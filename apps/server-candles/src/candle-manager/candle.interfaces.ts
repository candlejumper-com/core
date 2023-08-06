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