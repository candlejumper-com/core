import "colors"
import { logger, setLogSystemEnvironment } from '../util/log'
import { ApiServerBase, DB, InsightManager, TICKER_TYPE } from "@candlejumper/shared"
import { setProcessExitHandlers } from "../util/exit-handlers.util"
import { ConfigManager } from "../modules/config/config-manager"
import { SymbolManager } from "../modules/symbol/symbol.manager"
import { BrokerManager } from "../modules/broker/broker.manager"
import { Ticker } from "../ticker/ticker"
import { OrderManager } from "../modules/order/order-manager"

export abstract class System extends Ticker<null> {
  override system = this
  override id = "SYSTEM"

  time: Date
  isRunning = false
  production = process.env['NODE_ENV'] !== 'production'

  db: DB
  apiServer: ApiServerBase
  orderManager: OrderManager
  // insightManager: InsightManager

  readonly brokerManager = new BrokerManager(this)
  readonly configManager = new ConfigManager(this)
  readonly symbolManager = new SymbolManager(this)

  constructor() {
    super(null, null, null, null)

    setProcessExitHandlers(this)
  }

  override async init(): Promise<void> {
    super.init()

    this.configManager.init()

    setLogSystemEnvironment(this)

    const now = Date.now()
    logger.info(`♿ Initialize system \n-------------------------------------------------------------`)

    await this.symbolManager.init()
    await this.onInit?.()

    logger.info(`✅ Initialize system (${Date.now() - now}ms) `)

    this.isInitialized = true
  }

  async start() {
    if (this.isRunning) {
      throw new Error("Already running")
    }

    if (!this.isInitialized) {
      await this.init()
    }

    this.isRunning = true

    logger.info(
      `🦄 Started system \n--------------------------------------------------------------`
    );
  }

  stop() {
    if (!this.isRunning) {
      logger.warn("Not running")
      return
    }

    this.isRunning = false
  }
}
