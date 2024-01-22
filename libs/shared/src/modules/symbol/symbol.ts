import { INewsItem } from '../news/news.interfaces'
import { System } from '../../system/system'
import { INTERVAL } from '../../util/util'
import { IInsight } from '../insight/insight.interfaces'
import { ISymbol, ISymbolInfo } from './symbol.interfaces'
import { InsightEntity } from '../insight/insight.entity'
import { logger } from '../../util/log'
import { ICalendarItem } from '../calendar/calendar.interfaces'
import { ICandle } from '../candle'
import { IOrder } from '../order/order.interfaces'
import { Broker } from '../broker/broker'
import { BROKER_PURPOSE } from '../broker/broker.util'
import { ORDER_SIDE, ORDER_TYPE } from '../order/order.util'


export class Symbol implements ISymbol {
  name: string
  description: string
  baseAsset: string
  quoteAsset: string
  candles: {
    [key in INTERVAL]?: ICandle[]
  } = {}
  insights: IInsight = null
  calendar: ICalendarItem[] = []
  news: INewsItem[] = []
  orders: IOrder[] = []
  price: number
  updatedAt: Date
  lotMin: number
  currency: string
  shortSelling?: boolean

  brokers: Broker[] = []

  constructor(
    public system: System,
    params: ISymbol,
    broker: Broker
  ) {
    Object.assign(this, params)
    this.brokers = [broker]
  }

  async update() {
    const minUpdatedAtDiff = 1000 * 60 * 60 // 1 hour
    const insightRepo = this.system.db.connection.getRepository(InsightEntity)

    this.insights = await insightRepo.findOne({ where: { symbol: this.name }, order: { createdAt: 'DESC' } })

    if (!this.insights || !this.insights.skip) {
      const allowUpdate = this.insights?.updatedAt.getTime() + minUpdatedAtDiff < Date.now()

      if (!this.insights || allowUpdate) {
        this.insights = await this.system.insightManager.loadPredictionsBySymbol(this)
      }
    }

    try {
      await this.runTickers()
    } catch (error) {
      console.error(error)
    }
  }

  async runTickers() {
    const broker = this.getBrokerByPurpose(BROKER_PURPOSE.ORDERS)
    const hasOpenOrders = this.orders.length > 0

    if (!broker || !this.insights) {
      return
    }

    if (!hasOpenOrders) {
      // LONG
      if (this.insights.short === 4 && this.insights.mid >= 2) {
        if (this.currency === 'USD') {
          await this.system.orderManager.placeOrder(
          {
            side: ORDER_SIDE.BUY,
            symbol: this,
            quantity: this.calcQuantity(),
            type: ORDER_TYPE.MARKET,
          },
          {},
        )
        }
      }
      // SHORT
      if (this.insights.short === -4 && this.insights.mid <= -2) {
        if (this.currency === 'USD') {
          await this.system.orderManager.placeOrder(
            {
              side: ORDER_SIDE.SELL,
              symbol: this,
              quantity: this.calcQuantity(),
              type: ORDER_TYPE.MARKET,
            },
            {},
            )
          }
      }
    }

    // close open order
    else {
      if (this.orders[0].side === ORDER_SIDE.BUY && this.insights.short < 3) {
        await this.system.orderManager.closeOrder(this.orders[0])
      }
      if (this.orders[0].side === ORDER_SIDE.SELL && this.insights.short > -3) {
        await this.system.orderManager.closeOrder(this.orders[0])
      }
    }
  }
  
  getBrokerByPurpose(purpose: BROKER_PURPOSE) {
    return this.brokers.find(broker => broker.hasPurpose(purpose))
  }

  addBroker(instance: Broker) {
    if (!this.brokers.includes(instance)) {
      this.brokers.push(instance)
    } 
  }

  getInfo(): ISymbolInfo {
    return {
      name: this.name,
      description: this.description,
      baseAsset: this.baseAsset,
      insights: this.insights,
      price: this.price || 0,
      calendar: this.calendar,
    }
  }

  private calcQuantity() {
    const minOrderValue = 50
    const orderValue = this.price * this.lotMin
    let quantity: number
    if (orderValue < minOrderValue) {
      quantity = Math.ceil(minOrderValue / this.price)
    } else {
      quantity = this.lotMin
    }
    return quantity
  }
}
