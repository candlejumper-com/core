import { ISymbol } from '@candlejumper/shared'

export interface ISymbolClient extends ISymbol {
    name: string;
    price: number;
  }