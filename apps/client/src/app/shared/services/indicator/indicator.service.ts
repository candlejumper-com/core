import { Injectable } from '@angular/core'
import { WSService } from '../ws/ws.service'

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {

  indicators = []

  constructor(private wsService: WSService) { }

  init() {
    this.wsService.socket.on('indicators', data => {
      this.indicators = data
    })
  }
}
