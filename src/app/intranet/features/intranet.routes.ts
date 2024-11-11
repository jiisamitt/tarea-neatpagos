import { Routes } from '@angular/router';

export default [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component'),
  },
  {
    path: 'dashboard/history',
    loadComponent: () => import('./history/history.component'),
  },
  {
    path: 'dashboard/trade',
    loadComponent: () => import('./trade/trade.component'),
  },
] as Routes;
