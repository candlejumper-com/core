import { ISymbol } from "@candlejumper/shared"
import { TICKER_TYPE } from "../tickers/ticker"
import { SYSTEM_ENV } from "./system"

export interface ISystemState {
    config: {
        symbols: string[]
    }
    account: any
    tickers: {
        env: SYSTEM_ENV,
        config: {
            // indicators: JSON.parse(JSON.stringify(bot.getIndicatorConfigs()))
        },
        type: TICKER_TYPE,
        name: string,
        symbol: ISymbol,
        interval: string,
        stats: {
            startTime: Date
        },
        data: any,
        events: any[],
        hits: number
    }[]
    symbols: {
        [symbolName: string]: ISymbol
    }
    profitIndex?: number
    profit?: number
}

