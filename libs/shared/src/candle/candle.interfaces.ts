import { ICalendarItem, IInsight } from "../index_client"
import { INTERVAL } from "../util/util"

export interface ICandle {
  [0]: number
  [1]: number
  [2]: number
  [3]: number
  [4]: number
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