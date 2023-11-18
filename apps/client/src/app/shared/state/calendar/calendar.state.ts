import { Injectable } from '@angular/core';
import { Action, Selector, State } from '@ngxs/store';
import { CALENDAR_SET } from './calendar.actions';
import { ICalendarItem } from '@candlejumper/shared';

@State({
  name: 'Calendar',
  defaults: []
})
@Injectable()
export class CalendarState {

  @Selector()
  static getAll(state: ICalendarItem[]): ICalendarItem[] {
    return state;
  }

  @Action(CALENDAR_SET)
  set({ setState: setState }, action: CALENDAR_SET) {
    setState(action.items);
  }
}
