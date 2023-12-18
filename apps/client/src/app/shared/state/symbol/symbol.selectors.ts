import { Injectable } from '@angular/core'
import { Action, Selector, State, StateToken, createSelector } from '@ngxs/store'
import { SYMBOL_PRICE_SET, SYMBOL_SET } from './symbol.actions'
import { ISymbol } from '@candlejumper/shared'

export const SYMBOLS_STATE_TOKEN = new StateToken<string>(
  'symbols'
);

export class SymbolSelectors {

  @Selector([SYMBOLS_STATE_TOKEN])
  static entities(stateModel) {
    return stateModel.entities;
  }

  @Selector()
  static getAll(state: ISymbol[]): ISymbol[] {
    return state
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
    // return (name: string) => {
    //   if (!name.trim()) {
    //     return state
    //   }

    //   return Object.values(state).filter((symbol: ISymbol) => symbol.name.includes(name.toUpperCase()))
    // }
    return createSelector([this.entities], (state: ISymbol[]) => {
      console.log(222)
      if (!name) {
        return state
      }

      return Object.values(state).filter((symbol: ISymbol) => symbol.name.includes(name.toUpperCase()))
    })
  }
}
