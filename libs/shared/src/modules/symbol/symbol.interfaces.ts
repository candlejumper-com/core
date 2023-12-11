import { ICalendarItem } from "../../calendar/calendar.interfaces"
import { ICandle } from "../../candle/candle.interfaces"
import { INTERVAL } from "../../util/util"
import { IInsight } from "../insight/insight.interfaces"


export interface ISymbol {
  name?: string
  baseAsset?: string
  baseAssetPrecision?: number
  baseAssetIcon?: string
  quoteAsset?: string
  price?: number
  priceString?: string
  direction?: number

  candles?: {
    [key in INTERVAL]?: ICandle[]
  }

  // TEMP
  change24H?: number
  start24HPrice?: number
  change24HString?: string
  changedSinceLastClientTick?: boolean
  totalOrders?: number
  orders?: any[]
  calendar?: ICalendarItem[]
  insights?: IInsight
}