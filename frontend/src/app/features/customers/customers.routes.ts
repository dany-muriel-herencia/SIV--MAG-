import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/customer-list/customers-list').then((m) => m.CustomersList),
    title: 'Clientes - Sistema de Gestión',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/customer-form/customer-form').then((m) => m.CustomerForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Nuevo Cliente - Sistema de Gestión',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/customer-form/customer-form').then((m) => m.CustomerForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Editar Cliente - Sistema de Gestión',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/customer-detail/customer-detail').then((m) => m.CustomerDetail),
    title: 'Detalle de Cliente - Sistema de Gestión',
  },
];
