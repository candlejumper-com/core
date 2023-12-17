import { BrokerYahoo, ISymbol } from '@candlejumper/shared'
import { System } from '../../system/system'
import { InsightEntity } from './insight.entity'
import { LessThan, Equal, MoreThan } from 'typeorm'

export class InsightManager {
  constructor(public system: System) {}

  init() {}

  async loadPredictionsBySymbol(symbol: ISymbol) {
    console.log('[red ', 2323)
    const minLastUpdateTime = new Date()
    minLastUpdateTime.setHours(minLastUpdateTime.getHours() - 4)

    const InsightsRepo = this.system.db.connection.getRepository(InsightEntity)
    const lastRecord = await InsightsRepo.findOne({ where: { updatedAt: MoreThan(minLastUpdateTime) } })

    // if (lastRecord) {
    //   console.log('[red ', lastRecord)
    //   return lastRecord
    // }
    console.log('[red ', 5555555)
    const insightsData = await this.system.brokerManager.get(BrokerYahoo).getSymbolInsights(symbol)
    const insightsRecord = InsightsRepo.create(insightsData)
    const insights = await InsightsRepo.save(insightsRecord)

    return insights
  }
}
