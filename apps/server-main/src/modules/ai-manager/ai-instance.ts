import { WorkerPool } from 'workerpool';
import { System } from '../../system/system';
import { logger } from '../../util/log';
import {
    ITensorflowOptions,
  ITensorflowRunResult,
  ITensorFlowWorkerData,
  ITensorFlowWorkerMessage,
  ITensorFlowWorkerMessageProgress,
} from './ai.interfaces';
import { TENSORFLOW_WORKER_ACTION } from './ai.util';
import { AIContainer } from './ai-container';

export class AIInstance {
  static ID_COUNTER = 0;

  id = AIInstance.ID_COUNTER++;

  constructor(public system: System, public container: AIContainer, public workerPool: WorkerPool, public options: ITensorflowOptions) {}

  async run(): Promise<void> {
    const symbolName = this.options.symbol;
    const brokerSymbol = this.system.broker.getExchangeInfoBySymbol(symbolName);
    const symbol = this.system.candleManager.getSymbolByPair(symbolName);

    // check if symbol is recognized (currently in use / cached)
    if (!brokerSymbol || !symbol) {
      logger.error(`BACKTEST - Symbol ${symbolName} is not valid`);
    }

    // loop over all intervals
    const workerData: ITensorFlowWorkerData = {
      id: this.id,
      options: this.options,
      candles: await this.system.candleManager.getCandles(symbolName, '1d', this.options.count),
    };

    console.log(222, workerData.candles.length);

    this.workerPool.exec('run', [workerData], {
      on: ({ data, action }: ITensorFlowWorkerMessage<ITensorFlowWorkerMessageProgress>) => {
        if (action === TENSORFLOW_WORKER_ACTION.PROGRESS) {
          this.system.apiServer.io.emit('AI_JOB_PROGRESS', {
            container: this.container.id,
            id: this.id,
            data
          });
        }

        if (action === TENSORFLOW_WORKER_ACTION.FINISHED) {
          this.system.apiServer.io.emit('AI_JOB_FINISHED', {
            container: this.container.id,
            id: this.id,
            data
          });
        }
      },
    })
  }
}
