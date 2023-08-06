import "color"
import { worker, workerEmit } from "workerpool"
import { ITensorFlowWorkerData, ITensorflowRunResult } from "./ai.interfaces"
import { TensorflowCustomModel } from "./models/tensorflow.custom.model"
import { TENSORFLOW_WORKER_ACTION } from "./ai.util"

worker({
    async run(data: ITensorFlowWorkerData): Promise<void> {
        try {
          const now = Date.now()
          const model = new TensorflowCustomModel(data.options, data.candles)
          await model.run()

          workerEmit({
            action: TENSORFLOW_WORKER_ACTION.FINISHED,
            data: {
                stats: {
                    startTime: now,
                    totalTime: Date.now() - now,
                },
                data: await model.validate()
            }
          })
        } catch (error) {
            console.error(error)
            // throw error
        }
    },
})