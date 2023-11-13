import { logger } from '../../util/log'
import { Broker } from '../broker'
import { CandleTickerCallback, IBrokerInfo, ISymbol } from '../broker.interfaces'
import { ICandle } from '@candlejumper/shared'
import { WebsocketClient } from 'binance'
import axios from 'axios'
import { QueueBinance } from '../binance/binance.queue'
import rateLimit from 'axios-rate-limit';
import IG, { API_BASE_URL, PriceResponse } from 'ig-node-api'
import TEMP_BROKER_INFO from './broker-ig.json'
import { parse } from 'date-fns'

const defaultOptions = {
  baseURL: API_BASE_URL.PROD,
  headers: {
    'Content-Type': 'application/json',
    'X-IG-API-KEY': '',
    'IG-ACCOUNT-ID': 'BSYOC'
  },
};

const http = rateLimit(axios.create(defaultOptions), { maxRequests: 5, perMilliseconds: 1000 })

export enum BROKER_IG_TIMEFRAMES {
  '1m' = 'MINUTE', 
  '2m' = 'MINUTE_2', 
  '3m' = 'MINUTE_3', 
  '5m' = 'MINUTE_5', 
  '10m' = 'MINUTE_10', 
  '15m' = 'MINUTE_15', 
  '30m' = 'MINUTE_30', 
  '1h' = 'HOUR', 
  '2h' = 'HOUR_2', 
  '3h' = 'HOUR_3', 
  '4h' = 'HOUR_4', 
  '1d' = 'DAY', 
  'W' = 'WEEK', 
  'M' = 'MONTH'
}

export class BrokerIG extends Broker {

  id = 'IG'
  instance: IG
  websocket: WebsocketClient

  queue: QueueBinance

