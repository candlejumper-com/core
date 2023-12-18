import { System } from '../../system/system'
import { IOrder } from '../../order/order.interfaces'
import { OrderResponseACK, OrderResponseResult, OrderResponseFull } from 'binance'
import { CandleTickerCallback, IAccount, IBrokerInfo } from './broker.interfaces'
import { logger } from '../../util/log'
import { ICandle } from '../../modules/candle'
import { createAxiosRetryInstance } from '../../util/axios-retry'
import { TICKER_TYPE } from '../../ticker/ticker.util'
import { ISymbol } from '../symbol/symbol.interfaces'

export abstract class Broker {
  abstract id: string
  abstract syncAccount(): Promise<void>
  abstract syncExchangeFromBroker(): Promise<void>
  abstract getOrdersByMarket(market: string): Promise<IOrder[]>
  abstract placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull>
  abstract startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void>
  abstract startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): void
  abstract getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]>
  abstract getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]>

  onCandleTickCallback: (symbol: ISymbol, interval: string, candle: ICandle, isFinal: boolean) => Promise<void>
  onInit?(): Promise<void>

  account = { balances: [] } as IAccount
  exchangeInfo: IBrokerInfo
  axios = createAxiosRetryInstance()

  constructor(public system: System) {}

  async init() {
    if (this.system.type !== TICKER_TYPE.SYSTEM_BACKTEST) {
      await this.onInit?.()
    }

    if (this.system.type === TICKER_TYPE.SYSTEM_CANDLES) {
      const now = Date.now()
      logger.info(`\u267F [${this.id}] Sync exchange info from broker`)
      await this.syncExchangeFromBroker()
      logger.info(`\u2705 [${this.id}] Sync exchange info from broker (${Date.now() - now} ms)`)
    } else {
      await this.syncExchangeFromCandleServer()
    }

    if (this.system.type === TICKER_TYPE.SYSTEM_MAIN) {
      if (!this.exchangeInfo.timezone) {
        throw new Error('Missing broker timezone')
      }

      process.env.TZ = this.exchangeInfo.timezone
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

  getExchangeInfoBySymbol(symbol: string): any {
    return this.exchangeInfo.symbols.find(_symbol => _symbol.name === symbol)
  }

  async syncExchangeFromCandleServer(): Promise<void> {
    logger.info(`\u267F [${this.id}] Sync exchange info from candle server`)

    const now = Date.now()
    const {host, port} = this.system.configManager.config.server.candles

    try {
      const { data: { exchangeInfo} } = await this.axios.get(`http://${host}:${port}/api/exchange/${this.id}`)
      this.exchangeInfo = exchangeInfo

      logger.info(`\u2705 [${this.id}] Sync exchange info from candle server (${Date.now() - now} ms)`)
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
}
