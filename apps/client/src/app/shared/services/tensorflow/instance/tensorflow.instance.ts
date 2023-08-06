import { EventEmitter } from '@angular/core'
import {
  ITensorflowOptions,
  ITensorflowRunResult,
  ITensorFlowWorkerMessage,
  ITensorFlowWorkerMessageError,
  ITensorFlowWorkerMessageProgress,
} from '../tensorflow.interfaces'
import { BehaviorSubject } from 'rxjs'

export class TensorflowInstance {
  worker: Worker

  events$ = new EventEmitter<ITensorFlowWorkerMessage<ITensorflowRunResult | ITensorFlowWorkerMessageError>>()
  progres$ = new BehaviorSubject<ITensorFlowWorkerMessageProgress>(null)
  result$ = new BehaviorSubject<ITensorflowRunResult>(null)

  constructor(public options: ITensorflowOptions) {}
}
