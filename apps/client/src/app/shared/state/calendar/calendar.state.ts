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

  @Selector()
  static isLoggedIn(state: IUser): boolean {
    return !!state;
  }

  @Selector()
  static getBalanceByAsset(state: IUser, asset: string): number {
    return state.balances.find(balance => balance.asset === asset)?.free || 0
  }

  @Action(CALENDAR_SET)
  set({ setState: setState }, action: CALENDAR_SET) {
    setState(action.items);

    // update balances every second
    // setInterval(() => this.userService.updateBalances(), 1000);
    // this.updateBalances()
  }

  @Action(LoginSuccess)
  loginSuccess(action: any, payload: any) {
    // alert('login success')
  }
}
