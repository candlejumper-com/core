import { HistoricalHistoryResult } from 'yahoo-finance2/dist/esm/src/modules/historical'
import { logger, ICandle, IOrder } from '@candlejumper/shared'
import { Broker } from '../broker'
import { IBrokerInfo, CandleTickerCallback } from '../broker.interfaces'
import yahooFinance from 'yahoo-finance2'
import { format } from 'date-fns'
import { OrderResponseFull, OrderResponseResult } from 'binance'
import TEMP_BROKER_INFO from './broker-yahoo.json'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'
import nock from 'nock'
import { readFileSync } from 'fs'
import { join } from 'path'

const PATH_MOCK_SYMBOL_INSIGHTS = join(__dirname, '../../../mock/symbols-insights.json')
const PATH_MOCK_TRENDING_SYMBOLS = join(__dirname, '../../../mock/symbols-trending.json')

// nock(
//   'https://query2.finance.yahoo.com/ws/insights/v2/finance/insights?lang=en-US&region=US&getAllResearchReports=true&reportsCount=2&symbol=COST',
// )
//   .get('')
//   .query(true)
//   .reply(200, JSON.parse(readFileSync(PATH_MOCK_TRENDING_SYMBOLS, { encoding: 'utf-8' })))

nock('https://query2.finance.yahoo.com/v1/finance/trending/US')
  .get('')
  .query(true)
  .reply(200, JSON.parse(readFileSync(PATH_MOCK_TRENDING_SYMBOLS, { encoding: 'utf-8' })))

export class BrokerYahoo extends Broker {
  id = 'Yahoo'
  instance: any
  websocket = null

  override async onInit() {
    // prepare mock data
    if (this.system.configManager.config.dev) {
      const PATH_MOCK_TRENDING_SYMBOLS = join(__dirname, '../../../mock/symbols-trending.json')
      const PATH_MOCK_SYMBOL_INSIGHTS = join(__dirname, '../../../mock/symbols-insights.json')

      // trending
      // nock('https://query2.finance.yahoo.com/v1/finance/trending/US')
      //   .get('')
      //   .query(true)
      //   .reply(200, JSON.parse(readFileSync(PATH_MOCK_TRENDING_SYMBOLS, { encoding: 'utf-8' })))
      // .reply(200, await import('../../../../../mock/symbols-trending.json'))
    }
  }

  async getTrendingSymbols(count = 500): Promise<ISymbol[]> {
    const result = await yahooFinance.trendingSymbols('US', { count })

    const symbols: ISymbol[] = result.quotes

      // remove strange symbol names
      .filter(symbol => /^[^.=:]+$/.test(symbol.symbol))

      // create normal symbol objects
      .map(symbol => ({ name: symbol.symbol, baseAsset: '' }))

    return symbols
  }

  getSymbolInsights(symbol: ISymbol): Promise<InsightsResult> {
    return yahooFinance.insights(symbol.name)
  }

  async placeOrder(order: IOrder): Promise<OrderResponseResult | OrderResponseFull> {
    // return this.system.broker.instance.submitNewOrder(order as any) as Promise<OrderResponseResult>
    return null
  }

  async getOrdersByMarket(symbol: string): Promise<IOrder[]> {
    return []
  }

  async syncExchangeFromBroker(): Promise<void> {
    logger.debug(`\u267F Sync exchange info`)

    const symbols = await this.getTrendingSymbols(500)

    this.exchangeInfo = {
      symbols: symbols,
      timezone: 'Europe/London',
    }
  }

  async syncAccount(): Promise<void> {
    logger.debug(`\u267F Sync balance`)

    const now = Date.now()

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
  async getCandlesFromTime(symbol: ISymbol, interval: string, fromTime: number): Promise<ICandle[]> {
    const fromTimeDate = new Date(fromTime)
    const startTime = format(fromTimeDate, 'yyyy-MM-dd')
    const query = symbol.name.includes('/') ? `${symbol.name.split('/')[0]}=X` : symbol.name
    const queryOptions = { period1: startTime, interval: interval as any }

    logger.debug(`\u267F Sync from time: ${symbol} ${interval} ${startTime}`)

    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }

  async getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
    const now = new Date()
    now.setDate(now.getDate() - count)
    const period1 = format(now, 'yyyy-MM-dd')
    const query = symbol.name.includes('/') ? `${symbol.name.split('/')[0]}=X` : symbol.name
    const queryOptions = { period1, interval: interval as any }
    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }

  startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): void {}

  private normalizeCandles(candles: HistoricalHistoryResult): ICandle[] {
    // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))

    return candles.map(candle => [new Date(candle.date).getTime(), candle.open, candle.high, candle.low, candle.close, candle.volume])
  }

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    // throw new Error('Method not implemented.')
  }
}
