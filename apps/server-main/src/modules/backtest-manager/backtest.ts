import { SystemMain } from '../../system/system';
import { BACKTEST_TYPE } from './backtest-manager';
import { Bot } from '../../tickers/bot/bot';
import { CANDLE_FIELD } from '../candle-manager/candle-manager';
import { ORDER_TYPE } from '../order-manager/order-manager';
import { IWorkerData } from './backtest.interfaces';
import { ICandle, ISymbol, ORDER_SIDE, IBalance, BrokerYahoo, TICKER_TYPE, Symbol } from '@candlejumper/shared';

export class Backtest {

    // system = new SystemMain(null, null, null, null,)

    private options: IWorkerData['options']
    private candles: ICandle[]

    constructor(public workerOptions: any) {
        this.options = workerOptions.options

        this.validateOptions()
        // this.system.brokerManager.get(BrokerYahoo).exchangeInfo = this.workerOptions.exchangeInfo
    }

    /**
     * run a single backtest
     */
    async run(): Promise<void> {
        // // startup system
        // await this.system.start()

        // this.system.configManager.config.preloadAmount = this.options.candleCount

        // await this.setupSystem()

        // const system = this.system
        // const symbol = this.options.symbol
        // const interval = this.options.interval
        // const baseAssetBalanceRef = system.brokerManager.get(BrokerYahoo).account.balances.find(balance => balance.asset !== 'USDT')
        // const warmupAmount = system.configManager.config.warmupAmount
        // const systemCandles = symbol.candles[interval].candles
        // const backtestType = this.options.type
        // const createTicks = backtestType === BACKTEST_TYPE.OHLC_TICKS

        // // split into ticks
        // const ticksCount = createTicks ? 10 : 0

        // const tickEventsNormal = [CANDLE_FIELD.OPEN, CANDLE_FIELD.HIGH, CANDLE_FIELD.LOW, CANDLE_FIELD.CLOSE]
        // const tickEventsShuffled = [CANDLE_FIELD.OPEN, CANDLE_FIELD.LOW, CANDLE_FIELD.HIGH, CANDLE_FIELD.CLOSE]

        // // if (newConfig) {
        // //     await system.tickers[0].configTick(newConfig, stepCount, force)
        // // }

        // let i = this.candles.length
        // // let count = 0

        // // loop over candles
        // while (i--) {
        //     const candle = this.candles[i]
        //     const openTime = new Date(candle[CANDLE_FIELD.TIME])
        //     systemCandles.unshift(candle)

        //     // shorten array
        //     if (systemCandles.length > 250) {
        //         system.symbolManager.get(symbol.name)[interval].candles.pop()
        //     }

        //     // do not process candles until warmup is done
        //     if (i + warmupAmount > this.candles.length - 1) {
        //         continue
        //     }

        //     // start with either high or low, depending wich one is closer to open
        //     const highDiff = Math.abs(candle[CANDLE_FIELD.OPEN] - candle[CANDLE_FIELD.HIGH])
        //     const lowDiff = Math.abs(candle[CANDLE_FIELD.OPEN] - candle[CANDLE_FIELD.LOW])
        //     const highFirst = lowDiff > highDiff
        //     const tickEvents = highFirst ? tickEventsNormal : tickEventsShuffled

        //     // split into multipe ticks
        //     let priceSteps: number[]
        //     if (createTicks) {
        //         const totalDiff = candle[CANDLE_FIELD.HIGH] - candle[CANDLE_FIELD.LOW]
        //         const stepAmount = totalDiff / ticksCount
        //         priceSteps = new Array(ticksCount).map((v, index) => candle[CANDLE_FIELD.LOW] + (index * stepAmount))

        //         if (highFirst) {
        //             priceSteps.reverse()
        //         }
        //     }

        //     // tick open/high/low/close + ticks
        //     // TODO - check if flow of prices is logical
        //     for (let k = 0, lenk = tickEvents.length + ticksCount; k < lenk; k++) {
        //         let price: number

        //         // open + high OR low
        //         if (k < 2) {
        //             price = candle[tickEvents[k]]
        //         }

        //         // high OR low + close
        //         else if (k > ticksCount + 1) {
        //             price = candle[tickEvents[k - ticksCount]]
        //         }
        //         else {
        //             price = priceSteps[k - 2]
        //         }

        //         symbol.price = price

        //         // needed?
        //         system.candleManager.getCandles(symbol.name, interval)[0][CANDLE_FIELD.CLOSE] = price

        //         // check for stoploss/takeprofit
        //         await this.checkStopLossTakeProfit(baseAssetBalanceRef, symbol, price, interval)

        //         // tick bots
        //         await system.tick(openTime, symbol)
        //     }
        // }

        // // after all loops, do one last sell 
        // if (Math.abs(system.orderManager.orders[symbol.name].length % 2) == 1) {
        //     const poppedOrder = system.orderManager.orders[symbol.name].pop(); // only include completed orders
        //     const balances = this.system.brokerManager.get(BrokerYahoo).account.balances
        //     const totalPrice = poppedOrder.quantity * poppedOrder.price
        //     balances.find(balance => balance.asset === symbol.baseAsset).free -= poppedOrder.quantity
        //     balances.find(balance => balance.asset === symbol.quoteAsset).free += totalPrice
        // }
    }

