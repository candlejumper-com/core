import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { WSService } from '../ws/ws.service';
import { CandleService } from '../candle/candle.service';
import { ISymbol } from '@candlejumper/shared';

export const enum ORDER_SIDE {
  'BUY' = 'BUY',
  'SELL' = 'SELL'
}

export interface IOrder extends IOrderRaw {
  date: string
  profitString: string
  baseAsset: string
}

export interface IOrderRaw {
  id: number
  type: string
  side: ORDER_SIDE
  symbol: string
  quantity: number
  price: number
  time: number
  profit: number
  commission: number
  commissionAsset: string
  commissionUSDT: number
}
@Injectable({
  providedIn: 'root'
})
export class OrderService {

  orders$ = new BehaviorSubject<IOrder[]>([])
  newOrders$ = new BehaviorSubject<number>(0)

  constructor(
    private httpClient: HttpClient,
    private candleService: CandleService,
    private wsService: WSService
  ) {}

  init(): void {
    this.wsService.socket.on('order', order => {
      this.newOrders$.next(this.newOrders$.value + 1)
      this.playNewOrderSound('profit')
    })
  }

  load(): Observable<IOrderRaw[]> {
    return this.httpClient.get<IOrderRaw[]>(`/api/orders/`).pipe(tap(orders => {
      for (let i = 0, len = orders.length; i < len; i++) {
        const order = orders[i] as IOrder
        order.date = new Date(order.time).toUTCString()
        order.profitString = order.profit.toFixed(4)
        order.baseAsset = this.candleService.getBaseAssetFromSymbol(order.symbol)
      }

      this.orders$.next(orders as IOrder[])
    }))
  }

  order(symbol: ISymbol, side: ORDER_SIDE, quantity?: number): Observable<any>  {
    const order = {
      symbol: symbol.name,
      side,
      quantity
    }

    return this.httpClient.post('/api/order', order)
  }

  sellUnusedCoins(): Observable<void> {
    return this.httpClient.get<void>('/api/orders/sell-unused')
  }

  loadBySymbol(symbol: string, interval: string, backtest: boolean) {
    const url = backtest ? `/api/backtest/orders/${symbol.replace('/', '_')}/${interval}` : `/api/orders/${symbol.replace('/', '_')}`
    return this.httpClient.get<IOrder[]>(url)
  }

  private playNewOrderSound(type: 'profit' | 'loss'): void {
    let audio: HTMLAudioElement

    if (type === 'profit') {
      audio = new Audio('assets/sound/order-loss.mp3');
    } else {
      audio = new Audio('assets/sound/order-loss.mp3');
    }

    audio.volume = 0.5

    audio.play();
  }
}
