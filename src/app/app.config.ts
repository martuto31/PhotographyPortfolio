import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })), provideAnimationsAsync(),
  ],
};
