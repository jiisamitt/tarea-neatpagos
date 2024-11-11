import { Routes } from '@angular/router';
import { publicGuard, privateGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    canActivateChild: [publicGuard()],
    path: 'auth',
    loadChildren: () => import('./auth/features/auth.routes'),
  },
  {
    canActivateChild: [privateGuard()],
    path: '',
    loadChildren: () => import('./intranet/features/intranet.routes'),
  },
  {
    path: '**',
    redirectTo: 'intranet',
  },
];
