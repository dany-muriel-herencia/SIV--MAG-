import { Component, output } from '@angular/core';

@Component({
  selector: 'app-quick-actions-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
      <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Acciones Rápidas</h3>
      
      <div class="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          (click)="navigate.emit('/sales')"
          class="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-left flex flex-col gap-1 cursor-pointer group"
        >
          <i class="pi pi-shopping-cart text-slate-600 group-hover:text-primary transition-colors"></i>
          <span class="font-semibold text-slate-800">Nueva Venta</span>
        </button>

        <button
          type="button"
          (click)="navigate.emit('/customers')"
          class="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-left flex flex-col gap-1 cursor-pointer group"
        >
          <i class="pi pi-users text-slate-600 group-hover:text-primary transition-colors"></i>
          <span class="font-semibold text-slate-800">Clientes</span>
        </button>

        <button
          type="button"
          (click)="navigate.emit('/products')"
          class="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-left flex flex-col gap-1 cursor-pointer group"
        >
          <i class="pi pi-box text-slate-600 group-hover:text-primary transition-colors"></i>
          <span class="font-semibold text-slate-800">Productos</span>
        </button>

        <button
          type="button"
          (click)="navigate.emit('/stock')"
          class="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-left flex flex-col gap-1 cursor-pointer group"
        >
          <i class="pi pi-chart-bar text-slate-600 group-hover:text-primary transition-colors"></i>
          <span class="font-semibold text-slate-800">Kardex Stock</span>
        </button>
      </div>
    </div>
  `
})
export class QuickActionsCardComponent {
  readonly navigate = output<string>();
}