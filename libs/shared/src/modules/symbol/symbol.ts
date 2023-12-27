import ProgressBar from 'progress'
import { INewsItem } from '../news/news.interfaces'
import { System } from '../../system/system'
import { INTERVAL } from '../../util/util'
import { IInsight } from '../insight/insight.interfaces'
import { ISymbol, ISymbolInfo } from './symbol.interfaces'
import { InsightEntity } from '../insight/insight.entity'
import { logger } from '../../util/log'
import { ICalendarItem } from '../calendar/calendar.interfaces'
import { ICandle } from '../candle'
import { Ticker } from '../../ticker/ticker'
import { IOrder, ORDER_SIDE } from '../order/order.interfaces'
import { Broker } from '../broker/broker'
import { BrokerYahoo } from '../../brokers/yahoo/yahoo.broker'

let counter = 0
export class Symbol implements ISymbol {
  name: string
  description: string
  baseAsset: string
  candles: {
    [key in INTERVAL]?: ICandle[]
  } = {}
  insights: IInsight = null
  calendar: ICalendarItem[] = []
  news: INewsItem[] = []
  orders: IOrder[] = []

  updatedAt: Date

  constructor(
    public system: System,
    public broker: Broker,
    params: ISymbol,
  ) {
    Object.assign(this, params)
  }

  async update() {
    const minUpdatedAtDiff = 1000 * 60 * 60 // 1 hour
    const insightRepo = this.system.db.connection.getRepository(InsightEntity)

    this.insights = await insightRepo.findOne({ where: { symbol: this.name }, order: { createdAt: 'DESC' } })

    if (!this.insights || !this.insights.skip) {
      const allowUpdate = this.insights?.updatedAt.getTime() + minUpdatedAtDiff < Date.now()

      if (!this.insights || allowUpdate) {
        if (!this.name.includes('.') && this.broker instanceof BrokerYahoo) {
          logger.debug(`Updating ${this.name} symbol`)
          // this.insights = await this.system.insightManager.loadPredictionsBySymbol(this)
        }
      }
    }

    try {
      await this.runTickers()
    } catch (error) {
      console.error(error)
    }
  }

  async runTickers() {
   
    // if (this.insights) {
      if (!this.name.includes('TRON')) {
        return
      }

      if (this.orders.length === 0) {
        // if (this.insights.short === 4) {

          await this.system.orderManager.placeOrder(
            {
              force: true,
              side: ORDER_SIDE.BUY,
              symbol: this,
              quantity: 2500,
            },
            {},
          )
        // }
      }
      // console.log(this.insights.short)
    // }
  }

  getInfo(): ISymbolInfo {
    return {
      name: this.name,
      baseAsset: this.baseAsset,
      insights: this.insights,
      calendar: this.calendar,
    }
  }
}
