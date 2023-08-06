import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CandleService } from '../../../services/candle/candle.service';
import { ChartService } from '../../../services/chart/chart.service';
import { ConfigService } from '../../../services/config/config.service';
import { OrderService } from '../../../services/order/order.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-footer-tab-balances',
  templateUrl: './footer-tab-balances.component.html',
  styleUrls: ['./footer-tab-balances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class FooterTabBalancesComponent implements OnInit, OnDestroy {

  availableUSDT: number

  private updateInterval

  constructor(
    public configService: ConfigService,
    public candleService: CandleService,
    public profileService: ProfileService,
    public userService: UserService,
    private orderService: OrderService,
    private changeDetectorRef: ChangeDetectorRef,
    private chartService: ChartService
  ) {}

  ngOnInit() {
    this.availableUSDT = this.profileService.getBalance('USDT')
    this.startUpdateInterval()
  }

  ngOnDestroy(): void {
    clearInterval(this.updateInterval)
  }

  cleanUpUnusedCoins() {
    const confirmed = confirm("This will sell all coins not used in any bot.\n\nDo you want to continue?")
    if (confirmed) {
      this.orderService.sellUnusedCoins().subscribe()
    }
  }

  onClickAsset(asset: string): void {
    const symbol = this.candleService.getSymbolByAsset(asset)
    const chart = this.chartService.createChart('MAIN', symbol, this.chartService.activeInterval$.value);
    this.chartService.showChart(chart.id);
  }

  private startUpdateInterval() {
    this.updateInterval = setInterval(() => {
      this.availableUSDT = this.profileService.getBalance('USDT')
      this.changeDetectorRef.detectChanges()
    }, 500)
  }
}
