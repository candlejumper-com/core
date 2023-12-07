import { BrokerAlphavantage, BrokerYahoo, ISymbol, IInsight } from '@candlejumper/shared'
import { System } from '../../system/system'

export class InsightManager {
  // list of trending symbols
  insights: {[key: string]: IInsight} = {}

  brokerYahoo: BrokerYahoo
  brokerAlphavantage: BrokerAlphavantage

  constructor(public system: System) {}

  async init() {
    this.brokerYahoo = new BrokerYahoo(this.system)
    this.brokerAlphavantage = new BrokerAlphavantage(this.system)

    // (re)load current trending symbols
    const symbols = (await this.brokerYahoo.getTrendingSymbols(500))
    
    // prepare sybols
    symbols.forEach(symbol => {
      this.insights[symbol.name] = { insights: null, symbol }
    })

    await this.loadPredections()
  }

  async loadPredections() {
    let index = 0
    for (const symbol in this.insights) {

      // if (index++ > 4) {
      //   return
      // }

      const insights = await this.brokerYahoo.getSymbolInsights(symbol)
      
      this.insights[symbol].insights = insights
    }
  }
}
