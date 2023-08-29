import { APP_INITIALIZER, NgModule } from '@angular/core'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AppComponent } from './app.component'
import { CustomHttpInterceptor } from './shared/interceptors/http.interceptor'
import { InitializeService } from './shared/services/initialize/initialize.service'
import { ServiceWorkerModule } from '@angular/service-worker'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatTabsModule } from '@angular/material/tabs'
import { MatCardModule } from '@angular/material/card'
import { FlexLayoutModule } from '@angular/flex-layout'
import { routes } from './app.routes'
import { NgxsReduxDevtoolsPluginModule } from "@ngxs/devtools-plugin";
import { environment } from './environments/environment'
import { NgxsModule } from '@ngxs/store'
import { UserState } from './shared/state/user/user.state'
import { ConfigState } from './shared/state/config/config.state'
import { SymbolStateModule } from './shared/state/symbol/symbol.state.module'
import { UserStateModule } from './shared/state/user/user.state.module'
import { UserService } from './shared/services/user/user.service'
import { BacktestState } from './shared/state/backtest/backtest.state'
import { ChartViewState } from './shared/state/chart-view/chart-view.state'

export function initializeApp(appInitService: InitializeService) {
  return () => appInitService.Init()
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { useHash: true }),
    // NoopAnimationsModule,
    BrowserAnimationsModule,
    HttpClientModule,

    ServiceWorkerModule.register('./ngsw-worker.js', {
      // enabled: false,
      enabled: false,
      // enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      // registrationStrategy: 'registerWhenStable:30000'
    }),
    FlexLayoutModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsModule.forRoot([ConfigState, BacktestState, ChartViewState]),
    SymbolStateModule,
    UserStateModule
  ],
  providers: [
    InitializeService,
    [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: CustomHttpInterceptor,
        multi: true,
      },
    ],
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [InitializeService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
