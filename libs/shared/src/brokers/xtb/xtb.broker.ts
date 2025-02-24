import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance'
import { Broker } from '../../modules/broker/broker'
import { CandleTickerCallback, IBrokerInfo } from '../../modules/broker/broker.interfaces'
import XAPI, {
  CHART_RANGE_INFO_RECORD,
  CMD_FIELD,
  RATE_INFO_RECORD,
  SYMBOL_RECORD,
  TRADE_RECORD,
  TRADING_HOURS_RECORD,
  TYPE_FIELD,
  Time,
} from 'xapi-node'
import { format } from 'date-fns'
import { ICalendarItem } from '../../modules/calendar/calendar.interfaces'
import { logger } from '../../util/log'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'
import { Symbol } from '../../modules/symbol/symbol'
import { ICandle } from '../../modules/candle'
import { SimpleQueue } from '../../util/queue'
import { IOrder } from '../../modules/order/order.interfaces'
import { INTERVAL } from '../../util/util'
import { tradeTransactionResponse } from 'xapi-node/build/v2/interface/Response'
import { Transaction } from 'xapi-node/build/v2/core/Transaction'
import { BROKER_PURPOSE } from '../../modules/broker/broker.util'
import { ORDER_SIDE, ORDER_TYPE } from '../../modules/order/order.util'
import { error } from 'console'
import { SYMBOL_CATEGORY } from '../../modules/symbol/symbol.util'

// https://xstation5.xtb.com/#/demo/loggedIn
// http://developers.xstore.pro/documentation/

export class XtbBroker extends Broker {
  override id = 'xtb'
  instance: XAPI
  queue = new SimpleQueue(this.system)

  private symbolMap: Map<string, string> = new Map() // [shortName, originalName]

  override async onInit(): Promise<void> {
    const { type, accountId, password } = this.system.configManager.config.brokers.xtb
    this.instance = new XAPI({
      accountId,
      password,
      type,
    })

    await this.instance.connect()
  }

  override async onGetSymbolDetails(symbolName: string) {
    // super.ge
    return null
  }


  override async getCalendarItems(mock = true): Promise<ICalendarItem[]> {
    // console.log(' GET T ITEMS')
    return []
    // const items = await this.instance.getCalendarItems()
    // console.log('ITEMS' , items)
    // return items
  }

  override async getExchangeInfo() {
    return  {
      symbols: await this.getSymbols(),
      timezone: 'Europe/London'
    }
  }

  override async syncAccount(): Promise<void> {
    logger.debug(`♿ Sync balance`)

    const now = Date.now()

    this.instance.Stream.listen.getBalance(balance => {
      this.account.balances.push({ asset: 'USD', free: balance.balance, locked: 0 })
      logger.info('Balance update')
    })

    await this.instance.Stream.subscribe.getBalance()

    logger.info(`✅ Sync balance (${Date.now() - now} ms)`)
  }

  override async syncSymbols(): Promise<void> {
    const symbols = await this.getSymbols()

    // normalize symbol name and store original name in map
    symbols.forEach(symbol => {
      const cleanName = symbol.name.split('.')[0]
      this.symbolMap.set(cleanName, symbol.name)
      symbol.name = cleanName
    })

    this.exchangeInfo.symbols = symbols
  }

  override async isMarketOpen(symbol: Symbol) {
    const now = new Date()
    const tradingHoursResult = await this.getTradingHoursBySymbol(symbol)

    if (!tradingHoursResult) {
      return false
    }

    const {
      trading: { from, until },
    } = tradingHoursResult

    if (from > now && until < now) {
      return true
    }

    logger.info(`${symbol.name} market closed until: '${from}`)

    return false
  }

  override async getTradingHoursBySymbol(symbol: Symbol) {
    return null

    const originalName = this.symbolMap.get(symbol.name)
    const result = await this.instance.Socket.send.getTradingHours([originalName])
    const tradingHours = result.data.returnData[0]
    const now = new Date()
    let from: Date, until: Date

    // find next trading window
    while (true) {
      const today = tradingHours.trading.find(record => record.day === now.getDay())

      if (today) {
        now.setHours(0, 0, 0, 0)
        from = new Date(now.getTime() + today.fromT)
        until = new Date(now.getTime() + today.toT)

        break
      }

      now.setDate(now.getDate() + 1)
    }

    // normlize tradingHours
    return {
      trading: {
        from,
        until,
      },
      quotes: {
        from,
        until,
      },
    }
  }

