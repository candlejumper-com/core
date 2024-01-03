import { System } from '../../system/system'
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance'
import { CandleTickerCallback, IAccount, IBrokerInfo } from './broker.interfaces'
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
import { XtbBroker } from '../../brokers/xtb/xtb.broker'

export abstract class Broker {
  abstract id: string

  onCandleTickCallback: (symbol: Symbol, interval: INTERVAL, candle: ICandle, isFinal: boolean) => Promise<void>
  onInit?(): Promise<void>

  account = { balances: [] } as IAccount
  exchangeInfo: IBrokerInfo
  axios = createAxiosRetryInstance()

  constructor(
    public system: System,
    private purposes: BROKER_PURPOSE[],
  ) {}

  async init() {
    if (this.system.type !== TICKER_TYPE.SYSTEM_BACKTEST) {
      await this.onInit?.()
    }

    const now = Date.now()
    logger.info(`♿ [${this.id}] Sync exchange info from broker`)
    await this.syncExchange()
    logger.info(`✅ [${this.id}] Sync exchange info from broker (${Date.now() - now} ms)`)

    if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
      if (!this.exchangeInfo.timezone) {
        throw new Error('Missing broker timezone')
      }

      process.env.TZ = this.exchangeInfo.timezone
    }

    // if (this.id === 'xtb') {
    this.exchangeInfo.symbols.forEach(symbol => this.system.symbolManager.add(this, structuredClone(symbol)))
    // }

    if (this.system.type === TICKER_TYPE.SYSTEM_MAIN && this.hasPurpose(BROKER_PURPOSE.ORDERS)) {
      await this.syncOrders()
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

  async syncOrders(): Promise<void> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: syncOrders`)
    return null
  }

  async getSymbolInsights(symbol: ISymbol): Promise<InsightsResult> {
    throw new Error('Method not implemented: ' + 'getSymbolInsights')
  }

  async syncAccount(): Promise<void> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: syncAccount`)
  }

  async syncExchange(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async getOrdersBySymbol(symbol: Symbol): Promise<IOrder[]> {
    throw new Error('Method not implemented.')
  }
  async closeOrder(order: IOrder): Promise<void> {
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
  async isMarketOpen(symbol: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
}
