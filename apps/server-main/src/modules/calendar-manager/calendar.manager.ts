import { SystemMain } from '../../system/system'
import {
  BrokerAlphavantage,
  ICalendarItem,
  filterCalendarItemsBySymbols,
  filterCalendarItemsInTimeRange,
} from '@candlejumper/shared'

export class CalendarManager {
  // all calendar items
  items: ICalendarItem[] = []

  // calendar items within X days + trending
  calendarItems: ICalendarItem[] = []


  // how many times per day to check
  private updateIntervalTime = 1000 * 60 * 60 * 4 // 4 hours

  // how much time from now until calender event
  private activeTimeWindow = 1000 * 60 * 60 * 24 * 7 * 3 // 7 * 3days

  constructor(public system: SystemMain) {}

  /**
   * - load alphavantage and new instance of broker
   * - start interval
   */
  async init() {
    this.checkCalendarItems()

    setInterval(async () => this.checkCalendarItems(), this.updateIntervalTime)
  }

  async checkCalendarItems() {
    try {
      // (re)load all calendar items
      this.items = await this.system.brokerManager.get(BrokerAlphavantage).getCalendarItems()

      this.items.forEach(item => {
        const symbol = this.system.symbolManager.get(item.symbol)
        if (symbol) {
          symbol.calendar = [item]
        }
      })

      // filter calendar items that are between now and X days
      this.items = filterCalendarItemsInTimeRange(this.items, this.activeTimeWindow)

      // DEV ONLY
      // limit to 2 symbols
      if (this.system.configManager.config.dev) {
        this.calendarItems = filterCalendarItemsBySymbols(this.items, this.system.symbolManager.symbols.slice(0, 2))
      } else {
        this.calendarItems = filterCalendarItemsBySymbols(this.items, this.system.symbolManager.symbols)
      }

      // set current price diff and other stuff
      await this.setItemsMetadata()
      
      // sort by reportDate
      this.items.sort((a, b) => (a.reportDate as any) - (b.reportDate as any))

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
      // item.candles = await this.brokerYahoo.getCandlesFromCount(item.symbol, '1d', 100)

      // set diff from oldest to newest
      // item.diffInPercent = getDiffInPercentage(item.candles.at(0), item.candles.at(-1))
      
      // set extra data
      // item.insights = await this.brokerYahoo.getSymbolInsights(item.symbol)
    }
  }
}
