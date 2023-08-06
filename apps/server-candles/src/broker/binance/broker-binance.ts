import { logger } from '../../util/log'
import { Broker } from '../broker'
import { CandleTickerCallback, IBrokerInfo } from '../broker.interfaces'
import { CANDLE_FIELD, ICandle } from '@candlejumper/shared'
import { ExchangeInfo, Kline, KlineInterval, MainClient, WebsocketClient, WsMessageKlineFormatted } from 'binance'
import WebSocket from 'ws'
import axios from 'axios'
import { QueueBinance } from './binance.queue'
import rateLimit from 'axios-rate-limit';

const http = rateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1000 })

export class BrokerBinance extends Broker {

  id = 'binance'
  instance: MainClient
  websocket: WebsocketClient

  queue: QueueBinance

  onCandleTickCallback: (symbol: string, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

  async onInit(): Promise<void> {
    this.queue = new QueueBinance(this.system)
    const apiKey = this.system.configManager.config.brokers.binance.apiKey
    const apiSecret = this.system.configManager.config.brokers.binance.apiSecret

    this.instance = new MainClient({
      api_key: apiKey,
      api_secret: apiSecret,
    }, {
      // timeout: 60000
    })

    this.websocket = new WebsocketClient({
      api_key: apiKey,
      api_secret: apiSecret,
      beautify: true,
    })

    // receive raw events
    this.websocket.on('message', (data: any) => {
      // console.log('raw message received ', JSON.stringify(data, null, 2))
    })

    // notification when a connection is opened
    this.websocket.on('open', (data) => {
      // console.log('connection opened open:', data.wsKey, data.ws.target.url)
    })

    // receive formatted events with beautified keys. Any "known" floats stored in strings as parsed as floats.
    this.websocket.on('formattedMessage', async (data: WsMessageKlineFormatted) => {
      // console.log('formattedMessage: ', data)

      const kline = data.kline
      const candle: ICandle = [
        kline.startTime,
        kline.open,
        kline.high,
        kline.low,
        kline.close,
        kline.volume,
      ]

      await this.onCandleTickCallback(data.symbol, kline.interval, candle, kline.final)
    })

    // read response to command sent via WS stream (e.g LIST_SUBSCRIPTIONS)
    this.websocket.on('reply', (data) => {
      console.log('log reply: ', JSON.stringify(data, null, 2))
    })

    // receive notification when a ws connection is reconnecting automatically
    this.websocket.on('reconnecting', (data) => {
      console.log('ws automatically reconnecting.... ', data?.wsKey)
    })

    // receive notification that a reconnection completed successfully (e.g use REST to check for missing data)
    this.websocket.on('reconnected', (data) => {
      console.log('ws has reconnected ', data?.wsKey)
    })
  }

  /**
   * load candles from startime until now.
   * splits into multiple requests until end
   */
  async getCandlesFromTime(symbol: string, interval: string, startTime: number): Promise<ICandle[]> {
    const limit = 1000
    const allCandles = []
    const maxLoops = 20 

    for (let i = 0; i < maxLoops; i++) {
      // logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${startTime}`)

      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}`

      const data =  await this.queue.add( async () =>  { 
        // const { data } = await http.get(url, {headers: {'X-MBX-APIKEY': this.system.configManager.config.brokers.binance.apiKey}})
        const result = await this.instance.getKlines({symbol, interval: interval as any})
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

    // logger.info(`\u2705 Sync from time: ${symbol} ${interval}`)

    return allCandles.reverse()
  }

  /**
  * load candles and normalize values (string to number)
  */
  async getCandlesFromCount(symbol: string, interval: string, count = 1000): Promise<ICandle[]> {
    const limit = 1000
    const loops = Math.ceil(count / limit)
    const allCandles = []

    let endTime = Date.now()

    // break into multiple requests
    for (let i = 0; i < loops; ++i) {

      logger.debug(`\u231B Sync candles: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)

      const rawCandles = await this.instance.getKlines({
        symbol,
        interval: interval as KlineInterval,
        limit,
        endTime
      })

      const candles = this.normalizeCandles(rawCandles)

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

  /**
   * start listening for broker candles (websocket)
   */
  startCandleTicker(symbols: string[], intervals: string[], callback: CandleTickerCallback) {
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
        this.system.broker.websocket.subscribeSpotKline(symbols[k], intervals[i] as any)
      }
    }
  }

  /**
  * sync exchange info with broker
  * this loads all metadata for every symbol
  */
  protected async loadConfig(): Promise<IBrokerInfo> {
    return {} as IBrokerInfo
    // return this.instance.getExchangeInfo()
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
}