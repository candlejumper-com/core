import { ICalendarItem, IOrder } from '@candlejumper/shared'
import { Broker } from '../broker'
import { OrderResponseACK, OrderResponseFull, OrderResponseResult } from 'binance'
import alphavantage from 'alphavantage'
import MOCK_CALENDAR_ITEMS from './calendar.json'
import { normalizeCalendarData, parseCSV } from './alphavantage.util'
import axios from 'axios'

export class BrokerAlphavantage extends Broker {
  id = 'Alphavantage'
  instance: any

  override async onInit(): Promise<void> {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage

    this.instance = alphavantage({ key: apiKey })
  }

  async getCalendarItems(mock = true): Promise<ICalendarItem[]> {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage

    let items: any[] = []
    if (this.system.configManager.config.dev) {
      items = MOCK_CALENDAR_ITEMS as any
    } else {
      const { data } = await axios.get(`https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`)
      const items = await parseCSV(data)
    }

    // writeFileSync('./data3.json', JSON.stringify(items, null, 2))
    return normalizeCalendarData(items)
  }

  override syncAccount(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  override syncExchangeFromCandleServer(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  override syncExchangeFromBroker(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  override getOrdersByMarket(market: string): Promise<IOrder[]> {
    throw new Error('Method not implemented.')
  }
  override placeOrder(order: IOrder): Promise<OrderResponseACK | OrderResponseResult | OrderResponseFull> {
    throw new Error('Method not implemented.')
  }
}
