import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from '../user/user.service';
import { WSService } from '../ws/ws.service';

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
    private userService:UserService,
    private wsService: WSService
  ) {
    this.init()
  }

  init() {
    setInterval(() => this.load(), 60000)
    setInterval(() => {
      this.status.status = 'ok'

      if (!this.userService.user) {
        this.status.status = 'warn'
      }
    }, 1000)
  }

  load() {
    this.httpClient.get<IStatus>('/api/status').subscribe({
      next: status => {
        this.status = status

        if (!this.userService.user) {
          this.status.status = 'error'
        }
      },
      error: () => {
        this.status.status = 'error'
      }
    })
  }
}
