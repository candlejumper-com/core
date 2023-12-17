import { System } from '../../system/system'
import { ISymbol, ISymbolInfo } from './symbol.interfaces'
import { Symbol } from './symbol'

export class SymbolManager {
  symbols: Symbol[] = []

  constructor(private system: System) {}

  async init() {}

  add(symbol: ISymbol) {
    this.symbols.push(new Symbol(this.system, symbol))
  }

  get(symbolName: string): ISymbol {
    return this.symbols.find(symbol => symbol.name === symbolName)
  }

  getInfo(): ISymbolInfo[] {
    return this.symbols.map(symbol => symbol.getInfo())
  }

  async update() {
    for (const symbol of this.symbols) {
      await symbol.update()
    }
  }
}
