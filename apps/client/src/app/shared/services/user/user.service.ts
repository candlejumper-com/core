import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../state/user/user.state';
import merge from 'deepmerge';
import { FOOTER_TAB } from '../../components/footer-tabs/footer-tabs.component';
import { ChartId } from '../chart/chart.service';

export interface IUser {
  id?: number;
  username?: string;
  password?: string;
  broker?: string;
  brokerAPIKey?: string;
  brokerAPISecret?: string;
  production?: boolean;
  balances?: {
    asset: string;
    free: number;
    value?: number;
  }[];
}

export interface IProfile {
  version?: number;
  id?: number;
  username?: string;
  settings?: {
    client: {
      main: {
        activeChart: ChartId;
        charts: any[];
      };
      footer: {
        size: number;
        activeTab: FOOTER_TAB;
      };
      backtest: {
        symbols?: string[];
        intervals?: string[];
        USDT?: number;
        bots?: string[];
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // @Select(UserState.get) user$: Observable<IUser>;

  constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService, private store: Store) {}

  login(username: string, password: string) {
    return this.httpClient.post<{ token: string }>('/api/user/login', { username, password });
  }

  logout(): void {
    this.clearJWTToken();
    window.location.reload();
  }

  create(params: IUser): Observable<any> {
    return this.httpClient.post('/api/user', params);
  }

  toggleProductionMode(state: boolean): Observable<any> {
    return this.httpClient.post('/api/user/production-mode', { state });
  }

  getJWTToken(): string {
    return this.localStorageService.get('jwt');
  }

  setJWTToken(token: string): void {
    this.localStorageService.set('jwt', token);
  }

  clearJWTToken(): void {
    this.localStorageService.delete('jwt');
  }

  save() {
    this.localStorageService.set(
      'profile',
      this.store.selectSnapshot((state) => state.User)
    );
  }

  updateBalances() {
    this.setBalanceValues();
    this.setTotalValue();
    this.sortBalances();
  }

  setBalanceValues() {
    // this.account.balances.forEach(balance => balance.value = this.getAssetValue(balance.asset))
  }

  sortBalances(sortBy = 'free'): void {
    // this.account.balances.sort((a, b) => (a.value < b.value) ? 1 : (a.value > b.value) ? -1 : 0);
  }

  setTotalValue() {
    // this.balanceTotalUSDT = this.account.balances.reduce((value: number, balance) => value + balance.value, 0)
  }

  getAssetValue(asset: string) {
    const balance = this.store.selectSnapshot(UserState.getBalanceByAsset);
    let currentPrice = 1;

    if (asset !== 'USDT') {
      const symbol = this.store.selectSnapshot((symbols) => symbols.find((symbol) => symbol.name === asset + 'USDT'));
      currentPrice = symbol?.price || 0;
    }

    return currentPrice * balance;
  }
}
