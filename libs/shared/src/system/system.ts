import "colors"
import { logger } from '../util/log'
import { DB, InsightManager, TICKER_TYPE } from "@candlejumper/shared"
import { setProcessExitHandlers } from "../util/exit-handlers.util"
import { ConfigManager } from "../config/config-manager"
import { createAxiosRetryInstance } from "../util/axios-retry"
import { SymbolManager } from "../modules/symbol/symbol.manager"
import { BrokerManager } from "../modules/broker/broker.manager"
import { Ticker } from "../ticker/ticker"

export enum SYSTEM_ENV {
  MAIN = "MAIN",
  BACKTEST = "BACKTEST",
  CANDLES = "CANDLES",
}

export abstract class System extends Ticker<null> {
  abstract name?: string
  
  override id = "SYSTEM"
  override system = this

  axios = createAxiosRetryInstance()

  type = TICKER_TYPE.SYSTEM

  time: Date
  
  readonly abstract env: SYSTEM_ENV

  db: DB
  readonly insightManager = new InsightManager(this)
  readonly brokerManager = new BrokerManager(this)
  readonly configManager = new ConfigManager(this)
  readonly symbolManager = new SymbolManager(this)
  readonly orderManager: any

  protected isRunning = false

  constructor() {
    super(null, null, null, null)
  }

  override async init(): Promise<void> {
    setProcessExitHandlers(this)

    await super.init()
    await this.configManager.init()
    await this.symbolManager.init()
    await this.onInit?.()
  }

  async start() {
    logger.info(
      `\u231B Initialize system \n--------------------------------------------------------------`
    );

    if (this.isRunning) {
      throw new Error("Already running")
    }

    if (!this.isInitialized) {
      await this.init()
    }

    this.isRunning = true
  }

  stop() {
    if (!this.isRunning) {
      logger.warn("Not running")
      return
    }

    this.isRunning = false
  }
}
