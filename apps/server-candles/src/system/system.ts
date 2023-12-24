import { ApiServer } from './system.api'
import { CandleService } from '../modules/candle/candle.service'

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
      class: BrokerYahoo,
    }
  ]
})
export class SystemCandles extends System {
  constructor(
    private db: DB,
    private candleService: CandleService,
    private apiServer: ApiServer,
  ) {
    super(null, null, null, null)
  }

  async onInit() {
    await this.db.init([BrokerEntity, ...this.candleService.createCandleEntities()])

    await this.candleService.sync()
    await this.apiServer.start()

    this.candleService.startWebsocketListener()
    this.candleService.startOutTickInterval()
  }
}
