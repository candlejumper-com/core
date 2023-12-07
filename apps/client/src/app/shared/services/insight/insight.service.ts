import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ICalendarItem, IInsight } from '@candlejumper/shared'
import { Store } from '@ngxs/store'
import { tap } from 'rxjs'
import { CALENDAR_SET } from '../../state/calendar/calendar.actions'

@Injectable({
  providedIn: 'root'
})
export class InsightService {
  
  constructor(
    private httpClient: HttpClient,
    private store: Store
  ) {}

  load() {
    return this.httpClient.get<IInsight[]>('/api/insight').pipe(
      tap((items) => {
        // this.store.dispatch(new CALENDAR_SET(items))
      }),
    )
  }
}
