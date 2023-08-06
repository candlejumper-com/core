import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CandleService } from '../../../services/candle/candle.service';
import { ChartService } from '../../../services/chart/chart.service';
import { ConfigService } from '../../../services/config/config.service';
import { StateService } from '../../../services/state/state.service';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-footer-tab-bots',
  templateUrl: './footer-tab-bots.component.html',
  styleUrls: ['./footer-tab-bots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class FooterTabBotsComponent {

  bots: any[] = []

  constructor(
    public stateService: StateService,
    public configService: ConfigService,
    private httpClient: HttpClient,
    private candleService: CandleService,
    private chartService: ChartService
  ) {}

  ngOnInit() {
    this.bots  = this.stateService.main.tickers.map(bot => {
      return {
        name: bot.name,
        baseAsset: bot.baseAsset,
        symbol: bot.symbol,
        interval: bot.interval,
        hits: bot.hits,
        bot: bot,
        trades: this.stateService.main.symbols[bot.symbol.name].totalOrders
      }
    })

    console.log(this.bots[0])
  }

  automize() {
    const confirmed = confirm('This will drop all running bots and auto select the best performing bots, based on a (heavy) serie of backtests.\n\nDo you want to continue?')

    if (confirmed) {
      this.httpClient.post('/api/automize', {}).subscribe({
        next: () => {

        }
      })
    }
  }

  onClickBot(bot: any) {
    const symbol = this.candleService.getSymbolByName(bot.symbol)
    const chart = this.chartService.createChart('MAIN', symbol, this.chartService.activeInterval$.value);
    this.chartService.showChart(chart.id);
  }
}
