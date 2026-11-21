import { Component, computed, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { useCurrentCashRegisterQuery } from '../../../cash-register/queries/cash-register.queries';

@Component({
  selector: 'app-shift-widget',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200/60">
            <i class="pi pi-clock text-xs"></i>
          </div>
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Caja Chica / Turno</h3>
        </div>

        @if (isOpen()) {
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-bg text-success border border-emerald-200/60">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Abierto
          </span>
        } @else {
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200/60">
            Cerrado
          </span>
        }
      </div>

      @if (isLoading()) {
        <div class="animate-pulse space-y-2 py-2">
          <div class="h-3 bg-slate-200 rounded w-1/2"></div>
          <div class="h-3 bg-slate-100 rounded w-3/4"></div>
        </div>
      } @else if (isOpen()) {
        <div class="space-y-1.5 text-xs">
          <p class="text-slate-600">
            Cajero: <strong class="text-slate-900">{{ session()?.userFullName }}</strong>
          </p>
          <p class="text-slate-400 text-[11px]">
            Abierto el {{ session()?.openedAt | date: 'dd/MM/yyyy HH:mm' }}
          </p>
        </div>
      } @else {
        <p class="text-xs text-slate-500">
          No tienes ningún turno de caja abierto en este momento.
        </p>
      }

      <button
        type="button"
        (click)="goToShift.emit()"
        class="w-full h-9 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <span>{{ isOpen() ? 'Gestionar Arqueo' : 'Abrir Turno' }}</span>
        <i class="pi pi-arrow-right text-[10px]"></i>
      </button>
    </div>
  `
})
export class ShiftWidgetComponent {
  private readonly sessionQuery = useCurrentCashRegisterQuery();

  readonly goToShift = output<void>();

  protected readonly session = computed(() => this.sessionQuery.data() ?? null);
  protected readonly isOpen = computed(() => !!this.session()?.isOpen);
  protected readonly isLoading = computed(() => this.sessionQuery.isLoading());
}