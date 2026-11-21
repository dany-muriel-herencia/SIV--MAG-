import { Routes } from '@angular/router';
import { activeCashRegisterGuard } from '../cash-register/guards/cash-register.guard';

export const SALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sale-list/sale-list').then((m) => m.SaleList),
    title: 'Ventas - Sistema de Gestión',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/sale-form/sale-form').then((m) => m.SaleForm),
    canActivate: [activeCashRegisterGuard],
    title: 'Nueva Venta - Sistema de Gestión',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/sale-detail/sale-detail').then((m) => m.SaleDetail),
    title: 'Detalle de Venta - Sistema de Gestión',
  },
];
