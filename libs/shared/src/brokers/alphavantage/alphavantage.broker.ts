import { ICalendarItem } from '@candlejumper/shared'
import { Broker } from '../../modules/broker/broker'
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
      const PATH_MOCK_CALENDAR_ITEMS = join(__dirname, '../../../mock/calendar.csv')

      // calendar items
      nock('https://www.alphavantage.co')
        .get('/query')
        .query(true)
        .reply(200, readFileSync(PATH_MOCK_CALENDAR_ITEMS, { encoding: 'utf-8' }))
    }
  }

  override async getCalendarItems(): Promise<ICalendarItem[]> {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage
    const { data } = await axios.get(`https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`)
    const items = await parseCSV(data)
    // writeFileSync(join(__dirname, '../../../mock/calendar.csv'), data)
    return normalizeCalendarData(items)
  }
}
