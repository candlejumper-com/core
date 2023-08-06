
import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { StatusService } from '../status/status.service';
import { WSService } from '../ws/ws.service';
import { IPricesWebsocketResponse } from './candle.interfaces';
import { ISymbol } from '@candlejumper/shared';

@Injectable({
  providedIn: 'root'
})
export class CandleService {

  // candles: { [key: string]: { [key: string]: number[][] } } = {}
  symbols: ISymbol[] = []
  tick$ = new EventEmitter<IPricesWebsocketResponse>()

  constructor(
    private httpClient: HttpClient,
    private wsService: WSService,
    private statusService: StatusService
  ) { }

  init(): void {
    this.wsService.socket.on('prices', (prices: IPricesWebsocketResponse) => this.onPriceTick(prices))
    // this.wsService.socket.on('indiators', (prices: IPricesWebsocketResponse) => this.onPriceTick(prices))
  }

  getSymbolByName(symbol: string): ISymbol {
    return this.symbols.find(_symbol => _symbol.name === symbol)
  }

  getSymbolByAsset(asset: string): ISymbol {
    if (asset === 'USDT') {
      return {
        baseAssetPrecision: 8
      } as any
    }
    return this.symbols.find(_symbol => _symbol.name === asset + 'USDT')
  }

  getBaseAssetFromSymbol(symbol: string): string {
    return this.symbols.find(_symbol => _symbol.name === symbol)?.baseAsset
  }

  loadBySymbol(symbol: string, interval: string, count: number, setWatcher: boolean): Observable<any> {
    // const promise = new Promise((resolve, reject) => {
    //   this.wsService.socket.emit(`get:/api/candles`, { symbol, interval, count, setWatcher }, ({result}: any) => resolve(result))
    // })

    // return from(promise) as Observable<any>
    return this.httpClient.get(`/api/candles/${symbol.replace('/', '_')}/${interval}?count=${count}`)
  }


  // used by app_initializer
  setSymbols(symbols: { [key: string]: ISymbol }): void {
    for (let symbolName in symbols) {
      const symbol = symbols[symbolName]
      symbol.baseAssetIcon = 'assets/icons/crypto/' + symbol.baseAsset.toLowerCase() + '.svg'
      this.setSymbolDetails(symbol)
      this.symbols.push(symbol)
    }
  }

  /**
   * executed on every socket io tick (prices + chart)
   */
  private onPriceTick(tick: IPricesWebsocketResponse): void {

    // update bot server status
    this.statusService.status.botServer.lastTickTime = new Date()

    // update all symbol prices
    for (let symbolName in tick.prices) {
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
