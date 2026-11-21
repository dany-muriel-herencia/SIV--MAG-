import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TopProduct } from '../../../reports/models/report.model';

@Component({
  selector: 'app-top-products-card',
  imports: [DecimalPipe],
  template: `
    <div
      class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-5 h-full flex flex-col justify-between"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight">Productos Más Vendidos</h2>
          <p class="text-xs text-slate-500 mt-0.5">Rendimiento en el mes en curso</p>
        </div>
        <button
          type="button"
          (click)="viewAll.emit()"
          class="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Ver Inventario &rarr;
        </button>
      </div>

      <!-- Contenido -->
      @if (isLoading()) {
        <div class="space-y-4 py-2">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="animate-pulse flex items-center gap-3">
              <div class="w-8 h-8 bg-slate-200 rounded-xl"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-slate-200 rounded-md w-3/4"></div>
                <div class="h-2 bg-slate-100 rounded-md w-1/2"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!isAdmin()) {
        <div class="py-10 text-center text-slate-400 text-xs">
          <i class="pi pi-lock text-2xl mb-2 text-slate-300"></i>
          <p>Métrica disponible solo para administradores.</p>
        </div>
      } @else if (products().length === 0) {
        <div class="py-10 text-center text-slate-400 text-xs">
          <i class="pi pi-inbox text-2xl mb-2 text-slate-300"></i>
          <p>No hay ventas registradas este mes.</p>
        </div>
      } @else {
        <div class="space-y-4 flex-1">
          @for (product of products(); track product.productId; let idx = $index) {
            <div class="group">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-200/60"
                  >
                    {{ idx + 1 }}
                  </span>
                  <span
                    class="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[300px]"
                  >
                    {{ product.productName }}
                  </span>
                </div>

                <div class="text-right shrink-0">
                  <span class="font-bold text-slate-900"
                    >S/ {{ product.totalRevenue | number: '1.2-2' }}</span
                  >
                  <span class="text-slate-400 text-[10px] ml-1.5"
                    >({{ product.totalQuantitySold }} unids)</span
                  >
                </div>
              </div>

              <!-- Barra de Progreso Relativa -->
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary rounded-full transition-all duration-500 group-hover:bg-primary-hover"
                  [style.width.%]="calculatePercentage(product.totalRevenue)"
                ></div>
              </div>
            </div>
          }
        </div>
      }

      <div class="pt-2 text-[11px] text-slate-400 text-center border-t border-slate-100">
        Calculado automáticamente según los comprobantes del mes actual
      </div>
    </div>
  `,
})
export class TopProductsCardComponent {
  readonly products = input<TopProduct[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly isAdmin = input<boolean>(true);

  readonly viewAll = output<void>();

  private readonly maxRevenue = computed(() => {
    const list = this.products();
    if (list.length === 0) return 1;
    return Math.max(...list.map((p) => p.totalRevenue));
  });

  protected calculatePercentage(revenue: number): number {
    const max = this.maxRevenue();
    if (max <= 0) return 0;
    return Math.min(100, Math.max(8, (revenue / max) * 100));
  }
}
