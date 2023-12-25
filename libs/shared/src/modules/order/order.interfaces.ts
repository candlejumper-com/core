import { ITickerSnapshot } from "../../ticker/ticker.interfaces"
import { ICandle } from "../candle"
import { ISymbol } from "../symbol/symbol.interfaces"

export const enum ORDER_SIDE {
    'BUY' = 'BUY',
    'SELL' = 'SELL'
}

export interface IOrder {
    id?: number
    type?: string
    side?: ORDER_SIDE
    symbol?: string
    quantity?: number
    price?: number
    time?: number
    profit?: number
    commission?: number
    commissionAsset?: string
    commissionUSDT?: number
    stopPrice?: number
    stopLossTriggered?: boolean
}

export interface IOrderOptions {
    force?: boolean
    side: ORDER_SIDE
    symbol: ISymbol,
    stopLoss?: number
    takeProfit?: number
    price?: number
    quantity?: number
}

export interface IOrderSnapshot {
    indicators: ITickerSnapshot[];
    candles: ICandle[];
}

export interface IOrderData {
    snapshot?: IOrderSnapshot;
    reason?: string
    text?: string
    data?: any
    interval?: string
}