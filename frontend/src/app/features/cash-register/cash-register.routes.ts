import { Routes } from '@angular/router';

export const CASH_REGISTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cash-register/cash-register').then((m) => m.CashRegister),
    title: 'Caja Registradora - Sistema de Gestión',
  },
];
