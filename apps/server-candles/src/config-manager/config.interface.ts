
export interface ISystemConfig {
    symbols?: string[]
    intervals?: string[]
    bots?: string[]
    quantityPercentage?: number
    spread?: number
    syncInterval?: number
    maxOpenOrders?: number
    preloadAmount?: number
    warmupAmount?: number
    minTimeBetweenOrders?: number
    automize?: {
        enabled?: boolean
    }
    brokers: {
        binance?: {
            apiKey?: string
            apiSecret?: string
        },
        ig?: {
            apiKey: string
            password: string
            username: string
        },
    }
    data?: {
        path?: string
    },
    server?: {
        api?: {
            host: string
            port: number
        }
    }
    production?: {
        enabled?: boolean
        maxTradingAmount?: number,
        bots?: any[]
    }
}