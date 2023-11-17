import { Injectable } from '@angular/core';
import { Action, Selector, State } from '@ngxs/store';
import { LoginSuccess, CALENDAR_SET } from './calendar.actions';
import { IProfile, IUser, UserService } from '../../services/user/user.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { FOOTER_TAB } from '../../components/footer-tabs/footer-tabs.component';
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
