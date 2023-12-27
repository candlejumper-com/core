import { join } from 'path';
import * as fs from 'fs';
import { System } from '../../system/system';
import { BrokerYahoo } from '../../brokers/yahoo/yahoo.broker';
import { countDecimals } from '../../index_client';
import { TICKER_TYPE } from '../../ticker/ticker.util';
import { logger } from '../../util/log';
import { ISymbol } from '../symbol/symbol.interfaces';
import { IOrder, IOrderOptions, IOrderData, ORDER_SIDE } from './order.interfaces';
// import { XtbBroker } from '../../brokers/xtb/xtb.broker';

const PATH_SNAPSHOT_BACKTEST = join(__dirname, '../../../_data/snapshots/backtest')

export enum ORDER_TYPE {
    STOP_LOSS_LIMIT = 'STOP_LOSS_LIMIT',
    STOP_LOSS = 'STOP_LOSS',
    MARKET = 'MARKET'
}

export class OrderManager {

    readonly orders: { [key: string]: IOrder[] } = {}

    constructor(public system: System) { }

    init(): void {

    }

    // async placeStopLossLimitOrder(symbol: ISymbol, side: ORDER_SIDE, stopPrice: number, data?: IOrderData): Promise<void> {
    //     const spread = this.system.configManager.config.spread
    //     const spreadMultiplier = 1 + (side === 'BUY' ? -spread : spread)
    //     const orderOptions: any = {
    //         type: ORDER_TYPE.STOP_LOSS_LIMIT,
    //         timeInForce: 'GTC',
    //         stopPrice
    //     }

    //     await this.placeOrder(symbol, side, orderOptions, data)
    // }

    /**
     * place a new order
     */
    async placeOrder(options: IOrderOptions, data: IOrderData): Promise<void> {
        const isProduction = !!this.system.configManager.config.production.enabled
        const price = options.symbol.price
        const symbol = options.symbol
        const side = options.side

        if (!symbol) {
            throw 'Unkown symbol to system: ' + symbol.name
        }

        // unless forced, check if order is not same side as last order
        if (!options.force && ((this.system.type === TICKER_TYPE.SYSTEM_MAIN && !isProduction) || !this.checkIsNotSameOrderSide(symbol, side))) {
            console.log(11122323)
            return
        }

        // how much can we spend on this order
        const quantity = options.quantity || this.calculateQuantity(symbol, side)

        // only process when quantity is higher then zero
        if (!quantity) {
            logger.warn('quantity is zero')
            return
        }

        // used for binance
        const order: IOrder = {
            ...options,
            quantity,
            symbol: symbol,
        }

        // stoploss orders need a price field
        if (options.stopLoss) {
            order.price = price
        }

        // as stored in orders array
        const orderEvent = Object.assign({}, order, {
            data,
            price,
            commission: 0,
            symbol,
            time: (this.system.time || new Date).getTime(),
            state: 'PENDING',
            profit: 0,
            result: {}
        })

        // REAL ORDER
        if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
            try {
                await this.placeOrderReal(order, orderEvent)
            } catch (error: any) {
                console.error(error)
                throw new Error(error)
            }

        }
        // BACKTEST
        else {
            this.placeOrderBacktest(order, orderEvent, symbol)
        }

