import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICalendarItem } from '@candlejumper/shared';
import { Store } from '@ngxs/store';
import { CALENDAR_SET } from '../../state/calendar/calendar.actions';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(
    private httpClient: HttpClient,
    private store: Store
  ) {}

  load() {
    return this.httpClient.get<ICalendarItem[]>('/api/calendar').pipe(
      tap(items => {
        this.store.dispatch(new CALENDAR_SET(items))
      })
    )
  }
}
