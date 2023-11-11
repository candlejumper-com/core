import "colors"
import { logger } from '../util/log'
import { Ticker } from "../ticker/ticker"
import { TICKER_TYPE } from "@candlejumper/shared"
import { setProcessExitHandlers } from "../util/exit-handlers.util"
import { ConfigManager } from "../config/config-manager"

export enum SYSTEM_ENV {
  MAIN = "MAIN",
  BACKTEST = "BACKTEST",
}

export abstract class SystemBase extends Ticker<null> {
  type = TICKER_TYPE.SYSTEM

  time: Date

  readonly configManager = new ConfigManager(this)

  override system = this

  protected isRunning = false

  constructor(public env: SYSTEM_ENV) {
    super(null, null, null, null, null)

    setProcessExitHandlers(this)
  }

  override async init(): Promise<void> {
    await super.init()
    await this.configManager.init()
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