  override async syncOrders(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const { stopListen } = this.instance.Socket.listen.getTrades(trades => {
        stopListen()

        trades.forEach(trade => {
          // console.log(2323, trade)
          const symbolName = trade.symbol.split('.')[0]
          const symbol = this.system.symbolManager.get(symbolName)
          const normalizedOrder: IOrder = {
            id: trade.order,
            type: ORDER_TYPE.MARKET,
            side: trade.cmd === CMD_FIELD.BUY ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
            symbol: symbol,
          }

          symbol.orders.push(normalizedOrder)
        })

        resolve()
      })

      await this.instance.Socket.send.getTrades(false)
    })
  }

  override async getOrdersBySymbol(symbol: Symbol): Promise<IOrder[]> {
    return []
  }

  override async closeOrder(order: IOrder) {
    const transaction = await this.instance.trading.close({
      order: order.id,
    })

    // await transaction.transaction
    return await transaction.transactionStatus
  }

  override async placeOrder(order: IOrder): Promise<IOrder> {
    const originalName = this.symbolMap.get(order.symbol.name)
    // const originalName = order.symbol.getBrokerByPurpose(BROKER_PURPOSE.ORDERS).symbolName

    let request

    if (order.side === ORDER_SIDE.BUY) {
      request = this.instance.trading.buy({ symbol: originalName, volume: order.quantity })
    } else {
      request = this.instance.trading.sell({ symbol: originalName, volume: order.quantity })
    }

    // console.log(result, 'result');
    const [status, result] = await Promise.all([request.transactionStatus, request.transaction])

    // console.log(2323, status)

    // TODO - add more return data
    return {
      ...order,
      id: result.data.returnData.order,
    }
  }

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    // throw new Error('Method not implemented.');
  }

  override async startCandleTicker(symbols: Symbol[], intervals: string[], callback: CandleTickerCallback) {
    // console.log('CANDLE TICKER!')
    this.instance.Stream.listen.getTickPrices(data => {
      const symbol = this.system.symbolManager.get(data.symbol)
      symbol.price = data.bid
      // console.log('PRICE UPDATE', data)
    })

    for (let i = 0; i < symbols.length; i++) {
      await this.instance.Stream.subscribe.getTickPrices(symbols[i].name)
    }
  }

  override async getCandlesFromTime(symbol: Symbol, interval: string, fromTime: number): Promise<ICandle[]> {
    const fromTimeDate = new Date(fromTime)
    const startTime = format(fromTimeDate, 'yyyy-MM-dd')
    const originalName = this.symbolMap.get(symbol.name)
    // const originalName = symbol.getBrokerByPurpose(BROKER_PURPOSE.CANDLES).symbolName

    const queryOptions: CHART_RANGE_INFO_RECORD = {
      end: new Date().getTime(),
      period: 1440, // 1 day
      start: fromTime,
      symbol: originalName,
      ticks: 1000,
    }

    logger.debug(`♿ Sync from time: ${symbol} ${interval} ${startTime}`)

    let candles
    try {
      const result = await this.instance.Socket.send.getChartRangeRequest(
        queryOptions.end,
        queryOptions.period,
        queryOptions.start,
        queryOptions.symbol,
      )
      candles = result.data.returnData
      //   candles = (await this.instance.Socket.send.getChartRangeRequest(...Object.values(queryOptions))).data.returnData
    } catch (error) {
      console.log(error, 'error')
    }
    return this.normalizeCandles(candles.rateInfos)
  }

  override async getCandlesFromCount(symbol: Symbol, interval: string, count: number): Promise<ICandle[]> {
    const now = new Date()
    const originalName = this.symbolMap.get(symbol.name)
    // const originalName = symbol.getBrokerByPurpose(BROKER_PURPOSE.CANDLES).symbolName

    const queryOptions: CHART_RANGE_INFO_RECORD = {
      end: new Date().getTime(),
      period: 1440, // 1 day
      start: now.getTime() - count * 1440 * 1000,
      symbol: originalName,
      ticks: 1000,
    }

    logger.debug(`♿ Sync from time: ${symbol} ${interval} ${now}`)

    let candles
    try {
      candles = (
        await this.instance.Socket.send.getChartRangeRequest(queryOptions.end, queryOptions.period, queryOptions.start, queryOptions.symbol)
      ).data.returnData
    } catch (error) {
      console.log(error, 'error')
    }

    return this.normalizeCandles(candles.rateInfos)
  }

  private async getSymbols(): Promise<ISymbol[]> {
    const data = (await this.instance.Socket.send.getAllSymbols()).data.returnData
    // console.log(2222, data.find(symbol => symbol.symbol.startsWith('VZ.')))
    // console.log(data[0])
    return data.map(symbol => {

      // if (symbol.categoryName === SYMBOL_CATEGORY.CRYPTO) {
      //   console.log(symbol)
      // }

      const _symbol: ISymbol = {
        name: symbol.symbol,
        description: symbol.description,
        baseAsset: '',
        quoteAsset: '',
        currency: symbol.currency,
        price: symbol.ask,
        longOnly: symbol.longOnly,
        lotStep: symbol.lotStep,
        tickSize: symbol.tickSize,
        lotMin: symbol.lotMin,
        precision: symbol.precision,
        contractSize: symbol.contractSize,
        shortSelling: symbol.shortSelling,
        category: symbol.categoryName as SYMBOL_CATEGORY
      }

      return _symbol
    })
  }

  private normalizeCandles(candles: RATE_INFO_RECORD[]): ICandle[] {
    // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))

    return (candles || []).map(candle => [
      new Date(candle.ctm).getTime(),
      candle.open,
      candle.open + candle.high,
      candle.open + candle.low,
      candle.open + candle.close,
      candle.vol,
    ])
  }
}
