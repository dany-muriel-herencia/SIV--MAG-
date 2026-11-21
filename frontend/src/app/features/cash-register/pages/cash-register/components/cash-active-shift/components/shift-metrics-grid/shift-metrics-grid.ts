import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CashRegisterResponse } from '../../../../../../models/cash-register.model';

@Component({
  selector: 'app-shift-metrics-grid',
  imports: [DecimalPipe],
  template: `
    @if (session()?.summary; as summary) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-3">
        
        <!-- Base Inicial -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Fondo Inicial (Base)</span>
            <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/50">
              <i class="pi pi-wallet text-xs"></i>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-xl font-bold text-slate-900">
              S/ {{ session()?.openingBalance | number: '1.2-2' }}
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">Base en efectivo registrada</p>
          </div>
        </div>

        <!-- Ventas Efectivo -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Ventas en Efectivo</span>
            <div class="w-8 h-8 rounded-xl bg-success-bg text-success flex items-center justify-center border border-emerald-200/50">
              <i class="pi pi-money-bill text-xs"></i>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-xl font-bold text-emerald-700">
              S/ {{ summary.totalCash | number: '1.2-2' }}
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">{{ summary.totalSales }} ventas cobradas</p>
          </div>
        </div>

        <!-- Efectivo Esperado -->
        <div class="bg-slate-900 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-white">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Efectivo Total Esperado</span>
            <div class="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <i class="pi pi-calculator text-xs"></i>
            </div>
          </div>
          <div class="mt-3">
            <p class="text-xl font-bold text-white">
              S/ {{ expectedBalance() | number: '1.2-2' }}
            </p>
            <p class="text-[11px] text-slate-400 mt-0.5">Base + Ventas en efectivo</p>
          </div>
        </div>

        <!-- Tarjetas y Fiados -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500">Otros Medios de Pago</span>
            <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/50">
              <i class="pi pi-credit-card text-xs"></i>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Tarjeta / Yape:</span>
              <span class="font-bold text-slate-800">S/ {{ summary.totalCard + summary.totalTransfer | number: '1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Crédito / Fiado:</span>
              <span class="font-bold text-amber-700">S/ {{ summary.totalCreditIssued | number: '1.2-2' }}</span>
            </div>
          </div>
        </div>

      </div>
    }
  `
})
export class ShiftMetricsGrid {
  readonly session = input<CashRegisterResponse | null>(null);
  readonly expectedBalance = input<number>(0);
}