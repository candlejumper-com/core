import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'core-footer-tab-logs',
  templateUrl: './footer-tab-logs.component.html',
  styleUrls: ['./footer-tab-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule]
})
export class FooterTabLogsComponent {

  logs: any

  constructor(private httpClient: HttpClient, private elementRef: ElementRef) {}

  ngOnInit() {
    this.httpClient.get<any>('/api/logs', {}).subscribe({
      next: logs => {
        this.logs = logs.logs

        setTimeout(() => {
          this.elementRef.nativeElement.parentNode.parentNode.scrollTop = this.elementRef.nativeElement.parentNode.parentNode.scrollHeight
          // this.elementRef.nativeElement.scrollTo(0, this.elementRef.nativeElement.scrollHeight);
        }, 100)
      }
    })
  }
}
