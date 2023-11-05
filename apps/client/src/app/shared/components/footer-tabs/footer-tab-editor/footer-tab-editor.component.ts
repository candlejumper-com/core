import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'core-footer-tab-editor',
  templateUrl: './footer-tab-editor.component.html',
  styleUrls: ['./footer-tab-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [SharedModule]
})
export class FooterTabEditorComponent {
  openWindow() {
    window.open('/#/editor', 'editor', "toolbar=no,location=no,status=no,menubar=no,height=800,width=1000");
  }
}
