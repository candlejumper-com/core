import { Injectable } from '@angular/core';

export interface IConfigSystem {
  symbols: string[]
  intervals: string[]
  bots: string[]
}

export interface IConfigResponse {
  system: IConfigSystem
  availableBots: any[]
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  config: IConfigSystem

  setConfig(data: IConfigResponse): void {
    this.config = data.system
    this.config.bots = data.availableBots.map(bot => bot.name)
  }
}
