import { Injectable } from "@angular/core"
import { Action, Selector, State, Store } from "@ngxs/store"
import { SYMBOL_PRICE_SET, SYMBOL_SET } from "./symbol.actions"
import { ISymbol } from "@candlejumper/shared"

@State({
    name: 'Symbols',
    defaults: []
})
@Injectable()
export class SymbolState {

    constructor(private store: Store) {}

    @Selector()
    static getAll(state: ISymbol[]): ISymbol[] {
        return state
    }

    @Selector()
    static getByName(state: ISymbol[], name: string): ISymbol {
        return state.find(_symbol => _symbol.name === name)
    }

    @Action(SYMBOL_SET)
    symbolSet({setState: setState}, action: SYMBOL_SET) {
        setState(action.symbols)
    }

    @Action(SYMBOL_PRICE_SET)
    symbolPriceSet({patchState: patchState, setState: setState, getState: getState}, action: SYMBOL_PRICE_SET) {
        patchState({[`${action.symbol.name}`]: { ...action.symbol, price: action.price }})
    }
}

