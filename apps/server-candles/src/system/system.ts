import { ApiServer } from './system.api'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import {
  BrokerEntity,
  BrokerYahoo,
  DB,
  InsightEntity,
  System,
  TICKER_TYPE,
  XtbBroker,
  createCandleEntity,
  getCandleEntityName
} from '@candlejumper/shared'

export class SystemCandles extends System {
  readonly type = TICKER_TYPE.SYSTEM_CANDLES
  readonly candleManager = new CandleManager(this)
  apiServer = new ApiServer(this)

  async onInit() {
    // await this.brokerManager.add(BrokerYahoo)
    await this.brokerManager.add(XtbBroker)
    
    this.symbolManager.syncSymbolsWithBroker()

    this.db = new DB(this, [BrokerEntity, InsightEntity, ...this.createCandleEntities()])

    await this.db.init()

    await this.candleManager.sync()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()
  }

  /**
   * 
   * create candle entities for each symbol and interval
   */
  private createCandleEntities() {
    const symbols = this.system.symbolManager.symbols
    const intervals = this.system.configManager.config.intervals
    const tableNames = symbols.map(symbol => intervals.map(interval => getCandleEntityName(this.system, symbol.name, interval))).flat()
    return tableNames.map(tableName => createCandleEntity(tableName))
  }
}
