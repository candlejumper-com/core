import { System } from "../system/system"
import { CandleTickerCallback, IAccount, IBrokerInfo } from "./broker.interfaces"
import { BrokerEntity } from "./binance/broker-binance.entity"
import { ICandle } from "@candlejumper/shared"
import { logger } from "../util/log"
import Queue from "queue-promise";

const queue = new Queue({
    concurrent: 6,
    interval: 10
  });
  

export abstract class Broker {

    abstract id: string

    account: IAccount
    exchangeInfo: IBrokerInfo
    timezone: string

    protected eventListeners = []

    abstract instance: any
    protected abstract loadConfig(): Promise<IBrokerInfo>
    abstract getCandlesFromTime(market: string, interval: string, count: number): Promise<ICandle[]>
    abstract getCandlesFromCount(market: string, interval: string, count: number): Promise<ICandle[]>
    abstract startCandleTicker(symbols: string[], intervals: string[], callback: CandleTickerCallback): void

    onInit?(): Promise<void>

    constructor(public system: System) { }

    async init() {
        await this.onInit?.()

        logger.info('\u231B Sync exchange info')

        const now = Date.now()
        let fromLocal = true

        // this.exchangeInfo = await this.getByName(this.id)
        // console.log(this.exchangeInfo)
        if (!this.exchangeInfo) {
            fromLocal = false
            this.exchangeInfo = await this.loadConfig()
            await this.addBroker(this.id, this.exchangeInfo)
        }

        process.env.TZ = this.exchangeInfo.timezone

        logger.info(`\u2705 Sync exchange info (${Date.now() - now}ms) - (${fromLocal ? 'cached' : 'remote'})`)
    }

    /**
     * get symbol info
     */
    getExchangeInfoBySymbol(symbol: string): IBrokerInfo['symbols'][0] {
        return this.exchangeInfo.symbols.find(_symbol => _symbol.name === symbol)
    }

    addQueue(method: any): Promise<any> {
        // console.log('Add queue!')
        return new Promise((resolve, reject) => {
          return queue.add(() => method().then(resolve).catch(reject))
        })
      }

    async addBroker(name: string, data: any) {
        const repository = this.system.db.connection.getRepository(BrokerEntity)
        await repository.insert({ name, data: JSON.stringify(data) })
    }

    async getByName(name: string) {
        const repository = this.system.db.connection.getRepository(BrokerEntity)
        const broker = await repository.findOne({ where: { name } })

        if (broker) {
            return JSON.parse(broker.data)
        }
    }
}