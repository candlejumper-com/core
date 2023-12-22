import { ApiServer } from './system.api'
import { CandleManager } from '../modules/candle-manager/candle-manager'
import {
  BrokerEntity,
  BrokerYahoo,
  DB,
  System,
  TICKER_TYPE,
  SystemDecorator,
} from '@candlejumper/shared'

@SystemDecorator({
  type: TICKER_TYPE.SYSTEM_CANDLES,
  brokers: [
    {
      class: BrokerYahoo
    }
  ]
})
export class SystemCandles extends System {
  constructor(
    private db: DB,
    private candleManager: CandleManager,
    private apiServer: ApiServer,
  ) {
    super(null, null, null, null)
  }

  async onInit() {
    await this.db.init([BrokerEntity, ...this.candleManager.createCandleEntities()])

    await this.candleManager.sync()
    await this.apiServer.start()

    this.candleManager.startWebsocketListener()
    this.candleManager.startOutTickInterval()
  }
}
