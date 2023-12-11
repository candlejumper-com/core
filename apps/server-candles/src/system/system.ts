import { ApiServer } from '../api/api'
import { CandleManager } from '../candle-manager/candle-manager'
import { DB } from '../db/db'
import { logger } from '../util/log'
import { BrokerBinance, BrokerBitmart, BrokerYahoo, SYSTEM_ENV, SystemBase } from '@candlejumper/shared'

export class System extends SystemBase {
  override readonly name = 'CANDLES'

  readonly db = new DB(this)
  readonly candleManager = new CandleManager(this)
  readonly apiServer = new ApiServer(this)

  async onInit() {
    const broker = await this.brokerManager.add(BrokerYahoo)

    // this.configManager.config.symbols = broker.exchangeInfo.symbols
    //   .map((symbol) => symbol.name)
    //   .filter((symbolName) => /^[^.=:]+$/.test(symbolName))

    //   console.log(66666666666, this.configManager.config.symbols, broker.exchangeInfo.symbols, this.system.symbolManager.symbols)
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

  async clean() {
    await this.db.clean()
  }
}
