import { ICandle } from "@candlejumper/shared"
import { CANDLE_FIELD } from "../candle-manager/candle-manager"
import { DataSMAvec } from "./ai.interfaces"

export enum TENSORFLOW_WORKER_ACTION {
  "RUN" = "RUN",
  "PROGRESS" = "PROGRESS",
  "FINISHED" = "FINISHED",
  "ERROR" = "ERROR",
}

export enum TENSORFLOW_HARDWARE {
  "CPU" = "cpu",
  "WASM" = "wasm",
}

export function computeSMA(candles: ICandle[], window_size: number): DataSMAvec[] {
  let result = []
  let avg = 0.0
  let t = 0

  for (let i = 0; i <= candles.length - window_size; i++) {
    avg = 0.0
    t = i + window_size

    for (let k = i; k < t && k <= candles.length; k++) {
      avg += candles[k][CANDLE_FIELD.CLOSE] / window_size
    }
    result.push({ set: candles.slice(i, i + window_size), avg })
  }
  return result
}
