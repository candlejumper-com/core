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
import { XtbBroker } from '../../brokers/xtb/xtb.broker'
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

  brokers: {
    instance: Broker
    symbolName: string // the original symbol name as known to the broker (BTC.USD_4_1)
  }[] = []

  constructor(
    public system: System,
    params: ISymbol,
  ) {
    Object.assign(this, params)
  }

  getBrokerByPurpose(purpose: BROKER_PURPOSE) {
    const broker = this.brokers.find(broker => broker.instance.hasPurpose(purpose))

    if (!broker) {
      // throw new Error('Broker with purpose ' + purpose + ' not found')
      return null
    }

    return broker
  }

  addBroker(instance: Broker, symbolName: string) {
    if (this.brokers.some(broker => broker.instance === instance)) {
      // logger.warn(`Broker(${instance.id}) already added to symbol(${this.name})`)
      // throw new Error(`Broker(${instance.id}) already added to symbol(${symbolName})`)
      return
    }

    this.brokers.push({ instance, symbolName })
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
        await this.system.orderManager.placeOrder(
          {
            side: ORDER_SIDE.BUY,
            symbol: this,
            quantity: this.lotMin,
            type: ORDER_TYPE.MARKET,
          },
          {},
        )
      }
      // SHORT
      if (this.insights.short === -4 && this.insights.mid <= -2) {
        await this.system.orderManager.placeOrder(
          {
            side: ORDER_SIDE.SELL,
            symbol: this,
            quantity: this.lotMin,
            type: ORDER_TYPE.MARKET,
          },
          {},
        )
      }
    }

    // close open order
    else if (this.insights.short < 3) {
      console.log(2323, this.insights)
      if (this.orders[0].id) {
        await this.system.orderManager.closeOrder(this.orders[0])
      } else {
        logger.warn(`No open order found for symbol ${this.name}`)
      }
    }
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
