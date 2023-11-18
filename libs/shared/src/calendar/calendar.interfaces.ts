import { InsightsResult } from "yahoo-finance2/dist/esm/src/modules/insights"
import { ICandle } from "../candle/candle.interfaces"

export interface ICalendarItem {
  symbol: string,
  name: string,
  reportDate: Date,
  fiscalDateEnding: Date,
  estimate: string,
  currency: string
  diffInPercent?: number
  insights?: InsightsResult
  candles?: ICandle[]
}
