import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { Select } from '@ngxs/store'
import { WindowService } from '../../services/window/window.service'
import { SharedModule } from '../../shared.module'
import { DialogOrderComponent, IOrderDialogData } from '../dialog-order/dialog-order.component'
import { ChartType, ChartViewType } from '../../services/chart/chart.service'
import { IPricesWebsocketResponse } from '../../services/candle/candle.interfaces'
import { CandleService } from '../../services/candle/candle.service'
import { Subject, BehaviorSubject, Subscription, tap, takeUntil, Observable } from 'rxjs'
import { ConfigService, IConfigSystem } from '../../services/config/config.service'
import { IOrder, ORDER_SIDE } from '../../services/order/order.service'
import { ITicker, BOT_INDICATOR_TYPE, BOT_EVENT_TYPE } from '../../services/state/state.service'
import { CANDLE_FIELD, ICandle, ISymbol } from '@candlejumper/shared'
import { ConfigState } from '../../state/config/config.state'

/// <reference types="anychart" />
import 'anychart';
import '../chart/anychart-theme-dark-custom'

@Component({
  selector: 'core-chart-mini',
  templateUrl: './chart-mini.component.html',
  styleUrls: ['./chart-mini.component.scss'],
  standalone: true,
  imports: [SharedModule, DialogOrderComponent],
})
export class ChartMiniComponent implements OnInit, OnChanges, OnDestroy {
  @Select(ConfigState.getAll) config$: Observable<IConfigSystem>

  @Input()
  symbol: ISymbol

  @Input()
  type: ChartType = 'MAIN'

  @Input()
  bot: ITicker

  @Input()
  candleCount: number

  @Input()
  timeRange$: Subject<[number, number]> = new Subject()

  @Input()
  candles: ICandle[] = []

  @Input()
  orders: IOrder[] = []

  @Input()
  indicators: any[] = []

  @Input()
  interval$: BehaviorSubject<string>

  // busy$ = new BehaviorSubject<boolean>(true)
  error$ = new BehaviorSubject<any>(null)
  botConfigString: string
  viewType: ChartViewType = 'candlesticks'

  form = new FormGroup({
    interval: new FormControl('15m', [Validators.required]),
  })

  @ViewChild('chart', { static: true })
  private chartRef: ElementRef

  private chart: any
  private events: any[] = []
  private dataTable: any
  private dataMapping: any
  private xhrSubscription: Subscription
  private tickSubscription: Subscription
  private destroy$ = new Subject<void>()

  constructor(
    public configService: ConfigService,
    public dialog: MatDialog,
    private windowService: WindowService,
    private candleService: CandleService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupChartTheme()
    this.subscribeToTickUpdates()
    this.subscribeToIntervalChanges()
    this.load()
  }

  private setupChartTheme(): void {
    anychart.theme(anychart.theme['darkCustom'])
  }

  private subscribeToTickUpdates(): void {
    this.tickSubscription = this.candleService.tick$.subscribe((tick) => this.updateCurrentPrice(tick))
  }

  private subscribeToIntervalChanges(): void {
    this.interval$
      .pipe(
        tap((interval) => this.form.patchValue({ interval })),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }

  ngOnChanges() {
 
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
    this.timeRange$.subscribe(([from, to]) => {
      this.chart.selectRange(new Date(from), new Date(to))
    })

    this.createChart()
  }

  onClickBuy() {
    const data: IOrderDialogData = { symbol: this.symbol, type: ORDER_SIDE.BUY }
    this.dialog.open(DialogOrderComponent, { data })
  }

  onClickSell(): void {
    const data: IOrderDialogData = { symbol: this.symbol, type: ORDER_SIDE.SELL }
    this.dialog.open(DialogOrderComponent, { data })
  }

  setInterval(interval: string): void {
    this.interval$.next(interval)
    this.load()
  }

  private createChart(): void {
    this.destroyChart()

    // setTimeout(() => {
      this.ngZone.runOutsideAngular(() => {
        const data = this.candles.slice(0, 10).map(candle => {
          return [candle[CANDLE_FIELD.TIME], candle[CANDLE_FIELD.CLOSE]]
        })
  
        // create a chart
        this.chart = anychart.line()
        this.chart.background().stroke(null);
        // this.chart.width('100%')
        // this.chart.height('100px')
  
        // create a line series and set the data
        var series = this.chart.line(data)
  
        this.chart.xAxis(false);
        this.chart.yAxis(false);
  
  
        // set the container id
        this.chart.container(this.chartRef.nativeElement)
  
        // initiate drawing the chart
        this.chart.draw()
      })
    // }, 0)
    
  }

  /**
   * Create the chart
   */
  private createChart2(): void {
    this.destroyChart()

    this.ngZone.runOutsideAngular(() => {
      this.dataTable = anychart.data.table()
      // this.dataTable = window.anychart.data.table()
      this.dataTable.addData(this.candles)

      // map loaded data for the ohlc series
      this.dataMapping = this.dataTable.mapAs({
        open: 1,
        high: 2,
        low: 3,
        close: 4,
        volume: 5,
      })

      // create stock chart
      this.chart = anychart.stock()
      // this.chart = window.anychart.stock()
      this.chart.padding(10, 80, 20, 50)
      this.chart.credits().enabled(false)
      // this.chart.height('100%');

      // create plot on the chart
      const plot = this.chart.plot(0)
      if (this.viewType === 'candlesticks') {
        plot.candlestick(this.dataMapping)
      } else if (this.viewType === 'ohlc') {
        plot.ohlc(this.dataMapping)
      }

      plot.legend(false)
      plot.title(false)
      plot.xAxis().labels(false)

      const yAxis = plot.yAxis()
      yAxis.orientation('right')

      // plot.priceIndicator({
      //   value: 'last-visible',
      //   stroke: 'blue',
      //   dash: '5 5 5',
      //   fallingLabelBackground: 'blue',
      //   fallingLabel: {
      //     background: 'blue',
      //   },
      //   risingLabel: {
      //     background: 'blue',
      //   },
      // })

      // set starting range
      // const maxCandlesBack = this.candles.length > 200 ? 200 : this.candles.length
      // const startDate = new Date(this.candles[this.candles.length - 1][0])
      // const endDate = new Date(this.candles[this.candles.length - maxCandlesBack][0])
      // this.chart.selectRange(startDate, endDate)

      // this.chart.padding().left(0)
      this.chart.container(this.chartRef.nativeElement)
      // this.chart.scroller().candlestick(this.dataMapping)
      this.chart.draw()

      this.changeDetectorRef.detectChanges()
    })
  }

  /**
   * update current price and optionally add a new candle
   */
  private updateCurrentPrice(tick: IPricesWebsocketResponse): void {
    if (!this.candles?.length || this.type !== 'MAIN') {
      return
    }

    const lastCandle = this.candles[this.candles.length - 1]
    const isNewCandle = lastCandle[0] !== tick.chart.candle[0]

    // new candle
    if (isNewCandle && tick.chart?.symbol === this.symbol.name) {
      this.candles.push(tick.chart.candle)
      this.dataTable.addData([this.candles[this.candles.length - 1]])
    }

    // price update
    else if (!this.windowService.isResizing && tick.prices[this.symbol.name]) {
      this.candles[this.candles.length - 1][4] = tick.prices[this.symbol.name]
      this.dataTable.addData([this.candles[this.candles.length - 1]])
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

    this.bot = null
    this.indicators = []
    this.events = []
    this.orders = []
    this.dataTable = null
    this.dataMapping = null
  }
}
