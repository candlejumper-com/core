import { Kline, KlineInterval, MainClient, OrderResponseFull, OrderResponseResult, WebsocketClient } from 'binance'
import axios, { } from 'axios'
import { Broker } from '../../modules/broker/broker'
import { logger } from '../../util/log';
import { CandleTickerCallback } from '../../modules/broker/broker.interfaces'
import { ICandle } from '../../modules/candle/candle.interfaces'
import { CANDLE_FIELD } from '../../modules/candle/candle.util'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'
import { Symbol } from '../../modules/symbol/symbol'
import { SimpleQueue } from '../../util/queue'
import { TICKER_TYPE } from '../../ticker/ticker.util'
import { IOrder } from '../../modules/order/order.interfaces'
import { ICalendarItem } from '../../modules/calendar/calendar.interfaces'
import { INTERVAL } from '../../index_client'
import { ORDER_SIDE, ORDER_TYPE } from '../../modules/order/order.util'

export class TokenMetrics extends Broker {
  id = 'BINANCE'
  instance: MainClient
  websocket: WebsocketClient
  queue: SimpleQueue

  override async onInit() {
    const apiKey = this.system.configManager.config.brokers.binance.apiKey
    const apiSecret = this.system.configManager.config.brokers.binance.apiSecret

    this.instance = new MainClient({
      api_key: apiKey,
      api_secret: apiSecret,
      strictParamValidation: true
    }, {
      timeout: 60000
    })
  }

