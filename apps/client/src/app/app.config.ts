// import { ApplicationConfig } from '@angular/core';
// import {
//   provideRouter,
//   withEnabledBlockingInitialNavigation,
// } from '@angular/router';
// import { routes } from './app.routes';

// export const appConfig: ApplicationConfig = {
//   providers: [provideRouter(routes, withEnabledBlockingInitialNavigation())],
// };

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
