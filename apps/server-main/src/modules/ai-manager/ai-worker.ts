import "color"
import { worker } from "workerpool"
import { ITensorFlowWorkerData, ITensorflowRunResult } from "./ai.interfaces"
import { TensorflowCustomModel } from "./models/tensorflow.custom.model"

worker({
    async run(data: ITensorFlowWorkerData): Promise<ITensorflowRunResult> {
        try {
          const now = Date.now()
          const model = new TensorflowCustomModel(data.options, data.candles)
          await model.run()

          return {
              stats: {
                  startTime: now,
                  totalTime: Date.now() - now,
              },
              data: await model.validate()
          }
        } catch (error) {
            console.error(error)
            // throw error
        }
    },
})