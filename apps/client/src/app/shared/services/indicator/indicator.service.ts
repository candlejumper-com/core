import { Injectable } from '@angular/core'
import { WSService } from '../ws/ws.service'
import { ISymbol } from '@candlejumper/shared'

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {

  indicators: any[]= []

  constructor(private wsService: WSService) { }

  init() {
    this.wsService.socket.on('indicators', data => {
      this.indicators = data

      console.log('sadfsdf', data)
    })
  }

  get(symbol: ISymbol, interval: string) {
    return this.indicators.find(indicator => indicator.symbol.name === symbol.name && indicator.interval === interval)
  }
}
