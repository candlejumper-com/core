import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject, Subject, map, tap } from 'rxjs';
import millify from 'millify';
import { BacktestService } from '../../../services/backtest/backtest.service';
import { CandleService } from '../../../services/candle/candle.service';
import { ChartService } from '../../../services/chart/chart.service';
import { ConfigService } from '../../../services/config/config.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { SnapshotService } from '../../../services/snapshot/snapshot.service';
import { StateService } from '../../../services/state/state.service';
import { SharedModule } from '../../../shared.module';
import { ChartComponent } from '../../chart/chart.component';


export interface PeriodicElement {
  symbol: string;
  position: number;
  weight: number;
}

export interface IFooterTabBacktestOptions {
  force?: boolean;
}

@Component({
  selector: 'app-footer-tab-backtest',
  templateUrl: './footer-tab-backtest.component.html',
  styleUrls: ['./footer-tab-backtest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule, ChartComponent],
})
export class FooterTabBacktestComponent {
  static PREVIOUS_TABLE_DATA = [];

  @Input('options')
  options: IFooterTabBacktestOptions = {};

  @ViewChild('select') select: MatSelect;

  @ViewChild('chart') chart;

  error$ = new BehaviorSubject<any>(null);

  form = new FormGroup({
    symbols: new FormControl([], [Validators.required]),
    intervals: new FormControl([], [Validators.required]),
    bots: new FormControl([], [Validators.required]),
    USDT: new FormControl(100000, [Validators.required]),
    candleCount: new FormControl(2000, [Validators.required]),
    type: new FormControl('OHLC', [Validators.required]),
    optimize: new FormControl(30, [Validators.required]),
  });

  displayedColumns: string[] = [
    'symbol',
    'profitIndex',
    'profit',
    'hits',
    'trades',
    'interval',
    'candles',
    'ticks'
  ];

  orderColumns: string[] = [
    'side',
    'price',
    'profit',
    'quantity',
    'time',
    'reason',
    'text',
  ];

  allSelected = false;

  expandedElement: PeriodicElement | null;
  tableData: any[] = [];

  candleCount = '';
  loadLoopCount = '';

  averageDaily = 0;
  averageHits = 0;

  orders$ = this.chartService.activeOrders$;
  timeRange$ = new Subject<[number, number]>();

  constructor(
    public backtestService: BacktestService,
    private elementRef: ElementRef,
    public configService: ConfigService,
    public candleService: CandleService,
    public stateService: StateService,
    public profileService: ProfileService,
    private chartService: ChartService,
    private snapshotService: SnapshotService
  ) {}

  ngOnInit() {
    const previousSettings =
      this.profileService.profile.settings.client.backtest || {};

    this.form.patchValue(previousSettings);

    this.tableData = FooterTabBacktestComponent.PREVIOUS_TABLE_DATA;

    if (this.options?.force) {
      this.elementRef.nativeElement.style.height =
        window.document.body.clientHeight;
      this.start();
    }

    this.stateService.backtest$.subscribe((states) => {
      if (!states?.length) {
        return;
      }

      this.form.enable();

      // set averageDaily profit
      // only count those that have traded
      const systemsThatTraded = states.filter(state => state.symbols[state.config.symbols[0]].totalOrders > 0).length
      this.averageDaily = states.reduce((value: number, state) => value + state.profitIndex, 0) / systemsThatTraded

      FooterTabBacktestComponent.PREVIOUS_TABLE_DATA = this.tableData = states.map(state => {
        const bot = state.tickers[0];

        return {
          baseAsset: bot.baseAsset,
          symbol: bot.symbol,
          interval: bot.interval,
          hits: bot.hits,
          bot: bot,
          trades: state.symbols[state.config.symbols[0]].totalOrders,
          profit: state.profit,
          profitIndex: state.profitIndex,
          ticks: bot.stats.ticks,
          candles: bot.stats.candles,
          orders: []
        }
      })

      this.tableData.sort((p1, p2) => (p1.profitIndex < p2.profitIndex) ? 1 : (p1.profitIndex > p2.profitIndex) ? -1 : 0);
    })
  }

  toggleOrders(element) {
    if (element) {
      this.chartService.activeOrders$.next(element.bot.orders);
      return element;
    } else {
      return null;
    }
  }

  start() {
    this.tableData = null;
    this.error$.next(null);
    this.form.disable();

    const values: any = Object.assign({}, this.form.value);

    this.profileService.profile.settings.client.backtest = values;
    this.profileService.store();

    const candleCount =
      values.symbols.length * values.intervals.length * values.candleCount;
    this.candleCount = millify(candleCount);
    this.loadLoopCount = millify(
      candleCount * 4 * values.optimize * values.bots.length
    );
    this.chartService.cleanBacktestsAndSnapshots();
    this.backtestService.run(values);
  }

  toggleAllSelection() {
    if (!this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
      this.allSelected = true;
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
      this.allSelected = false;
    }
  }

  openSnapshot(order) {
    const symbol = order.symbol;
    this.snapshotService.fetchSnapshot(order.symbol, order.data.interval, order.time).pipe(
      tap(((snapshot: any) => {
        const chart = this.chartService.createChart(
          'SNAPSHOT',
          symbol,
          order.data.interval,
          order.time,
          {
            order,
            candles: snapshot.candles,
            indicators: snapshot.indicators,
          }
        );
        this.chartService.showChart(chart.id);
      }))
    ).subscribe()
  }

  openBacktest(row) {
    const chart = this.chartService.createChart(
      'BACKTEST',
      row.symbol,
      row.interval,
      0,
      row
    );
    this.chartService.showChart(chart.id);
  }
}
