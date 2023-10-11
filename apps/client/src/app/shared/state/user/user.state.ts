import { Injectable } from '@angular/core';
import { Action, Selector, State } from '@ngxs/store';
import { LoginSuccess, USER_SET } from './user.actions';
import { IProfile, IUser, UserService } from '../../services/user/user.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { FOOTER_TAB } from '../../components/footer-tabs/footer-tabs.component';

const PROFILE_VERSION = 1
const DEFAULT_PROFILE: IProfile = {
  version: PROFILE_VERSION,
  settings: {
    client: {
      main: {
        activeChart: null,
        charts: []
      },
      footer: {
        size: 150,
        activeTab: FOOTER_TAB.balances
      },
      backtest: {
        symbols: [],
        intervals: [],
        USDT: 100000,
        bots: []
      }
    }
  }
}

@State({
  name: 'User',
  defaults: {
    balances: [],
  },
})
@Injectable()
export class UserState {

  constructor(
    private localStorageService: LocalStorageService,
    // private userService: UserService
  ) {}

  @Selector()
  static get(user: IUser): IUser {
    return user;
  }

  @Selector()
  static isLoggedIn(state: IUser): boolean {
    return !!state;
  }

  @Selector()
  static getBalanceByAsset(state: IUser, asset: string): number {
    return state.balances.find(balance => balance.asset === asset)?.free || 0
  }

  @Action(USER_SET)
  set({ setState: setState }, action: USER_SET) {
    // update profile from localstorage
    // only if version matches
    const localProfile = this.localStorageService.get('profile');

    if (typeof localProfile === 'object' && localProfile?.version === PROFILE_VERSION) {
      // this.profile = merge(DEFAULT_PROFILE, localProfile);
    }
    // otherwhise reset localstorage
    else {
      this.localStorageService.set('profile', null);
    }

    setState(action.user);

    // update balances every second
    // setInterval(() => this.userService.updateBalances(), 1000);
    // this.updateBalances()
  }

  @Action(LoginSuccess)
  loginSuccess(action: any, payload: any) {
    // alert('login success')
  }
}
