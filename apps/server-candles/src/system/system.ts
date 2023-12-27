import { ApiServer } from './system.api'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import { BROKER_PURPOSE, BrokerEntity, DB, InsightEntity, System, TICKER_TYPE, XtbBroker, createCandleEntities } from '@candlejumper/shared'

export class SystemCandles extends System {
  override type = TICKER_TYPE.SYSTEM_CANDLES

  readonly apiServer = new ApiServer(this)
  readonly candleManager = new CandleManager(this)

  async onInit() {
    await this.brokerManager.add(XtbBroker, [BROKER_PURPOSE.CANDLES])

    this.db = new DB(this, [BrokerEntity, InsightEntity, ...createCandleEntities(this.system)])

    await this.db.init()

    await this.candleManager.sync()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()
  }
}
