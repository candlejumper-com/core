import { ICalendarItem } from "../index_client"

export interface ICandle {
  [0]: number
  [1]: number
  [2]: number
  [3]: number
  [4]: number
}

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
  calendar?: ICalendarItem[]
}

export interface ICandleObject {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number,
  closeTime?: number,
  quoteVolume?: number,
  trades?: number,
  baseAssetVolume?: number,
  quoteAssetVolume?: number
}

export interface ICandleServerEvent {
  [key: string]: {
      [key: string]: ICandle
  }
}