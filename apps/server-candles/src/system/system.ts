import { ApiServer } from './system.api'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import { BrokerEntity, DB, InsightEntity, System, TICKER_TYPE, XtbBroker, createCandleEntities } from '@candlejumper/shared'

export class SystemCandles extends System {
  readonly type = TICKER_TYPE.SYSTEM_CANDLES
  readonly candleManager = new CandleManager(this)
  apiServer = new ApiServer(this)

  async onInit() {
    // await this.brokerManager.add(BrokerYahoo)
    await this.brokerManager.add(XtbBroker)

    this.db = new DB(this, [BrokerEntity, InsightEntity, ...createCandleEntities(this.system)])

    await this.db.init()

    await this.candleManager.sync()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()
  }
}
