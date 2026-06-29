import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth';

import { LucideAngularModule, Home, Settings, Users, Calendar, DollarSign, Briefcase, Clock } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    importProvidersFrom(
      LucideAngularModule.pick({
        Home,
        Settings,
        Users,
        Calendar,
        DollarSign,
        Briefcase,
        Clock
      })
    )
  ]
};