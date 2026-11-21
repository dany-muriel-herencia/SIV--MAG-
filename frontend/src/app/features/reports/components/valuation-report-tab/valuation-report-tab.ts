import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StockValuationDto } from '../../models/report.model';

@Component({
  selector: 'app-valuation-report-tab',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <!-- 1. Si está cargando O si aún no hay datos y la query se está ejecutando -->
    @if (isLoading() || (!valuation() && isFetching())) {
      <div class="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-3 shadow-2xs">
        <i class="pi pi-spin pi-spinner text-primary text-2xl"></i>
        <p class="text-xs text-slate-400 font-medium">Auditando inventario de almacén...</p>
      </div>
    } 
    <!-- 2. Si ya tenemos los datos cargados -->
    @else if (valuation(); as val) {
      <div class="space-y-6">
        
        <!-- Rejilla Valoración -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capital Invertido (Costo)</span>
            <p class="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              S/ {{ val.totalCostValue | number: '1.2-2' }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Costo total de compra de inventario</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor de Venta Estimado</span>
            <p class="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              S/ {{ val.totalSaleValue | number: '1.2-2' }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Si se vendiera el 100% del stock</p>
          </div>

          <div class="bg-success-bg border border-emerald-200/60 rounded-2xl p-5 shadow-2xs">
            <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Ganancia Proyectada</span>
            <p class="text-2xl font-bold tracking-tight text-emerald-700 mt-2">
              S/ {{ val.potentialProfit | number: '1.2-2' }}
            </p>
            <p class="text-xs text-emerald-600 mt-1">Margen global de inventario</p>
          </div>
        </div>

        <!-- Métricas del Catálogo -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 tracking-tight">Métricas del Catálogo</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-slate-500">Total Productos:</span>
              <p class="text-base font-bold text-slate-900 mt-0.5">{{ val.totalProducts }} ítems</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span class="text-slate-500">Productos Activos:</span>
              <p class="text-base font-bold text-slate-900 mt-0.5">{{ val.activeProducts }} activos</p>
            </div>
            <div class="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span class="text-amber-800">Stock Mínimo:</span>
              <p class="text-base font-bold text-amber-900 mt-0.5">{{ val.lowStockProducts }} productos</p>
            </div>
            <div class="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/60">
              <span class="text-rose-800">Agotados:</span>
              <p class="text-base font-bold text-rose-900 mt-0.5">{{ val.outOfStockProducts }} productos</p>
            </div>
          </div>
        </div>

        <!-- Tabla de Detalle por Producto -->
        @if (val.items.length > 0) {
          <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div class="p-4 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900">Desglose de Valoración por Producto</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr class="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th scope="col" class="py-3 px-4">Producto</th>
                    <th scope="col" class="py-3 px-4 text-center">Stock</th>
                    <th scope="col" class="py-3 px-4 text-right">P. Compra</th>
                    <th scope="col" class="py-3 px-4 text-right">P. Venta</th>
                    <th scope="col" class="py-3 px-4 text-right">Valor Costo</th>
                    <th scope="col" class="py-3 px-4 text-right">Valor Venta</th>
                    <th scope="col" class="py-3 px-4 text-right">Margen</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs text-slate-600">
                  @for (item of val.items; track item.productId) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3 px-4 font-semibold text-slate-900">
                        <p>{{ item.productName }}</p>
                        <p class="text-[10px] text-slate-400 font-normal">{{ item.categoryName }} &bull; {{ item.sku }}</p>
                      </td>
                      <td class="py-3 px-4 text-center font-bold text-slate-800">{{ item.stock }}</td>
                      <td class="py-3 px-4 text-right text-slate-500">S/ {{ item.purchasePrice | number: '1.2-2' }}</td>
                      <td class="py-3 px-4 text-right text-slate-800 font-medium">S/ {{ item.salePrice | number: '1.2-2' }}</td>
                      <td class="py-3 px-4 text-right font-semibold text-slate-700">S/ {{ item.costValue | number: '1.2-2' }}</td>
                      <td class="py-3 px-4 text-right font-bold text-slate-900">S/ {{ item.saleValue | number: '1.2-2' }}</td>
                      <td class="py-3 px-4 text-right font-bold text-emerald-600">{{ item.marginPercent | number: '1.1-1' }}%</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

      </div>
    } 
    <!-- 3. Mensaje de respaldo solo si la query YA terminó y no hay datos -->
    @else {
      <div class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2">
        <i class="pi pi-inbox text-3xl text-slate-300"></i>
        <p class="text-xs font-semibold text-slate-700">No hay información de valoración disponible</p>
        <p class="text-[11px]">Verifica que existan productos registrados en el sistema.</p>
      </div>
    }
  `
})
export class ValuationReportTabComponent {
  readonly valuation = input<StockValuationDto | null | undefined>(null);
  readonly isLoading = input<boolean>(false);
  readonly isFetching = input<boolean>(false); // <-- Agregamos esta propiedad
}