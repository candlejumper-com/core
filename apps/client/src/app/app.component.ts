import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { WSService } from './shared/services/ws/ws.service'
import { DeviceService } from './shared/services/device/device.service'

@Component({
  selector: 'core-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(public wsService: WSService, public deviceService: DeviceService) {}

  ngOnInit() {
    // this.wsService.init()
  }
}
