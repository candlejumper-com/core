// import { InsightsResult } from "yahoo-finance2/dist/esm/src/modules/insights"
// import { ISymbol } from "../../candle"

export interface IInsight {
  symbol?: any
  insights?: any
  updatedAt?: Date
  short?: number
  mid?: number
  long?: number
  skip?: boolean
}