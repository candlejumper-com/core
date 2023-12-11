import { BrokerAlphavantage, BrokerYahoo, ISymbol, IInsight } from '@candlejumper/shared'
import { System } from '../../system/system'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

export class InsightManager {
  // list of trending symbols
  insights: { [key: string]: IInsight } = {}

  brokerYahoo: BrokerYahoo
  brokerAlphavantage: BrokerAlphavantage

  constructor(public system: System) {}

  async init() {
    this.brokerYahoo = new BrokerYahoo(this.system)
    this.brokerAlphavantage = new BrokerAlphavantage(this.system)

    // prepare sybols
    this.system.symbolManager.symbols.forEach(symbol => {
      this.insights[symbol.name] = { insights: null, symbol }
    })

    await this.loadPredictions()
  }

  async loadPredictions(mock = true) {
    const PATH_MOCK = join(__dirname, '../../../mock/symbols-insights.json')

    if (mock) {
      const MOCK_PREDICTIONS = JSON.parse(readFileSync(PATH_MOCK, { encoding: 'utf-8' }))
      this.insights = MOCK_PREDICTIONS
      return
    }

    let index = 0
    for (const symbol in this.insights) {
      if (symbol !== 'GPS') {
        continue
      }

      const insights = await this.brokerYahoo.getSymbolInsights(symbol)

      this.insights[symbol].insights = insights
    }

    // Store mock data
    writeFileSync(PATH_MOCK, JSON.stringify(this.insights, null, 2))
  }
}
