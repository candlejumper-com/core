import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CandleService } from './shared/services/candle/candle.service';
import { WSService } from './shared/services/ws/ws.service';
import { IndicatorService } from './shared/services/indicator/indicator.service'
import { Store } from '@ngxs/store';
import { LoginSuccess } from './shared/state/user/user.actions';

@Component({
  selector: 'core-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  constructor(
    public wsService: WSService,
    private candleService: CandleService,
    private indicatorService: IndicatorService,
    private store: Store
    
  ) { }

  ngOnInit() {
    // this.wsService.init()
    this.candleService.init()
  }
}
