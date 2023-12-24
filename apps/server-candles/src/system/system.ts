import { CandleService } from '../modules/candle/candle.service'
import {
  BrokerEntity,
  BrokerYahoo,
  DB,
  System,
  TICKER_TYPE,
  SystemDecorator,
  XtbBroker,
  BrokerAlphavantage,
} from '@candlejumper/shared'

@SystemDecorator({
  type: TICKER_TYPE.SYSTEM_CANDLES,
  brokers: [
    // {
    //   class: XtbBroker,
    // },
    // {
    //   class: BrokerAlphavantage,
    // }
  ]
})
export class SystemCandles extends System {
  constructor(
    // private db: DB,
    // private candleService: CandleService
  ) {
    super(null, null, null, null)
  }

  async onInit() {
    // await this.db.init([BrokerEntity, ...this.candleService.createCandleEntities()])

    // await this.candleService.sync()

    // this.candleService.startWebsocketListener()
    // this.candleService.startOutTickInterval()
  }
}
