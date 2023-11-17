import { System } from '../../system/system'
import {
  BrokerAlphavantage,
  BrokerYahoo,
  ICalendarItem,
  filterItemsBySymbols,
  filterItemsInTimeRange,
} from '@candlejumper/shared'
import { getDiffInPercentage } from './calendar.util'

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
  private activeTimeWindow = 1000 * 60 * 60 * 24 * 7// 7 days

  private brokerYahoo: BrokerYahoo
  private brokerAlphavantage: BrokerAlphavantage

  constructor(public system: System) {}

  /**
   * - load alphavantage and new instance of broker
   * - start interval
   */
  async init() {
    this.brokerYahoo = new BrokerYahoo(this.system)
    this.brokerAlphavantage = new BrokerAlphavantage(this.system)

    this.checkCalendarItems()

    setInterval(async () => this.checkCalendarItems(), this.updateIntervalTime)
  }

  async checkCalendarItems() {
    try {
      // (re)load all calendar items
      this.items = await this.brokerAlphavantage.getCalendarItems()

      // (re)load current trending symbols
      this.trendingSymbols = await this.brokerYahoo.getTrendingSymbols()

      // filter calendar items that are between now and X days
      const activeItems = filterItemsInTimeRange(this.items, this.activeTimeWindow)

      // filter calendar items by trending symbols
      this.selectedItems = filterItemsBySymbols(activeItems, this.trendingSymbols)

      // DEV ONLY
      // limit to 2 symbols
      if (this.system.configManager.config.dev) {
        this.selectedItems = this.selectedItems.slice(0, 2)
      }

      // set current price diff and other stuff
      await this.setItemsMetadata()
      
      // sort by reportDate
      this.selectedItems.sort((a, b) => (a.reportDate as any) - (b.reportDate as any))

      // send push notification to clients
      await this.system.deviceManager.sendCalendarUpcomingNotifiction(this.selectedItems)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * TODO - make batches to not hit request limit
   */
  private async setItemsMetadata() {
    for await (const item of this.selectedItems) {
      // load candles of symbol
      const candles = await this.brokerYahoo.getCandlesFromCount(item.symbol, '1d', 100)

      // set diff from oldest to newest
      item.diffInPercent = getDiffInPercentage(candles.at(0), candles.at(-1))
      
      // set extra data
      item.insights = await this.brokerYahoo.getSymbolInsights(item.symbol)
    }
  }
}