        this.orders[symbol.name] = this.orders[symbol.name] || []
        this.orders[symbol.name].push(orderEvent)
    }

    /**
     * execute order on binance
     */
    private async placeOrderReal(order: IOrder, orderEvent): Promise<void> {
        const eventLog = `${orderEvent.symbol.name} ${order.side} ${order.type} ${order.quantity} ${order.price}`

        try {
            const orderResult = await order.symbol.broker.placeOrder(order)

            orderEvent.id = orderResult.orderId
            orderEvent.price = orderResult['price']
            console.log('order result', orderResult)
            // orderEvent.commission = parseFloat(orderResult.commission)

            logger.info(`TRADE SUCCCESS:`, eventLog)

            orderEvent.state = 'SUCCESS'

            // await this.system.deviceManager.sendTradeNotification(orderEvent)
        } catch (error: any) {
            logger.error(`TRADE ERROR: ${eventLog}`)

            orderEvent.state = 'ERROR'
            orderEvent.result.stateReason = error?.message || error || 'Uknown'

            throw error
        }
    }

    /**
     * fake order execute + update balances
     */
    private placeOrderBacktest(order: IOrder, orderEvent, symbol: ISymbol): void {
        const balances = this.system.brokerManager.getByClass(BrokerYahoo).account.balances
        const totalPrice = order.quantity * orderEvent.price

        orderEvent.state = 'SUCCESS'

        // update balances
        if (order.side === ORDER_SIDE.BUY) {
            balances.find(balance => balance.asset === symbol.baseAsset).free += order.quantity
            balances.find(balance => balance.asset === symbol.quoteAsset).free -= totalPrice
        }

        else {
            balances.find(balance => balance.asset === symbol.baseAsset).free -= order.quantity

            // find last BUY order
            const prevOrder = this.orders[order.symbol.name]?.findLast(order => order.side === ORDER_SIDE.BUY)
            console.log(order.symbol)
            if (prevOrder) {
                balances.find(balance => balance.asset === symbol.quoteAsset).free += totalPrice
                console.log(totalPrice - (order.quantity * prevOrder.price))
                orderEvent.profit = totalPrice - (order.quantity * prevOrder.price)
            }
        }

        // save snapshot
        if (orderEvent.data?.snapshot) {
            fs.writeFileSync(`${PATH_SNAPSHOT_BACKTEST}/${symbol.name}-${orderEvent.data.interval}-${orderEvent.time}.json`, JSON.stringify(orderEvent.data.snapshot))
        }
    }

    
    /**
     * listen to binance 'userData' stream (order + balances)
     */
    async startWebSocket(): Promise<void> {
        await this.system.brokerManager.getByClass(BrokerYahoo).startWebsocket(reason => {
            console.error('Websocket error: ' + reason)
        }, event => {
            switch (event.eventType) {
                case 'outboundAccountPosition':
                    this.onBalanceUpdate(event)
                    break
                case 'executionReport':
                    this.onOrderExecuted(event)
                    break
            }
        })
    }

    /**
     * triggered when broker updated balances
     */
    private onBalanceUpdate(event) {
        event.balances.forEach(balance => {
            const accountAsset = this.system.brokerManager.getByClass(BrokerYahoo).account.balances.find(_balance => _balance.asset.toLowerCase() === balance.asset.toLowerCase())

            if (accountAsset) {
                accountAsset.free = parseFloat(balance.free)
            }
        })
    }

    /**
     * triggered when broker received new order (request)
     */
    private onOrderExecuted(event) {
        if (event.orderStatus !== 'FILLED') {
            return
        }

        // create new order data
        const order: IOrder = {
            type: event.orderType,
            symbol: event.symbol,
            time: event.eventTime,
            id: event.orderId,
            side: event.side as ORDER_SIDE,
            commission: parseFloat(event.commission),
            commissionAsset: event.commissionAsset,
            quantity: parseFloat(event.quantity),
            price: parseFloat(event.priceLastTrade),
            profit: 0,
            commissionUSDT: 0,
            stopPrice: parseFloat(event.stopPrice)
        }

        order.commissionUSDT = order.commission * order.price

        // check if we already know this order
        const existingOrder = this.orders[order.symbol.name]?.find(_order => _order.id === order.id)

        this.setOrderProfit(order)

        // merge order with existing
        // TODO - should this be done? b 
        if (existingOrder) {
            console.log('EXISTING ORDER ORDER', order)
            if (!order.price && existingOrder.price) {
                order.price = existingOrder.price
            }
            Object.assign(existingOrder, order)
        }
        // or push as new order (done from outside this running instance)
        else {
            this.orders[order.symbol.name] = this.orders[order.symbol.name] || []
            this.orders[order.symbol.name].push(order)
        }

        // emit to client
        if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
            // this.system.apiServer.io.emit('order', order)
        }
    }

    /**
     * calculate the amount to spend on this order (USDT)
     */
    private getToSpendAmount(symbol: ISymbol): number {
        const quoteAssetBalance = this.system.brokerManager.getByClass(BrokerYahoo).getBalance(symbol.quoteAsset)

        if (this.system.type === TICKER_TYPE.SYSTEM_BACKTEST) {
            return quoteAssetBalance
        }

        const maxTradingAmount = this.system.configManager.config.production.maxTradingAmount
        return Math.min(maxTradingAmount, quoteAssetBalance)
    }

    /**
     * calculate order quantity
     */
    private calculateQuantity(symbol: ISymbol, side: ORDER_SIDE): number {
        const toSpend = this.getToSpendAmount(symbol)
        const broker = this.system.brokerManager.getByClass(BrokerYahoo)
        const baseAssetBalance = broker.getBalance(symbol.baseAsset)
        const price = this.system.symbolManager.symbols[symbol.name].price //  TODO - reuse symbol object, also used above
        const marketData = broker.getExchangeInfoBySymbol(symbol.name)
        const lotSize = (marketData.filters.find(filter => filter.filterType === 'LOT_SIZE') as any)
        const lotStepSize = parseFloat(lotSize.stepSize)

        // TODO - binance API seems to be updated and the npm package does not reflect correct types
        const minNotional = parseFloat((marketData.filters.find(filter => filter.filterType === 'NOTIONAL' as any) as any)?.minNotional)
        const lotSizeMin = parseFloat(lotSize.minQty)
        const lotSizePrecision = countDecimals(parseFloat(lotSize.stepSize))

        let quantity = 0

        // BUY
        if (side === ORDER_SIDE.BUY) {
            // quantity = +(toSpend / price - lotStepSize).toFixed(lotSizePrecision)
            quantity = +((toSpend * 0.999) / price - lotStepSize).toFixed(lotSizePrecision)
        }
        // SELL
        // TODO: check if wallet has BNB, if so, no * 0.99 needed for commission
        else {
            quantity = +(baseAssetBalance - lotStepSize).toFixed(lotSizePrecision)
            // quantity = +((baseAssetBalance * 0.99) - lotStepSize).toFixed(lotSizePrecision)
        }

        // MIN_LOT_SIZE (minimal amount)
        if (quantity < lotSizeMin) {
            quantity = 0
        }

        // MIN_NOTIONAL (minimal total value)
        if (quantity * price < minNotional) {
            quantity = 0
        }

        return Math.max(0, quantity)
    }

    private validate() {

    }

    /**
     * load all orders for binance for every symbol that is used
     * WARNING: this is fucking heavy regarding weight limit to Binance, because every symbol must be separatly requested
     * TODO: store in database or something and | or sync only symbols needed
     */
    async sync(): Promise<void> {
        // this.system.brokerManager.get(XtbBroker).
        // // return
        // logger.info(`Sync orders`)

        // const now = Date.now()
        // const promises = this.system.symbolManager.symbols.map(async symbol => {
        //     this.orders[symbol.name] = await this.system.brokerManager.get(BrokerYahoo).getOrdersByMarket(symbol.name)

        //     // add profit to each order
        //     this.orders[symbol.name].forEach(order => this.setOrderProfit(order))
        // })

        // await Promise.all(promises)

        // logger.info(`Synced orders in ${Date.now() - now}ms`)
    }

    /**
     * calculate how much profit was made on this sell order
     */
    private setOrderProfit(order: IOrder): void {
        if (order.side === ORDER_SIDE.SELL) {
            // find last BUY order
            const prevOrder = this.orders[order.symbol.name]?.findLast(order => order.side === ORDER_SIDE.BUY)

            if (prevOrder) {
                order.profit = (order.quantity * order.price) - (order.quantity * prevOrder.price)
            }
        }
    }

    /**
     * get last order
     * TODO: still needed?? seems a bit useless
     */
    private getLast(symbol: ISymbol): IOrder {
        return this.orders[symbol.name]?.at(-1)
    }

    /**
     * 
     */
    private checkIsNotSameOrderSide(symbol: ISymbol, side: ORDER_SIDE): boolean {
        const lastOrder = this.getLast(symbol)
        const minTimeBetweenOrders = this.system.configManager.config.minTimeBetweenOrders
        const currentTime = this.system.time.getTime()

        // check if this trade is different side then previous trade
        if (lastOrder?.side === side) {
            if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
                // logger.info('will not trade same side twice. Set allowOrderSideRepeat: true in bot config to enable')
            }
            return false
        }

        if (lastOrder?.time - minTimeBetweenOrders > currentTime) {
            if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
                logger.info(`Last trade happend ${(currentTime - lastOrder.time) / 1000} seconds ago. Min delay is ${minTimeBetweenOrders / 1000} seconds`)
            }
            return false
        }

        return true
    }
}
// {
//     eventType: 'executionReport',
//     eventTime: 1678199595622,
//     symbol: 'ATOMUSDT',
//     newClientOrderId: 'WbARI2TEaTE4kpnDGmnRlI',
//     originalClientOrderId: '',
//     side: 'SELL',
//     orderType: 'MARKET',
//     timeInForce: 'GTC',
//     quantity: '2.76000000',
//     price: '0.00000000',
//     executionType: 'NEW',
//     stopPrice: '0.00000000',
//     trailingDelta: undefined,
//     icebergQuantity: '0.00000000',
//     orderStatus: 'NEW',
//     orderRejectReason: 'NONE',
//     orderId: 2096031860,
//     orderTime: 1678199595622,
//     lastTradeQuantity: '0.00000000',
//     totalTradeQuantity: '0.00000000',
//     priceLastTrade: '0.00000000',
//     commission: '0',
//     commissionAsset: null,
//     tradeId: -1,
//     isOrderWorking: true,
//     isBuyerMaker: false,
//     creationTime: 1678199595622,
//     totalQuoteTradeQuantity: '0.00000000',
//     orderListId: -1,
//     quoteOrderQuantity: '0.00000000',
//     lastQuoteTransacted: '0.00000000',
//     trailingTime: undefined
//   }
//   {
//     eventType: 'executionReport',
//     eventTime: 1678199595622,
//     symbol: 'ATOMUSDT',
//     newClientOrderId: 'WbARI2TEaTE4kpnDGmnRlI',
//     originalClientOrderId: '',
//     side: 'SELL',
//     orderType: 'MARKET',
//     timeInForce: 'GTC',
//     quantity: '2.76000000',
//     price: '0.00000000',
//     executionType: 'TRADE',
//     stopPrice: '0.00000000',
//     trailingDelta: undefined,
//     icebergQuantity: '0.00000000',
//     orderStatus: 'FILLED',
//     orderRejectReason: 'NONE',
//     orderId: 2096031860,
//     orderTime: 1678199595622,
//     lastTradeQuantity: '2.76000000',
//     totalTradeQuantity: '2.76000000',
//     priceLastTrade: '11.63600000',
//     commission: '0.00008415',
//     commissionAsset: 'BNB',
//     tradeId: 173735048,
//     isOrderWorking: false,
//     isBuyerMaker: false,
//     creationTime: 1678199595622,
//     totalQuoteTradeQuantity: '32.11536000',
//     orderListId: -1,
//     quoteOrderQuantity: '0.00000000',
//     lastQuoteTransacted: '32.11536000',
//     trailingTime: undefined
//   }
//   {
//     balances: [
//       { asset: 'BNB', free: '0.02328970', locked: '0.00000000' },
//       { asset: 'USDT', free: '32.32216309', locked: '0.00000000' },
//       { asset: 'ATOM', free: '0.00000000', locked: '0.00000000' }
//     ],
//     eventTime: 1678199595622,
//     eventType: 'outboundAccountPosition',
//     lastAccountUpdate: 1678199595622
//   }
//   {
//     eventType: 'executionReport',
//     eventTime: 1678199602803,
//     symbol: 'FTMUSDT',
//     newClientOrderId: 'usdTd8Au1ZEi10TUsoF8cT',
//     originalClientOrderId: '',
//     side: 'BUY',
//     orderType: 'MARKET',
//     timeInForce: 'GTC',
//     quantity: '80.00000000',
//     price: '0.00000000',
//     executionType: 'NEW',
//     stopPrice: '0.00000000',
//     trailingDelta: undefined,
//     icebergQuantity: '0.00000000',
//     orderStatus: 'NEW',
//     orderRejectReason: 'NONE',
//     orderId: 2372486588,
//     orderTime: 1678199602803,
//     lastTradeQuantity: '0.00000000',
//     totalTradeQuantity: '0.00000000',
//     priceLastTrade: '0.00000000',
//     commission: '0',
//     commissionAsset: null,
//     tradeId: -1,
//     isOrderWorking: true,
//     isBuyerMaker: false,
//     creationTime: 1678199602803,
//     totalQuoteTradeQuantity: '0.00000000',
//     orderListId: -1,
//     quoteOrderQuantity: '0.00000000',
//     lastQuoteTransacted: '0.00000000',
//     trailingTime: undefined
//   }
//   {
//     eventType: 'executionReport',
//     eventTime: 1678199602803,
//     symbol: 'FTMUSDT',
//     newClientOrderId: 'usdTd8Au1ZEi10TUsoF8cT',
//     originalClientOrderId: '',
//     side: 'BUY',
//     orderType: 'MARKET',
//     timeInForce: 'GTC',
//     quantity: '80.00000000',
//     price: '0.00000000',
//     executionType: 'TRADE',
//     stopPrice: '0.00000000',
//     trailingDelta: undefined,
//     icebergQuantity: '0.00000000',
//     orderStatus: 'FILLED',
//     orderRejectReason: 'NONE',
//     orderId: 2372486588,
//     orderTime: 1678199602803,
//     lastTradeQuantity: '80.00000000',
//     totalTradeQuantity: '80.00000000',
//     priceLastTrade: '0.40390000',
//     commission: '0.00008466',
//     commissionAsset: 'BNB',
//     tradeId: 196883273,
//     isOrderWorking: false,
//     isBuyerMaker: false,
//     creationTime: 1678199602803,
//     totalQuoteTradeQuantity: '32.31200000',
//     orderListId: -1,
//     quoteOrderQuantity: '0.00000000',
//     lastQuoteTransacted: '32.31200000',
//     trailingTime: undefined
//   }
//   {
//     balances: [
//       { asset: 'BNB', free: '0.02320504', locked: '0.00000000' },
//       { asset: 'USDT', free: '0.01016309', locked: '0.00000000' },
//       { asset: 'FTM', free: '80.00000000', locked: '0.00000000' }
//     ],
//     eventTime: 1678199602803,
//     eventType: 'outboundAccountPosition',
//     lastAccountUpdate: 1678199602803
//   }

// { "e": "executionReport", "E": 1682946790008, "s": "VGXUSDT", "c": "Z7Gbva6fsWQM7WbgCxZFbz", "S": "SELL", "o": "MARKET", "f": "GTC", "q": "74.20000000", "p": "0.00000000", "P": "0.00000000", "F": "0.00000000", "g": -1, "C": "", "x": "TRADE", "X": "FILLED", "r": "NONE", "i": 111243060, "l": "74.20000000", "z": "74.20000000", "L": "0.23070000", "n": "0.01711794", "N": "USDT", "T": 1682946790008, "t": 17946174, "I": 240739580, "w": false, "m": false, "M": true, "O": 1682946790008, "Z": "17.11794000", "Y": "17.11794000", "Q": "0.00000000", "W": 1682946790008, "V": "NONE" }