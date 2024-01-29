import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from '@angular/material/icon'
import { TabSettingsComponent } from './components/tab-settings/tab-settings.component'
import { TabSymbolsComponent } from './components/tab-symbols/tab-symbols.component'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TabCalendarComponent } from './components/tab-calendar/tab-calendar.component'
import { BrowserModule } from '@angular/platform-browser'
import { CommonModule } from '@angular/common'
import { StoreModule } from '@ngrx/store';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    TabSymbolsComponent,
    TabCalendarComponent,
    TabSettingsComponent,
  ],
  selector: 'trade-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss', '../../../../node_modules/bootstrap/scss/bootstrap.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {}
