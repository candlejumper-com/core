import { System } from '../../system/system'
import { ISymbol, ISymbolInfo } from './symbol.interfaces'
import { Symbol } from './symbol'
import { logger } from '../../util/log'
import { showProgressBar } from '../../util/progress-bar'
// import { BrokerYahoo } from '../../brokers/yahoo/yahoo.broker'

export class SymbolManager {
  private intervalRef: NodeJS.Timeout
  private intervalTimeout = 1000 * 60 * 60

  symbols: Symbol[] = []

  constructor(private system: System) {}

  async init() {}

  add(data: ISymbol) {
    const existing = this.get(data.name)

    if (existing) {
      throw new Error(`Symbol already exists with that name: ${data.name}`)
    }

    const symbol = new Symbol(this.system, data)
    this.symbols.push(symbol)
    return symbol
  }

  get(symbolName: string): ISymbol {
    return this.symbols.find(symbol => symbol.name === symbolName)
  }

  getInfo(): ISymbolInfo[] {
    return this.symbols.map(symbol => symbol.getInfo())
  }

  syncSymbolsWithBroker() {
    // TODO - using import gives circular dependency error?
    const { BrokerYahoo } = require('../../brokers/yahoo/yahoo.broker')
    const symbols = this.system.brokerManager.get(BrokerYahoo).exchangeInfo.symbols
    symbols.forEach(symbol => this.add(symbol))
  }

  async update() {
    const progressBar = showProgressBar(this.symbols.length, 'Updating symbols')

    for (const symbol of this.symbols) {
      if (symbol.name === 'EXAS') {
        await symbol.update()
      }

      progressBar.tick()
    }
  }

  startUpdateInterval() {
    logger.info('\u231B Starting symbol update interval')
    this.intervalRef = setInterval(() => this.update(), this.intervalTimeout)
  }

  stopUpdateInterval() {
    clearInterval(this.intervalRef)
  }
}
