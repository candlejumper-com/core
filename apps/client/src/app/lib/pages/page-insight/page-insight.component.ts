import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { InsightService } from '../../../shared/services/insight/insight.service'
import { ICalendarItem, IInsight, ISymbol } from '@candlejumper/shared'
import { Store } from '@ngxs/store'
import { Observable, BehaviorSubject, combineLatest, filter, map, tap } from 'rxjs'
import { PeriodicElement } from '../../../shared/components/footer-tabs/footer-tab-backtest/footer-tab-backtest.component'
import { CalendarService } from '../../../shared/services/calendar/calendar.service'
import { CALENDAR_SET } from '../../../shared/state/calendar/calendar.actions'
import { CalendarState } from '../../../shared/state/calendar/calendar.state'
import { ChartMiniComponent } from '../../../shared/components/chart-mini/chart-mini.component'
import { SharedModule } from '../../../shared/shared.module'
import { MatSort, Sort } from '@angular/material/sort'
import { LiveAnnouncer } from '@angular/cdk/a11y'
import { MatTableDataSource } from '@angular/material/table'
import { SymbolSelectors } from '../../../shared/state/symbol/symbol.selectors'
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
    'intermediate',
    'short',
    'long',
    'estimate',
    'diffInPercent',
    'reportDate',
  ]

  orderColumns: string[] = ['index', 'side', 'price', 'profit', 'quantity', 'time', 'reason', 'text']

  dataSource$ = new BehaviorSubject([{}, {}])
  dataSource: ISymbol[]

  constructor(
    public insightService: InsightService,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.dataSource = this.store.selectSnapshot(SymbolState.getAll)
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.

    // switch (sortState.active) {
    //   case 'intermediate':
    //     this.dataSource.data.sort(function compareByName(a, b) {
    //       return (
    //         parseInt(a.insights?.instrumentInfo?.technicalEvents.intermediateTermOutlook.score, 10) -
    //         parseInt(b.insights?.instrumentInfo?.technicalEvents.intermediateTermOutlook.score, 10)
    //       )
    //     })
    //     break
    //   case 'short':
    //     this.dataSource.data.sort(function compareByName(a, b) {
    //       return (
    //         a.insights?.instrumentInfo?.technicalEvents.shortTermOutlook.score -
    //         b.insights?.instrumentInfo?.technicalEvents.shortTermOutlook.score
    //       )
    //     })
    //     break
    //   case 'long':
    //     this.dataSource.data.sort(function compareByName(a, b) {
    //       return (
    //         a.insights?.instrumentInfo?.technicalEvents.longTermOutlook.score -
    //         b.insights?.instrumentInfo?.technicalEvents.longTermOutlook.score
    //       )
    //     })
    //     break
    // }

    // if (sortState.direction === 'asc') {
    //   this.dataSource.data.reverse()
    // }

    // this.dataSource = new MatTableDataSource(this.dataSource.data)
    this.changeDetectorRef.detectChanges()
    // if (sortState.direction) {
    //   this.liveAnnouncer.announce(`Sorted ${sortState.direction}ending`)
    // } else {
    //   this.liveAnnouncer.announce('Sorting cleared')
    // }
  }

  toggleDetails(element) {
    if (element) {
      return element
    } else {
      return null
    }
  }
}