  onCandleTickCallback: (symbol: string, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

  async onInit(): Promise<void> {
    this.queue = new QueueBinance(this.system)

    const { apiKey, username, password } = this.system.configManager.config.brokers.ig || {}

    // set default headers
    http.defaults.headers['X-IG-API-KEY'] = apiKey as string
    http.defaults.headers['IG-ACCOUNT-ID'] = 'BSYOC'

    // get access token 
    const { data } = await http.post('/session', { identifier: username, password }, { headers: { Version: 3 } })

    // this.instance.getPrices()

    // add access token to default heades
    http.defaults.headers['Authorization'] = `Bearer ${data.oauthToken.access_token}`

    // const resultMarkets = await http.get('https://demo-api.ig.com/gateway/deal/marketnavigation/264134/')

    // console.log(resultMarkets.data)
    // this.instance = new APIClient(APIClient.URL_LIVE, {
    //   apiKey,
    //   username,
    //   password,
    // });

    // this.websocket = new WebsocketClient({
    //   api_key: apiKey,
    //   api_secret: apiSecret,
    //   beautify: true,
    // })

    // receive raw events
    // this.websocket.on('message', (data: any) => {
    //   // console.log('raw message received ', JSON.stringify(data, null, 2))
    // })

    // // notification when a connection is opened
    // this.websocket.on('open', (data) => {
    //   // console.log('connection opened open:', data.wsKey, data.ws.target.url)
    // })

    // // receive formatted events with beautified keys. Any "known" floats stored in strings as parsed as floats.
    // this.websocket.on('formattedMessage', async (data: WsMessageKlineFormatted) => {
    //   // console.log('formattedMessage: ', data)

    //   const kline = data.kline
    //   const candle: ICandle = [
    //     kline.startTime,
    //     kline.open,
    //     kline.high,
    //     kline.low,
    //     kline.close,
    //     kline.volume,
    //   ]

    //   await this.onCandleTickCallback(data.symbol, kline.interval, candle, kline.final)
    // })

    // // read response to command sent via WS stream (e.g LIST_SUBSCRIPTIONS)
    // this.websocket.on('reply', (data) => {
    //   console.log('log reply: ', JSON.stringify(data, null, 2))
    // })

    // // receive notification when a ws connection is reconnecting automatically
    // this.websocket.on('reconnecting', (data) => {
    //   console.log('ws automatically reconnecting.... ', data?.wsKey)
    // })

    // // receive notification that a reconnection completed successfully (e.g use REST to check for missing data)
    // this.websocket.on('reconnected', (data) => {
    //   console.log('ws has reconnected ', data?.wsKey)
    // })
  }

  /**
   * load candles from startime until now.
   * splits into multiple requests until end
   */
  async getCandlesFromTime(symbol: string, interval: string, startTime: number): Promise<ICandle[]> {
    const limit = 1000
    const allCandles = []
    const maxLoops = 20

    // for (let i = 0; i < maxLoops; i++) {
    //   // logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${startTime}`)

    //   const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}`

    //   const data =  await this.queue.add( async () =>  { 
    //     // const { data } = await http.get(url, {headers: {'X-MBX-APIKEY': this.system.configManager.config.brokers.binance.apiKey}})
    //     const result = await this.instance.getKlines({symbol, interval: interval as any})
    //     return result
    //     return data
    //   })

    //   // const { data } = await this.queue.add(() => http.get(url, {headers: {'X-MBX-APIKEY': this.system.configManager.config.brokers.binance.apiKey}})) 
    //   const candles = this.normalizeCandles(data)

    //   allCandles.push(...candles)

    //   // received less then limit, there is no more
    //   if (candles.length < limit) {
    //     break
    //   }

    //   // set new startTime
    //   startTime = candles[candles.length - 1]?.[CANDLE_FIELD.TIME] + 1
    // }

    // logger.info(`\u2705 Sync from time: ${symbol} ${interval}`)

    return allCandles.reverse()
  }

  /**
  * load candles and normalize values (string to number)
  */
  async getCandlesFromCount(symbol: string, interval: string, count = 1000): Promise<ICandle[]> {
    const epic = this.getEpicFromSymbolName(symbol)
    const limit = 1000
    const loops = Math.ceil(count / limit)
    const allCandles: ICandle[] = []

    const endTime = Date.now()

    interval = BROKER_IG_TIMEFRAMES[interval]

    // break into multiple requests
    for (let i = 0; i < loops; ++i) {

      logger.debug(`\u231B Sync candles: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)


      const { data } = await http.get(`/prices/${epic}/${interval}/${count}`)
      const candles = this.normalizeCandles(data.prices)

      allCandles.push(...candles.reverse())

      logger.info(`\u2705 Sync candles: ${symbol} ${interval} (${i + 1}/${loops}) ${new Date(endTime)}`)

      if (candles.length < limit || allCandles.length === count) {
        break
      }

      // - 1 to prevent double loading the latest
      // endTime = candles[candles.length - 1][CANDLE_FIELD.TIME] - 1
    }

    console.log(allCandles)

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
        // this.system.broker.websocket.subscribeSpotKline(symbols[k], intervals[i] as any)
      }
    }
  }

  getEpicFromSymbolName(symbolName: string): string | undefined {
    return this.system.broker.exchangeInfo.symbols.find(symbol => symbol.name === symbolName)?.epic
  }

  /**
  * sync exchange info with broker
  * this loads all metadata for every symbol
  */
  protected async loadConfig(): Promise<IBrokerInfo> {
    // protected async loadConfig(): Promise<{accounts: Account[]}> {
    // return this.instance.getAccountDetails()
    const exchangeInfo = structuredClone(TEMP_BROKER_INFO)

    exchangeInfo.symbols.forEach((symbol: ISymbol) => {
      symbol.baseAsset = 'AUD'
    })
    return exchangeInfo as IBrokerInfo
  }

  private normalizeCandles(candles: PriceResponse['prices']): ICandle[] {
    // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))

    return candles.map((candle) => ([
      parse(candle.snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()).getTime(),
      candle.openPrice.ask,
      candle.highPrice.ask,
      candle.lowPrice.ask,
      candle.closePrice.ask,
      candle.lastTradedVolume

      // candle.quoteVolume = parseFloat(candle.quoteVolume)
      // candle.baseAssetVolume = parseFloat(candle.baseAssetVolume)
      // candle.quoteAssetVolume = parseFloat(candle.quoteAssetVolume)
    ])) as ICandle[] // TEMP to fix typing
  }
}