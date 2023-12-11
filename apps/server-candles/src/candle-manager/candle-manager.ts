import { Repository } from "typeorm"
import { System } from "../system/system"
import { logger } from "../util/log"
import { getCandleEntityName } from "./candle.entity"
import { ICandleObject } from "./candle.interfaces"
import { showProgressBar } from "../util/util"
import { writeFileSync } from "fs"
import { CANDLE_FIELD, isForwardCandleArray, ICandle } from "@candlejumper/shared"

export class CandleManager {
  private outTickIntervalTime = 200
  private outTickInterval: NodeJS.Timer

  constructor(public system: System) {}

  /**
   * open websockets for all symbols + intervals
   */
  startWebsocketListener(): void {
    const intervals = this.system.configManager.config.intervals
    const symbols = this.system.symbolManager.symbols.map((symbol) => symbol.name)

    this.system.brokerManager.get().startCandleTicker(symbols, intervals, async (symbol, interval, candle, isFinal) => {
      if (isFinal) {
        await this.saveToDB(symbol, interval, [candle])
      }
    })
  }

  startOutTickInterval(): void {
    this.outTickInterval = setInterval(() => {
      const candles = {}

      this.system.symbolManager.symbols.forEach((symbol) => {
          for (const interval in symbol) {
            if (!candles[symbol.name]) {
              candles[symbol.name] = {}
            }
            if (symbol.candles[interval]?.[0]) {
              console.log(232, symbol.candles[interval][0])
            }

            candles[symbol.name][interval] = symbol[interval][0]
          }
      })

      this.system.apiServer.io.emit("candles", candles)
    }, this.outTickIntervalTime)
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
    const symbols = this.system.symbolManager.symbols
    const intervals = config.intervals
    const preloadAmount = config.preloadAmount
    const promises = []
    const progressBar = showProgressBar(symbols.length * intervals.length, "candles")
    console.log(34334, symbols)
    for (let i = 0, len = symbols.length; i < len; ++i) {
      const symbol = symbols[i]

      for (let k = 0, lenk = Object.keys(symbol.candles).length; k < lenk; k++) {
        const interval = intervals[k]
        await this.syncSymbol(symbol.name, interval, preloadAmount).then(() => progressBar.tick())
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
    const broker = this.system.brokerManager.get()

    // get last candle
    const [lastCandle] = await this.getFromDB(symbol, interval, 1)
    let candles: ICandle[]

    // start from last candle time
    if (lastCandle) {
      candles = await this.system.brokerManager.get().getCandlesFromTime(symbol, interval, lastCandle[CANDLE_FIELD.TIME])
    }

    // load the full preload amount
    else {
      candles = await this.system.brokerManager.get().getCandlesFromCount(symbol, interval, count)
    }

    // store new candles in database
    await this.saveToDB(symbol, interval, candles)

    // create memory cache of candles
    // TODO - remove from candle server
    // this.candles[symbol][interval] = await this.getFromDB(symbol, interval, count)
  }
}
