import { INTERVAL } from "../../util/util"

export interface ISystemConfig {
    dev: boolean,
    logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent',
    security?: {
        jwtSecret?: string
    }
    thirdParty: {
        alphavantage: {
            apiKey: string
        },
        openAI: {
            apiKey: string
        }
    }
    intervals?: INTERVAL[]
    bots?: string[]
    quantityPercentage?: number
    spread?: number
    syncInterval?: number
    maxOpenOrders?: number
    preloadAmount?: number
    warmupAmount?: number
    minTimeBetweenOrders?: number
    tickers?: {
        default?: string[]
    },
    automize?: {
        enabled?: boolean
    }
    brokers?: {
        binance?: {
            apiKey?: string
            apiSecret?: string
        },
        ig?: {
            apiKey?: string
            password?: string
            username?: string
        },
        bitmart?: {
            name: string
            apiKey: string
            apiSecret: string
        },
        xtb?: {
            type: 'demo' | 'real'
            accountId: string
            username: string
            password: string
        }
    }
    server?: {
        api?: {
            host: string
            port: number
        },
        candles?: {
            host: string
            port: number
        }
    }
    production?: {
        enabled?: boolean
        maxTradingAmount?: number,
        bots?: {
            class: string,
            interval: string,
            symbol: string,
            optimize?: number
            id: string | number
        }[]
    }
}