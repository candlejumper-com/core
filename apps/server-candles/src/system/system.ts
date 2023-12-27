import { ApiServer } from './system.api'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import { BROKER_PURPOSE, BrokerEntity, DB, InsightEntity, System, TICKER_TYPE, XtbBroker, createCandleEntities } from '@candlejumper/shared'

export class SystemCandles extends System {
  override type = TICKER_TYPE.SYSTEM_CANDLES

  readonly apiServer = new ApiServer(this)
  readonly candleManager = new CandleManager(this)

  async onInit() {
    await this.brokerManager.add(XtbBroker, [BROKER_PURPOSE.CANDLES])
    const exchangeInfo = this.system.brokerManager.getByPurpose(BROKER_PURPOSE.CANDLES).exchangeInfo
    console.log(exchangeInfo.symbols[0])

    this.db = new DB(this, [BrokerEntity, InsightEntity, ...createCandleEntities(this.system)])

    await this.db.init()

    await this.candleManager.syncAll()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()


  }
}
