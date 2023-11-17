import { System } from '../../system/system'
import { BrokerYahoo, ICalendarItem } from '@candlejumper/shared'
import calendarMOCK from './calendar.json'
import alphavantage from 'alphavantage'
import {
  filterItemsInTimeRange,
  filterItemsBySymbols,
  getDiffInPercentage,
  normalizeCalendarData,
  parseCSV,
} from './calendar.util'

export class CalendarManager {
  // all calendar items
  items: ICalendarItem[] = []

  // calendar items within X days + trending
  selectedItems: ICalendarItem[] = []

  // list of trending symbols
  trendingSymbols: string[] = []

  // how many times per day to check
  private updateIntervalTime = 1000 * 60 * 60 * 4 // 4 hours

  // how much time from now until calender event
  private activeTimeWindow = 1000 * 60 * 60 * 24 * 7 // 7 days

  private alphavantage: any
  private brokerYahoo: BrokerYahoo

  constructor(public system: System) {}

  /**
   * - load alphavantage and new instance of broker
   * - start interval
   */
  async init() {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage

    this.alphavantage = alphavantage({ key: apiKey })
    this.brokerYahoo = new BrokerYahoo(this.system)

    this.checkCalendarItems()

    setInterval(async () => this.checkCalendarItems(), this.updateIntervalTime)
  }

  async checkCalendarItems() {
    try {
      this.items = await this.loadItems()
      this.trendingSymbols = await this.brokerYahoo.getTrendingSymbols()

      const activeItems = filterItemsInTimeRange(this.items, this.activeTimeWindow)
      const trendyItems = filterItemsBySymbols(activeItems, this.trendingSymbols)

      this.selectedItems = []

      for (let i = 0; i < trendyItems.length; i++) {
        const item = trendyItems[i]

        // get diff from 100 days ago until today
        const candles = await this.brokerYahoo.getCandlesFromCount(item.symbol, '1d', 100)
        item.diffInPercent = getDiffInPercentage(candles.at(-1), candles[0])

        this.selectedItems.push(item)
      }

      this.selectedItems.sort((a, b) => (a.reportDate as any) - (b.reportDate as any))

      await this.system.deviceManager.sendCalendarNotifiction(this.selectedItems)
    } catch (error) {
      console.error(error)
    }
  }

  private async loadItems() {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage

    // const { data } = await axios.get(
    //   `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`,
    // )
    // const items = await parseCSV(data)
    // writeFileSync('./data3.json', JSON.stringify(items, null, 2))

    const items = calendarMOCK as any
    return normalizeCalendarData(items)
  }
}
