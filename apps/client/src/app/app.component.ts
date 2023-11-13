import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { WSService } from './shared/services/ws/ws.service'

@Component({
  selector: 'core-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(public wsService: WSService) {}

  ngOnInit() {
    // this.wsService.init()
  }
}
