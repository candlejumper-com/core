import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CandleService } from '../../../services/candle/candle.service';
import { ChartService } from '../../../services/chart/chart.service';
import { ConfigService } from '../../../services/config/config.service';
import { OrderService } from '../../../services/order/order.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { IUser, UserService } from '../../../services/user/user.service';
import { SharedModule } from '../../../shared.module';
import { UserState } from '../../../state/user/user.state';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';

@Component({
  selector: 'core-footer-tab-balances',
  templateUrl: './footer-tab-balances.component.html',
  styleUrls: ['./footer-tab-balances.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SharedModule
  ]
})
export class FooterTabBalancesComponent implements OnInit, OnDestroy {

  @Select(UserState.get) user$: Observable<IUser>

  availableUSDT: number

  private updateInterval

  constructor(
    public configService: ConfigService,
    public candleService: CandleService,
    private orderService: OrderService,
    private changeDetectorRef: ChangeDetectorRef,
    private chartService: ChartService,
    public userService: UserService
  ) {}

  ngOnInit() {
    // this.availableUSDT = this.user$.getBalance('USDT')
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
      this.availableUSDT = this.userService.getAssetValue('USDT')
      this.changeDetectorRef.detectChanges()
    }, 500)
  }
}
