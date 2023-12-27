import { SystemMain } from '../../system/system'
import {
  BrokerAlphavantage,
  ICalendarItem,
  filterCalendarItemsBySymbols,
  filterCalendarItemsInTimeRange,
  Symbol,
  BrokerYahoo
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
    await this.checkCalendarItems()

    setInterval(async () => this.checkCalendarItems(), this.updateIntervalTime)
  }

  async checkCalendarItems() {
    try {
      // (re)load all calendar items
      const broker = this.system.brokerManager.get(BrokerAlphavantage)
      this.items = await broker.getCalendarItems()

      this.items.forEach(async (item, index) => {
        let symbol = this.system.symbolManager.get(item.symbol)
        if (symbol) {
          symbol.calendar = [item]
        } else{
          symbol = this.system.symbolManager.add(broker, { name: item.symbol, calendar: [item] })
        }

        // set current price diff and other stuff
        await this.setItemsMetadata(symbol)
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
  private async setItemsMetadata(symbol: Symbol) {
    symbol.insights = await this.system.brokerManager.get(BrokerYahoo).getSymbolInsights(symbol)
    // console.log(symbol.insights)
  }
}
