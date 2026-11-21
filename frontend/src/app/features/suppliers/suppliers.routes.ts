import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const SUPPLIERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/supplier-list/supplier-list').then((m) => m.SupplierList),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Proveedores - Sistema de Gestión',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/supplier-form/supplier-form').then((m) => m.SupplierForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Nuevo Proveedor - Sistema de Gestión',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/supplier-form/supplier-form').then((m) => m.SupplierForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Editar Proveedor - Sistema de Gestión',
  },
];
