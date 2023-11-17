import { System } from '../../system/system'
import axios from 'axios'
import { parse } from 'csv-parse'
import { BrokerYahoo, CANDLE_FIELD, ICalendarItem } from '@candlejumper/shared'
import { ICalendarAlphaVantage } from './calendar.interfaces'
import calendarMOCK from './calendar.json'
import alphavantage from 'alphavantage'
import yahooFinance from 'yahoo-finance2'
import { HistoricalHistoryResult } from 'yahoo-finance2/dist/esm/src/modules/historical'
import { writeFileSync } from 'fs'
import { join } from 'path'

export class CalendarManager {
  items: ICalendarItem[] = []

  updateIntervalTime = 1000 * 60 * 60 * 4 // 4 hours
  activeTimeWindow = 1000 * 60 * 60 * 24 * 7 // 7 days

  alphavantage: any
  brokerYahoo: BrokerYahoo
  
  trendingSymbols: string[] = []
  selectedItems: ICalendarItem[] = []

  constructor(public system: System) {}

  async init() {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage
    
    this.brokerYahoo = new BrokerYahoo(this.system)
    this.trendingSymbols = await this.brokerYahoo.getTrendingSymbols()
    this.alphavantage = alphavantage({ key: apiKey })

    this.startUpdateInterval()
    await this.checkCalendarItems()
  }

  async checkCalendarItems() {
    this.items = await this.loadNews()

    const activeItems = this.filterItemsInRange(this.items)
    const trendyItems = this.filterItemsWithTrendySymbol(activeItems)

    const selectedItems = []
    console.log(trendyItems.length)

    for (let i = 0; i < trendyItems.length; i++) {
      const item = trendyItems[i]

      // get diff from 100 days ago until today
      const candles = await this.brokerYahoo.getCandlesFromCount(item.symbol, '1d', 100)
      const diff = candles.at(-1)[CANDLE_FIELD.CLOSE] - candles[0][CANDLE_FIELD.CLOSE]
      const diffInPercent = (diff / candles.at(0)[CANDLE_FIELD.CLOSE]) * 100

      item.diffInPercent = diffInPercent
      // if (Math.abs(diffInPercent) > 30) {
        selectedItems.push(item)
      // }
    }

    selectedItems.sort(function(a, b) { return a.reportDate - b.reportDate; });

    this.selectedItems = selectedItems

    if (selectedItems.length > 0) {
      await this.system.deviceManager.sendCalendarNotifiction(selectedItems)
    }
  }

  async loadNews() {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage

    // const { data } = await axios.get(
    //   `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`,
    // )
    // const items = await this.parseCSV(data)
    // writeFileSync('./data3.json', JSON.stringify(items, null, 2))	

    const items = calendarMOCK as any
    return this.normalizeCalendarData(items)
  }

  private filterItemsInRange(items = this.items): ICalendarItem[] {
    const now = Date.now()
    return items.filter(item => item.reportDate.getTime() - now < this.activeTimeWindow)
  }

  private filterItemsWithTrendySymbol(items = this.items): ICalendarItem[] {
    return items.filter(item => this.trendingSymbols.includes(item.symbol))
  }

  private normalizeCalendarData(data: ICalendarAlphaVantage[]): ICalendarItem[] {
    return data.map(item => ({
        ...item,
        reportDate: new Date(item.reportDate),
        fiscalDateEnding: new Date(item.fiscalDateEnding),
    }))
  }

  private async parseCSV(data: string): Promise<ICalendarAlphaVantage[]> {
    return new Promise((resolve, reject) => {
      parse(data, { comment: '#', columns: true }, (err, records: ICalendarAlphaVantage[]) => {
        if (err) {
          console.error(err)
          return reject(err)
        }

        resolve(records)
      })
    })
  }


  private startUpdateInterval() {
    setInterval(async () => {
      try {
        await this.checkCalendarItems()
      } catch (error) {
        console.error(error)
      }
    }, this.updateIntervalTime)
  }
}
