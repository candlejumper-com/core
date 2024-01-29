import { ApplicationConfig, CSP_NONCE, importProvidersFrom } from '@angular/core'
import { provideRouter } from '@angular/router'
import { appRoutes } from './app.routes'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TabCalendarComponent } from './components/tab-calendar/tab-calendar.component'
import { TabSettingsComponent } from './components/tab-settings/tab-settings.component'
import { TabSymbolsComponent } from './components/tab-symbols/tab-symbols.component'
import { StoreModule } from '@ngrx/store'
import { addSymbolReducer } from './state/symbol/symbol.reducer'

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      // BrowserModule,
      BrowserAnimationsModule,
      StoreModule.forRoot({symbol: addSymbolReducer}),
    ),

    {
      provide: CSP_NONCE,
      useValue: 232323
    },
    provideRouter(appRoutes)
  ],
}
