import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core'
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
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
    private elementRef: ElementRef,
    public configService: ConfigService,
    public dialog: MatDialog,
    private windowService: WindowService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load()
  }

  ngAfterViewInit() {
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
    if (!this.candles.length) {
      return
    }

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
      this.chart.padding(10, 0, 10, 0)

      const dateTimeScale = anychart.scales.dateTime()
      const dateTimeTicks = dateTimeScale.ticks()
      dateTimeTicks.interval(0, 6)

      // apply Date Time scale
      this.chart.xScale(dateTimeScale)

      this.chart.xAxis(false)
      this.chart.yAxis().orientation('right')
      this.chart.yAxis().labels().width(65);

      this.addTargetPrice()

      // set the container id
      this.chart.container(this.chartRef.nativeElement)

      // initiate drawing the chart
      this.chart.draw()
    })
  }

  private addTargetPrice() {
    const targetPrice = this.insights.recommendation?.targetPrice || this.candles.at(-1)[CANDLE_FIELD.CLOSE]

    const lastPrice = this.candles.at(-1)[CANDLE_FIELD.CLOSE]
    const lastCandleDate = new Date(this.candles.at(-1)[CANDLE_FIELD.TIME])

    const targetCandleDate = new Date(lastCandleDate)
    targetCandleDate.setDate(lastCandleDate.getDate() + 20)

    const lineSeries = this.chart.line([
      {
        x: lastCandleDate.getTime(),
        value: lastPrice,
      },
      {
        x: targetCandleDate.getTime(),
        value: targetPrice,
      },
    ])

    const color = lastPrice === targetPrice ? 'gray' : lastPrice > targetPrice ? 'red' : 'green'
    const dashStyle = lastPrice === targetPrice ? null : '5 5'

    lineSeries.stroke(color, 3, dashStyle, 'round')
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
