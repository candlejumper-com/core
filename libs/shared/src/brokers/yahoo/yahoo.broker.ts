import { HistoricalHistoryResult } from 'yahoo-finance2/dist/esm/src/modules/historical'
import { logger, ICandle, IOrder } from '@candlejumper/shared'
import { Broker } from '../broker'
import { IBrokerInfo, CandleTickerCallback } from '../broker.interfaces'
import yahooFinance from 'yahoo-finance2'
import { format } from 'date-fns'
import { OrderResponseFull, OrderResponseResult } from 'binance'
import { readFileSync, writeFileSync } from 'fs'
import { TrendingSymbolsResult } from 'yahoo-finance2/dist/esm/src/modules/trendingSymbols'
import TEMP_BROKER_INFO from './broker-yahoo.json'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'
import { join } from 'path'
import axios from 'axios'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'

const defaultOptions = {};

export class BrokerYahoo extends Broker {
  id = 'Yahoo'
  instance: any
  websocket = null

  override async onInit() {
    console.log('ON INDSFINISDNFSDF')
  }

  async getTrendingSymbols(count = 500, mock = true): Promise<ISymbol[]> {
    const PATH_MOCK = join(__dirname, '../../../mock/symbols-trending.json')

    if (mock) {
      return JSON.parse(readFileSync(PATH_MOCK, { encoding: 'utf-8' })).quotes.map(symbol => ({ name: symbol.symbol }))
    }

    const result = (await yahooFinance.trendingSymbols('US', { count })) as TrendingSymbolsResult
    const symbols: ISymbol[] = result.quotes.map(symbol => ({ name: symbol.symbol, baseAsset: '' }))

    writeFileSync(PATH_MOCK, JSON.stringify(result, null, 2))

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

    const now = Date.now()
    const candleServerUrl = this.system.configManager.config.server.candles.url

    try {
      const { data } = await axios.get(`${candleServerUrl}/api/exchange/yahoo`)
      this.exchangeInfo = data.exchangeInfo
      this.exchangeInfo.timezone = (this.exchangeInfo as any).timezone
    } catch (error: any) {
      if (error.cause) {
        logger.error(error.cause)
      }
      else if (error.status) {
        console.error(error.status)
        console.error(error.data)
      }

      else {
        console.error(error)
      }

      throw new Error(`error fetching broker config from candle server`.red)
    }

    logger.info(`\u2705 Sync exchange info (${Date.now() - now} ms)`)
  }

  async syncExchangeFromBroker(mock = false): Promise<void> {
    logger.debug(`\u267F Sync exchange info`)

    if (mock) {
      this.exchangeInfo = TEMP_BROKER_INFO
      return
    }

    const symbols = await this.getTrendingSymbols(1, mock)

    this.exchangeInfo = {
      symbols: symbols,
      timezone: 'America/New_York'
    }
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
    const fromTimeDate = new Date(fromTime)
    const startTime = format(fromTimeDate, 'yyyy-MM-dd')
    const query = symbol.includes('/') ? `${symbol.split('/')[0]}=X` : symbol
    const queryOptions = { period1: startTime, interval: interval as any }

    logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${startTime}`)

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

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    // throw new Error('Method not implemented.')
  }
}
