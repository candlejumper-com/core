import { Repository } from 'typeorm'
import {
  CANDLE_FIELD,
  isForwardCandleArray,
  ICandle,
  ISymbol,
  ICandleObject,
  getCandleEntityName,
  showProgressBar,
  logger,
  Service,
  ConfigService,
  DB,
  createCandleEntity,
  BrokerService,
  SymbolService,
} from '@candlejumper/shared'
import { ApiServer } from '../../system/system.api'

@Service({})
export class CandleService {
  private outTickIntervalTime = 200
  private outTickInterval: NodeJS.Timer

  constructor(
    private db: DB,
    // private apiServer: ApiServer,
    // // private symbolService: SymbolService,
    // private configManager: ConfigService,
    // private brokerService: BrokerService
  ) {}

  /**
   * open websockets for all symbols + intervals
   */
  startWebsocketListener(): void {
    // const intervals = this.configManager.config.intervals
    // const symbols = this.symbolService.symbols

    // this.brokerService.get().startCandleTicker(symbols, intervals, async (symbol, interval, candle, isFinal) => {
    //   if (isFinal) {
    //     await this.saveToDB(symbol, interval, [candle])
    //   }
    // })
  }

  startOutTickInterval(): void {
    this.outTickInterval = setInterval(() => {
      const candles = {}

      // this.symbolService.symbols.forEach(symbol => {
      //   for (const interval in symbol) {
      //     if (!candles[symbol.name]) {
      //       candles[symbol.name] = {}
      //     }
      //     if (symbol.candles[interval]?.[0]) {
      //       candles[symbol.name][interval] = symbol.candles[interval][0]
      //     }
      //   }
      // })

      // this.apiServer.io.emit('candles', candles)
    }, this.outTickIntervalTime)
  }

  async getFromDB(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
    try {
      const result = await this.getRepository(symbol, interval).find({ take: count, order: { time: 'DESC' } })
      const candles: ICandle[] = result.map(row => [row.time, row.open, row.high, row.low, row.close, row.volume])
      return candles.reverse()
    } catch (error) {
      console.error(`Symbol not found ${symbol.name} - ${interval}`)
      console.error(error)
      return undefined
    }
  }

  async saveToDB(symbol: ISymbol, interval: string, candles: ICandle[]): Promise<void> {
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

  createCandleEntities() {
    // const symbols = this.symbolService.symbols
    // const intervals = this.configManager.config.intervals
    // const tableNames = symbols.map(symbol => intervals.map(interval => getCandleEntityName(symbol.name, interval))).flat()
    // return tableNames.map(tableName => createCandleEntity(tableName))
    return []
  }

  /**BNBN
   * sync candles between database and broker
   */
  async sync(): Promise<void> {
    logger.info(`\u267F Sync candles`)

    const now = Date.now()
    // const config = this.configManager.config
    // // const symbols = this.symbolService.symbols
    // const intervals = config.intervals
    // const preloadAmount = config.preloadAmount
    // const promises = []
    // const progressBar = showProgressBar(symbols.length * intervals.length, 'candles')

    // console.log(symbols, ' symbols');
    

    // for (let i = 0, len = symbols.length; i < len; ++i) {
    //   const symbol = symbols[i]
    //   if (!symbol.name.startsWith('HALO.US_4')) {
    //     continue
    //   }
    //   for (let k = 0, lenk = Object.keys(symbol.candles).length; k < lenk; k++) {
    //     const interval = intervals[k]
    //     await this.syncSymbol(symbol, interval, preloadAmount).then(() => progressBar.tick())
    //   }
    // }

    // await Promise.all(promises)

    logger.info(`\u2705 Sync candles (${Date.now() - now}ms)`)
  }

  private getRepository(symbol: ISymbol, interval: string): Repository<ICandleObject> {
    const repositoryName = getCandleEntityName(symbol.name, interval)
    return this.db.connection.getRepository(repositoryName)
  }

  /**
   * preload data from broker and store in DB
   */
  private async syncSymbol(symbol: ISymbol, interval: string, count: number): Promise<void> {
    // const broker = this.brokerService.get()

    // // get last candle
    // const [lastCandle] = await this.getFromDB(symbol, interval, 1)
    // let candles: ICandle[]

    // // start from last candle time
    // if (lastCandle) {
    //   candles = await this.brokerService.get().getCandlesFromTime(symbol, interval, lastCandle[CANDLE_FIELD.TIME])
    // }

    // // load the full preload amount
    // else {
    //   candles = await this.brokerService.get().getCandlesFromCount(symbol, interval, count)
    // }

    // // store new candles in database
    // await this.saveToDB(symbol, interval, candles)
  }
}
