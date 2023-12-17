import { ApiServer } from '../api/api'
import { CandleManager } from '../candle-manager/candle-manager'
import { logger } from '../util/log'
import { BrokerEntity, BrokerYahoo, DB, InsightEntity, SYSTEM_ENV, System, createCandleEntity, getCandleEntityName } from '@candlejumper/shared'

export class SystemCandles extends System {
  env = SYSTEM_ENV.CANDLES
  override readonly name = 'CANDLES'

  readonly candleManager = new CandleManager(this)
  readonly apiServer = new ApiServer(this)

  async onInit() {
    await this.brokerManager.add(BrokerYahoo)

    this.db = new DB(this, [BrokerEntity, InsightEntity, ...this.createCandleEntities()])

    await this.db.init()

    await this.candleManager.sync()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()

    logger.info(`\u2705 Initialize system \n-------------------------------------------------------------`)

    this.isInitialized = true
  }

  /**
   * start running
   */
  async start(): Promise<void> {
    await super.start()

    if (this.env === SYSTEM_ENV.MAIN) {
      logger.info(`${this.env} - ${'READY'.green}`)
      console.info(`--------------------------------------------------------------`)
    }
  }

  private createCandleEntities() {
    const symbols = this.system.symbolManager.symbols
    const intervals = this.system.configManager.config.intervals
    const tableNames = symbols.map(symbol => intervals.map(interval => getCandleEntityName(this.system, symbol.name, interval))).flat()
    return tableNames.map(tableName => createCandleEntity(tableName))
  }
}
