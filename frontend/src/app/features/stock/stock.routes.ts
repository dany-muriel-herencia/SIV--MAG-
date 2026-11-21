import { Routes } from '@angular/router'
import { roleGuard } from '../../core/auth/role.guard'

export const STOCK_ROUTES: Routes = [
  {
    path: 'adjust',
    loadComponent: () =>
      import('./pages/movements-list/components/movements-adjust/manual-adjustment-form')
        .then(m => m.ManualAdjustmentForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/movements-list/movements-list')
        .then(m => m.MovementsList),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] }
  },
]