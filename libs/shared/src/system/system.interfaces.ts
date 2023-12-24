import { ISymbol } from "../modules/symbol/symbol.interfaces"
import { TICKER_TYPE } from "../ticker/ticker.util"

export interface ISystemState {
    config: {
        symbols: string[]
    }
    account: any
    tickers: {
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
    symbols: ISymbol[]
    profitIndex?: number
    profit?: number
}

