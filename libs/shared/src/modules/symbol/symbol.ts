import { ICandle } from "../../candle/candle.interfaces"
import { ICalendarItem } from "../../index_client"
import { INewsItem } from "../../news/news.interfaces"
import { IOrder } from "../../order/order.interfaces"
import { System } from "../../system/system"
import { INTERVAL } from "../../util/util"
import { IInsight } from "../insight/insight.interfaces"
import { ISymbol, ISymbolInfo } from "./symbol.interfaces"

let counter = 0

export class Symbol implements ISymbol {
  name: string
  baseAsset: string
  candles: {
    [key in INTERVAL]?: ICandle[]
  } = {}
  insights: IInsight = null
  calendar: ICalendarItem[] = []
  news: INewsItem[] = []
  orders: IOrder[] = []

  updatedAt: Date

  constructor(public system: System, params: ISymbol) {
    Object.assign(this, params)
  }

  async update() {
    if (this.name === 'COST') {
      console.log(223232322323)
      this.insights = await this.system.insightManager.loadPredictionsBySymbol(this)
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