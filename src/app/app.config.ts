import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth';

import { LucideAngularModule, Home, Settings, Users, Calendar, DollarSign, Briefcase, Clock, CircleX, X } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
          cssLayer: false
        }
      }
    }),

    importProvidersFrom(
      LucideAngularModule.pick({
        Home,
        Settings,
        Users,
        Calendar,
        DollarSign,
        Briefcase,
        Clock,
        CircleX,
        X
      })
    )
  ]
};