import { Routes } from '@angular/router';

import { AppComponent } from './pages/app/app';
import { AvailabilitiesComponent } from './pages/availabilities/availabilities';
import { BookingsComponent } from './pages/bookings/bookings';
import { CustomersComponent } from './pages/customers/customers';
import { MyScheduleComponent } from './pages/my-schedule/my-schedule';
import { PaymentsComponent } from './pages/payments/payments';
import { ProfileComponent } from './pages/profile/profile';
import { ServicesComponent } from './pages/services/services';
import { SettingsComponent } from './pages/settings/settings';
import { UsersComponent } from './pages/users/users';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { CompaniesComponent } from './pages/companies/companies';
import { CompanyComponent } from './pages/company/company';


import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth';
import { guestGuard } from './guards/guest';
import { permissionGuard } from './guards/permission-guard';
export const routes: Routes = [

  { path: '', redirectTo: 'app', pathMatch: 'full' },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },

  {
  path: 'app',
  component: AppComponent,
  canActivate: [authGuard],
  canActivateChild: [permissionGuard],
  children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'companies', component: CompaniesComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'availabilities', component: AvailabilitiesComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'my-schedule', component: MyScheduleComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ]
},

  { path: '**', redirectTo: 'app' },
];