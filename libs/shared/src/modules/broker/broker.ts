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

export abstract class Broker {
  abstract id: string

  onCandleTickCallback: (symbol: ISymbol, interval: INTERVAL, candle: ICandle, isFinal: boolean) => Promise<void>
  onInit?(): Promise<void>

  account = { balances: [] } as IAccount
  exchangeInfo: IBrokerInfo
  axios = createAxiosRetryInstance()

  constructor(public system: System, public purposes: BROKER_PURPOSE[]) {}

  async init() {
    if (this.system.type !== TICKER_TYPE.SYSTEM_BACKTEST) {
      await this.onInit?.()
    }

    if (this.system.type === TICKER_TYPE.SYSTEM_CANDLES) {
      const now = Date.now()
      logger.info(`♿ [${this.id}] Sync exchange info from broker`)
      await this.syncExchangeFromBroker()
      logger.info(`✅ [${this.id}] Sync exchange info from broker (${Date.now() - now} ms)`)
    } else {
      await this.syncExchangeFromCandleServer()
    }

    if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
      if (!this.exchangeInfo.timezone) {
        throw new Error('Missing broker timezone')
      }

      process.env.TZ = this.exchangeInfo.timezone
    }
    
    this.exchangeInfo.symbols.forEach(async symbol => this.system.symbolManager.add(this, symbol))

    await this.getOrders()
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

  async syncExchangeFromCandleServer(): Promise<void> {
    logger.info(`♿ [${this.id}] Sync exchange info from candle server`)

    const now = Date.now()
    const {host, port} = this.system.configManager.config.server.candles

    try {
      const { data: { exchangeInfo} } = await this.axios.get(`http://${host}:${port}/api/exchange/${this.id}`)
      this.exchangeInfo = exchangeInfo

      logger.info(`✅ [${this.id}] Sync exchange info from candle server (${Date.now() - now} ms)`)
    } catch (error: any) {
      if (error.cause) {
        logger.error(error.cause)
      } else if (error.status) {
        console.error(error.status)
        console.error(error.data)
      } else {
        console.error(error)
      }

      throw new Error(`error fetching broker config from candle server`.red)
    }
  }

  async getOrders(): Promise<void> {
    logger.warn(`⚠️ [${this.id}] Method not implemented: getOrders`)
    return null
  }

  async getSymbolInsights(symbol: ISymbol): Promise<InsightsResult> {
    throw new Error('Method not implemented: ' + 'getSymbolInsights')
  }
  
  async syncAccount(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async syncExchangeFromBroker(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async getOrdersBySymbol(symbol: Symbol): Promise<IOrder[]> {
    throw new Error('Method not implemented.')
  }
  async placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull> {
    throw new Error('Method not implemented.')
  }
  async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): Promise<void> {
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
}
