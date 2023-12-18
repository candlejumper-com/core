import { Component, OnInit, ViewChild } from '@angular/core'
import { InsightService } from '../../../shared/services/insight/insight.service'
import { ICalendarItem, IInsight, ISymbol } from '@candlejumper/shared'
import { Store } from '@ngxs/store'
import { Observable, BehaviorSubject } from 'rxjs'
import { PeriodicElement } from '../../../shared/components/footer-tabs/footer-tab-backtest/footer-tab-backtest.component'
import { ChartMiniComponent } from '../../../shared/components/chart-mini/chart-mini.component'
import { SharedModule } from '../../../shared/shared.module'
import { MatSort, Sort } from '@angular/material/sort'
import { SymbolState } from '../../../shared/state/symbol/symbol.state'

@Component({
  standalone: true,
  selector: 'core-page-insight',
  templateUrl: './page-insight.component.html',
  styleUrls: ['./page-insight.component.scss'],
  imports: [SharedModule, ChartMiniComponent],
})
export class PageInsightComponent implements OnInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort

  calendarItems$: Observable<ICalendarItem[]>
  items$: Observable<IInsight[]>

  activeInterval$ = new BehaviorSubject('1D')
  expandedElement: PeriodicElement | null

  displayedColumns: string[] = [
    'index',
    'symbol',
    'name',
    'chart',
    'rating',
    'target',
    'short',
    'mid',
    'long',
    'estimate',
    'diffInPercent',
    'reportDate',
  ]

  orderColumns: string[] = ['index', 'side', 'price', 'profit', 'quantity', 'time', 'reason', 'text']

  dataSource: ISymbol[]
  sortedData: ISymbol[];

  constructor(
    public insightService: InsightService,
    private store: Store
  ) {}

  ngOnInit() {
    this.dataSource = this.store.selectSnapshot(SymbolState.getAll)
    this.sortData({active: 'short', direction: 'desc'})
  }

  sortData(sort: Sort) {
    const data = this.dataSource.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    function compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
      
      // return !Number.isFinite(a) as any - (!Number.isFinite(b) as any) || (a as any) - (b as any)
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'short':
          return compare(a.insights?.short || 0, b.insights?.short || 0, isAsc);
        case 'mid':
          return compare(a.insights?.mid || 0, b.insights?.mid || 0, isAsc);
        case 'long':
          return compare(a.insights?.long || 0, b.insights?.long || 0, isAsc);
        case 'reportDate':
          return compare(b.calendar?.[0]?.reportDate || 0, a.calendar?.[0]?.reportDate || 0, isAsc);
        default:
          return 0;
      }
    });
  }

  toggleDetails(element) {
    if (element) {
      return element
    } else {
      return null
    }
  }
}
