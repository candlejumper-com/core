import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConfigResponse } from '../config/config.service';
import { State } from '../state/state.service';
import { WSService } from '../ws/ws.service';
import { Store } from '@ngxs/store';
import { CONFIG_SET } from '../../state/config/config.actions';
import { SYMBOL_SET } from '../../state/symbol/symbol.actions';
import { USER_SET } from '../../state/user/user.actions';
import { IUser } from '../user/user.service';
import { ISymbol } from '@candlejumper/shared';
import { CandleService } from '../candle/candle.service';
import { ChartService } from '../chart/chart.service';
import { OrderService } from '../order/order.service';
import { AIService } from '../ai/ai.service';
import { BacktestService } from '../backtest/backtest.service';
import { IndicatorService } from '../indicator/indicator.service';

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
    private httpClient: HttpClient,
    private store: Store
  ) { }

  async Init(): Promise<void> {
    return new Promise((resolve, reject) => {

      this.httpClient.get<IAppInitResponse>('/api/app-init').subscribe({
        next: result => {
          const user = Object.assign({}, result.user, result.state.account)

          this.store.dispatch(new USER_SET({id: 2}))
          this.store.dispatch(new CONFIG_SET(result.config))
          this.store.dispatch(new SYMBOL_SET(result.state.symbols))

          this.wsService.init()
          this.chartService.init()
          this.orderService.init()
          this.aiService.init()
          this.backtestService.init()
          this.indicatorService.init()

          // load firebase and PWA
          // this.deviceService.init();
          resolve()
        },
        error: error => {
          console.error(error);
          document.body.innerHTML = '<h1 style="color: red; margin-top: 100px; text-align: center;">INITIALIZE FAILED</h1>'
          reject()
        }
      })
    })
  }
}
