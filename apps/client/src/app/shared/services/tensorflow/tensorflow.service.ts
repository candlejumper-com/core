import { Injectable } from '@angular/core'
import { TensorflowInstance } from './instance/tensorflow.instance'
import { ITensorflowOptions, ITensorflowRunResult } from './tensorflow.interfaces'

@Injectable({
  providedIn: 'root',
})
export class TensorflowService {

  instances: TensorflowInstance[] = []

  async run(options: ITensorflowOptions): Promise<TensorflowInstance> {
    const instance = new TensorflowInstance(options)
    this.instances.push(instance)

    return instance
  }
}
