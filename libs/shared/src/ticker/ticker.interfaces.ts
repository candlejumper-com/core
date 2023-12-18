import { ICandle } from '../modules/candle/candle.interfaces'
import { BOT_INDICATOR_TYPE } from '../bot/bot.interfaces'
import { TICKER_EVENT_TYPE } from "./ticker.util"
import { ISymbol } from '../modules/symbol/symbol.interfaces'

export interface ITickerParams<T> {
    class?: any
    // class?: typeof Ticker<T>
    id: string | number
    // class?: typeof Ticker
    path?: string
    symbol?: ISymbol
    interval?: string
    params?: any
}

export interface ITickerEvent {
    time: Date,
    id: number,
    type: TICKER_EVENT_TYPE
    data?: any
}

export interface ITickerSnapshot {
    candles: ICandle[],
    output: any, // depends on indicator
    type: BOT_INDICATOR_TYPE,
    params: any,
}

export interface ITicker {
    // type: string
    env: string
    account: any
    name: string
    price: number
    symbol: ISymbol
    interval: string
    events: any[]
    config: any
    baseAsset: string
    quoteAsset: string
    hits: number
    stats: {
      ticks: number
      candles: number
    }
  }