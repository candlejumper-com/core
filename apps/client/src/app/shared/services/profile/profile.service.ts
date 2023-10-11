import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import merge from 'deepmerge';
import { ChartId } from '../chart/chart.service';
import { FOOTER_TAB } from '../../components/footer-tabs/footer-tabs.component';
import { Store } from '@ngxs/store';

export interface IProfile {
  version?: number
  id?: number
  username?: string
  settings?: {
    client: {
      main: {
        activeChart: ChartId
        charts: any[]
      },
      footer: {
        size: number
        activeTab: FOOTER_TAB
      },
      backtest: {
        symbols?: string[]
        intervals?: string[]
        USDT?: number
        bots?: string[]
      }
    },
  }
}

export interface IAccount {
  balances: {
    asset: string
    free: number
    value?: number
  }[]
}

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

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  profile = DEFAULT_PROFILE
  account: IAccount = null
  balanceTotalUSDT = 0

  constructor(
    private localStorageService: LocalStorageService,
    private store: Store
  ) { }

  init() {
    // update profile from localstorage
    // only if version matches
    const localProfile = this.localStorageService.get('profile')
    
    if (typeof localProfile === 'object' && localProfile?.version === PROFILE_VERSION) {
      this.profile = merge(DEFAULT_PROFILE, localProfile)
    }
    // otherwhise reset localstorage
    else {
      this.localStorageService.set('profile', null)
    }

    // update balances every second
    setInterval(() => this.updateBalances(), 1000)
  }

  save() {
    this.localStorageService.set('profile', this.profile)
  }

  updateBalances() {
    this.setBalanceValues()
    this.setTotalValue()
    this.sortBalances()
  }

  setAccount(data: IAccount): void {
    this.account = data
    this.updateBalances()
  }

  setBalanceValues() {
    this.account.balances.forEach(balance => balance.value = this.getAssetValue(balance.asset))
  }

  sortBalances(sortBy = 'free'): void {
    this.account.balances.sort((a, b) => (a.value < b.value) ? 1 : (a.value > b.value) ? -1 : 0);
  }

  setTotalValue() {
    this.balanceTotalUSDT = this.account.balances.reduce((value: number, balance) => value + balance.value, 0)
  }

  getBalance(asset: string): number {
    return this.account.balances.find(balance => balance.asset === asset)?.free || 0
  }

  getAssetValue(asset: string) {
    const balance = this.getBalance(asset)
    let currentPrice = 1

    if (asset !== 'USDT') {
      const symbol = this.store.selectSnapshot(symbols => symbols.find(symbol => symbol.name === asset + 'USDT'))
      currentPrice = symbol?.price || 0
    }

    return currentPrice * balance
  }
}
