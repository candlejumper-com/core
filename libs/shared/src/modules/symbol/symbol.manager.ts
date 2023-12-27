import { System } from '../../system/system'
import { ISymbol, ISymbolInfo } from './symbol.interfaces'
import { Symbol } from './symbol'
import { logger } from '../../util/log'
import { showProgressBar } from '../../util/progress-bar'
import { Broker } from '../broker/broker'
// import { BrokerYahoo } from '../../brokers/yahoo/yahoo.broker'

export class SymbolManager {
  symbols: Symbol[] = []

  private intervalRef: NodeJS.Timeout
  private intervalTimeout = 1000 * 60 * 60

  constructor(public system: System) {}

  async init() {}

  add(broker: Broker, data: ISymbol) {
    // normalize symbol name
    const oSymbolName = data.name
    data.name = data.name.split('.')[0]

    // console.log(34343, oSymbolName)
    let symbol = this.symbols.find(symbol => symbol.name === data.name)

    if (symbol) {
      logger.debug(`Symbol ${data.name} already exists`)
      symbol.addBroker(broker, oSymbolName)
      return symbol
    }
    
    symbol = new Symbol(this.system, data)

    // add broker + original symbol name
    symbol.addBroker(broker, oSymbolName)

    this.symbols.push(symbol)
    return symbol
  }

  remove() {
    // TODO
  }

  get(symbolName: string): Symbol {
    return this.symbols.find(symbol => symbol.name === symbolName)
  }

  getInfo(): ISymbolInfo[] {
    return this.symbols.map(symbol => symbol.getInfo())
  }

  async update() {
    const progressBar = showProgressBar(this.symbols.length, 'Updating symbols')
    for (let i = 0, len = this.symbols.length; i < len; i++) {
      const symbol = this.symbols[i]
      try {
        // if (symbol.name === 'EXAS') {
        await symbol.update()
        // }
      } catch (error) {
        logger.error(error)
      }

      progressBar.tick()
    }
  }

  startUpdateInterval(preUpdate = true) {
    logger.info('⏳ Starting symbol update interval')
    this.intervalRef = setInterval(() => this.update(), this.intervalTimeout)
  }

  stopUpdateInterval() {
    clearInterval(this.intervalRef)
  }
}
