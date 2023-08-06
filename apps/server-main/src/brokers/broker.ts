import { System, SYSTEM_ENV } from "../system/system"
import { logger } from "../util/log"
import { IOrder } from "../modules/order-manager/order.interfaces"
import { OrderResponseACK, OrderResponseResult, OrderResponseFull, DailyChangeStatistic, SpotAssetBalance, ExchangeInfo, AccountInformation } from "binance"
import { IAccount, IBrokerInfo } from "./broker.interfaces"

export abstract class Broker {

    account: IAccount = { balances: [] } as any
    exchangeInfo: IBrokerInfo
    timezone: string

    onInit?(): Promise<void>

    abstract syncAccount(): Promise<void>
    abstract syncExchange(): Promise<void>
    abstract getOrdersByMarket(market: string): Promise<IOrder[]>
    abstract placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull>

    constructor(public system: System) { }

    async init() {
        await this.onInit?.()
        await this.syncExchange()
        
        if (this.system.env === SYSTEM_ENV.MAIN) {
            if (!this.timezone) {
                throw new Error('Missing broker timezone')
            }

            process.env.TZ = this.timezone
        }
    }

    getBalance(asset: string): number {
        const balanceAsset = this.account.balances.find(balance => balance.asset === asset)

        if (!balanceAsset) {
            logger.warn(`Balance asset not found: ${asset}`)
            return 0
        }

        return balanceAsset.free 
    }

    hasEnoughBalance(asset: string, amount: number): boolean {
        const balance = this.account.balances.find(balance => balance.asset === asset)
        return balance.free >= amount
    }
}