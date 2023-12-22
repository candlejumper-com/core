import ProgressBar from "progress"
import { INewsItem } from "../news/news.interfaces"
import { IOrder } from "../../order/order.interfaces"
import { System } from "../../system/system"
import { INTERVAL } from "../../util/util"
import { IInsight } from "../insight/insight.interfaces"
import { ISymbol, ISymbolInfo } from "./symbol.interfaces"
import { InsightEntity } from "../insight/insight.entity"
import { logger } from "../../util/log"
import { ICalendarItem } from "../calendar/calendar.interfaces"
import { ICandle } from "../candle"
import { InsightManager } from "../insight/insight.manager"
import { DB } from "../../db/db"

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

  constructor(public system: System, params: ISymbol) {
    Object.assign(this, params)
  }

  async update() {
    const minUpdatedAtDiff = 1000 * 60 * 60 // 1 hour
    const insightRepo = this.system.modules.get(DB).connection.getRepository(InsightEntity)

    this.insights = await insightRepo.findOne({ where: { symbol: this.name }, order: { createdAt: "DESC" } })

    if (this.insights?.skip) {
      return
    }

    const allowUpdate = this.insights?.updatedAt.getTime() + minUpdatedAtDiff < Date.now()
    if (!this.insights || allowUpdate) {
      logger.debug(`Updating ${this.name} symbol`)
      this.insights = await this.system.modules.get(InsightManager).loadPredictionsBySymbol(this)
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