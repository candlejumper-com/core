import { INewsItem } from '@candlejumper/shared'
import { SystemMain } from '../../system/stystem.main'
import axios from 'axios'
import { parse } from 'csv-parse'

const ALPHA_VENTAGE_KEY = 'OWYPQ4HUJ0NCVSQR'
const alpha = require('alphavantage')({ key: ALPHA_VENTAGE_KEY })

export class NewsManager {
  agenda: INewsItem[] = []

  constructor(public system: SystemMain) {}

  async init() {
    await this.loadNews()
  }

  async loadNews() {
    const { data } = await axios.get(
      `https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey=${ALPHA_VENTAGE_KEY}`,
    )
    
    this.agenda = await this.parseCSV(data)
  }

  private async parseCSV(data: string): Promise<INewsItem[]> {
    return new Promise((resolve, reject) => {
      parse(data, { comment: '#', columns: true }, function (err, records: INewsItem[]) {
        if (err) {
          console.error(err)
          return reject(err)
        }

        resolve(records)
      })
    })
  }
}
