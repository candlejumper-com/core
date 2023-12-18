import ProgressBar from "progress"
import { ICandle } from "../../candle/candle.interfaces"
import { ICalendarItem } from "../../index_client"
import { INewsItem } from "../../news/news.interfaces"
import { IOrder } from "../../order/order.interfaces"
import { System } from "../../system/system"
import { INTERVAL } from "../../util/util"
import { IInsight } from "../insight/insight.interfaces"
import { ISymbol, ISymbolInfo } from "./symbol.interfaces"
import { InsightEntity } from "../insight/insight.entity"

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
    const minUpdatedAtDiff = 1000 * 60 * 60 // 1 hour

    const UserRepo = this.system.db.connection.getRepository(InsightEntity)
    const lastInsight = await UserRepo.findOne({ where: { symbol: this.name }, order: { createdAt: "DESC" } })

    if (lastInsight?.updatedAt.getTime() + minUpdatedAtDiff < Date.now()) {
      console.log(lastInsight.updatedAt)
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