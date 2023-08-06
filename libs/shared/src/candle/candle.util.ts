import { ICandle} from './candle.interfaces'

export const INTERVAL_MILLISECONDS = {
  "1m": 60000,
  "5m": 5 * 60000,
  "15m": 15 * 60000,
  "1h": 60 * 60000,
  "4h": 4 * 60 * 60000,
  "1d": 24 * 60 * 60000,
}

export enum CANDLE_DATA_ORIGIN {
  "STATIC" = "static",
  "LIVE" = "live",
}

export enum CANDLE_FIELD {
  "TIME",
  "OPEN",
  "HIGH",
  "LOW",
  "CLOSE",
  "VOLUME",
}

// test if all candles are linear in time
// timeline goes from [0 = newest] to [1 = older]
export function isForwardCandleArray(candles: ICandle[]): boolean {
  for (let i = 1, len = candles.length; i < len; ++i) {
    const candleTime = candles[i][CANDLE_FIELD.TIME]
    const previousCandleTime = candles[i - 1][CANDLE_FIELD.TIME]

    // previous candle time must be LOWER than current candle
    if (previousCandleTime > candleTime) {
      return false
    }
  }

  return true
}
