import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Select } from '@ngxs/store'
import { WindowService } from '../../services/window/window.service'
import { ChartType } from '../../services/chart/chart.service'
import { Subject, BehaviorSubject, Subscription, Observable } from 'rxjs'
import { ConfigService, IConfigSystem } from '../../services/config/config.service'
import { CANDLE_FIELD, ICandle, ISymbol } from '@candlejumper/shared'
import { ConfigState } from '../../state/config/config.state'

/// <reference types="anychart" />
import 'anychart'
import '../chart/anychart-theme-dark-custom'
import { InsightsResult } from 'yahoo-finance2/dist/esm/src/modules/insights'

anychart.theme(anychart.theme['darkCustom'])

@Component({
  selector: 'core-chart-mini',
  templateUrl: './chart-mini.component.html',
  styleUrls: ['./chart-mini.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartMiniComponent implements OnInit, OnDestroy {
  @Select(ConfigState.getAll) config$: Observable<IConfigSystem>

  @Input()
  symbol: ISymbol

  @Input()
  type: ChartType = 'MAIN'

  @Input()
  candles: ICandle[] = []

  @Input()
  insights: InsightsResult

  @Input()
  interval$: BehaviorSubject<string>

  // busy$ = new BehaviorSubject<boolean>(true)
  error$ = new BehaviorSubject<any>(null)
  botConfigString: string

  @ViewChild('chart', { static: true })
  private chartRef: ElementRef

  private chart: any
  private xhrSubscription: Subscription
  private tickSubscription: Subscription
  private destroy$ = new Subject<void>()
  private data: any[] = []

  constructor(
    public configService: ConfigService,
    public dialog: MatDialog,
    private windowService: WindowService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load()
  }

  ngOnDestroy(): void {
    this.tickSubscription?.unsubscribe()
    this.destroy()
    this.destroy$.next()
    this.destroy$.complete()
  }

  /**
   * start loading data for chart
   */
  load(): void {
    this.createChart()
  }

  private createChart(): void {
    this.destroyChart()

    this.ngZone.runOutsideAngular(() => {
      this.data = this.candles.map((candle) => ({
        value: candle[CANDLE_FIELD.CLOSE],
        x: candle[CANDLE_FIELD.TIME],
      }))

      // create a chart
      this.chart = anychart.line(this.data)
      this.chart.background().stroke(null)
      const dateTimeScale = anychart.scales.dateTime()
      const dateTimeTicks = dateTimeScale.ticks()
      dateTimeTicks.interval(0, 6)

      // apply Date Time scale
      this.chart.xScale(dateTimeScale)

      this.chart.xAxis(false)
      // this.chart.yAxis(false)
      this.chart.yAxis().orientation('right')

      this.addTargetPrice()

      // set the container id
      this.chart.container(this.chartRef.nativeElement)

      // initiate drawing the chart
      this.chart.draw()
    })
  }

  private addTargetPrice() {
    if (this.insights?.recommendation?.targetPrice) {

      const lastPrice = this.candles.at(-1)[CANDLE_FIELD.CLOSE]
      const lastCandleDate = new Date(this.candles.at(-1)[CANDLE_FIELD.TIME])

      const targetPrice = this.insights.recommendation?.targetPrice
      const targetCandleDate = new Date(lastCandleDate)
      targetCandleDate.setDate(lastCandleDate.getDate() + 10)

      const color = lastPrice > targetPrice ? 'red' : 'green'

      const lineSeries = this.chart.line([
        {
          x: lastCandleDate.getTime(),
          value: lastPrice
        },
        {
          x: targetCandleDate.getTime(),
          value: this.insights.recommendation?.targetPrice
        }
      ])
      
      lineSeries.stroke(`3 ${color}`);
    }
  }

  private destroyChart(): void {
    this.xhrSubscription?.unsubscribe()

    if (this.chart) {
      this.ngZone.runOutsideAngular(() => {
        this.chart.remove()
        this.chart = null
        this.chartRef.nativeElement.innerHTML = ''
      })
    }
  }

  /**
   * Cleanup chart and listeners
   */
  private destroy(): void {
    this.destroyChart()
  }
}
