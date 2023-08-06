import { ITensorFlowWorkerData, ITensorflowOptions, ITensorflowRunResult } from "./ai.interfaces"
import { join } from "path"
import { System } from "../../system/system"
import { logger } from "../../util/log"
import { WorkerPool, pool } from "workerpool"

const PATH_WORKER = join(__dirname, "ai.worker.js")

export class AIManager {

  private workerPool: WorkerPool

  constructor(public system: System, public maxWorkers?: number) {}

  async run(options: ITensorflowOptions): Promise<ITensorflowRunResult[]> {
    const now = Date.now()
    const promiseList = []

    if (!this.workerPool) {
      this.createWorkerPool()
    }

    // loop over all symbols
    for (let i = 0, len = options.symbols.length; i < len; ++i) {
      const symbolName = options.symbols[i]
      const brokerSymbol = this.system.broker.getExchangeInfoBySymbol(symbolName)
      const symbol = this.system.candleManager.getSymbolByPair(symbolName)

      // check if symbol is recognized (currently in use / cached)
      if (!brokerSymbol || !symbol) {
        logger.error(`BACKTEST - Symbol ${symbolName} is not valid`)
        continue
      }

      // loop over all intervals
      const workerData: ITensorFlowWorkerData = {
        options: options,
        candles: await this.system.candleManager.getCandles(symbolName, "1d", options.count),
      }

      console.log(222, workerData.candles.length)

      const workerJob = this.workerPool.exec("run", [workerData])

      promiseList.push(workerJob)
    }
    
    return Promise.all(promiseList)
    // console.log(results)
    // const systems = this.getData(results.filter(Boolean), options)
    // const totalTime = Date.now() - now

    // this.latest = {
    //     config: options,
    //     totalTime,
    //     systems
    // }
  }

  private createWorkerPool(): void {
    const options: any = {}

    if (this.maxWorkers) {
      options.maxWorkers = this.maxWorkers
    }

    this.workerPool = pool(PATH_WORKER, options)
  }
}
