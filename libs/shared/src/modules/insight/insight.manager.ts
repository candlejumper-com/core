import { BrokerYahoo, ISymbol } from '@candlejumper/shared'
import { System } from '../../system/system'
import { InsightEntity } from './insight.entity'
import { LessThan, Equal, MoreThan } from 'typeorm'

export class InsightManager {
  constructor(public system: System) {}

  init() {}

  async loadPredictionsBySymbol(symbol: ISymbol) {
    const minLastUpdateTime = new Date()
    minLastUpdateTime.setHours(minLastUpdateTime.getHours() - 4)

    const InsightsRepo = this.system.db.connection.getRepository(InsightEntity)
    const lastRecord = await InsightsRepo.findOne({ where: { updatedAt: MoreThan(minLastUpdateTime) } })

    // if (lastRecord) {
    //   console.log('[red ', lastRecord)
    //   return lastRecord
    // }
    const insightsData = await this.system.brokerManager.get(BrokerYahoo).getSymbolInsights(symbol)
    if (!insightsData.instrumentInfo) {
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
