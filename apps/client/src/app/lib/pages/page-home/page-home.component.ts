import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core'
// import { MessagingModule } from '@angular/fire/messaging'
import { Subject, distinctUntilChanged, takeUntil, tap } from 'rxjs'
import { ChartComponent } from '../../../shared/components/chart/chart.component'
import { DialogAuthRegistrateComponent } from '../../../shared/components/dialog-auth-registrate/dialog-auth-registrate.component'
import { DialogAuthComponent } from '../../../shared/components/dialog-auth/dialog-auth.component'
import { FooterTabsComponent } from '../../../shared/components/footer-tabs/footer-tabs.component'
import { SymbolOverviewComponent } from '../../../shared/components/symbol-overview/symbol-overview.component'
import { CandleService } from '../../../shared/services/candle/candle.service'
import { ChartService, ChartId } from '../../../shared/services/chart/chart.service'
import { DeviceService } from '../../../shared/services/device/device.service'
import { OrderService } from '../../../shared/services/order/order.service'
import { StateService } from '../../../shared/services/state/state.service'
import { SharedModule } from '../../../shared/shared.module'

@Component({
  standalone: true,
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SharedModule,
    // MessagingModule,
    ChartComponent,
    SymbolOverviewComponent,
    FooterTabsComponent,
    DialogAuthComponent,
    DialogAuthRegistrateComponent,
  ],
  providers: [DeviceService],
})
export class PageHomeComponent implements OnInit, OnDestroy {
  constructor(
    public deviceService: DeviceService,
    public stateService: StateService,
    public chartService: ChartService,
    public candleService: CandleService,
    public orderService: OrderService
  ) {}

  chart$ = this.chartService.activeChartWithData$
  chartTabs$ = this.chartService.chartsInTabs$.pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
  )
  activeInterval$ = this.chartService.activeInterval$

  private destroy$ = new Subject<void>()

  ngOnInit() {
    this.activeInterval$
      .pipe(
        tap((interval) => {
          const chart = this.chartService.createChart(
            this.chartService.activeChart$.value.type,
            this.chartService.activeChart$.value.symbol,
            interval
          )
          this.chartService.showChart(chart.id)
        }),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  trackChartTabs(_, tab) {
    return tab
  }

  toggleChartTab(chartId: ChartId) {
    event?.preventDefault()

    this.chartService.showChart(chartId)
  }

  closeChartTab(chartId: ChartId) {
    event?.preventDefault()

    this.chartService.close(chartId)
  }
}
