import { System } from '../../system/system'
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance'
import { CandleTickerCallback, IAccount, IBrokerInfo, ITradingTime } from './broker.interfaces'
import { logger } from '../../util/log'
import { ICandle } from '../../modules/candle'
import { createAxiosRetryInstance } from '../../util/axios-retry'
import { TICKER_TYPE } from '../../ticker/ticker.util'
import { ISymbol } from '../symbol/symbol.interfaces'
import { Symbol } from '../symbol/symbol'
import { IOrder } from '../order/order.interfaces'
import { INTERVAL } from '../../index_client'
import { ICalendarItem } from '../calendar/calendar.interfaces'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'
import { BROKER_PURPOSE } from './broker.util'
import { SymbolEntity } from '../symbol/symbol.entity'
import { BrokerEntity } from './broker.entity'

export abstract class Broker {
  abstract id: string

  onCandleTickCallback: (symbol: Symbol, interval: INTERVAL, candle: ICandle, isFinal: boolean) => Promise<void>
  onInit?(): Promise<void>

  account = { balances: [] } as IAccount
  exchangeInfo: IBrokerInfo = {}
  axios = createAxiosRetryInstance()

  private entity: typeof BrokerEntity

  constructor(
    public system: System,
    private purposes: BROKER_PURPOSE[],
  ) {}

  async init() {
    if (this.system.type !== TICKER_TYPE.SYSTEM_BACKTEST) {
      await this.onInit?.()
      await this.save()
    }

    const now = Date.now()
    logger.info(`♿ [${this.id}] Sync exchange info from broker`)
    
    this.exchangeInfo = await this.getExchangeInfo()

    if (!this.exchangeInfo.timezone) {
      throw new Error('Missing broker timezone')
    }

    logger.info(`✅ [${this.id}] Sync exchange info from broker (${Date.now() - now} ms)`)

    process.env.TZ = this.exchangeInfo.timezone

    logger.info(`✅ [${this.id}] Sync exchange info from broker`)

    await this.sync()
  }
 
  async sync() {
    const now = Date.now()

    // await this.syncExchange()

    if (this.system.type === TICKER_TYPE.SYSTEM_MAIN || this.system.type === TICKER_TYPE.SYSTEM_CANDLES) {
      if (this.hasPurpose(BROKER_PURPOSE.CANDLES) || this.hasPurpose(BROKER_PURPOSE.INSIGHT)) {
        await this.syncSymbols()
        
        this.exchangeInfo.symbols.forEach(symbol => this.system.symbolManager.add(this, symbol))
      }
      if (this.hasPurpose(BROKER_PURPOSE.ORDERS)) {
        // await this.getExchangeInfo()
        await this.syncOrders()
      }
    }
  }

  hasPurpose(purpose: BROKER_PURPOSE): boolean {
    return this.purposes.includes(purpose)
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

  getExchangeInfoBySymbol(symbol: string): any {
    return this.exchangeInfo.symbols.find(_symbol => _symbol.name === symbol)
  }

  async getSymbolDetails(symbol: string): Promise<ISymbol> {
    const now = Date.now()
    logger.info(`♿ [${this.id}] - get symbol details: ${symbol}`)

    // const repositoryName = getSymbolEntityName(this, symbol)
    const repository =  this.system.db.connection.getRepository<SymbolEntity>(SymbolEntity)
    const symbolDetails = await repository.find({where: { name: symbol}})?.[0]
    // const symbolDetails = await repository.find({where: {broker: BrokerEntity, name: symbol}})?.[0]
    // console.log('SYMBOL DETAILS', symbolDetails)
    if (!symbolDetails) {
      const details = await this.onGetSymbolDetails(symbol)
      const detailsObj = repository.create({ name: symbol, ...details })

      const symbolDetails = await repository.save({ name: symbol })
      return symbolDetails
    } 

    console.log('fresh!')
    // console.log(2323, symbolDetails)
    return symbolDetails
  }

  async save() {
    const repository =  this.system.db.connection.getRepository<BrokerEntity>(BrokerEntity)
    console.log('id,', this.id)
    const broker = await repository.upsert({ id: null, name: this.id },  {
      conflictPaths: ["name"],
      skipUpdateIfNoValuesChanged: true, // supported by postgres, skips update if it would not change row values
      // upsertType: UpsertOptions, //  "on-conflict-do-update" | "on-duplicate-key-update" | "upsert" - optionally provide an UpsertType - 'upsert' is currently only supported by CockroachDB
  },)

    console.log(' BROKER', broker)
  }

  async syncOrders(): Promise<void> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: syncOrders`)
    return null
  }

  async getSymbolInsights(symbol: ISymbol): Promise<InsightsResult> {
    throw new Error('Method not implemented: ' + 'getSymbolInsights')
  }

  async syncSymbols(): Promise<void> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: syncSymbols`)
  }
  async syncAccount(): Promise<void> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: syncAccount`)
    return null
  }
  
  async getExchangeInfo(): Promise<IBrokerInfo> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: syncAccount`)
    return null
  }
  async syncExchange(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async getOrdersBySymbol(symbol: Symbol): Promise<IOrder[]> {
    throw new Error('Method not implemented.')
  }
  async closeOrder(order: IOrder): Promise<any> {
    throw new Error('Method not implemented.')
  }
  async placeOrder(order: IOrder): Promise<IOrder> {
    throw new Error('Method not implemented.')
  }
  async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async startCandleTicker(symbols: Symbol[], intervals: string[], callback: CandleTickerCallback): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]> {
    throw new Error('Method not implemented.')
  }
  async getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
    throw new Error('Method not implemented.')
  }
  async getCalendarItems(): Promise<ICalendarItem[]> {
    throw new Error('Method not implemented.')
  }
  async isMarketOpen(symbol: Symbol): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  async getTradingHoursBySymbol(symbol: Symbol): Promise<ITradingTime> {
    throw new Error('Method not implemented.')
  }
  async onGetSymbolDetails(symbolName: string): Promise<ISymbol> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: onGetSymbolDetails`)
    return null
  }


}
