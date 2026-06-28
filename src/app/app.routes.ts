import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { AppComponent } from './pages/app/app';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth';
import { guestGuard } from './guards/guest';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app/dashboard',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },

  {
    path: 'app',
    component: AppComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'app/dashboard',
  },
];