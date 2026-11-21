import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list').then((m) => m.UserList),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Usuarios - Sistema de Gestión',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/user-form/user-form').then((m) => m.UserForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Nuevo Usuario - Sistema de Gestión',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-form/user-form').then((m) => m.UserForm),
    canActivate: [roleGuard],
    data: { roles: ['Admin'] },
    title: 'Editar Usuario - Sistema de Gestión',
  },
];
