import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/category-list/category-list').then((m) => m.CategoryList),
    title: 'Categorías - Sistema de Gestión',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/category-form/category-form').then((m) => m.CategoryForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Nueva Categoría - Sistema de Gestión',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/category-form/category-form').then((m) => m.CategoryForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Editar Categoría - Sistema de Gestión',
  },
];
