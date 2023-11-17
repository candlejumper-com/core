import { ICalendarItem } from '@candlejumper/shared'
import { ICalendarAlphaVantage } from './alphavantage.interfaces'
import { parse } from 'csv-parse'

export async function parseCSV(data: string): Promise<ICalendarAlphaVantage[]> {
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

export function normalizeCalendarData(data: ICalendarAlphaVantage[]): ICalendarItem[] {
  return data.map(item => ({
      ...item,
      reportDate: new Date(item.reportDate),
      fiscalDateEnding: new Date(item.fiscalDateEnding),
  }))
}

export function filterItemsInTimeRange(items: ICalendarItem[], timeWindow: number): ICalendarItem[] {
  const now = Date.now()
  return items.filter(item => item.reportDate.getTime() - now < timeWindow)
}

export function filterItemsBySymbols(items: ICalendarItem[], filterList: string[]): ICalendarItem[] {
  return items.filter(item => filterList.includes(item.symbol))
}
