import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, forkJoin, map, of, switchMap, tap, timer } from 'rxjs';
import { ProfileService } from '../profile/profile.service';
import { IOrder, OrderService } from '../order/order.service';
import { CandleService } from '../candle/candle.service';
import { ISymbol } from '@candlejumper/shared';

export type ChartType = 'MAIN' | 'SNAPSHOT' | 'BACKTEST';
export type ChartViewType = 'ohlc' | 'candlesticks';
export type Chart = ViewedChart & { candles: number[][], 
  orders: IOrder[];
  indicators: any[];
 };
export type ChartId = string;

type ViewedChart = {
  id: ChartId;
  symbol: ISymbol;
  type: ChartType;
  snapshot?: any;
};

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  chartsInTabs$ = new BehaviorSubject<ViewedChart[]>([]);
  activeChart$ = new BehaviorSubject<ViewedChart>(null);
  activeOrders$ = new BehaviorSubject<IOrder[]>([]);
  activeInterval$ = new BehaviorSubject<string>('15m');

  activeChartWithData$: Observable<Chart> = this.activeChart$.pipe(switchMap((chart) => {
    if (chart.type === 'MAIN' || chart.type === 'BACKTEST') {
      return forkJoin([
        this.candleService.loadBySymbol(chart.symbol.name, this.activeInterval$.value, 5000, true),
        this.orderService.loadBySymbol(chart.symbol.name, this.activeInterval$.value, chart.type !== 'MAIN')
      ]).pipe(map(([candles, orders]) => {
        return {
          ...chart,
          candles: candles,
          orders,
          indicators: [] // todo
        };
      }), tap(chart => this.activeOrders$.next(chart.orders)));
    } else { // chart.type === 'SNAPSHOT'
      return of({
        ...chart,
        candles: chart.snapshot.candles,
        orders: [chart.snapshot.order],
        indicators: chart.snapshot.indicators
      });
    }
  }),
  tap((chart) => {
    const startTime = chart.candles.length > 200 ? chart.candles.at(-200)[0] : chart.candles.at(0)[0];
    const endTime = chart.candles.at(-1)[0];
    const timeRange = [startTime, endTime] as [number, number];
    this.timeRange$.next(timeRange.sort());
  }));

  timeRange$ = new Subject<[number, number]>();

  constructor(
    private profileService: ProfileService,
    private candleService: CandleService,
    private orderService: OrderService
  ) {}

  init() {
    // get open charts from profile
    this.chartsInTabs$.next(
      this.profileService.profile.settings.client.main.charts.filter(Boolean)
    );

    // get selected chart from profile
    const chartIdFromProfile = this.profileService.profile.settings.client.main.activeChart
    if (chartIdFromProfile) {
      this.showChart(chartIdFromProfile)
    }

    this.requireOneChart();
  }

  createChart(type: ChartType, symbol: ISymbol, interval: string, time = 0, snapshot?: any): ViewedChart {
    const chartId = this.buildChartId(type, symbol, interval, time);
    const existingChart = this.chartsInTabs$.value.find(chart => chart.id === chartId);
    // this.activeInterval$.next(interval);
    if (existingChart) {
      return existingChart;
    }
    const chart = this.getChartData(chartId, symbol, type, snapshot);
    const chartsInTabs = this.chartsInTabs$.value;
    chartsInTabs.push(chart);
    this.chartsInTabs$.next(chartsInTabs);

    this.rememberChartsInTabs();

    return chart;
  }

  showChart(chartId: ChartId) {
    const chart = this.chartsInTabs$.value.find(
      (chart) => chart.id === chartId
    );
    if (!chart) {
      throw new Error(`No chart found by id "${chartId}"`);
    }
    if (!chartId.startsWith('MAIN-')) {
      this.activeInterval$.next(chartId.split('-')[2]);
    }
    this.activeChart$.next(chart);
    this.rememberActiveChart();
  }

  getChartData(
    id: ChartId,
    symbol: ISymbol,
    type: ChartType,
    snapshot?: any
  ): ViewedChart {
    return {
      id,
      symbol,
      type,
      snapshot,
    };
  }

  rememberActiveChart() {
    if (this.activeChart$.value.type === 'MAIN') {
      this.profileService.profile.settings.client.main.activeChart = this.activeChart$.value.id;
      this.profileService.save();
    }
  }

  rememberChartsInTabs() {
    this.profileService.profile.settings.client.main.charts = this.chartsInTabs$.value.filter(charts => charts.type === 'MAIN');
  }

  setTimeRange(from: number, to: number) {
    this.timeRange$.next([from, to]);
  }

  close(chartId: ChartId) {
    // only close if there are more then 1 charts open
    if (this.chartsInTabs$.value.length === 1) {
      return;
    }

    const index = this.chartsInTabs$.value.findIndex(
      (chart) => chart.id === chartId
    );
    const charts = this.chartsInTabs$.value;
    charts.splice(index, 1);
    this.chartsInTabs$.next(charts);

    // if closed one was also the one active, pick another chart to go active
    if (this.chartsInTabs$.value.length) {
      const chart = this.chartsInTabs$.value[this.chartsInTabs$.value.length - 1];
      this.showChart(chart.id);
    }

    this.rememberChartsInTabs();
    this.rememberActiveChart();
  }

  buildChartId(type: ChartType, symbol: ISymbol, interval: string, time = 0): ChartId {
    if (type === 'MAIN') {
      return `${type}-${symbol.name}-${time}` 
    }
    return `${type}-${symbol.name}-${interval}-${time}`;
  }

  cleanBacktestsAndSnapshots() {
    this.chartsInTabs$.next(this.chartsInTabs$.value.filter(chart => chart.type === 'MAIN'));
    this.requireOneChart();
    this.rememberChartsInTabs();
    this.rememberActiveChart();
  }

  requireOneChart() {
    if (!this.chartsInTabs$?.value.length) {
      this.showChart(
        this.createChart('MAIN', this.candleService.getSymbolByName('OIL'), '15m')
          .id
      );
    }
  }
}
