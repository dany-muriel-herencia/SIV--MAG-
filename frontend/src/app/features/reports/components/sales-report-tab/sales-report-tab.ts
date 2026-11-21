import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SalesSummary, TopProduct } from '../../models/report.model';

@Component({
  selector: 'app-sales-report-tab',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    @if (isLoading()) {
      <div class="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-3 shadow-2xs">
        <i class="pi pi-spin pi-spinner text-primary text-2xl"></i>
        <p class="text-xs text-slate-400 font-medium">Calculando estado de resultados...</p>
      </div>
    } @else if (salesSummary(); as s) {
      <div class="space-y-6">
        
        <!-- Rejilla de Métricas Financieras (4 KPIs) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Ingresos Totales -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ventas Totales</span>
            <p class="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              S/ {{ s.totalRevenue | number: '1.2-2' }}
            </p>
            <p class="text-xs text-slate-400 mt-1">
              {{ s.totalSales }} operaciones ({{ s.cancelledSales }} canceladas)
            </p>
          </div>

          <!-- Ticket Promedio -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
            <p class="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              S/ {{ s.averageTicket | number: '1.2-2' }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Promedio por transacción</p>
          </div>

          <!-- Recaudo en Efectivo -->
          <div class="bg-success-bg border border-emerald-200/60 rounded-2xl p-5 shadow-2xs">
            <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Efectivo Ingresado</span>
            <p class="text-2xl font-bold tracking-tight text-emerald-700 mt-2">
              S/ {{ s.totalCash | number: '1.2-2' }}
            </p>
            <p class="text-xs text-emerald-600 font-medium mt-1">Cobros en caja física</p>
          </div>

          <!-- Ventas a Crédito (Fiado) -->
          <div class="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 shadow-2xs">
            <span class="text-xs font-bold text-amber-900 uppercase tracking-wider">Emitido a Crédito</span>
            <p class="text-2xl font-bold tracking-tight text-amber-800 mt-2">
              S/ {{ s.totalCredit | number: '1.2-2' }}
            </p>
            <p class="text-xs text-amber-700 font-medium mt-1">Cartera de clientes</p>
          </div>

        </div>

        <!-- Desglose de Canales de Cobro y Top Productos -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Estructura de Cobros -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">Estructura de Métodos de Pago</h3>
            
            <div class="space-y-3">
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <i class="pi pi-money-bill text-xs"></i>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-slate-800">Efectivo</p>
                    <p class="text-[10px] text-slate-400">Caja física</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-slate-900">S/ {{ s.totalCash | number: '1.2-2' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <i class="pi pi-credit-card text-xs"></i>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-slate-800">Tarjeta / Yape</p>
                    <p class="text-[10px] text-slate-400">POS y transferencias</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-slate-900">S/ {{ (s.totalCard + s.totalTransfer) | number: '1.2-2' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <i class="pi pi-clock text-xs"></i>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-amber-900">Ventas a Crédito</p>
                    <p class="text-[10px] text-amber-700">Fiados pendientes</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-amber-900">S/ {{ s.totalCredit | number: '1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Top Productos del Período -->
          <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">Top Productos en el Período</h3>
            
            @if (topProducts().length === 0) {
              <p class="text-xs text-slate-400 py-6 text-center">No hay productos vendidos en este rango de fechas.</p>
            } @else {
              <div class="space-y-3">
                @for (prod of topProducts(); track prod.productId; let idx = $index) {
                  <div class="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div class="flex items-center gap-3 min-w-0">
                      <span class="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {{ idx + 1 }}
                      </span>
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-800 truncate">{{ prod.productName }}</p>
                        <p class="text-[10px] text-slate-400">{{ prod.categoryName }} &bull; SKU: {{ prod.productSKU }}</p>
                      </div>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="font-bold text-slate-900">S/ {{ prod.totalRevenue | number: '1.2-2' }}</span>
                      <span class="text-slate-400 text-[10px] ml-2">({{ prod.totalQuantitySold }} unids)</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

        </div>

        <!-- Gráfico / Histórico diario si existen elementos -->
        @if (s.dailySales.length > 0) {
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">Ventas Diarias en el Período</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              @for (day of s.dailySales; track day.date) {
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p class="text-[10px] text-slate-400 font-medium">{{ day.date | date: 'dd MMM' }}</p>
                  <p class="text-xs font-bold text-slate-800 mt-1">S/ {{ day.revenue | number: '1.2-2' }}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">{{ day.salesCount }} ventas</p>
                </div>
              }
            </div>
          </div>
        }

      </div>
    }
  `
})
export class SalesReportTabComponent {
  readonly salesSummary = input<SalesSummary | null | undefined>(null);
  readonly topProducts = input<TopProduct[]>([]);
  readonly isLoading = input<boolean>(false);
}