import { Injectable } from '@angular/core'
import { ITensorflowOptions, ITensorflowTaskResponse } from '../tensorflow/tensorflow.interfaces'
import { TensorflowInstance } from '../tensorflow/instance/tensorflow.instance'
import { BehaviorSubject } from 'rxjs'
import { WSService } from '../ws/ws.service'
import { AIGroup } from './ai-group'

@Injectable({
  providedIn: 'root',
})
export class AIService {
  containers$ = new BehaviorSubject<AIGroup[]>([])

  constructor(private wsService: WSService) {}

  init() {
    this.wsService.socket.on('AI_JOB_PROGRESS', data => {

      const container = this.containers$.value.find(container => container.id === data.container)

      if (!container) {
        return
      }
      const instance = container.instances.find(instance => instance.id === data.id)
      console.log('instance', data.data)
      instance.progres$.next(data.data)
    })

    this.wsService.socket.on('AI_JOB_FINISHED', data => {
      console.log('AI_JOB_FINISHED', data)

      const container = this.containers$.value.find(container => container.id === data.container)
      const instance = container.instances.find(instance => instance.id === data.id)
      instance.result$.next(data.data)
      console.log(3434,instance)
    })
  }

  run(options: ITensorflowOptions): void {
    this.wsService.socket.emit('post:/api/ai', options, (result: ITensorflowTaskResponse) => {
      const container = new AIGroup()
      container.id = result.id
      container.options = options
      console.log(result)
      container.instances = result.instances.map(instance => new TensorflowInstance(instance.symbol, options, instance.id))

      this.containers$.next(this.containers$.value.concat([container]))
      console.log(container)
      // result[0].data.inputs.predY = new Float32Array(result[0].data.inputs.predY)
      // instance.result$.next(result[0])
    })
  }
}