    /**
   * load candles from startime until now.
   * splits into multiple requests until end
   */
    override async getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]> {
      const limit = 1000
      const allCandles = []
      const maxLoops = 20 
  
      for (let i = 0; i < maxLoops; i++) {
        // logger.debug(`♿ Sync from time: ${symbol} ${interval} ${startTime}`)
  
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}`
  
        const data =  await this.queue.add( async () =>  { 
          // const { data } = await http.get(url, {headers: {'X-MBX-APIKEY': this.system.configManager.config.brokers.binance.apiKey}})
          const result = await this.instance.getKlines({symbol: symbol.name, interval: interval as any})
          return result
          return data
        })
  
        // const { data } = await this.queue.add(() => http.get(url, {headers: {'X-MBX-APIKEY': this.system.configManager.config.brokers.binance.apiKey}})) 
        const candles = this.normalizeCandles(data)
  
        allCandles.push(...candles)
  
        // received less then limit, there is no more
        if (candles.length < limit) {
          break
        }
  
        // set new startTime
        startTime = candles[candles.length - 1]?.[CANDLE_FIELD.TIME] + 1
      }
  
      // logger.info(`✅ Sync from time: ${symbol} ${interval}`)
  
      return allCandles.reverse()
    }

  private normalizeCandles(candles: Kline[]): ICandle[] {
    return candles.map((candle) => ([
      candle['openTime'] || candle['startTime'] || candle[0],
      candle[1],
      candle[2],
      candle[3],
      candle[4],
      candle[5]

      // candle.quoteVolume = parseFloat(candle.quoteVolume)
      // candle.baseAssetVolume = parseFloat(candle.baseAssetVolume)
      // candle.quoteAssetVolume = parseFloat(candle.quoteAssetVolume)
    ])) as ICandle[] // TEMP to fix typing
  }

  override async getCandlesFromCount(symbol: ISymbol, interval: string, count = 1000): Promise<ICandle[]> {
    const limit = 1000
    const loops = Math.ceil(count / limit)
    const allCandles = []

    let endTime = Date.now()

    // break into multiple requests
    for (let i = 0; i < loops; ++i) {

      logger.debug(`\u231B Sync candles: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)

      const rawCandles = await this.instance.getKlines({
        symbol: symbol.name,
        interval: interval as KlineInterval,
        limit,
        endTime
      })

      const candles = this.normalizeCandles(rawCandles)

      allCandles.push(...candles.reverse())

      logger.info(`✅ Sync candles: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)

      if (candles.length < limit || allCandles.length === count) {
        break
      }

      // - 1 to prevent double loading the latest
      endTime = candles[candles.length - 1][CANDLE_FIELD.TIME] - 1
    }

    return allCandles
  }

  override async startCandleTicker(symbols: Symbol[], intervals: INTERVAL[], callback: CandleTickerCallback) {
    this.onCandleTickCallback = callback
    // const streamBinance = new WebSocket('wss://stream.binance.com:9443/ws')

    // streamBinance.on('open', () => {
    //   console.log('stream opened')

    //   for (let i = 0, len = intervals.length; i < len; i++) {
    //     console.log('SUBSCRIBE', symbols.map((symbol) => `${symbol}@kline_${intervals[i]}`))
    //     const subs = {
    //       method: 'SUBSCRIBE',
    //       params: symbols.map((symbol) => `${symbol}@kline_${intervals[i]}`),
    //       id: i,
    //     }
    //     streamBinance.send(JSON.stringify(subs))
    //   }
    // })

    for (let k = 0, lenk = symbols.length; k < lenk; k++) {
        for (let i = 0, len = intervals.length; i < len; i++) {
        this.websocket.subscribeSpotKline(symbols[k].name, intervals[i] as any)
      }
    }
  }

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void) {
    const APIKEY = this.system.configManager.config.brokers.tokenMetrics.apiKey

    const listenKey = await getUserDataStream(APIKEY)
    const socketApi = new SocketClient(`ws/${listenKey}`)

    socketApi.setHandler('executionReport', (data) => eventCallback(userTransforms.executionReport(data)))
    socketApi.setHandler('outboundAccountPosition', (data) => eventCallback(userTransforms.outboundAccountPosition(data)))
    socketApi.setHandler('error', (data) => errorCallback(data))
    renewListenKey(APIKEY)(listenKey)
  }

  /**
   * load account balances
   */
  override async syncAccount(): Promise<void> {
    logger.debug(`♿ Sync balance`)

    const now = Date.now()

    try {
      const balances = await this.instance.getBalances()

      this.account.balances = balances.map(balance => ({
        free: parseFloat(balance.free as string),
        locked: parseFloat(balance.locked as string),
        asset: balance.coin
      }))
    } catch (error: any) {
      if (error.status) {
        console.error(error.status)
        console.error(error.data)
      } else {
        console.error(error)
      }

      throw new Error(`Error Sync account balance`)
    }

    logger.info(`✅ Sync balance (${Date.now() - now} ms)`)
  }

  override async getOrdersBySymbol(symbol: Symbol): Promise<IOrder[]> {
    const orders = await this.instance.getAccountTradeList({ symbol: symbol.name, limit: 50 })

    // normalize
    return orders.map(order => {
      // const commissionAssetPrice = this.system.candleManager.getSymbolByPair(order.commissionAsset + 'USDT')?.price || 1

      const cleanOrder: IOrder = {
        id: order.id,
        type: ORDER_TYPE.MARKET,
        time: order.time,
        price: parseFloat(order.price as string),
        side: order.isBuyer ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
        symbol: symbol,
        quantity: parseFloat(order.qty as string),
        profit: 0,
        commission: parseFloat(order.commission as string),
        commissionAsset: order.commissionAsset,
        commissionUSDT: 0
      }

      // cleanOrder.commissionUSDT = cleanOrder.commission * commissionAssetPrice

      return cleanOrder
    })
  }

  // TODO: check typings
  override async placeOrder(order: IOrder): Promise<IOrder> {
    const result = await this.instance.submitNewOrder(order as any)
    
    return {
      ...order,
      id: result.orderId
    }
  }

  override getCalendarItems(): Promise<ICalendarItem[]> {
    throw new Error('Method not implemented.')
  }

  // async get24HChanges(): Promise<IDailyStatsResult[]> {
  //   const results = await this.instance.get24hrChangeStatististics() as DailyChangeStatistic[]

  //   // normalize
  //   results.forEach(result => result.quoteVolume = parseFloat(result.quoteVolume as any))

  //   return results as IDailyStatsResult[]
  // }
}