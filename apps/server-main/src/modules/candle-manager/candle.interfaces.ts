import { ICandle } from '@candlejumper/shared'

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