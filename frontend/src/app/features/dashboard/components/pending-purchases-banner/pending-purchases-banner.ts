import { Component, output } from '@angular/core';

@Component({
  selector: 'app-pending-purchases-banner',
  template: `
    <div class="bg-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <i class="pi pi-truck text-lg text-white"></i>
        </div>
        <div>
          <h4 class="text-sm font-bold">Gestión de Abastecimiento</h4>
          <p class="text-xs text-slate-300 mt-0.5">
            Registra órdenes de compra para reponer inventarios agotados.
          </p>
        </div>
      </div>

      <button
        type="button"
        (click)="navigate.emit()"
        class="h-9 px-4 bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
      >
        Ir a Compras
      </button>
    </div>
  `
})
export class PendingPurchasesBannerComponent {
  readonly navigate = output<void>();
}