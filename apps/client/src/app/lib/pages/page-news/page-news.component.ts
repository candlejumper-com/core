import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { Select, Store } from '@ngxs/store'
import { CalendarState } from '../../../shared/state/calendar/calendar.state'
import { ICalendarItem } from '@candlejumper/shared'
import { BehaviorSubject, Observable, combineLatest, filter, map, tap } from 'rxjs'
import { SharedModule } from '../../../shared/shared.module'
import { CalendarService } from '../../../shared/services/calendar/calendar.service'
import { ChartMiniComponent } from '../../../shared/components/chart-mini/chart-mini.component'
import { CALENDAR_SET } from '../../../shared/state/calendar/calendar.actions'

@Component({
  selector: 'core-page-news',
  templateUrl: './page-news.component.html',
  styleUrls: ['./page-news.component.scss'],
  standalone: true,
  imports: [SharedModule, ChartMiniComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNewsComponent implements OnInit {
  calendarItems$: Observable<ICalendarItem[]>

  activeInterval$ = new BehaviorSubject('1D')

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
  ) {}

  ngOnInit() {
    this.calendarItems$ = combineLatest([this.store.select(CalendarState.getAll), this.activeInterval$]).pipe(
      filter(([calendarItems]) => !!calendarItems.length),
      map(([calendarItems]) => calendarItems),
    )

    this.calendarService.load().subscribe()
  }

  ngOnDestroy() {
    this.store.dispatch(new CALENDAR_SET([]))
  }
}
