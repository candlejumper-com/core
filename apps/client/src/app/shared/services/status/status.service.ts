import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

export interface IStatus {
  status: 'ok' | 'warn' | 'error'
  account: {
    status: string
  }
  candleServer: {
    status?: string
    lastTickTime?: Date
  }
  botServer: {
    status?: string
    lastTickTime?: Date
  }
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  lastTickTime = 0

  status: IStatus = {
    status: 'error',
    account: {
      status: 'error'
    },
    candleServer: {
      status: 'ok'
    },
    botServer: {
      status: 'ok'
    },
  }

  constructor(
    private httpClient: HttpClient,
    private store: Store
  ) {
    // this.init()
  }

  init() {
    setInterval(() => this.load(), 60000)
    setInterval(() => {
      this.status.status = 'ok'
      const isLoggedIn = this.store.select(user => !!user)

      // if (!this.userService.user) {
      //   this.status.status = 'warn'
      // }
    }, 1000)
  }

  load() {
    this.httpClient.get<IStatus>('/api/status').subscribe({
      next: status => {
        this.status = status

        // if (!this.userService.user) {
        //   this.status.status = 'error'
        // }
      },
      error: () => {
        this.status.status = 'error'
      }
    })
  }
}
