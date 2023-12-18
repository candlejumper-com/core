import { Injectable } from '@angular/core'
import { Action, Selector, State, StateToken, createSelector } from '@ngxs/store'
import { SYMBOL_PRICE_SET, SYMBOL_SET } from './symbol.actions'
import { ISymbol } from '@candlejumper/shared'

export const SYMBOLS_STATE_TOKEN = new StateToken<string>('symbols')

@State<ISymbol[]>({
  name: 'symbols',
  defaults: [],
})
@Injectable()
export class SymbolState {
  @Selector([SYMBOLS_STATE_TOKEN])
  static entities(stateModel) {
    return stateModel.entities
  }

  @Selector()
  static getAll(state: ISymbol[]): ISymbol[] {
    return state
  }

  @Selector()
  static getFirst(state: ISymbol[]): ISymbol {
    return state[Object.keys(state)[0]]
  }

  @Selector()
  static getByName(state: ISymbol[], name: string): ISymbol {
    return state.find((_symbol) => _symbol.name === name)
  }

  @Selector()
  static getFilteredByName3(state: ISymbol[]) {
    return (name: string) => {
      if (!name) {
        return state
      }

      return Object.values(state).filter((symbol: ISymbol) => symbol.name.includes(name.toUpperCase()))
    }
  }

  // @Selector([SymbolState.getAll])
  static getFilteredByName(name: string) {
    return createSelector([SymbolState], (state) => {
      if (!name.trim()) {
        return state
      }
      return Object.values(state).filter((symbol: ISymbol) => symbol.name.includes(name.toUpperCase()))
    })
  }

  @Action(SYMBOL_SET)
  symbolSet({ setState: setState }, action: SYMBOL_SET) {
    action.symbols.forEach(symbol => {
      if ( symbol.calendar?.[0]?.reportDate) {
        symbol.calendar[0].reportDate = new Date(symbol.calendar[0].reportDate)
      }
    })
    setState(action.symbols)
  }

  @Action(SYMBOL_PRICE_SET)
  symbolPriceSet({ patchState: patchState }, action: SYMBOL_PRICE_SET) {
    // patchState({ [`${action.symbol.name}`]: { ...action.symbol, price: action.price } })
  }
}
