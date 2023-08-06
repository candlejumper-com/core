import { ICandle } from "@candlejumper/shared"
import { DailyChangeStatistic, SpotAssetBalance, AccountInformation } from "binance"

export interface IDailyStatsResult extends Omit<DailyChangeStatistic, 'quoteVolume'> {
    quoteVolume: number
}

export interface IBalance extends Omit<SpotAssetBalance, 'free' | 'locked'> {
    free: number
    locked: number
}

export interface IAccount extends Omit<AccountInformation, 'balances'> {
    balances: IBalance[]
}

export type CandleTickerCallback = (symbol: string, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>

export interface ISymbol {
    delayTime: 0,
    epic: string,
    netChange: 0,
    lotSize: 10,
    expiry: '-',
    instrumentType: 'CURRENCIES',
    name: 'AUD/USD',
    high: 0.67333,
    low: 0.67267,
    percentageChange: 0,
    updateTime: '75539000',
    updateTimeUTC: '20:58:59',
    bid: 0.67276,
    offer: 0.67342,
    otcTradeable: true,
    streamingPricesAvailable: true,
    marketStatus: 'EDITS_ONLY',
    scalingFactor: 10000
    baseAsset: string
}

export interface IBrokerInfo {
    timezone: string
    symbols: ISymbol[]
}