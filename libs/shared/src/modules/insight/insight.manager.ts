import { BrokerYahoo } from '../../brokers/yahoo/yahoo.broker'
import { DB } from '../../db/db'
import { Service } from '../../decorators/service.decorator'
import { System } from '../../system/system'
import { BrokerService } from '../broker/broker.service'
import { ISymbol } from '../symbol/symbol.interfaces'
import { InsightEntity } from './insight.entity'
import { LessThan, Equal, MoreThan } from 'typeorm'

@Service({})
export class InsightManager {
  constructor(private db: DB, private brokerService: BrokerService) {}

  init() {}

  async loadPredictionsBySymbol(symbol: ISymbol) {
    const minLastUpdateTime = new Date()
    minLastUpdateTime.setHours(minLastUpdateTime.getHours() - 4)

    const InsightsRepo = this.db.connection.getRepository(InsightEntity)
    const lastRecord = await InsightsRepo.findOne({ where: { updatedAt: MoreThan(minLastUpdateTime) } })

    const insightsData = await this.brokerService.get(BrokerYahoo).getSymbolInsights(symbol)
    if (!insightsData.instrumentInfo) {
      const insightObject = {
        symbol: symbol.name,
        skip: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const insightsRecord = InsightsRepo.create(insightObject)
      const insights = await InsightsRepo.save(insightsRecord)
      return null
    }
    
    const insightObject = {
      symbol: symbol.name,
      short: insightsData.instrumentInfo.technicalEvents.shortTermOutlook.score,
      mid: insightsData.instrumentInfo.technicalEvents.intermediateTermOutlook.score,
      long: insightsData.instrumentInfo.technicalEvents.longTermOutlook.score,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (insightsData.instrumentInfo.technicalEvents.shortTermOutlook. direction === 'Bearish') {
      insightObject.short = -insightObject.short
    }

    if (insightsData.instrumentInfo.technicalEvents.intermediateTermOutlook.direction === 'Bearish') {
      insightObject.mid = -insightObject.mid
    }

    if (insightsData.instrumentInfo.technicalEvents.longTermOutlook. direction === 'Bearish') {
      insightObject.long = -insightObject.long
    }

    const insightsRecord = InsightsRepo.create(insightObject)
    const insights = await InsightsRepo.save(insightsRecord)
    return insights
  }
}
