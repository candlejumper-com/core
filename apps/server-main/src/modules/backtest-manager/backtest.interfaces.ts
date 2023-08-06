import { ExchangeInfo } from "binance"
import { ISystemState } from "../../system/system.interfaces"
import { BACKTEST_TYPE } from "./backtest-manager"
import { ISymbol } from "@candlejumper/shared"

export interface IBacktestOptions {
    symbols: string[]
    intervals: string[]
    candleCount: number
    USDT: number
    bots: string[]
    optimize: number
    type: BACKTEST_TYPE
    start?: string
}

export interface IWorkerData {
    exchangeInfo: ExchangeInfo
    options: {
        symbol: ISymbol
        interval: string
        candleCount: number
        bots: any[]
        USDT: number
        optimize: number
        type: BACKTEST_TYPE
    }
}

export interface IBacktestResult {
    totalTime: number
    config: IBacktestOptions
    systems: ISystemState[]
}