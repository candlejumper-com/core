import { ApplicationConfig, CSP_NONCE } from '@angular/core'
import { provideRouter } from '@angular/router'
import { appRoutes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    // {
    //   provide: CSP_NONCE,
    //   useValue: globalThis.myRandomNonceValue
    // },
    provideRouter(appRoutes)
  ],
}
