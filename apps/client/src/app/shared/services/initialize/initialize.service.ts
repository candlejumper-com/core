import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CandleService } from '../candle/candle.service';
import { ConfigService, IConfigResponse } from '../config/config.service';
import { ProfileService } from '../profile/profile.service';
import { State, StateService } from '../state/state.service';
import { UserService } from '../user/user.service';
import { WSService } from '../ws/ws.service';

interface IAppInitResponse {
  config: IConfigResponse
  symbols: any[]
  state: State
  user: any
}

@Injectable()
export class InitializeService {

  constructor(
    public wsService: WSService,
    private configService: ConfigService,
    private candleService: CandleService,
    private profileService: ProfileService,
    private stateService: StateService,
    private userService: UserService,
    private httpClient: HttpClient,
  ) { }

  async Init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.wsService.init()

      this.httpClient.get<IAppInitResponse>('/api/app-init').subscribe({
        next: result => {
          this.userService.setUser(result.user)
          this.configService.setConfig(result.config)
          this.candleService.setSymbols(result.state.symbols)
          this.profileService.setAccount(result.state.account)
          this.stateService.loadMain(result.state)

          // load firebase and PWA
          // this.deviceService.init();
          this.profileService.init()

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
