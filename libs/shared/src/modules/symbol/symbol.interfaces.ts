import { ICalendarItem } from "../../calendar/calendar.interfaces"


export interface ISymbol {
  name?: string
  baseAsset?: string
  baseAssetPrecision?: number
  baseAssetIcon?: string
  quoteAsset?: string
  price?: number
  priceString?: string
  direction?: number

  // TEMP
  change24H?: number
  start24HPrice?: number
  change24HString?: string
  changedSinceLastClientTick?: boolean
  totalOrders?: number
  orders?: any[]
  insights?: any
  // insights?: InsightsResult
  calendar?: ICalendarItem[]
}