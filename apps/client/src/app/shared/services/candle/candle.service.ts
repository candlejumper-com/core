
import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from '../status/status.service';
import { WSService } from '../ws/ws.service';
import { IPricesWebsocketResponse } from './candle.interfaces';
import { ISymbol } from '@candlejumper/shared';
import { Select, Store } from '@ngxs/store';
import { SYMBOL_PRICE_SET } from '../../state/symbol/symbol.actions';
import { SymbolState } from '../../state/symbol/symbol.state';

@Injectable({
  providedIn: 'root'
})
export class CandleService {
  
  @Select(SymbolState.getAll) symbols$: Observable<ISymbol[]>

  tick$ = new EventEmitter<IPricesWebsocketResponse>()

  private updateInterval: any

  constructor(
    private httpClient: HttpClient,
    private wsService: WSService,
    private statusService: StatusService,
    private store: Store
  ) { }

  init(): void {
    this.wsService.socket.on('prices', (prices: IPricesWebsocketResponse) => this.onPriceTick(prices))
    
    // sort by name
    // this.symbols = this.candleService.symbols.sort((p1, p2) => (p1.symbol < p2.symbol) ? -11 : (p1.symbol > p2.symbol) ? 0 : -1)
    // this.symbols = this.candleService.symbols.sort((p1, p2) => (p1.symbol < p2.symbol) ? -11 : (p1.symbol > p2.symbol) ? 0 : -1)
    // this.wsService.socket.on('indiators', (prices: IPricesWebsocketResponse) => this.onPriceTick(prices))

    this.startSymbolUpdateInterval()
  }

  getSymbolByName(name: string): ISymbol {
    return this.store.selectSnapshot(({symbols}) => symbols[name])
  }

  getSymbolByAsset(asset: string): ISymbol {
    if (asset === 'USDT') {
      return {
        baseAssetPrecision: 8
      } as any
    }
    // return this.symbols.find(_symbol => _symbol.name === asset + 'USDT')
  }

  getBaseAssetFromSymbol(symbolName: string): string {
    return this.getSymbolByName(symbolName)?.baseAsset
  }

  loadBySymbol(symbol: string, interval: string, count: number, setWatcher: boolean): Observable<any> {
    // const promise = new Promise((resolve, reject) => {
    //   this.wsService.socket.emit(`get:/api/candles`, { symbol, interval, count, setWatcher }, ({result}: any) => resolve(result))
    // })

    // return from(promise) as Observable<any>
    return this.httpClient.get(`/api-candles/candles/${symbol.replace('/', '_')}/${interval}?count=${count}`)
  }


  // used by app_initializer
  // setSymbols(symbols: { [key: string]: ISymbol }): void {
  //   for (let symbolName in symbols) {
  //     const symbol = symbols[symbolName]
  //     symbol.baseAssetIcon = 'assets/icons/crypto/' + symbol.baseAsset.toLowerCase() + '.svg'
  //     this.setSymbolDetails(symbol)
  //     this.symbols.push(symbol)
  //   }
  // }

  private startSymbolUpdateInterval() {
    clearInterval(this.updateInterval)

    this.updateInterval = setInterval(() => {
      const symbols = this.store.selectSnapshot(SymbolState.getAll)
      for (const key in symbols) {
        this.store.dispatch(new SYMBOL_PRICE_SET(symbols[key], Date.now()))
      }
    }, 5000)
  }

  /**
   * executed on every socket io tick (prices + chart)
   */
  private onPriceTick(tick: IPricesWebsocketResponse): void {
    // update bot server status
    this.statusService.status.botServer.lastTickTime = new Date()

    // update all symbol prices
    for (const symbolName in tick.prices) {
      const price = tick.prices[symbolName]
      const symbol = this.getSymbolByName(symbolName)

      // update symbol
      if (symbol) {
        symbol.direction = price === symbol.price ? 0 : price > symbol.price ? 1 : -1
        symbol.price = price
        this.setSymbolDetails(symbol)
      }
    }

    this.tick$.next(tick)
  }

  private setSymbolDetails(symbol: ISymbol): void {
    symbol.priceString = symbol.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    symbol.change24H = ((symbol.price / symbol.start24HPrice) * 100) - 100
    symbol.change24HString = symbol.change24H.toFixed(2)
  }
}
