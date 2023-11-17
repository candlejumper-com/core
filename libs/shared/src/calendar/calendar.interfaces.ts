import { InsightsResult } from "yahoo-finance2/dist/esm/src/modules/insights"

export interface ICalendarItem {
  symbol: string,
  name: string,
  reportDate: Date,
  fiscalDateEnding: Date,
  estimate: string,
  currency: string
  diffInPercent?: number
  insights?: InsightsResult
}