    /**
     * check stop loss orders
     */
    private async checkStopLossTakeProfit(baseAssetBalanceRef: IBalance, symbol: ISymbol, price: number, interval: string): Promise<void> {
        // only check if there are coins to sell (just to be sure)
        if (baseAssetBalanceRef.free === 0) {
            return
        }

        // const orders = this.system.orderManager.orders[symbol.name]
        // const order = orders.findLast(order => order.side === ORDER_SIDE.BUY)

        // if (order.type === ORDER_TYPE.STOP_LOSS_LIMIT && !order.stopLossTriggered) {
        //     if (price <= order.stopPrice) {
        //         await this.system.orderManager.placeOrder({
        //             symbol: symbol,
        //             side: ORDER_SIDE.SELL
        //         }, { reason: 'Stoploss triggered', interval })
        //         order.stopLossTriggered = true
        //     }
        // }
    }

    /**
     * get current value of asset
     */
    // private getAssetValue(asset: string): number {
    //     const balance = this.system.brokerManager.get(BrokerYahoo).getBalance(asset)
    //     const currentPrice = (this.system.tickers[0] as unknown as Bot<any>).price
    //     return currentPrice * balance
    // }

    /**
     * Refresh the system for next run
     */
    private async setupSystem(): Promise<void> {
        // const now = Date.now()
        // const system = this.system
        // const symbol = new Symbol(system, this.options.symbol)
        // const interval = this.options.interval
        // const warmupAmount = system.configManager.config.warmupAmount
        // const exchangeInfoSymbol = system.brokerManager.get(BrokerYahoo).getExchangeInfoBySymbol(symbol.name)

        // // reset orders
        // system.orderManager.orders[symbol.name] = []

        // // reset symbols
        // this.system.symbolManager.symbols = [symbol]

        // // reset balances
        // system.brokerManager.get(BrokerYahoo).account.balances = [
        //     {
        //         asset: exchangeInfoSymbol.baseAsset,
        //         free: 0,
        //         locked: 0
        //     },
        //     {
        //         asset: exchangeInfoSymbol.quoteAsset,
        //         free: this.options.USDT,
        //         locked: 0
        //     }
        // ]

        // // load candles only first time
        // if (!this.candles) {
        //     const loadAmount = this.options.candleCount + warmupAmount
        //     const loadArray = [{ symbol: symbol.name, interval }]
        //     const data = await system.candleManager.load(loadArray, loadAmount)
        //     this.candles = data[symbol.name][interval]
        // }

        // // add bots to config
        // system.configManager.config.production.bots = this.options.bots.map(botName => ({ class: botName, symbol: symbol.name, interval, id: botName }))

        // // prepare candlemanager
        // // TODO - should be done in system.init
        // await system.candleManager.init()

        // // set candles for warmup
        // symbol.candles = {
        //     [interval]: {
        //         candles: this.candles.slice(0 - this.system.configManager.config.warmupAmount - 1),
        //         volume: []
        //     }
        // }

        // add bots to system
        // await system.addBotsFromConfig()

        // logger.verbose(`setup system took : ${Date.now() - now}`)
    }

    /**
     * make sure the backtest starts with valid options
     */
    private validateOptions(): void {
        if (!this.options.symbol) {
            throw Error('options.symbol is required')
        }

        if (!this.options.candleCount) {
            throw Error('options.candlesCount is required, type number')
        }

        if (!this.options.USDT) {
            throw Error('options.USDT is required')
        }

        if (!this.options.type) {
            throw Error('options.type is required')
        }

        // if (!Object.keys(workerData.exchangeInfo).length) {
        //     throw Error('options.exchangeInfo is required')
        // }

        if (!this.options.bots?.length) {
            throw Error('options.bots is required')
        }

        if (!this.options.interval) {
            throw Error('options.interval is required')
        }
    }
}