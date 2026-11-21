import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CashRegisterResponse } from '../../../../../../models/cash-register.model';


@Component({
  selector: 'app-shift-header',
  imports: [DatePipe],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs my-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-success-bg text-success border border-emerald-200/60 flex items-center justify-center shrink-0">
            <i class="pi pi-clock text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success-bg text-success border border-emerald-200/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Turno Activo
              </span>
              <span class="text-xs text-slate-400 font-medium">#{{ session()?.id?.slice(0, 8) }}</span>
            </div>
            <p class="text-xs sm:text-sm font-semibold text-slate-900 mt-1">
              Cajero: <span class="text-slate-600 font-normal">{{ session()?.userFullName || 'Cajero Actual' }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4 sm:border-l sm:border-slate-100 sm:pl-6">
          <div class="text-left sm:text-right">
            <p class="text-[11px] font-medium text-slate-400">Tiempo Transcurrido</p>
            <p class="text-sm font-bold text-slate-800 font-mono">{{ elapsedTime() }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">
              Apertura: {{ session()?.openedAt | date: 'dd/MM/yyyy HH:mm' }}
            </p>
          </div>

          <button
            type="button"
            (click)="onGoToSales.emit()"
            class="inline-flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <i class="pi pi-shopping-cart text-xs"></i>
            <span>Ir a Ventas</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class ShiftHeader {
  readonly session = input<CashRegisterResponse | null>(null);
  readonly elapsedTime = input<string>('00h 00m');
  readonly onGoToSales = output<void>();
}