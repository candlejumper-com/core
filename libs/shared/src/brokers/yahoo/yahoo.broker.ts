import { HistoricalHistoryResult } from 'yahoo-finance2/dist/esm/src/modules/historical'
import { logger, ICandle, ICalendarItem, SYMBOL_CATEGORY } from '@candlejumper/shared'
import { Broker } from '../../modules/broker/broker'
import yahooFinance from 'yahoo-finance2'
import { format } from 'date-fns'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'
// import nock from 'nock'
import { join } from 'path'
import { SimpleQueue } from '../../util/queue'
import { TrendingSymbolsResult } from 'yahoo-finance2/dist/esm/src/modules/trendingSymbols'
import { QuoteSummaryResult } from 'yahoo-finance2/dist/esm/src/modules/quoteSummary-iface'

const PATH_MOCK_SYMBOL_INSIGHTS = join(__dirname, '../../../mock/symbols-insights.json')
const PATH_MOCK_TRENDING_SYMBOLS = join(__dirname, '../../../mock/symbols-trending.json')

// nock(
//   'https://query2.finance.yahoo.com/ws/insights/v2/finance/insights?lang=en-US&region=US&getAllResearchReports=true&reportsCount=2&symbol=COST',
// )
//   .get('')
//   .query(true)
//   .reply(200, JSON.parse(readFileSync(PATH_MOCK_TRENDING_SYMBOLS, { encoding: 'utf-8' })))

// nock('https://query2.finance.yahoo.com/v1/finance/trending/US')
//   .get('')
//   .query(true)
//   .reply(200, JSON.parse(readFileSync(PATH_MOCK_TRENDING_SYMBOLS, { encoding: 'utf-8' })))

enum YAHOO_SYMBOL_CATEGORY_LIST {
  'CRYPTOCURRENCY' = SYMBOL_CATEGORY.CRYPTO,
  'EQUITY' = SYMBOL_CATEGORY.STOCK,
  'ETF' = SYMBOL_CATEGORY.ETF,
}

export class BrokerYahoo extends Broker {
  id = 'yahoo'
  instance: any
  websocket = null

  queue = new SimpleQueue(this.system)

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
    const { quotes } = await this.queue.add(() => yahooFinance.trendingSymbols('US', { count })) as TrendingSymbolsResult
    const filteredQuotes = quotes.filter(symbol => /^[^/^.=:]+$/.test(symbol.symbol))

    const symbols: ISymbol[] = []

    for (const symbol of filteredQuotes) {
      const details = await this.queue.add(() => yahooFinance.quoteSummary(symbol.symbol)) as QuoteSummaryResult
      logger.info('Updating symbol : ' + symbol.symbol)

      symbols.push({
        name: symbol.symbol,
        description: details.price.shortName,
        baseAsset: details.summaryDetail.fromCurrency,
        quoteAsset: details.summaryDetail.currency,
        category: YAHOO_SYMBOL_CATEGORY_LIST[details.price.quoteType],
        price: details.price.regularMarketPrice,
        start24HPrice: details.price.regularMarketPreviousClose,
      })
    }

    // const gainers = await this.queue.add(() => yahooFinance.dailyGainers())
    // const gainersFiltered = gainers.quotes.map((gainer: any) => ({symbol: gainer.symbol}))
    // console.log(33434, gainers)

    // const symbols: ISymbol[] = [...result.quotes]

    //   // remove strange symbol names
    //   .filter(symbol => /^[^.=:]+$/.test(symbol.symbol))

    //   // create normal symbol objects
    //   .map(symbol => ({ name: symbol.symbol, baseAsset: '', category: SYMBOL_CATEGORY.CMD}))

    return symbols
  }

  private normalizeSymbolType() {}

  override getSymbolInsights(symbol: ISymbol) {
    return this.queue.add<InsightsResult>(() => yahooFinance.insights(symbol.name, null, { validateResult: false }))
  }

  override async syncExchange(): Promise<void> {
    const symbols = await this.getTrendingSymbols()

    this.exchangeInfo = {
      symbols: symbols,
      timezone: 'Europe/London',
    }
  }

  override async getCandlesFromTime(symbol: ISymbol, interval: string, fromTime: number): Promise<ICandle[]> {
    const fromTimeDate = new Date(fromTime)
    const startTime = format(fromTimeDate, 'yyyy-MM-dd')
    const query = symbol.name.includes('/') ? `${symbol.name.split('/')[0]}=X` : symbol.name
    const queryOptions = { period1: startTime, interval: interval as any }

    logger.debug(`♿ Sync from time: ${symbol} ${interval} ${startTime}`)

    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }

  override async getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
    const now = new Date()
    now.setDate(now.getDate() - count)
    const period1 = format(now, 'yyyy-MM-dd')
    const query = symbol.name.includes('/') ? `${symbol.name.split('/')[0]}=X` : symbol.name
    const queryOptions = { period1, interval: interval as any }
    const candles = await yahooFinance.historical(query, queryOptions)
    return this.normalizeCandles(candles)
  }

  private normalizeCandles(candles: HistoricalHistoryResult): ICandle[] {
    // console.log(parse(candles[0].snapshotTime, "yyyy:MM:dd-HH:mm:ss", new Date()))

    return candles.map(candle => [new Date(candle.date).getTime(), candle.open, candle.high, candle.low, candle.close, candle.volume])
  }

  override async startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    // throw new Error('Method not implemented.')
  }

  override getCalendarItems(): Promise<ICalendarItem[]> {
    throw new Error('Method not implemented.')
  }
}
