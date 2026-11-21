import { Routes } from '@angular/router';

export const PURCHASES_ROUTES: Routes = [
  {
    path: '',
    // Carga la página principal de compras (lista de compras u órdenes)
    loadComponent: () =>
      import('./pages/purchase-list/purchase-list').then(
        (m) => m.PurchaseList
      ),
    title: 'Compras - Sistema de Gestión',
  },
  {
    path: 'new',
    // Carga la vista para registrar/crear una nueva compra
    loadComponent: () =>
      import('./pages/purchase-form/purchase-form').then(
        (m) => m.PurchaseForm
      ),
    title: 'Nueva Compra - Sistema de Gestión',
  },
  {
    path: ':id',
    // Carga el detalle de una compra específica
    loadComponent: () =>
      import('./pages/purchase-detail/purchase-detail').then(
        (m) => m.PurchaseDetail
      ),
    title: 'Detalle de Compra - Sistema de Gestión',
  },
];