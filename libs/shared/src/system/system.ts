import 'reflect-metadata'
import "colors"
import { logger, setLogSystemEnvironment } from '../util/log'
import { DB, InsightManager, SystemDecorator, TICKER_TYPE } from "@candlejumper/shared"
import { setProcessExitHandlers } from "../util/exit-handlers.util"
import { ConfigService } from "../modules/config/config.service"
import { Ticker } from "../ticker/ticker"

@SystemDecorator({
  type: TICKER_TYPE.SYSTEM_BASE
})
export abstract class System extends Ticker<null> {
  override id = "SYSTEM"
  override system = this

  modules: any

  time: Date

  // readonly orderManager: any

  protected isRunning = false

  // constructor(public configManager: ConfigService) {
  //   console.log(2222, configManager)
  //   super(null, null, null, null)

  //   setProcessExitHandlers(this)
  // }

  override async init(): Promise<void> {
    setLogSystemEnvironment(this.type)

    const now = Date.now()
    logger.info(`\u267F Initialize system \n-------------------------------------------------------------`)

    await super.init()
    await this.modules.get(ConfigService).onInit()
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

  toggleProductionMode(state: boolean): void {
    // const prevMode = this.configManager.config.production.enabled

    // if (prevMode === state) {
    //   return
    // }

    // this.configManager.config.production.enabled = state
  }

}
