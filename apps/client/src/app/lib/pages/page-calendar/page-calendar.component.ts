import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { Store } from '@ngxs/store'
import { CalendarState } from '../../../shared/state/calendar/calendar.state'
import { ICalendarItem, ISymbol } from '@candlejumper/shared'
import { BehaviorSubject, Observable, combineLatest, filter, map, tap } from 'rxjs'
import { SharedModule } from '../../../shared/shared.module'
import { CalendarService } from '../../../shared/services/calendar/calendar.service'
import { ChartMiniComponent } from '../../../shared/components/chart-mini/chart-mini.component'
import { CALENDAR_SET } from '../../../shared/state/calendar/calendar.actions'
import { PeriodicElement } from '../../../shared/components/footer-tabs/footer-tab-backtest/footer-tab-backtest.component'
import { CurrencyPipe, DatePipe } from '@angular/common'
import { SymbolState } from '../../../shared/state/symbol/symbol.state'

@Component({
  selector: 'core-page-calendar',
  templateUrl: './page-calendar.component.html',
  styleUrls: ['./page-calendar.component.scss'],
  standalone: true,
  imports: [SharedModule, ChartMiniComponent],
  providers: [DatePipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNewsComponent implements OnInit {
  calendarItems$: Observable<ICalendarItem[]>

  activeInterval$ = new BehaviorSubject('1D')
  expandedElement: PeriodicElement | null;

  dataSource: Observable<ISymbol[]>
  
  displayedColumns: string[] = [
    'symbol',
    'name',
    'chart',
    'rating',
    'target',
    'intermediate',
    'short',
    'long',
    'estimate',
    'diffInPercent',
    'reportDate',
  ]

  orderColumns: string[] = ['side', 'price', 'profit', 'quantity', 'time', 'reason', 'text']

  constructor(
    private calendarService: CalendarService,
    private store: Store,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
  ) {}

  ngOnInit() {
    this.dataSource = this.store.select(SymbolState.getAll).pipe(
      map(data => this.normalizeData(data))
    )
    // this.dataSource = this.normalizeData(this.store.selectSnapshot(SymbolState.getAll))
  }

  ngOnDestroy() {
    // this.store.dispatch(new CALENDAR_SET([]))
  }

  toggleDetails(element) {
    if (element) {
      return element;
    } else {
      return null;
    }
  }

  private normalizeData(data) {
    return data.map(item => {
      const data = {
        ...item,
      }
      if (data.calendar[0]) {
        data.calendar[0].reportDateString = this.datePipe.transform(data.calendar[0].reportDate, 'dd/MM/yyyy');
        data.calendar[0].targetPriceString = this.currencyPipe.transform(item.insights?.recommendation?.targetPrice || 0)  
      }
      return data
    })
  }
}
