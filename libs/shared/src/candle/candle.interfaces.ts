export interface ICandle {
  [0]: number
  [1]: number
  [2]: number
  [3]: number
  [4]: number
}

export interface ISymbol {
  name?: string
  symbol?: string
  baseAsset?: string
  baseAssetPrecision?: number
  baseAssetIcon?: string
  quoteAsset?: string
  price?: number
  priceString?: string
  direction?: number

  // TEMP
  change24H?: number
  start24HPrice?: number
  change24HString?: string
  changedSinceLastClientTick?: boolean
  totalOrders?: number
  orders?: any[]
}
