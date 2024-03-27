import {
  ITensorFlowWorkerData,
  ITensorFlowWorkerMessage,
  ITensorFlowWorkerMessageProgress,
  ITensorflowOptions,
  ITensorflowRunResult,
} from './ai.interfaces';
import { join } from 'path';
import { SystemMain } from '../../system/stystem.main';
import { logger } from '@candlejumper/shared';
import { Pool, pool } from 'workerpool';
import { TENSORFLOW_WORKER_ACTION } from './ai.util';
import { AIContainer } from './ai-container';

export class AIManager {

  private workerPool: Pool;
  private containers: AIContainer[] = []

  constructor(public system: SystemMain, public maxWorkers?: number) {}

  run(options: ITensorflowOptions): AIContainer {
    if (!this.workerPool) {
      this.createWorkerPool();
    }

    const container = new AIContainer(this.system, this.workerPool, options)

    // options.symbols.forEach((symbolName) => container.add(symbolName));
    this.containers.push(container)

    container.run()

    return container
  }

  private createWorkerPool(): void {
    const options: any = {};

    if (this.maxWorkers) {
      options.maxWorkers = this.maxWorkers;
    }
    // TODO clean up, fucking strange
    // const url = new URL('./ai-worker', import.meta.url);
    this.workerPool = pool('./dist/apps/server-main/ai-worker.js', { maxWorkers: 1 });
  }
}
