import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CustomerDebtReportDto } from '../../models/report.model';
@Component({
  selector: 'app-debt-report-tab',
  imports: [DecimalPipe],
  template: `
    @if (isLoading() || (!debtReport() && isFetching())) {
      <div
        class="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center gap-3 shadow-2xs"
      >
        <i class="pi pi-spin pi-spinner text-primary text-2xl"></i>
        <p class="text-xs text-slate-400 font-medium">Cargando reporte de cartera de clientes...</p>
      </div>
    } @else if (debtReport(); as report) {
      <div class="space-y-6">
        <!-- Tarjetas Resumen Deuda -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-5 shadow-2xs">
            <span class="text-xs font-bold text-amber-900 uppercase tracking-wider"
              >Deuda Total por Cobrar</span
            >
            <p class="text-2xl font-bold tracking-tight text-amber-900 mt-2">
              S/ {{ report.totalDebt | number: '1.2-2' }}
            </p>
            <p class="text-xs text-amber-700 mt-1">Capital pendiente de cobro</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Clientes con Deuda</span
            >
            <p class="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              {{ report.customersWithDebt }} / {{ report.totalCustomers }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Clientes activos en el sistema</p>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >Deuda Promedio</span
            >
            <p class="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              S/ {{ report.averageDebt | number: '1.2-2' }}
            </p>
            <p class="text-xs text-slate-400 mt-1">Promedio por cliente moroso</p>
          </div>
        </div>

        <!-- Tabla de Clientes Deudores -->
        <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div class="p-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">Listado de Clientes Deudores</h3>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr
                  class="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100"
                >
                  <th scope="col" class="py-3 px-4">Cliente</th>
                  <th scope="col" class="py-3 px-4">Teléfono</th>
                  <th scope="col" class="py-3 px-4 text-right">Límite de Crédito</th>
                  <th scope="col" class="py-3 px-4 text-right">Crédito Disponible</th>
                  <th scope="col" class="py-3 px-4 text-right">Deuda Actual</th>
                  <th scope="col" class="py-3 px-4 text-center">Uso Crédito</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs text-slate-600">
                @if (report.items.length === 0) {
                  <tr>
                    <td colspan="6" class="py-10 text-center text-slate-400">
                      No hay clientes registrados con deuda pendiente. ¡Excelente gestión de cobro!
                    </td>
                  </tr>
                }
                @for (item of report.items; track item.customerId) {
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-slate-900">{{ item.fullName }}</td>
                    <td class="py-3.5 px-4 text-slate-500">{{ item.phone || 'Sin registrar' }}</td>
                    <td class="py-3.5 px-4 text-right text-slate-700 font-medium">
                      S/ {{ item.creditLimit | number: '1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-right text-emerald-700 font-medium">
                      S/ {{ item.availableCredit ?? 0 | number: '1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-rose-600">
                      S/ {{ item.currentDebt | number: '1.2-2' }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        [class]="
                          item.debtPercent >= 90
                            ? 'bg-rose-100 text-rose-800'
                            : item.debtPercent >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                        "
                      >
                        {{ item.debtPercent | number: '1.0-0' }}%
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else {
      <div
        class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2"
      >
        <i class="pi pi-users text-3xl text-slate-300"></i>
        <p class="text-xs font-semibold text-slate-700">No hay datos de cartera disponibles</p>
        <p class="text-[11px]">No se encontraron registros de fiados en el sistema.</p>
      </div>
    }
  `,
})
export class DebtReportTabComponent {
  readonly debtReport = input<CustomerDebtReportDto | null | undefined>(null);
  readonly isLoading = input<boolean>(false);
  readonly isFetching = input<boolean>(false);
}
