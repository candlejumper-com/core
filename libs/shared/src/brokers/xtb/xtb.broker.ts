import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance'
import { Broker } from '../../modules/broker/broker'
import { CandleTickerCallback } from '../../modules/broker/broker.interfaces'
import XAPI, { CHART_RANGE_INFO_RECORD, CMD_FIELD, RATE_INFO_RECORD, SYMBOL_RECORD, TRADE_RECORD, Time } from 'xapi-node'
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

// https://xstation5.xtb.com/#/demo/loggedIn
// http://developers.xstore.pro/documentation/

export class XtbBroker extends Broker {
  override id = 'xtb'
  instance: XAPI
  queue = new SimpleQueue(this.system)

  override async onInit(): Promise<void> {
    const { type, accountId, password } = this.system.configManager.config.brokers.xtb
    this.instance = new XAPI({
      accountId,
      password,
      type,
    })
    await this.instance.connect()
  }

  override async getCalendarItems(mock = true): Promise<ICalendarItem[]> {
    // console.log(' GET T ITEMS')
    return []
    // const items = await this.instance.getCalendarItems()
    // console.log('ITEMS' , items)
    // return items
  }

  override async syncAccount(): Promise<void> {
    logger.debug(`♿ Sync balance`)

    const now = Date.now()

    this.instance.Stream.listen.getBalance(balance => {
      this.account.balances.push({asset: 'USD', free: balance.balance, locked: 0})
      logger.info('Balance update')
    })

    await this.instance.Stream.subscribe.getBalance()

    logger.info(`✅ Sync balance (${Date.now() - now} ms)`)
  }

  override async syncExchange(): Promise<void> {
    this.exchangeInfo = {
      symbols: await this.getTrendingSymbols(),
      timezone: 'Europe/London',
    }

    await this.getTradingHours(this.exchangeInfo.symbols[0].name)
  }

  override async isMarketOpen(symbol: string) {
    const tradingHours = await this.getTradingHours(symbol)
    const now = new Date()
    const today = tradingHours.trading.find(record => record.day === now.getDay() + 1)

    if (!today) {
      return false
    }
    
    now.setHours(0,0,0,0)

    const openTime = new Date(now.getTime() + today.fromT)
    const closeTime = new Date(now.getTime() + today.fromT)

    if (openTime > new Date && closeTime < new Date) {
      return true
    }
    
    return false
  }

  async getTradingHours(symbol: string) {
    const tradingHours = await this.instance.Socket.send.getTradingHours([symbol])
    return tradingHours.data.returnData[0]
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
            symbol: symbol
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
      order: order.id
    })

    // await transaction.transaction
    return await transaction.transactionStatus
  }

  override async placeOrder(order: IOrder): Promise<IOrder> {
    const originalName = order.symbol.getBrokerByPurpose(BROKER_PURPOSE.ORDERS).symbolName

    let request;

    if (order.side === ORDER_SIDE.BUY) {
      request = this.instance.trading.buy({ symbol: originalName, volume: order.quantity })
    } else {
      request = this.instance.trading.sell({ symbol: originalName, volume: order.quantity })
    }

    // console.log(result, 'result');
    const [status, result] = await Promise.all([
      request.transactionStatus,
      request.transaction
    ])

    // console.log(2323, status)

    // TODO - add more return data
    return {
      ...order,
      id: result.data.returnData.order
    }
  }

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    // throw new Error('Method not implemented.');
  }

  override async startCandleTicker(symbols: Symbol[], intervals: string[], callback: CandleTickerCallback) {
    // throw new Error('Method not implemented.');
  }

  override async getCandlesFromTime(symbol: Symbol, interval: string, fromTime: number): Promise<ICandle[]> {
    const fromTimeDate = new Date(fromTime)
    const startTime = format(fromTimeDate, 'yyyy-MM-dd')
    const originalName = symbol.getBrokerByPurpose(BROKER_PURPOSE.CANDLES).symbolName

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
      const result = await this.instance.Socket.send.getChartRangeRequest(queryOptions.end, queryOptions.period, queryOptions.start, queryOptions.symbol)
      candles = result.data.returnData
      //   candles = (await this.instance.Socket.send.getChartRangeRequest(...Object.values(queryOptions))).data.returnData
    } catch (error) {
      console.log(error, 'error')
    }
    return this.normalizeCandles(candles.rateInfos)
  }

  override async getCandlesFromCount(symbol: Symbol, interval: string, count: number): Promise<ICandle[]> {
    const now = new Date()
    const originalName = symbol.getBrokerByPurpose(BROKER_PURPOSE.CANDLES).symbolName

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

  private async getTrendingSymbols(): Promise<ISymbol[]> {
    const data = (await this.instance.Socket.send.getAllSymbols()).data.returnData
    // console.log(2222, data.find(symbol => symbol.symbol.startsWith('VZ.')))
    return data.map(symbol => {
      const _symbol: ISymbol = {
        description: symbol.description,
        name: symbol.symbol,
        baseAsset: '',
        quoteAsset: '',
        currency: symbol.currency,
        price: symbol.ask,
        priceString: symbol.ask.toString(),
        direction: 0,
        change24H: 0,
        start24HPrice: 0,
        change24HString: '0',
        changedSinceLastClientTick: false,
        longOnly: symbol.longOnly,
        lotStep: symbol.lotStep,
        tickSize: symbol.tickSize,
        lotMin: symbol.lotMin,
        precision: symbol.precision,
        contractSize: symbol.contractSize,
        shortSelling: symbol.shortSelling,
        totalOrders: 0,
        candles: {
          [INTERVAL['1d']]: [],
        },
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
