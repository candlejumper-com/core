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
  override id = "SYSTEM"
  override system = this

  time: Date

  db: DB
  readonly insightManager = new InsightManager(this)
  readonly brokerManager = new BrokerManager(this)
  readonly configManager = new ConfigManager(this)
  readonly symbolManager = new SymbolManager(this)
  readonly orderManager: OrderManager
  apiServer: ApiServerBase

  protected isRunning = false

  constructor(public type?: TICKER_TYPE) {
    super(null, null, null, null)

    setProcessExitHandlers(this)
  }

  override async init(): Promise<void> {
    setLogSystemEnvironment(this.type)

    const now = Date.now()
    logger.info(`\u267F Initialize system \n-------------------------------------------------------------`)

    await super.init()
    await this.configManager.init()
    await this.symbolManager.init()
    await this.onInit?.()

    logger.info(
      `\u2705 Initialize system (${Date.now() - now}ms)\n-------------------------------------------------------------`
    )

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
      `\u2705 Started system \n--------------------------------------------------------------`
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
