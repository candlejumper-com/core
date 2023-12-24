import { SystemMain } from '../../system/system'
import {
  BrokerAlphavantage,
  BrokerService,
  ConfigService,
  ICalendarItem,
  Service,
  SymbolService,
  filterCalendarItemsBySymbols,
  filterCalendarItemsInTimeRange,
} from '@candlejumper/shared'
import { DeviceManager } from '../device-manager/device-manager'

@Service({})
export class CalendarManager {
  // all calendar items
  items: ICalendarItem[] = []

  // calendar items within X days + trending
  calendarItems: ICalendarItem[] = []


  // how many times per day to check
  private updateIntervalTime = 1000 * 60 * 60 * 4 // 4 hours

  // how much time from now until calender event
  private activeTimeWindow = 1000 * 60 * 60 * 24 * 7 * 3 // 7 * 3days

  constructor(
    public symbolService: SymbolService,
    private configManager: ConfigService,
    private brokerService: BrokerService,
    private deviceManager: DeviceManager,
  ) {}
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
      this.items = await this.brokerService.get(BrokerAlphavantage).getCalendarItems()

      this.items.forEach(item => {
        const symbol = this.symbolService.get(item.symbol)
        if (symbol) {
          symbol.calendar = [item]
        } else{
          this.symbolService.add({ name: item.symbol, calendar: [item] })
        }
      })

      // filter calendar items that are between now and X days
      this.items = filterCalendarItemsInTimeRange(this.items, this.activeTimeWindow)

      // DEV ONLY
      // limit to 2 symbols
      if (this.configManager.config.dev) {
        this.calendarItems = filterCalendarItemsBySymbols(this.items, this.symbolService.symbols.slice(0, 2))
      } else {
        this.calendarItems = filterCalendarItemsBySymbols(this.items, this.symbolService.symbols)
      }

      // set current price diff and other stuff
      await this.setItemsMetadata()
      
      // sort by reportDate
      this.items.sort((a, b) => (a.reportDate as any) - (b.reportDate as any))

      // send push notification to clients
      await this.deviceManager.sendCalendarUpcomingNotifiction(this.calendarItems)
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
