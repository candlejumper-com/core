import { logger } from '../../util/log'
import { Broker } from '../../modules/broker/broker'
import { Kline, KlineInterval, OrderResponseFull, OrderResponseResult, WebsocketClient } from 'binance'
import { IOrder } from '../../order/order.interfaces'
import { ICandle, CANDLE_FIELD } from '../../modules/candle'
import { CandleTickerCallback, IBrokerInfo } from '../../modules/broker/broker.interfaces'
import { BitmartSpotAPI } from '@bitmartexchange/bitmart-node-sdk-api'
import { IBrokerBitmartSymbols } from './bitmart.interfaces'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'
import { SimpleQueue } from '../../util/queue'

export enum BROKER_BITMART_TIMEFRAMES {
  '1m' = 1,
  '2m' = 'MINUTE_2',
  '3m' = 3,
  '5m' = 5,
  '10m' = 'MINUTE_10',
  '15m' = 15,
  '30m' = 30,
  '1h' = 60,
  '2h' = 120,
  '3h' = 'HOUR_3',
  '4h' = 240,
  '6h' = 360,
  '12h' = 720,
  '1d' = 1440,
  'W' = 'WEEK',
  'M' = 'MONTH',
}

// @param {Int} options.step - K-Line step, default is 1 minute. step: 1, 3, 5, 15, 30, 60, 120, 240, 360, 720, 1440, 4320, 10080
export class BrokerBitmart extends Broker {
  id = 'BitMart'
  instance: BitmartSpotAPI
  websocket: WebsocketClient

  queue: SimpleQueue

