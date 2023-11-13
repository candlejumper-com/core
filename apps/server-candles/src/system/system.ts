import { ApiServer } from '../api/api'
import commandLineArgs from 'command-line-args'
import { CandleManager } from '../candle-manager/candle-manager'
import { DB } from '../db/db'
import { logger } from '../util/log'
import { BrokerBinance, BrokerBitmart, BrokerYahoo, SYSTEM_ENV, SystemBase } from '@candlejumper/shared'

const cliOptions = commandLineArgs([
  { name: 'clean', alias: 'c', type: Boolean, defaultOption: false },
  { name: 'dev', type: Boolean, defaultOption: false },
])

export class System extends SystemBase {
  readonly db = new DB(this)
  readonly broker = new BrokerBitmart(this)
  // readonly broker = new BrokerYahoo(this)
  // readonly broker = new BrokerBinance(this)
  readonly candleManager = new CandleManager(this)
  readonly apiServer = new ApiServer(this)

  async init() {
    await super.init()

    if (cliOptions.clean) {
      await this.clean()
    }

    await this.db.init()
    await this.broker.init()

    // use only symbols with USDT (for now)
    // this.broker.exchangeInfo.symbols = this.broker.exchangeInfo.symbols.filter(symbol => this.configManager.config.symbols.includes(symbol.name))
    this.broker.exchangeInfo.symbols = this.broker.exchangeInfo.symbols.filter((symbol) =>
      this.configManager.config.symbols.includes(symbol.name),
    )

    this.configManager.config.symbols = this.broker.exchangeInfo.symbols.map((symbol) => symbol.name)

    await this.candleManager.init()
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
