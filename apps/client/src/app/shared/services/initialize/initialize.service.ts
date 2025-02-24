import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { IConfigResponse } from '../config/config.service'
import { State } from '../state/state.service'
import { WSService } from '../ws/ws.service'
import { Store } from '@ngxs/store'
import { CONFIG_SET } from '../../state/config/config.actions'
import { SYMBOL_SET } from '../../state/symbol/symbol.actions'
import { USER_SET } from '../../state/user/user.actions'
import { IUser } from '../user/user.service'
import { ISymbol } from '@candlejumper/shared'
import { CandleService } from '../candle/candle.service'
import { ChartService } from '../chart/chart.service'
import { OrderService } from '../order/order.service'
import { AIService } from '../ai/ai.service'
import { BacktestService } from '../backtest/backtest.service'
import { IndicatorService } from '../indicator/indicator.service'
import { DeviceService } from '../device/device.service'
import { EMPTY, catchError, of, tap } from 'rxjs'

interface IAppInitResponse {
  config: IConfigResponse
  symbols: ISymbol[]
  state: State
  user: IUser
}

@Injectable()
export class InitializeService {
  constructor(
    public wsService: WSService,
    private chartService: ChartService,
    private orderService: OrderService,
    private aiService: AIService,
    private backtestService: BacktestService,
    private indicatorService: IndicatorService,
    private candleService: CandleService,
    private deviceService: DeviceService,
    private httpClient: HttpClient,
    private store: Store,
  ) {}

  async Init(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.setToDefaultState()

      this.httpClient.get<IAppInitResponse>('/api/app-init')
        .pipe(
          tap(async (result) => {
            this.store.dispatch(new USER_SET({ id: 2 }))
            this.store.dispatch(new CONFIG_SET(result.config))
            this.store.dispatch(new SYMBOL_SET(result.state.symbols))
          }),
          catchError((error) => {
            console.error(error)
            return of(undefined);
          }),
          tap(async () => {
            try {
              await this.initServices()
            } catch (error) {
              console.error(error)
            }
            resolve(null)    
          })
        )
      .subscribe()
    })
  }

  private async initServices() {
    this.wsService.init()
    this.chartService.init()
    this.orderService.init()
    this.aiService.init()
    this.backtestService.init()
    this.indicatorService.init()
    this.candleService.init()

    // load firebase and PWA
    await this.deviceService.init()
  }

  private setToDefaultState() {
    this.store.dispatch(new USER_SET({ id: 2 }))
    this.store.dispatch(new CONFIG_SET({ system: { symbols: [], intervals: [], bots: [] }, availableBots: [] }))
    this.store.dispatch(new SYMBOL_SET([]))
  }
}
