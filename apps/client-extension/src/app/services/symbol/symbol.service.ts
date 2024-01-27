import { Injectable } from '@angular/core'
import { ISymbol } from '@candlejumper/shared'
import { Store } from '@ngrx/store'
import { ISymbolClient } from '../../state/symbol/symbol.model';

export interface AppState {
  readonly symbol: ISymbolClient[];
}

@Injectable({
  providedIn: 'root',
})
export class SymbolService {
  constructor(private store: Store<AppState>) {}

  async load(): Promise<ISymbol[]> {
    const req = await fetch('http://localhost:3000/api/app-init')
    const { state } = await req.json()

    state.symbols.forEach((symbol: ISymbol) => {
      this.add(symbol)
    })
    return state.symbols
  }

  add(symbol: ISymbol) {
    this.store.dispatch({
      type: 'ADD_PRODUCT',
      payload: symbol
    });
  }
}
