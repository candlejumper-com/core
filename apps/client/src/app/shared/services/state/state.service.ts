import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISymbol } from '@candlejumper/shared';

export interface ISystemState {
  account: any
  tickers: any[]
  interval: string
  symbols: any[]
  profit: number
  profitIndex: number
}

export interface ITicker {
  // type: string
  env: string
  account: any
  name: string
  price: number
  symbol: ISymbol
  interval: string
  events: any[]
  config: any
  baseAsset: string
  quoteAsset: string
  hits: number
  stats: {
    ticks: number
    candles: number
  }
}

export enum BOT_EVENT_TYPE {
  START = 'START',
  WATCHER_START = 'WATCHER_START',
  WATCHER_STOP = 'WATCHER_STOP',
  WATCHER_TRIGGERED = 'WATCHER_TRIGGERED',
  TRADE = 'TRADE',
  TREND_UP = 'TREND_UP',
  TREND_DOWN = 'TREND_DOWN',
}

export enum BOT_INDICATOR_TYPE {
  'BB' = 'BB',
  'MACD' = 'MACD',
  'SMA' = 'SMA',
  'RSI' = 'RSI',
  'VOLUME_SMA' = 'VOLUME_SMA',
  'FIBONACCI' = 'FIBONACCI',
  'TREND' = 'TREND'
}

export class State {
  account?: any
  tickers: ITicker[]
  symbols: any = {}
  interval: string
  profit: number
  profitIndex: number
  config: {
    symbols: string[]
    intervals: string[]
    candleCount: number
    USDT: number
    bots: string[]
    optimize: number
    type: string
  }

  getBalance(asset: string): number {
    return this.account.balances.find(balance => balance.asset === asset)?.free || 0
  }

  getAssetValue(asset: string) {
    const balance = this.getBalance(asset)
    let currentPrice = 1

    if (asset !== 'USDT') {
      currentPrice = this.symbols[asset + 'USDT']?.price || 0
    }
    return currentPrice * balance
  }
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  main: State

  loadMain(state: State): void {
    console.log(state)
    this.main = new State()
    this.main.tickers = state.tickers

    for (const symbol in state.symbols) {
      this.main.symbols[symbol] = state.symbols[symbol]

      // for (let interval in state.symbols[symbol].candles) {
      //   this.candleService.set(symbol, interval, state.symbols[symbol].candles[interval])
      // }
    }
  }
}

