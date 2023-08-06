import { Injectable } from '@angular/core'
import { ITensorflowOptions, ITensorflowRunResult } from '../tensorflow/tensorflow.interfaces'
import { TensorflowInstance } from '../tensorflow/instance/tensorflow.instance'
import { CandleService } from '../candle/candle.service'
import { BehaviorSubject } from 'rxjs'
import { WSService } from '../ws/ws.service'

@Injectable({
  providedIn: 'root',
})
export class AIService {
  instances$ = new BehaviorSubject<TensorflowInstance[]>([])

  constructor(private wsService: WSService) {}

  run(options: ITensorflowOptions): void {
    const instances = options.symbols.map((symbol) => {
      const singleRunOptions = { ...options, symbol }

      const instance = new TensorflowInstance(singleRunOptions)

      this.wsService.socket.emit('post:/api/ai', singleRunOptions, (result: ITensorflowRunResult[]) => {
        result[0].data.inputs.predY = new Float32Array(result[0].data.inputs.predY)
        instance.result$.next(result[0])
      })

      return instance
    })

    this.instances$.next(this.instances$.value.concat(instances))
  }
}
