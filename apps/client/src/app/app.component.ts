import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CandleService } from './shared/services/candle/candle.service';
import { WSService } from './shared/services/ws/ws.service';
import { IndicatorService } from './shared/services/indicator/indicator.service'

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
    private indicatorService: IndicatorService
    
  ) { }

  ngOnInit() {
    // this.wsService.init()
    this.candleService.init()
  }
}
