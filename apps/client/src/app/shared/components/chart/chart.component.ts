import { ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import './anychart-theme-dark-custom'
import { WindowService } from '../../services/window/window.service'
import { SharedModule } from '../../shared.module'
import { MatDialog } from '@angular/material/dialog'
import { DialogOrderComponent, IOrderDialogData } from '../dialog-order/dialog-order.component'
import { ChartType, ChartViewType } from '../../services/chart/chart.service'
import { IPricesWebsocketResponse } from '../../services/candle/candle.interfaces'
import { CandleService } from '../../services/candle/candle.service'
import { Subject, BehaviorSubject, Subscription, tap, takeUntil, Observable } from 'rxjs'
import { ConfigService, IConfigSystem } from '../../services/config/config.service'
import { IOrder, ORDER_SIDE } from '../../services/order/order.service'
import { ITicker, BOT_INDICATOR_TYPE, BOT_EVENT_TYPE } from '../../services/state/state.service'
import { ISymbol } from '@candlejumper/shared'
import { ConfigState } from '../../state/config/config.state'
import { Select } from '@ngxs/store'

@Component({
  selector: 'core-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true,
  imports: [SharedModule, DialogOrderComponent],
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
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
  candles: number[][] = []

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
    window.anychart?.theme((anychart as any).themes.darkCustom)
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

  /**
   * Create the chart
   */
  private createChart(): void {
    this.destroyChart()

    this.ngZone.runOutsideAngular(() => {
      this.dataTable = window.anychart.data.table()
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
      this.chart = window.anychart.stock()
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

      plot.priceIndicator({
        value: 'last-visible',
        stroke: 'blue',
        dash: '5 5 5',
        fallingLabelBackground: 'blue',
        fallingLabel: {
          background: 'blue',
        },
        risingLabel: {
          background: 'blue',
        },
      })

      // create and setup volume plot
      const volumePlot = this.chart.plot(1)

      volumePlot.height('10%')
      volumePlot.maxHeight('60px')
      volumePlot.yAxis().labels().format('${%Value}{scale:(1000000)(1000)|(kk)(k)}')
      volumePlot.xAxis().labels(false)

      const volumeMaIndicator = volumePlot.volumeMa(this.dataMapping, 20, 'sma', 'column', 'splineArea')
      volumeMaIndicator.volumeSeries('column')
      volumePlot.legend(false)
      volumePlot.title(false)

      const maSeries = volumeMaIndicator.maSeries()
      maSeries.stroke('red')
      maSeries.fill('red .2')

      // set starting range
      const maxCandlesBack = this.candles.length > 200 ? 200 : this.candles.length
      const startDate = new Date(this.candles[this.candles.length - 1][0])
      const endDate = new Date(this.candles[this.candles.length - maxCandlesBack][0])
      this.chart.selectRange(startDate, endDate)

      this.addOrders()
      this.addIndicators()
      this.addEvents()

      this.chart.padding().left(0)
      this.chart.container(this.chartRef.nativeElement)
      this.chart.scroller().candlestick(this.dataMapping)
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

  /**
   * Add indicators
   */
  private addIndicators(): void {
    const plot = this.chart.plot(0)

    this.indicators.forEach((indicator: any) => {
      switch (indicator.type) {
        // SMA
        case BOT_INDICATOR_TYPE.SMA: {
          // create SMA indicators with period 20
          const SMA = plot.sma(this.dataMapping, indicator.params.period.value).series()
          SMA.stroke('#bf360c')
          break
        }

        // Bollinger
        case BOT_INDICATOR_TYPE.BB: {
          // create Bollinger Bands indicator
          const bbMapping = this.dataTable.mapAs({ value: 4 })
          const bbands = plot.bbands(bbMapping, indicator.params.period.value, indicator.params.weight.value)

          // TODO - should be done in theming file
          bbands.lowerSeries().stroke('#fff 0.5')
          bbands.upperSeries().stroke('#fff 0.5')
          bbands.rangeSeries().fill('#ccc 0.1')
          break
        }
        // RSI
        case BOT_INDICATOR_TYPE.RSI: {
          const rsiPlot = this.chart.plot(2)
          rsiPlot.height('20%')
          rsiPlot.maxHeight('100px')
          const rsiMapping = this.dataTable.mapAs({ value: 4 })
          const rsi14 = rsiPlot.rsi(rsiMapping, indicator.params.period.value).series()
          rsi14.stroke('#bf360c')
          break
        }

        case BOT_INDICATOR_TYPE.FIBONACCI: {
          // const candles = this.candles.slice(0, 20).map(candle => ({ h: candle[2], l: candle[3]}))
          // var resists = tw.fibonacciRetrs(candles, 'UPTREND');

          // access the annotations() object of the plot to work with annotations
          const controller = plot.annotations()
          const period = indicator.params.period.value
          // create a Fibonacci Retracement annotation
          const candles = this.candles
            .slice(this.candles.length - period, this.candles.length - 1)
            .map((candle) => candle[4])
          const highestPrice = Math.max(...candles)
          const lowestPrice = Math.min(...candles)

          controller.fibonacciRetracement({
            xAnchor: this.candles[this.candles.length - period][0],
            valueAnchor: lowestPrice,
            secondXAnchor: this.candles[this.candles.length - 1][0],
            secondValueAnchor: highestPrice,
          })
          break
        }
        default:
          console.error('Unknown indicator: ' + indicator.type)
      }
    })
  }

  /**
   * Add òrders
   */
  private addOrders(): any {
    const plot = this.chart.plot(0)
    const firstCandleTime = this.candles[0][0]
    const buyOrders = []
    const sellOrders = []

    this.orders.forEach((order) => {
      // Don't show orders that are longer ago then the first candle time
      if (order.time < firstCandleTime) {
        return
      }

      // get the nearest candle time, so that the icon shows 'over' the candle (think: z-index) (instead of slighly next to it)
      const nearestCandleIndex = this.candles.findIndex((candle) => candle[0] > order.time)
      const nearestTime = this.candles[nearestCandleIndex - 1]?.[0] || this.candles[0][0]

      if (order.side === 'BUY') {
        buyOrders.push([nearestTime, order.price])
      } else {
        sellOrders.push([nearestTime, order.price])
      }
    })
    ;['BUY', 'SELL'].forEach((side) => {
      // const symbol = ['ERROR', 'PENDING'].includes(order.state) ? 'url(/assets/img/icon-warning.png)' : 'circle'
      const color = side === 'BUY' ? 'darkgreen' : 'darkred'
      const table = anychart.data.table()
      table.addData(side === 'BUY' ? buyOrders : sellOrders)

      // map the data
      const orderMapping = table.mapAs()
      orderMapping.addField('value', 1)

      const markers = plot.marker(table)
      markers.normal().size(15)
      markers.hovered().size(15)
      markers.selected().size(15)
      markers.normal().fill(color)
      markers.normal().stroke(color.replace('dark', 'light'))
      markers.normal().type('star3')
    })
  }

  /**
   * Add events
   */
  private addEvents(): void {
    const plot = this.chart.plot()
    const controller = plot.annotations()
    let lastTrendUpTime
    let lastTrenDownTime

    this.events.forEach((event, index) => {
      switch (event.type) {
        // start line of bot
        case BOT_EVENT_TYPE.START:
          controller.verticalLine({
            xAnchor: event.time,
            normal: { stroke: '2 green' },
            hovered: { stroke: '2 #ff0000' },
            selected: { stroke: '4 #ff0000' },
          })
          break

        case BOT_EVENT_TYPE.WATCHER_START: {
          const color = event.data.dir === 'up' ? 'green' : 'red'
          controller.verticalLine({
            xAnchor: event.time,
            normal: { stroke: '2 ' + color },
            hovered: { stroke: '2 #ff0000' },
            selected: { stroke: '4 #ff0000' },
          })
          break
        }
        case BOT_EVENT_TYPE.WATCHER_STOP:
          controller.verticalLine({
            xAnchor: event.time,
            normal: { stroke: '2 orange' },
            hovered: { stroke: '2 #ff0000' },
            selected: { stroke: '4 #ff0000' },
          })
          break

        case BOT_EVENT_TYPE.WATCHER_TRIGGERED:
          controller.verticalLine({
            xAnchor: event.time,
            normal: { stroke: '2 purple' },
            hovered: { stroke: '2 #ff0000' },
            selected: { stroke: '4 #ff0000' },
          })
          break

        case BOT_EVENT_TYPE.TREND_UP:
          lastTrendUpTime = event.time
          if (lastTrenDownTime) {
            // create a Vertical Channel annotation
            controller.verticalRange({
              xAnchor: lastTrenDownTime,
              secondXAnchor: event.time,
            })
          }

          break

        case BOT_EVENT_TYPE.TREND_DOWN:
          lastTrenDownTime = event.time

          if (lastTrendUpTime) {
            controller.verticalRange({
              xAnchor: lastTrendUpTime,
              secondXAnchor: event.time,
              hovered: {
                fill: '#398cae 0.3',
                stroke: '2 #ff0000',
              },
              normal: {
                fill: 'green 0.3',
                stroke: '4 #ff0000',
              },
            })
          }

          break

        default:
          throw 'Unkown event: ' + event.type
      }
    })
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
