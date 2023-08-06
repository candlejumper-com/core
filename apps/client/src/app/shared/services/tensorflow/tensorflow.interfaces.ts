import { CANDLE_DATA_ORIGIN, ICandle } from '@candlejumper/shared'
import { TENSORFLOW_HARDWARE, TENSORFLOW_WORKER_ACTION } from "./tensorflow.util";

export interface ITensorflowOptions {
  inputs?: number[][];
  outputs?: number[];
  symbol?: string;
  symbols?: string[];
  timeframe?: string;
  SMALength?: number;
  predictionSize?: number;
  epochs?: number;
  learningRate?: number;
  hiddenLayers?: number;
  hardware?: TENSORFLOW_HARDWARE
  dataOrigin?: CANDLE_DATA_ORIGIN
  count?: number
}

export interface ITensorflowRunResult {
  data: {
    inputs: {
      predX: number[][];
      predY: Float32Array;
      sma: number[][];
    }
  }
  stats: {
    startTime: number
    totalTime: number
  }
}

export interface TensorFlowOutput {
  dataSmaVec: DataSMAvec[];
  sma: number[];
  prices: number[];
  timestamps_a: number[];
  timestamps_b: number[];
}

export interface TrainedModel {
  stats: History;
}

export interface DataSMAvec {
  avg: number;
  set: ICandle[];
}

export interface ITensorFlowWorkerMessage<T> {
  action: TENSORFLOW_WORKER_ACTION,
  data: T
}

export interface ITensorFlowWorkerMessageRun {
  options: any
  candles: ICandle[]
}

export interface ITensorFlowWorkerMessageProgress {
  loss: number
  epoch: number
  totalEpoch: number
}

export interface ITensorFlowWorkerMessageError {

}