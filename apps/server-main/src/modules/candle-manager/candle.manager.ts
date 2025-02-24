import { io, Socket } from 'socket.io-client'
import { SystemMain } from '../../system/stystem.main'
import { logger, ICandle, ISymbol, ICandleServerSocketEvent, sleep, createAxiosRetryInstance } from '@candlejumper/shared'

export const INTERVAL_MILLISECONDS = {
  '1m': 60000,
  '5m': 5 * 60000,
  '15m': 15 * 60000,
  '1h': 60 * 60000,
  '4h': 4 * 60 * 60000,
  '1d': 24 * 60 * 60000,
}

export enum CANDLE_FIELD {
  'TIME',
  'OPEN',
  'HIGH',
  'LOW',
  'CLOSE',
  'VOLUME',
}

export class CandleManager {
  private candleServerSocket: Socket

  constructor(public system: SystemMain) {}

  async init(): Promise<void> {
    // this.prepare()
  }

  /**
   * get a slice of candles if amount is given
   * otherwise return reference to full candles array
   *
   * TEMP - Changed to fetching remote from candle server
   */
  async getCandles(symbol: string, interval: string, count?: number): Promise<ICandle[]> {
    const candles = await this.load([{ symbol, interval }], count)
    return candles[symbol][interval]

    // const candles = this.candles[symbol][interval].candles

    // if (typeof count === 'number') {
    //     return candles.slice(0, Math.min(candles.length, count))
    // }

    // return candles
  }

  /**
   * get a slice of volumes
   */
  getVolume(symbol: ISymbol, interval: string, amount?: number): number[] {
    const volume = symbol.candles[interval].volume

    if (typeof amount === 'number') {
      return volume.slice(0, Math.min(volume.length, amount))
    }

    return volume
  }

  /**
   * load candles from candle server
   */
  async load(
    params: { symbol: string; interval: string }[],
    count: number,
  ): Promise<{ [symbol: string]: { [interval: string]: ICandle[] } }> {
    const { host, port } = this.system.configManager.config.server.candles
    const { data } = await createAxiosRetryInstance().post(`http://${host}:${port}/api/candles/?count=${count}`, params)
    
    return data
  }

  /**
   * load all candles from all symbols on all intervals
   */
  async sync(): Promise<void> {
    logger.info(`♿ Sync candles`)

    const now = Date.now()
    const config = this.system.configManager.config

    /*
     * loop over each symbol => loop over each interval => return {symbol, interval}
     * flatten nested array
     * [{symbol: 'BTCUSDT', interval: '15m'}, {symbol: 'BNBUSDT', interval: '1h'}]
     */
    const loadParams = this.system.symbolManager.symbols
      .map(symbol => config.intervals.map(interval => ({ symbol: symbol.name, interval })))
      .flat()

    try {
      const data = await this.load(loadParams, +config.preloadAmount || 500)

      // loop over each symbol
      for (let symbol in data) {
        // loop over each interval
        for (let interval in data[symbol]) {
          // set candles
          this.system.symbolManager.get(symbol).candles[interval] = data[symbol][interval]

          // set volumes
          // this.candles[symbol][interval].volume = data[symbol][interval].map((candle) => candle[CANDLE_FIELD.VOLUME])

          // set current price
          // TODO: symbol should drop price field
          // console.log(symbol, interval)
          // this.symbols[symbol].price = this.candles[symbol][interval].candles[0][CANDLE_FIELD.CLOSE]
        }
      }
    } catch (error) {
      console.error(error)
      throw new Error('Error fetching candles from candle server')
    }

    logger.info(`✅ Sync candles (${(Date.now() - now)}ms)`)
  }

  /**
   * start listening for candle updates from candle server
   */
  async openCandleServerSocket(){
    return new Promise((resolve, reject) => {
      let isResolved = false
      const { host, port } = this.system.configManager.config.server.candles

      this.candleServerSocket = io(`http://${host}:${port}`)

      this.candleServerSocket.on('connect', () => {
        if (!isResolved) {
          isResolved = true
          resolve(null)
        }
      })
      this.candleServerSocket.on('error', error => {
        if (!isResolved) {
          isResolved = true
          reject(error)
        }
      })

      this.candleServerSocket.on('candles:price', (event: ICandleServerSocketEvent) => this.onSymbolPriceUpdate(event))
    })
  }

