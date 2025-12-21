import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/dashboard/home.component';
import { AccountComponent } from './features/account/account.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', loadComponent: () => import('./features/tenders/tenders-dashboard.component').then(m => m.TendersDashboardComponent) },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: '**', redirectTo: '/login' }
];
