import { ITickerSnapshot } from "../../ticker/ticker.interfaces"
import { ICandle } from "../candle"
import { Symbol } from "../symbol/symbol"
import { ORDER_SIDE, ORDER_TYPE } from "./order.util"

export interface IOrder {
    id?: number
    type: string
    side: ORDER_SIDE
    symbol: Symbol
    symbolName?: string
    quantity?: number
    price?: number
    time?: number
    profit?: number
    commission?: number
    commissionAsset?: string
    commissionUSDT?: number
    stopPrice?: number
    stopLossTriggered?: boolean
    state?: any
    result?: any
    data?: any
    snapshot?: IOrderSnapshot;
}

export interface IOrderOptions {
    type: ORDER_TYPE
    force?: boolean
    side: ORDER_SIDE
    symbol: Symbol,
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