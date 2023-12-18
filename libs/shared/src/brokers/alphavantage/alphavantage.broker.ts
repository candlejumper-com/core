import { CandleTickerCallback, ICalendarItem, ICandle, IOrder, ISymbol, logger } from '@candlejumper/shared'
import { Broker } from '../../modules/broker/broker'
import { OrderResponseACK, OrderResponseFull, OrderResponseResult } from 'binance'
import alphavantage from 'alphavantage'
import { normalizeCalendarData, parseCSV } from './alphavantage.util'
import axios from 'axios'
import { readFileSync } from 'fs'
import nock from 'nock'
import { join } from 'path'


export class BrokerAlphavantage extends Broker {
  id = 'alphavantage'
  instance: any

  override async onInit(): Promise<void> {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage
    this.instance = alphavantage({ key: apiKey })

    if (this.system.configManager.config.dev) {

      const PATH_MOCK_CALENDAR_ITEMS = join(__dirname, '../../../mock/calendar.json')

      // calendar items
      nock('https://www.alphavantage.co')
        .get('/query')
        .query(true)
        .reply(200, JSON.parse(readFileSync(PATH_MOCK_CALENDAR_ITEMS, { encoding: 'utf-8' })))
    }
  }

  async getCalendarItems(mock = true): Promise<ICalendarItem[]> {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage
    const { data } = await axios.get(`https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`)
    const items = data
    // const items = await parseCSV(data)
    // writeFileSync('./data3.json', JSON.stringify(items, null, 2))
    return normalizeCalendarData(items)
  }

  override syncAccount(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  // override async syncExchangeFromCandleServer(): Promise<void> {
  //   logger.info('Method not implemented.')
  // }
  override syncExchangeFromBroker(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  override getOrdersByMarket(market: string): Promise<IOrder[]> {
    throw new Error('Method not implemented.')
  }
  override placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull> {
    throw new Error('Method not implemented.')
  }
  override startWebsocket(errorCallback: (reason: string) => void, eventCallback: (data: any) => void): Promise<void> {
    throw new Error('Method not implemented.')
  }
  override startCandleTicker(symbols: ISymbol[], intervals: string[], callback: CandleTickerCallback): void {
    throw new Error('Method not implemented.')
  }
  override getCandlesFromTime(symbol: ISymbol, interval: string, startTime: number): Promise<ICandle[]> {
    throw new Error('Method not implemented.')
  }
  override getCandlesFromCount(symbol: ISymbol, interval: string, count: number): Promise<ICandle[]> {
    throw new Error('Method not implemented.')
  }
}
