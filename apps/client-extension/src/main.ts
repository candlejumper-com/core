import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'

declare let __webpack_nonce__: any

__webpack_nonce__ = 'randomNonceGoesHere';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err))
