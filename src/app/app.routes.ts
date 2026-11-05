import { Routes } from '@angular/router';

import { LandingComponent } from './features/landing/landing/landing';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';
import { DashboardComponent } from './features/dashboard/dashboard/dashboard';
import { authGuard } from './core/guard/auth-guard';
import { guestGuard } from './core/guard/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];