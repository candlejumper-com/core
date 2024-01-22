import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from '@angular/material/icon'
import { TabSettingsComponent } from './components/tab-settings/tab-settings.component'
import { TabSymbolsComponent } from './components/tab-symbols/tab-symbols.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TabCalendarComponent } from './components/tab-calendar/tab-calendar.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    TabSymbolsComponent,
    TabCalendarComponent,
    TabSettingsComponent,
    MatTabsModule,
    MatIconModule,
  ],
  selector: 'trade-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {}