  override async onInit() {
    this.queue = new SimpleQueue(this.system)

    const { name, apiKey, apiSecret } = this.system.configManager.config.brokers.bitmart

    this.instance = new BitmartSpotAPI({
      apiKey,
      apiSecret,
      apiMemo: name,
    })
  }

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void) {
    // const APIKEY = this.system.configManager.config.brokers.binance.apiKey
    // const listenKey = await getUserDataStream(APIKEY)
    // const socketApi = new SocketClient(`ws/${listenKey}`)
    // socketApi.setHandler('executionReport', (data) => eventCallback(userTransforms.executionReport(data)))
    // socketApi.setHandler('outboundAccountPosition', (data) => eventCallback(userTransforms.outboundAccountPosition(data)))
    // socketApi.setHandler('error', (data) => errorCallback(data))
    // renewListenKey(APIKEY)(listenKey)
  }

  /**
   * load account balances
   */
  async syncAccount(): Promise<void> {
    logger.debug(`\u267F Sync balance`)

    const now = Date.now()

    // try {
    //   const balances = await this.instance.getBalances()

    //   this.account.balances = balances.map(balance => ({
    //     free: parseFloat(balance.free as string),
    //     locked: parseFloat(balance.locked as string),
    //     asset: balance.coin
    //   }))
    // } catch (error) {
    //   if (error.status) {
    //     console.error(error.status)
    //     console.error(error.data)
    //   } else {
    //     console.error(error)
    //   }

    //   throw new Error(`Error Sync account balance`)
    // }

    logger.info(`\u2705 Sync balance (${Date.now() - now} ms)`)
  }

  /**
   * load broker data from candleServer (symbols, limits etc)
   */
  async syncExchangeFromBroker(): Promise<void> {
    logger.debug(`\u267F ${this.constructor.name} Sync exchange info`)

    // TODO - use somewhere?
    const time = await this.instance.getSystemTime()
    const symbolsRaw = await this.instance.getSymbolsDetails()

    const symbols = (symbolsRaw.data.data.symbols as IBrokerBitmartSymbols[])
      // .filter(symbol => !!this.system.symbolManager.symbols.find(s => s.name === symbol.symbol))
      .map(symbol => ({
        name: symbol.symbol,
        baseAsset: symbol.base_currency,
        quoteAsset: symbol.quote_currency,
      }))

    const exchangeInfo: IBrokerInfo = {
      timezone: 'Europe/London',
      symbols,
    }

    this.exchangeInfo = exchangeInfo
  }

  async getOrdersByMarket(symbol: string): Promise<IOrder[]> {
    // const orders = await this.system.broker.instance.getAccountTradeList({ symbol, limit: 50 })

    // // normalize
    // return orders.map(order => {
    //   const commissionAssetPrice = this.system.candleManager.getSymbolByPair(order.commissionAsset + 'USDT')?.price || 1

    //   const cleanOrder: IOrder = {
    //     id: order.id,
    //     type: 'MARKET',
    //     time: order.time,
    //     price: parseFloat(order.price as string),
    //     side: order.isBuyer ? ORDER_SIDE.BUY : ORDER_SIDE.SELL,
    //     symbol: order.symbol,
    //     quantity: parseFloat(order.qty as string),
    //     profit: 0,
    //     commission: parseFloat(order.commission as string),
    //     commissionAsset: order.commissionAsset,
    //     commissionUSDT: 0
    //   }

    //   cleanOrder.commissionUSDT = cleanOrder.commission * commissionAssetPrice

    //   return cleanOrder
    // })
    return []
  }

  // TODO: check typings
  async placeOrder(order: IOrder): Promise<OrderResponseResult | OrderResponseFull> {
    // return this.system.broker.instance.submitNewOrder(order as any) as Promise<OrderResponseResult>
    return null
  }

  async getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]> {
    const limit = 1000
    const allCandles = []
    const maxLoops = 20

    for (let i = 0; i < maxLoops; i++) {
      // logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${startTime}`)

      const data = await this.queue.add(async () => {
        const candlesRaw = (
          await this.instance.getV3HistoryKline(symbol, {
            // before: before,
            after: startTime,
            step: BROKER_BITMART_TIMEFRAMES[interval],
            limit: 100,
          })
        ).data.data?.reverse()

        return candlesRaw
      })

      if (!data) {
        break
      }

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

    // logger.info(`\u2705 Sync from time: ${symbol} ${interval}`)

    return allCandles.reverse()
  }

  /**
   * load candles and normalize values (string to number)
   */
  async getCandlesFromCount(symbol: ISymbol, interval: string, count = 1000): Promise<ICandle[]> {
    const limit = 1000
    const loops = Math.ceil(count / limit)
    const allCandles = []

    let endTime = Date.now()

    // break into multiple requests
    for (let i = 0; i < loops; ++i) {
      logger.debug(`\u231B Sync candles from: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)

      const before = Date.now() - 10000
      const after = before - 24 * 60 * 60

      const candlesRaw = (
        await this.instance.getV3HistoryKline(symbol, {
          before: before,
          // after: after,
          step: BROKER_BITMART_TIMEFRAMES[interval],
          limit: 100,
        })
      ).data.data.reverse()

      const candles = this.normalizeCandles(candlesRaw)

      allCandles.push(...candles.reverse())

      logger.info(`\u2705 Sync candles: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)

      if (candles.length < limit || allCandles.length === count) {
        break
      }

      // - 1 to prevent double loading the latest
      endTime = candles[candles.length - 1][CANDLE_FIELD.TIME] - 1
    }

    return allCandles
  }

  startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback) {
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
        // this.system.broker.websocket.subscribeSpotKline(symbols[k], intervals[i] as any)
      }
    }
  }

  private normalizeCandles(candles: Kline[]): ICandle[] {
    return candles.map((candle) => [
      candle[0] * 1000,
      candle[1],
      candle[2],
      candle[3],
      candle[4],
      candle[5],

      // candle.quoteVolume = parseFloat(candle.quoteVolume)
      // candle.baseAssetVolume = parseFloat(candle.baseAssetVolume)
      // candle.quoteAssetVolume = parseFloat(candle.quoteAssetVolume)
    ]) as ICandle[] // TEMP to fix typing
  }

  // async get24HChanges(): Promise<IDailyStatsResult[]> {
  //   const results = await this.instance.get24hrChangeStatististics() as DailyChangeStatistic[]

  //   // normalize
  //   results.forEach(result => result.quoteVolume = parseFloat(result.quoteVolume as any))

  //   return results as IDailyStatsResult[]
  // }
}
