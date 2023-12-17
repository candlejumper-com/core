import { ICalendarItem } from '@candlejumper/shared'
import { ICalendarAlphaVantage } from './alphavantage.interfaces'
import { parse } from 'csv-parse'
import { ISymbol } from '../../modules/symbol/symbol.interfaces'

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

export function filterCalendarItemsInTimeRange(items: ICalendarItem[], timeWindow: number): ICalendarItem[] {
  const now = Date.now()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return items.filter(item => item.reportDate > today && item.reportDate.getTime() - now < timeWindow)
}

export function filterCalendarItemsBySymbols(items: ICalendarItem[], symbols: ISymbol[]): ICalendarItem[] {
  return items.filter(item => !!symbols.find(symbol => symbol.name === item.symbol))
}
