import { SystemBase } from "../../system/system";
import { ISymbol } from "./symbol.interfaces";

export class SymbolManager {

  symbols: ISymbol[] = []

  constructor(private system: SystemBase) {}

  async init() {
    
  }

  add(symbol: ISymbol) {
    symbol.candles = {}
    this.symbols.push(symbol)
  }

  get(symbolName: string): ISymbol {
    return this.symbols.find(symbol => symbol.name === symbolName)
  }
}
