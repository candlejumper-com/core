import { HistoricalHistoryResult } from 'yahoo-finance2/dist/esm/src/modules/historical'
import { logger, ICandle, ISymbol, IOrder } from '@candlejumper/shared'
import { Broker } from '../broker'
import { IBrokerInfo, CandleTickerCallback } from '../broker.interfaces'
import yahooFinance from 'yahoo-finance2'
import { format } from 'date-fns'
import { OrderResponseFull, OrderResponseResult } from 'binance'
import { writeFileSync } from 'fs'
import { TrendingSymbolsResult } from 'yahoo-finance2/dist/esm/src/modules/trendingSymbols'
import TEMP_BROKER_INFO from './broker-yahoo.json'
import TEMP_TRENDING_SYMBOLS from './trending-symbols.json'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'
import axios from 'axios'

const defaultOptions = {};

export class BrokerYahoo extends Broker {
  id = 'Yahoo'
  instance: any
  websocket = null

  http = rateLimit(axios.create(defaultOptions), { maxRequests: 5, perMilliseconds: 1000 });

  async getTrendingSymbols(count = 500, mock = true): Promise<ISymbol[]> {
    if (mock) {
      return TEMP_TRENDING_SYMBOLS.map(symbol => ({ name: symbol }))
    }

    const result = (await yahooFinance.trendingSymbols('US', { count })) as TrendingSymbolsResult
    const symbols: ISymbol[] = result.quotes.map(symbol => ({ name: symbol.symbol }))

    // temp
    writeFileSync('./trending-symbols.json', JSON.stringify(symbols, null, 2))

    return symbols
  }

  getSymbolInsights(symbol: string): Promise<InsightsResult> {
    return yahooFinance.insights(symbol)
  }

  async placeOrder(order: IOrder): Promise<OrderResponseResult | OrderResponseFull> {
    // return this.system.broker.instance.submitNewOrder(order as any) as Promise<OrderResponseResult>
    return null
  }

  async getOrdersByMarket(symbol: string): Promise<IOrder[]> {
    return []
  }

  async syncExchangeFromCandleServer(): Promise<void> {
    logger.debug(`\u267F Sync exchange info`)
    this.exchangeInfo = { ...TEMP_BROKER_INFO }
    this.exchangeInfo.timezone = 'America/New_York'
  }

  async syncExchangeFromBroker(): Promise<void> {
    logger.debug(`\u267F Sync exchange info`)
    this.exchangeInfo = { ...TEMP_BROKER_INFO }
    // yahooFinance.trendingSymbols().then((res: ISymbol[]) => {
    //   console.log(res)
    // })
  }

  async syncAccount(): Promise<void> {
    logger.debug(`\u267F Sync balance`)

    const now = Date.now()

    // try {
    //   const balances = await this.instance.getBalances()

    //   this.account.balances = balances.map(balance => ({
    //     free: parseFloat(balance.free as string),
    //     locked: parseFloat(balance.locked as string),
    //     asset: balance.coin
    //   }))
    // } catch (error) {
    //   if (error.status) {
    //     console.error(error.status)
    //     console.error(error.data)
    //   } else {
    //     console.error(error)
    //   }

    //   throw new Error(`Error Sync account balance`)
    // }

    logger.info(`\u2705 Sync balance (${Date.now() - now} ms)`)
  }

  protected async loadConfig(): Promise<IBrokerInfo> {
    // protected async loadConfig(): Promise<{accounts: Account[]}> {
    // return this.instance.getAccountDetails()
    const exchangeInfo = structuredClone(TEMP_BROKER_INFO)

    exchangeInfo.symbols.forEach((symbol: ISymbol) => {
      symbol.baseAsset = 'AUD'
    })

    return exchangeInfo as IBrokerInfo
  }
  async getCandlesFromTime(symbol: string, interval: string, fromTime: number): Promise<ICandle[]> {
    // console.log(fromTime)
    const fromTimeDate = new Date(fromTime)
    const period1 = format(fromTimeDate, 'yyyy-MM-dd')
    const query = symbol.includes('/') ? `${symbol.split('/')[0]}=X` : symbol
    const queryOptions = { period1, interval: '1d' as any }
    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }
  async getCandlesFromCount(symbol: string, interval: string, count: number): Promise<ICandle[]> {
    const now = new Date()
    now.setDate(now.getDate() - count)
    const period1 = format(now, 'yyyy-MM-dd')
    const query = symbol.includes('/') ? `${symbol.split('/')[0]}=X` : symbol
    const queryOptions = { period1, interval: interval as any }
    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }
  startCandleTicker(symbols: string[], intervals: string[], callback: CandleTickerCallback): void {}

  private normalizeCandles(candles: HistoricalHistoryResult): ICandle[] {
    // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))

    return candles.map((candle) => [new Date(candle.date).getTime(), candle.open, candle.high, candle.low, candle.close, candle.volume])
  }
}
function rateLimit(arg0: any, arg1: { maxRequests: number; perMilliseconds: number }) {
  throw new Error('Function not implemented.')
}

