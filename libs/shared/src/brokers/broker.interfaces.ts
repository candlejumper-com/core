import { ICandle, ISymbol } from "@candlejumper/shared"
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

export interface IBrokerInfo {
    timezone: string
    symbols: ISymbol[]
}