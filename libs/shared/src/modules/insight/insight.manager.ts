import { BROKER_PURPOSE, BrokerYahoo, ISymbol, Symbol, XtbBroker, logger } from '@candlejumper/shared'
import { System } from '../../system/system'
import { InsightEntity } from './insight.entity'
import { LessThan, Equal, MoreThan } from 'typeorm'

export class InsightManager {
  constructor(public system: System) {}

  async loadPredictionsBySymbol(symbol: Symbol) {
    const broker = symbol.getBrokerByPurpose(BROKER_PURPOSE.INSIGHT)

    if (!broker) {
      return null
    }

    logger.info(`Updating insight: ${symbol.name}`)

    const minLastUpdateTime = new Date()
    minLastUpdateTime.setHours(minLastUpdateTime.getHours() - 4)

    const InsightsRepo = this.system.db.connection.getRepository(InsightEntity)
    const insightsData = await broker.getSymbolInsights(symbol)

    if (!insightsData?.instrumentInfo) {
      console.log('NO INSIGHT ', symbol.name)
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
