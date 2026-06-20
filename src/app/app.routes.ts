import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then( m => m.SplashPage)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'tender-list',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tender-list/tender-list.page').then(m => m.TenderListPage)
  },
  {
    path: 'tender-detail/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tender-detail/tender-detail.page').then(m => m.TenderDetailPage)
  },
  {
    path: 'bidding/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/bidding/bidding.page').then(m => m.BiddingPage)
  },
  {
    path: 'bidding',
    redirectTo: 'tender-list',
    pathMatch: 'full',
  },
  {
    path: 'result/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/result/result.page').then(m => m.ResultPage)
  },
  {
    path: 'result',
    redirectTo: 'tender-list',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  },
  {
    path: 'edit-profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/edit-profile/edit-profile.page').then(m => m.EditProfilePage)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage)
  },
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/documents/documents.page').then(m => m.DocumentsPage)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.page').then( m => m.ForgotPasswordPage)
  },
  {
    path: 'customer-service',
    loadComponent: () => import('./pages/customer-service/customer-service.page').then( m => m.CustomerServicePage)
  },
];
