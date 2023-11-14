import { System } from '../../system/system'
import axios from 'axios'
import { parse } from 'csv-parse'
import { ICalendarItem } from '@candlejumper/shared'
import { ICalendarAlphaVantage } from './calendar.interfaces'
import calendarMOCK from './data.json'

export class CalendarManager {
  calendar: ICalendarItem[] = []

  updateIntervalTime = 1000 * 60 * 60 * 4 // 4 hours
  activeTimeWindow = 1000 * 60 * 60 * 24 * 7 // 7 days

  constructor(public system: System) {}

  async init() {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage
    const alpha = require('alphavantage')({ key: apiKey })

    await this.loadNews()
    this.startUpdateInterval()
    await this.checkCalendarItems()
  }
  
  async checkCalendarItems() {
    const activeItems = this.getAllItemsInRange()

    await this.system.deviceManager.sendCalendarNotifiction(activeItems)
  }

  async loadNews() {
    const { apiKey } = this.system.configManager.config.thirdParty.alphavantage
    
    // const { data } = await axios.get(
    //   `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${apiKey}`,
    // )

    // const items = await this.parseCSV(data)
    const items = calendarMOCK as any
    this.calendar = this.normalizeData(items)
  }

  private getAllItemsInRange() {
    const now = Date.now()

    return this.calendar.filter((item) => {
      return item.reportDate.getTime() - now < this.activeTimeWindow
    })
  }

  private async parseCSV(data: string): Promise<ICalendarAlphaVantage[]> {
    return new Promise((resolve, reject) => {
      parse(data, { comment: '#', columns: true }, (err, records: ICalendarAlphaVantage[]) => {
        if (err) {
          console.error(err)
          return reject(err)
        }

        console.log(records)

        resolve(records)
      })
    })
  }

  private normalizeData(data: ICalendarAlphaVantage[]): ICalendarItem[] {
    return data.map((item) => {
      return {
        symbol: item.symbol,
        name: item.name,
        reportDate: new Date(item.reportDate),
        fiscalDateEnding: new Date(item.fiscalDateEnding),
        estimate: item.estimate,
        currency: item.currency
      }
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
