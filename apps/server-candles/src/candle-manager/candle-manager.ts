import { Repository } from "typeorm"
import { System } from "../system/system"
import { logger } from "../util/log"
import { getCandleEntityName } from "./candle.entity"
import { ICandleObject } from "./candle.interfaces"
import { showProgressBar } from "../util/util"
import { writeFileSync } from "fs"
import { CANDLE_FIELD, isForwardCandleArray, ICandle } from "@candlejumper/shared"

export class CandleManager {
  candles: { [key: string]: { [key: string]: ICandle[] } } = {}

  private outTickIntervalTime = 200
  private outTickInterval: NodeJS.Timer

  constructor(public system: System) {}

  async init() {
    this.prepareCandleData()
  }

  /**
   * open websockets for all symbols + intervals
   */
  startWebsocketListener(): void {
    const intervals = this.system.configManager.config.intervals
    const symbols = this.system.configManager.config.symbols

    this.system.broker.startCandleTicker(symbols, intervals, async (symbol, interval, candle, isFinal) => {
      const candles = this.candles[symbol][interval]
      const isFresh = candles[0][CANDLE_FIELD.TIME] < candle[CANDLE_FIELD.TIME]

      if (isFresh) {
        candles.unshift(candle)
        candles.pop()
      } else {
        candles[0] = candle
        if (isFinal) {
          await this.saveToDB(symbol, interval, [candle])
        }
      }
    })
  }

  startOutTickInterval(): void {
    this.outTickInterval = setInterval(() => {
      const candles = {}

      for (const symbol in this.candles) {
        candles[symbol] = candles[symbol] || {}

        for (const interval in this.candles[symbol]) {
          candles[symbol][interval] = this.candles[symbol][interval][0]
        }
      }

      this.system.apiServer.io.emit("candles", candles)
    }, this.outTickIntervalTime)
  }

  get(symbol: string, interval: string, count: number): ICandle[] {
    return this.candles[symbol]?.[interval]?.slice(0, count) || []
  }

  async getFromDB(symbol: string, interval: string, count: number): Promise<ICandle[]> {
    try {
      const result = await this.getRepository(symbol, interval).find({ take: count, order: { time: "DESC" } })
      const candles: ICandle[] = result.map((row) => [row.time, row.open, row.high, row.low, row.close, row.volume])
      return candles.reverse()
    } catch (error) {
      console.warn(`Symbol not found ${symbol} - ${interval}`)
      return []
    }
  }

  async saveToDB(symbol: string, interval: string, candles: ICandle[]): Promise<void> {
    if (!candles.length) {
      return
    }

    // test if all candles are linear in time
    // timeline goes from [0 = newest] to [1 = older]
    if (!isForwardCandleArray(candles)) {
      throw new Error("Candles not reversed linear ([0 = old] | [1 = new])")
    }

    // reverse to get correct order in database
    // candles.reverse()

    const candleObjects: ICandleObject[] = candles.map((candle) => ({
      time: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5],
    }))

    // writeFileSync("../../temp_data.json", JSON.stringify(candleObjects, null, 2))

    await this.getRepository(symbol, interval).upsert(candleObjects, ["time"])
  }

  /**BNBN
   * sync candles between database and broker
   */
  async sync(): Promise<void> {
    logger.info(`\u231B Sync all candles`)

    const now = Date.now()
    const config = this.system.configManager.config
    const symbols = config.symbols
    const intervals = config.intervals
    const preloadAmount = config.preloadAmount
    const promises = []
    const progressBar = showProgressBar(symbols.length * intervals.length, "candles")

    for (let i = 0, len = symbols.length; i < len; ++i) {
      const symbol = symbols[i]

      for (let k = 0, lenk = intervals.length; k < lenk; k++) {
        const interval = intervals[k]
        const job = await this.syncSymbol(symbol, interval, preloadAmount).then(() => progressBar.tick())
        // promises.push()
      }
    }

    await Promise.all(promises)

    logger.info(`\u2705 Sync candles (${Date.now() - now}ms)`)
  }

  private getRepository(symbol: string, interval: string): Repository<ICandleObject> {
    const repositoryName = getCandleEntityName(this.system, symbol, interval)
    return this.system.db.connection.getRepository(repositoryName)
  }

  /**
   * preload data from broker and store in DB
   */
  private async syncSymbol(symbol: string, interval: string, count: number): Promise<void> {
    // get last candle
    const [lastCandle] = await this.getFromDB(symbol, interval, 1)
    let candles: ICandle[]

    // start from last candle time
    if (lastCandle) {
      candles = await this.system.broker.getCandlesFromTime(symbol, interval, lastCandle[CANDLE_FIELD.TIME])
    }

    // load the full preload amount
    else {
      candles = await this.system.broker.getCandlesFromCount(symbol, interval, count)
    }

    // store new candles in database
    await this.saveToDB(symbol, interval, candles)

    // create memory cache of candles
    // TODO - remove from candle server
    this.candles[symbol][interval] = await this.getFromDB(symbol, interval, count)
  }

  /**
   * prepare candles object
   * set symbols and timeframes
   */
  private prepareCandleData(): void {
    const symbols = this.system.configManager.config.symbols
    const intervals = this.system.configManager.config.intervals

    for (let i = 0, len = symbols.length; i < len; i++) {
      this.candles[symbols[i]] = {}

      for (let k = 0, lenk = intervals.length; k < lenk; k++) {
        this.candles[symbols[i]] = { [intervals[k]]: [] }
      }
    }
  }
}
