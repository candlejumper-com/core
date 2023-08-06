import { Injectable } from "@angular/core"
import { CANDLE_FIELD, ICandle, isForwardCandleArray } from "@candlejumper/shared"
import { ITensorflowRunResult, ITensorflowOptions } from "../../../shared/services/tensorflow/tensorflow.interfaces"
import { GraphData } from "./training-view.interfaces"

@Injectable({
  providedIn: 'root',
})
export class TrainingViewService {
  getGraphData(
    inputs: ITensorflowRunResult['data']['inputs'],
    candles: ICandle[],
    options: ITensorflowOptions
  ): GraphData[] {
    const predictionSize = options.predictionSize
    const smaSize = options.SMALength
    const trainingCandles = candles.slice(0, -predictionSize)
    const predictTCandles = candles.slice(candles.length - predictionSize, candles.length)
    const isForward = isForwardCandleArray(trainingCandles)

    if (!isForward) {
      throw new Error('Time array must flow forwards (candles[0] = "MONDAY", candles[1] = "TUESDAY"')
    }

    inputs.predY = new Float32Array(inputs.predY)

    const historyPrices = {
      x: trainingCandles.map((candle) => new Date(candle[0])),
      y: trainingCandles.map((val) => val[CANDLE_FIELD.CLOSE]) as any,
      name: 'History Price',
    }

    const futurePrices = {
      x: predictTCandles.map((candle) => new Date(candle[0])),
      y: predictTCandles.map((val) => val[CANDLE_FIELD.CLOSE]) as any,
      name: 'Future Price',
    }

    const SMA = {
      x: trainingCandles.slice(smaSize, candles.length).map((candle) => new Date(candle[0])),
      y: inputs.sma,
      name: 'Training Label (SMA)',
    }

    const prediction = {
      x: predictTCandles.map((candle) => new Date(candle[0])),
      y: inputs.predY,
      name: 'Predicted',
    }

    return [historyPrices, futurePrices, SMA, prediction]
  }

  getPricesTimestamps(candles: ICandle[]): Date[] {
    return candles.map((val) => new Date(val[CANDLE_FIELD.TIME]))
  }

  getSMATimestamps(candles: ICandle[], smaSize: number, trainingSize: number): number[] {
    return candles
      .map((val) => val[CANDLE_FIELD.TIME])
      .splice(smaSize, candles.length - Math.floor(((100 - trainingSize) / 100) * candles.length))
  }

  getPredictionTimestamps(candles: ICandle[], smaSize: number, trainingSize: number): number[] {
    return candles
      .map((val) => val[CANDLE_FIELD.TIME])
      .splice(smaSize + Math.floor((trainingSize / 100) * candles.length), candles.length)
  }
}
