import { Repository } from 'typeorm'
import { SystemCandles } from '../../system/system'
import {
  CANDLE_FIELD,
  isForwardCandleArray,
  ICandle,
  ISymbol,
  ICandleObject,
  getCandleEntityName,
  showProgressBar,
  logger,
  INTERVAL,
  BROKER_PURPOSE,
  Symbol,
} from '@candlejumper/shared'

export class CandleManager {
  private outTickIntervalTime = 200
  private outTickInterval: NodeJS.Timer

  constructor(public system: SystemCandles) {}

  /**
   * open websockets for all symbols + intervals
   */
  startWebsocketListener(): void {
    const intervals = this.system.configManager.config.intervals
    const symbols = this.system.symbolManager.symbols

    this.system.brokerManager
      .getByPurpose(BROKER_PURPOSE.CANDLES)
      .startCandleTicker(symbols, intervals, async (symbol, interval, candle, isFinal) => {
        if (isFinal) {
          await this.saveToDB(symbol, interval, [candle])
        }
      })
  }

  startOutTickInterval(): void {
    this.outTickInterval = setInterval(() => {
      const candles = {}

      this.system.symbolManager.symbols.forEach(symbol => {
        for (const interval in symbol) {
          if (!candles[symbol.name]) {
            candles[symbol.name] = {}
          }
          if (symbol.candles[interval]?.[0]) {
            console.log(232, symbol.candles[interval][0])
            candles[symbol.name][interval] = symbol.candles[interval][0]
          }
        }
      })

      this.system.apiServer.io.emit('candles', candles)
    }, this.outTickIntervalTime)
  }

  async getFromDB(symbol: Symbol, interval: INTERVAL, count: number): Promise<ICandle[]> {
    try {
      const result = await this.getRepository(symbol, interval).find({ take: count, order: { time: 'DESC' } })
      const candles: ICandle[] = result.map(row => [row.time, row.open, row.high, row.low, row.close, row.volume])
      return candles.reverse()
    } catch (error) {
      logger.error(`Symbol not found ${symbol.name} - ${interval}`)
      logger.error(error)
      return undefined
    }
  }

  async saveToDB(symbol: Symbol, interval: INTERVAL, candles: ICandle[]): Promise<void> {
    if (!candles.length) {
      return
    }

    // test if all candles are linear in time
    // timeline goes from [0 = newest] to [1 = older]
    if (!isForwardCandleArray(candles)) {
      throw new Error('Candles not reversed linear ([0 = old] | [1 = new])')
    }

    // reverse to get correct order in database
    // candles.reverse()

    const candleObjects: ICandleObject[] = candles.map(candle => ({
      time: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }))

    // writeFileSync("../../temp_data.json", JSON.stringify(candleObjects, null, 2))

    await this.getRepository(symbol, interval).upsert(candleObjects, ['time'])
  }

  /**BNBN
   * sync candles between database and broker
   */
  async syncAll(): Promise<void> {
    logger.info(`♿ Sync candles`)

    const now = Date.now()
    const config = this.system.configManager.config
    const symbols = this.system.symbolManager.symbols
    const intervals = config.intervals
    const preloadAmount = config.preloadAmount
    const promises = []
    const progressBar = showProgressBar(symbols.length * intervals.length, 'candles')

    // console.log(symbols, ' symbols');

    for (let i = 0, len = symbols.length; i < len; ++i) {
      const symbol = symbols[i]
      if (!symbol.name.startsWith('HALO')) {
        continue
      }
      for (let k = 0, lenk = Object.keys(symbol.candles).length; k < lenk; k++) {
        const interval = intervals[k]
        await this.syncSymbol(symbol, interval, preloadAmount).then(() => progressBar.tick())
      }
    }

    await Promise.all(promises)

    logger.info(`✅ Sync candles (${Date.now() - now}ms)`)
  }

  /**
   * preload data from broker and store in DB
   */
  private async syncSymbol(symbol: Symbol, interval: INTERVAL, count: number): Promise<void> {
    const broker = this.system.brokerManager.getByPurpose(BROKER_PURPOSE.CANDLES)

    // get last candle
    const [lastCandle] = await this.getFromDB(symbol, interval, 1)
    let candles: ICandle[]

    // start from last candle time
    if (lastCandle) {
      candles = await broker.getCandlesFromTime(symbol, interval, lastCandle[CANDLE_FIELD.TIME])
    }

    // load the full preload amount
    else {
      candles = await broker.getCandlesFromCount(symbol, interval, count)
    }

    // store new candles in database
    await this.saveToDB(symbol, interval, candles)
  }

  private getRepository(symbol: Symbol, interval: INTERVAL): Repository<ICandleObject> {
    const repositoryName = getCandleEntityName(symbol, interval)
    return this.system.db.connection.getRepository(repositoryName)
  }
}
