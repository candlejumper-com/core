import { Injectable } from '@angular/core'
import { ISymbol } from '@candlejumper/shared'

@Injectable({
  providedIn: 'root',
})
export class SymbolService {
  constructor() {}

  async load(): Promise<ISymbol[]> {
    const req = await fetch('http://localhost:3000/api/app-init')
    const { state } = await req.json()

    return state.symbols
  }
}
