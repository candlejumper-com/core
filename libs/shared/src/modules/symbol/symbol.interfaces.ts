import { INTERVAL } from "../../util/util"
import { ICalendarItem } from "../calendar/calendar.interfaces"
import { ICandle } from "../candle/candle.interfaces"
import { IInsight } from "../insight/insight.interfaces"

export interface ISymbol extends ISymbolInfo {
  candles?: {
    [key in INTERVAL]?: ICandle[]
  }
  orders?: any[]
}

export interface ISymbolInfo {
  name?: string
  baseAsset?: string
  baseAssetPrecision?: number
  baseAssetIcon?: string
  quoteAsset?: string
  price?: number
  priceString?: string
  direction?: number
  change24H?: number
  start24HPrice?: number
  change24HString?: string
  changedSinceLastClientTick?: boolean
  totalOrders?: number
  insights?: IInsight
  calendar?: ICalendarItem[]
}