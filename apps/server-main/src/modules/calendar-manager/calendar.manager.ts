import { System } from '../../system/system'
import {
  BrokerAlphavantage,
  BrokerYahoo,
  ICalendarItem,
  ISymbol,
  filterCalendarItemsBySymbols,
  filterCalendarItemsInTimeRange,
} from '@candlejumper/shared'
import { getDiffInPercentage } from './calendar.util'

export class CalendarManager {
  // all calendar items
  items: ICalendarItem[] = []

  // calendar items within X days + trending
  calendarItems: ICalendarItem[] = []

  // list of trending symbols
  symbols: ISymbol[] = []

  // how many times per day to check
  private updateIntervalTime = 1000 * 60 * 60 * 4 // 4 hours

  // how much time from now until calender event
  private activeTimeWindow = 1000 * 60 * 60 * 24 * 7 * 3 // 7 * 3days

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

      // filter calendar items that are between now and X days
      const activeItems = filterCalendarItemsInTimeRange(this.items, this.activeTimeWindow)

      // filter calendar items by trending symbols
      this.calendarItems = filterCalendarItemsBySymbols(activeItems, this.symbols)

      // DEV ONLY
      // limit to 2 symbols
      if (this.system.configManager.config.dev) {
        // this.selectedItems = this.selectedItems.slice(0, 2)
      }

      // set current price diff and other stuff
      await this.setItemsMetadata()
      
      // sort by reportDate
      this.calendarItems.sort((a, b) => (a.reportDate as any) - (b.reportDate as any))

      // send push notification to clients
      await this.system.deviceManager.sendCalendarUpcomingNotifiction(this.calendarItems)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * TODO - make batches to not hit request limit
   */
  private async setItemsMetadata() {
    for (const item of this.calendarItems) {
      // load candles of symbol
      item.candles = await this.brokerYahoo.getCandlesFromCount(item.symbol, '1d', 100)

      // set diff from oldest to newest
      item.diffInPercent = getDiffInPercentage(item.candles.at(0), item.candles.at(-1))
      
      // set extra data
      item.insights = await this.brokerYahoo.getSymbolInsights(item.symbol)
    }
  }
}
