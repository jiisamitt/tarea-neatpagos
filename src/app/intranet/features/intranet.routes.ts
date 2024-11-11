import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component'),
  },
  {
    path: 'history',
    loadComponent: () => import('./history/history.component'),
  },
  {
    path: 'trade',
    loadComponent: () => import('./trade/trade.component'),
  },
] as Routes;
