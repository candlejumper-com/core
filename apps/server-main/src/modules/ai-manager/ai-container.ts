import { Pool } from 'workerpool';
import { SystemMain } from '../../system/system';
import { logger } from '@candlejumper/shared';
import {
  ITensorflowOptions,
  ITensorflowRunResult,
  ITensorFlowWorkerData,
  ITensorFlowWorkerMessage,
  ITensorFlowWorkerMessageProgress,
} from './ai.interfaces';
import { TENSORFLOW_WORKER_ACTION } from './ai.util';
import { symbolName } from 'typescript';
import { AIInstance } from './ai-instance';

export class AIContainer {
  static ID_COUNTER = 0;

  id = AIContainer.ID_COUNTER++;

  instances:AIInstance[] = [];

  constructor(public system: SystemMain, public workerPool: Pool, public options: ITensorflowOptions) {
    this.init();
  }

  init() {
    this.options.symbols.forEach((symbolName) => this.add(symbolName));
  }

  add(symbolName: string) {
    const instance = new AIInstance(this.system, this, this.workerPool, { ...this.options, symbol: symbolName });
    this.instances.push(instance);
  }

  run(): void {
    this.instances.forEach(instance => instance.run())
  }
}
