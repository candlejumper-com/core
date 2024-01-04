import { join } from 'path'
import * as fs from 'fs'
import { System } from '../../system/system'
import { BrokerYahoo } from '../../brokers/yahoo/yahoo.broker'
import { countDecimals } from '../../index_client'
import { TICKER_TYPE } from '../../ticker/ticker.util'
import { ISymbol } from '../symbol/symbol.interfaces'
import { IOrder, IOrderOptions, IOrderData } from './order.interfaces'
import { BROKER_PURPOSE } from '../broker/broker.util'
import { ORDER_SIDE, ORDER_STATE } from './order.util'
import { logger } from '../../util/log'

const PATH_SNAPSHOT_BACKTEST = join(__dirname, '../../../_data/snapshots/backtest')

export class OrderManager {
  constructor(public system: System) {}

  init(): void {}

  
  async closeOrder(order: IOrder) {
    logger.info('CLOSING ORDER: ' + order.id)
    const broker = order.symbol.getBrokerByPurpose(BROKER_PURPOSE.ORDERS)
    // const marketOpen = await broker.instance.isMarketOpen(broker.symbolName)

    // if (!marketOpen) {
    //   logger.info(`MARKET CLOSED: ${broker.symbolName}`)
    //   return
    // }

    try {
      await order.symbol.getBrokerByPurpose(BROKER_PURPOSE.ORDERS).instance.closeOrder(order)
      console.log('index', order.symbol.orders.findIndex(_order => _order.id === order.id))
      order.symbol.orders.splice(order.symbol.orders.findIndex(_order => _order.id === order.id), 1)
    } catch (error) {
      console.error(error)
    }
  }

  async placeOrder(options: IOrderOptions, data: IOrderData) {
    const symbol = options.symbol

    // how much can we spend on this order
    const quantity = options.quantity || this.calculateQuantity(symbol, options.side)

    // only process when quantity is higher then zero
    if (!quantity) {
      logger.error('quantity is zero')
      return
    }

    // as stored in orders array
    const order: IOrder = Object.assign({}, options, {
      quantity,
      data,
      price: symbol.price,
      commission: 0,
      symbol,
      time: (this.system.time || new Date()).getTime(),
      state: ORDER_STATE.PENDING,
      profit: 0,
      result: {},
    })

    switch (this.system.type) {
      case TICKER_TYPE.SYSTEM_MAIN:
        await this.placeOrderReal(order)
        break;
      case TICKER_TYPE.SYSTEM_BACKTEST:
        this.placeOrderBacktest(order)
        break;
    }

    if (order.state === ORDER_STATE.SUCCESS) {
      symbol.orders.push(order)
    }
  }

  /**
   * execute order on binance
   */
  private async placeOrderReal(order: IOrder): Promise<void> {
    const eventLog = `${order.symbol.name} ${order.side} ${order.type} ${order.quantity} ${order.price}`
    const broker = order.symbol.getBrokerByPurpose(BROKER_PURPOSE.ORDERS)
    // const marketOpen = await broker.instance.isMarketOpen(broker.symbolName)

    // if (!marketOpen) {
    //   logger.info(`MARKET CLOSED: ${eventLog}`)
    //   return
    // }

    try {
      const orderResult = await broker.instance.placeOrder(order)

      order.id = orderResult.id
      order.price = orderResult['price']
      console.log('order result', orderResult)
      // orderEvent.commission = parseFloat(orderResult.commission)

      logger.info(`TRADE SUCCCESS:`, eventLog)

      order.state = ORDER_STATE.SUCCESS

      // await this.system.deviceManager.sendTradeNotification(orderEvent)
    } catch (error: any) {
      logger.error(`TRADE ERROR: ${eventLog}`)
      console.error(error)

      order.state = ORDER_STATE.ERROR
      order.result.stateReason = error?.message || error || 'Uknown'

      // throw error
    }
  }

  /**
   * fake order execute + update balances
   */
  private placeOrderBacktest(order: IOrder): void {
    const symbol = order.symbol
    const balances = this.system.brokerManager.getByClass(BrokerYahoo).account.balances
    const totalPrice = order.quantity * order.price

    order.state = ORDER_STATE.SUCCESS

    // update balances
    if (order.side === ORDER_SIDE.BUY) {
      balances.find(balance => balance.asset === symbol.baseAsset).free += order.quantity
      balances.find(balance => balance.asset === symbol.quoteAsset).free -= totalPrice
    } else {
      balances.find(balance => balance.asset === symbol.baseAsset).free -= order.quantity

      // find last BUY order
      const prevOrder = symbol.orders.findLast(order => order.side === ORDER_SIDE.BUY)

      if (prevOrder) {
        balances.find(balance => balance.asset === symbol.quoteAsset).free += totalPrice
        console.log(totalPrice - order.quantity * prevOrder.price)
        order.profit = totalPrice - order.quantity * prevOrder.price
      }
    }

    // save snapshot
    if (order.data?.snapshot) {
      fs.writeFileSync(
        `${PATH_SNAPSHOT_BACKTEST}/${symbol.name}-${order.data.interval}-${order.time}.json`,
        JSON.stringify(order.data.snapshot),
      )
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
    const broker = this.system.brokerManager.getByClass(BrokerYahoo)
    const toSpend = this.getToSpendAmount(symbol)
    const baseAssetBalance = broker.getBalance(symbol.baseAsset)
    const price = this.system.symbolManager.symbols[symbol.name].price //  TODO - reuse symbol object, also used above
    const marketData = broker.getExchangeInfoBySymbol(symbol.name)
    const lotSize = marketData.filters.find(filter => filter.filterType === 'LOT_SIZE') as any
    const lotStepSize = parseFloat(lotSize.stepSize)

    // TODO - binance API seems to be updated and the npm package does not reflect correct types
    const minNotional = parseFloat((marketData.filters.find(filter => filter.filterType === ('NOTIONAL' as any)) as any)?.minNotional)
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
}