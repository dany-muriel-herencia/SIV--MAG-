import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-status-filter',
  imports: [],
  templateUrl: './status-filter.html',
})
export class StatusFilterComponent {
  readonly value = input<boolean | undefined>(undefined);

  readonly totalCount = input<number>();
  readonly activeCount = input<number>();
  readonly inactiveCount = input<number>();

  readonly statusChange = output<boolean | undefined>();

  // Estilos idénticos a la lógica del Sidebar:
  // Si está seleccionado -> bg-white con sombra y texto destacado.
  // Si NO está seleccionado -> transparente con hover suave.
  btnClass = computed(() => ({
    all: this.value() === undefined
      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/80 font-semibold'
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 border border-transparent font-medium',
    
    active: this.value() === true
      ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/80 font-semibold'
      : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60 border border-transparent font-medium',
    
    inactive: this.value() === false
      ? 'bg-white text-rose-700 shadow-sm border border-rose-200/80 font-semibold'
      : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50/60 border border-transparent font-medium',
  }));

  badgeClass = computed(() => ({
    all: this.value() === undefined
      ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
      : 'bg-slate-200/60 text-slate-500',
    
    active: this.value() === true
      ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
      : 'bg-slate-200/60 text-slate-500',
    
    inactive: this.value() === false
      ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
      : 'bg-slate-200/60 text-slate-500',
  }));
}