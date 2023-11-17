import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { CalendarState } from '../../../shared/state/calendar/calendar.state';
import { ICalendarItem } from '@candlejumper/shared';
import { Observable } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { CalendarService } from '../../../shared/services/calendar/calendar.service';

@Component({
  selector: 'core-page-news',
  templateUrl: './page-news.component.html',
  styleUrls: ['./page-news.component.scss'],
  standalone: true,
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNewsComponent implements OnInit {

  @Select(CalendarState.getAll) calendarItems$: Observable<ICalendarItem[]>

  displayedColumns: string[] = [
    'symbol',
    'name',
    'ISL',
    'rating',
    'estimate',
    'diffInPercent',
    'reportDate',
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

  constructor(private calendarService: CalendarService) { }

  ngOnInit() {
    this.calendarService.load().subscribe()
  }
}
