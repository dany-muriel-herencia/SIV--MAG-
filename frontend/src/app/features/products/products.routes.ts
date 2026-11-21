import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductList),
    title: 'Productos - Sistema de Gestión',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-form/product-form').then((m) => m.ProductForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Nuevo Producto - Sistema de Gestión',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/product-form/product-form').then((m) => m.ProductForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Editar Producto - Sistema de Gestión',
  },
];
