import "colors"
import { logger } from '../util/log'
import { TICKER_TYPE } from "@candlejumper/shared"
import { setProcessExitHandlers } from "../util/exit-handlers.util"
import { ConfigManager } from "../config/config-manager"
import { createAxiosRetryInstance } from "../util/axios-retry"
import { SymbolManager } from "../modules/symbol/symbol.manager"
import { BrokerManager } from "../modules/broker/broker.manager"
import { Ticker } from "../ticker/ticker"

export enum SYSTEM_ENV {
  MAIN = "MAIN",
  BACKTEST = "BACKTEST",
}

export abstract class SystemBase extends Ticker<null> {
  abstract name?: string
  
  override id = "SYSTEM"
  override system = this

  axios = createAxiosRetryInstance()

  type = TICKER_TYPE.SYSTEM

  time: Date

  readonly brokerManager = new BrokerManager(this)
  readonly configManager = new ConfigManager(this)
  readonly symbolManager = new SymbolManager(this)

  protected isRunning = false

  constructor(public env: SYSTEM_ENV) {
    super(null, null, null, null, null)

    setProcessExitHandlers(this)
  }

  override async init(): Promise<void> {
    await super.init()
    await this.configManager.init()
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
