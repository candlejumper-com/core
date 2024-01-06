import { System } from '../../system/system'
import { ISymbol, ISymbolInfo } from './symbol.interfaces'
import { Symbol } from './symbol'
import { logger } from '../../util/log'
import { Broker } from '../broker/broker'

export class SymbolManager {
  symbols: Symbol[] = []

  private timeoutRef: NodeJS.Timeout
  private intervalTimeout = 1000 * 60 * 60

  constructor(public system: System) {}

  async init() {}

  add(broker: Broker, data: ISymbol) {
    let symbol = this.symbols.find(symbol => symbol.name === data.name)

    if (symbol) {
      logger.debug(`Symbol ${symbol.name} already exists`)
      symbol.addBroker(broker)
      return symbol
    }
    
    symbol = new Symbol(this.system, data, broker)

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
    logger.info('♿ Looping all symbols and update them...')
    
    for (let i = 0, len = this.symbols.length; i < len; i++) {
      try {
        await this.symbols[i].update()
      } catch (error) {
        logger.error(error)
      }
    }

    logger.info('✅ All symbols updated!')

    this.timeoutRef = setTimeout(() => this.update(), 60 * 1000)
  }

  stopUpdateInterval() {
    clearInterval(this.timeoutRef)
  }
}
