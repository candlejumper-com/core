import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISystemState, State, StateService } from '../state/state.service';
import { WSService } from '../ws/ws.service';
import { Select, Store } from '@ngxs/store';
import { BacktestState } from '../../state/backtest/backtest.state';
import { BACKTEST_RESET, BACKTEST_SET } from '../../state/backtest/backtest.actions';

export interface IBacktestResult {
  totalTime: number
  config: IBacktestOptions
  systems: ISystemState[]
}

export interface IBacktestOptions {
  symbols: string[]
  intervals: string[]
  candleCount: number
  USDT: number
  bots: string[]
  optimize: number
}

@Injectable({
  providedIn: 'root'
})
export class BacktestService {

  @Select(BacktestState.getAll) backtests$: Observable<State[]>

  readonly busy$ = new BehaviorSubject<boolean>(false)

  constructor(
    private stateService: StateService,
    private wsService: WSService,
    private store: Store
  ) {}

  init(): void {
    this.wsService.socket.on('backtest-finished', (result: IBacktestResult) => this.onFinished(result))
  }

  run(options: any): void {
    this.busy$.next(true)

    // reset backtest state
    this.store.dispatch(new BACKTEST_RESET()).subscribe()

    // remove old snapshots
    this.wsService.socket.emit('delete:/api/snapshots', () => {
      this.wsService.socket.emit('post:/api/backtest', options)
    })
    // when websocket returns message "ok"
  }

  private onFinished(result: IBacktestResult): void {
    this.busy$.next(false)

    console.log(result)
    const states = result.systems.map(system => {
      const state = new State()
      state.symbols = system.symbols
      state.account = system.account
      state.interval = system.tickers[0].interval
      state.tickers = system.tickers
      state.profit = system.profit
      state.profitIndex = system.profitIndex
      state.config = system['config']

      return state
    })

    this.store.dispatch(new BACKTEST_SET(states))
  }
}