  /**
   * handle tick from candle server
   */
  private async onSymbolPriceUpdate(event: ICandleServerSocketEvent) {

    // loop over every symbol
    for (let symbolName in event) {
      const symbol = this.system.symbolManager.get(symbolName)

      // bot server does not recognize this symbol
      if (!symbol) {
        logger.warn('Got symbol price update, but system does not have symbol stored')
        return
      }

      symbol.price = event[symbolName].price
      
      // loop over each interval
      for (let interval in event[symbolName].candles) {
        const candle = event[symbolName][interval]
        const symbolIntervalRef = this.system.symbolManager.get(symbolName).candles[interval]

        if (!symbolIntervalRef) {
          continue
        }

        // check if new time < last time
        const isNewCandle = symbolIntervalRef.candles[0][CANDLE_FIELD.TIME] < candle[CANDLE_FIELD.TIME]

        // new candle
        // add to candle array
        // remove oldest candle from array to keep fixed length (to prevent unlimited growth)
        if (isNewCandle) {
          symbolIntervalRef.candles.unshift(candle)
          symbolIntervalRef.candles.pop()
          symbolIntervalRef.volume.unshift(candle[CANDLE_FIELD.VOLUME])
          symbolIntervalRef.volume.pop()
        }

        // no new candle
        // just update latest candle to reflect new price
        else {
          symbolIntervalRef.candles[0] = candle
          symbolIntervalRef.volume[0] = candle[CANDLE_FIELD.VOLUME]
        }

        // TEMP - keep track of changed candles
        // so that data to client is minimized to only price updates
        // if (candle[CANDLE_FIELD.CLOSE] !== this.symbols[symbolName].price) {
        //   // there is a new price!
        //   symbol.changedSinceLastClientTick = true

        //   this.symbols[symbolName].price = candle[CANDLE_FIELD.CLOSE]
        // }
      }

      this.system.tick(new Date(), symbol)
    }

    this.sendOutbountIOTick()
  }

  /**
   * emit candle tick to clients (websocket)
   */
  private sendOutbountIOTick(): void {
    return

    // const data = {
    //   time: this.system.time,
    //   chart: {},
    //   prices: {},
    // }

    // for (let symbolName in this.symbols) {
    //   const symbol = this.symbols[symbolName]
    //   if (symbol.changedSinceLastClientTick) {
    //     data.prices[symbolName] = symbol.price
    //   }

    //   // reset
    //   symbol.changedSinceLastClientTick = false
    // }

    // for (let key in this.system.apiServer.sockets) {
    //   const socket = this.system.apiServer.sockets[key]

    //   if (socket.data?.watch) {
    //     const symbol = socket.data.watch.symbol
    //     const interval = socket.data.watch.interval
    //     const candle = this.getCandles(symbol, interval, 1)

    //     if (candle) {
    //       data.chart = {
    //         symbol,
    //         interval,
    //         candle,
    //       }
    //     }
    //   }

    //   socket.emit('prices', data)
    // }
  }

  /**
   * prepare this.candles and this.symbols object array
   * set symbols and timeframes before it is needed
   */
  // private prepare(): void {
  //   const symbols = this.system.configManager.config.symbols
  //   const intervals = this.system.configManager.config.intervals

  //   for (let i = 0, len = symbols.length; i < len; i++) {
  //     const symbolName = symbols[i]
  //     const symbol = this.system.broker.getExchangeInfoBySymbol(symbolName)

  //     // holding all candles
  //     this.candles[symbolName] = {}

  //     // loop over each interval, to set object
  //     for (let k = 0, lenk = intervals.length; k < lenk; k++) {
  //       this.candles[symbolName][intervals[k]] = {
  //         candles: [],
  //         volume: [],
  //       }
  //     }

  //     // holding basic symbol info
  //     this.symbols[symbolName] = {
  //       name: symbolName,
  //       baseAsset: symbol.baseAsset,
  //       quoteAsset: symbol.quoteAsset,
  //       baseAssetPrecision: symbol.baseAssetPrecision,
  //       price: 0,
  //     }
  //   }
  // }
}
