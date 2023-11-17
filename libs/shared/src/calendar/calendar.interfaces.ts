export interface ICalendarItem {
  symbol: string,
  name: string,
  reportDate: Date,
  fiscalDateEnding: Date,
  estimate: string,
  currency: string
  diffInPercent?: number
}
