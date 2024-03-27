import { ApiServer } from './system.api'
import { CandleManager } from '../modules/candle-manager/candle.manager'
import { BROKER_PURPOSE, BrokerEntity, DB, InsightEntity, SymbolEntity, System, TICKER_TYPE, XtbBroker } from '@candlejumper/shared'
import { createCandleEntities } from '../modules/candle-manager/candle.entity'

export class SystemCandles extends System {
  override type = TICKER_TYPE.SYSTEM_CANDLES

  readonly apiServer = new ApiServer(this)
  readonly candleManager = new CandleManager(this)

  async onInit() {
    this.db = new DB(this, [BrokerEntity, SymbolEntity, InsightEntity])
    await this.db.init()

    await this.brokerManager.add(XtbBroker, [BROKER_PURPOSE.CANDLES])
    // console.log(this.brokerManager['brokers'])

    this.db = new DB(this, [BrokerEntity, SymbolEntity, InsightEntity, ...createCandleEntities(this.system)])

    await this.db.init()

    await this.candleManager.syncAll()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()
  }
}
