import { ISymbol } from '@candlejumper/shared';

export class SYMBOL_GET_BY_NAME {
  static readonly type = '[Symbol] get by name';
  constructor(public name: string) {}
}

export class SYMBOL_SET {
  static readonly type = '[Symbol] set';
  constructor(public symbols: ISymbol[]) {}
}

export class SYMBOL_PRICE_SET {
  static readonly type = '[Symbol] price set';
  constructor(public symbol: ISymbol, public price: number) {}
}


export class SYMBOL_GET_ALL {
  static readonly type = '[Symbol] set';
}

export class SYMBOL_FILTER_BY_NAME {
  static readonly type = '[Symbol] filter by name';
  constructor(public name: string) {}
}
