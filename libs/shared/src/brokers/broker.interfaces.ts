import { ICandle } from "@candlejumper/shared"
import { DailyChangeStatistic, SpotAssetBalance, AccountInformation } from "binance"
import { ISymbol } from "../modules/symbol/symbol.interfaces"

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

export interface IWallet {
    id?: number
    address: string
    filename: string
    gitUrl?: string
    chain?: string
    privateKey: string
    fileContent?: string
    balanceBNB?: number
    balanceETH?: number
    lastTransaction?: Date
    lastCheck?: Date
    version: number
}