import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const ALERTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/alert-list/alert-list').then((m) => m.AlertList),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Alertas - Sistema de Gestión',
  },
];
