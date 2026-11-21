import { Component, input, output } from '@angular/core';

export type StatColorScheme = 'emerald' | 'amber' | 'rose' | 'slate';

@Component({
  selector: 'app-stat-card',
  template: `
    <div
      (click)="cardClick.emit()"
      class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
    >
      @if (isLoading()) {
        <div class="animate-pulse space-y-3">
          <div class="flex items-center justify-between">
            <div class="h-3 w-24 bg-slate-200 rounded-md"></div>
            <div class="w-8 h-8 bg-slate-200 rounded-xl"></div>
          </div>
          <div class="h-7 w-32 bg-slate-200 rounded-lg"></div>
          <div class="h-3 w-40 bg-slate-100 rounded-md"></div>
        </div>
      } @else {
        <div>
          <!-- Header de la tarjeta -->
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {{ title() }}
            </span>
            <div [class]="iconBgClasses()" class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105">
              <i [class]="icon() + ' text-sm'"></i>
            </div>
          </div>

          <!-- Valor principal -->
          <div class="mt-3">
            <p class="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              {{ value() }}
            </p>
          </div>
        </div>

        <!-- Subtítulo / Detalle -->
        <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span [innerHTML]="subtitle()"></span>
          <i class="pi pi-arrow-right text-[10px] text-slate-400 group-hover:translate-x-1 transition-transform"></i>
        </div>
      }
    </div>
  `
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('pi pi-chart-bar');
  readonly colorScheme = input<StatColorScheme>('slate');
  readonly isLoading = input<boolean>(false);

  readonly cardClick = output<void>();

  protected iconBgClasses(): string {
    switch (this.colorScheme()) {
      case 'emerald':
        return 'bg-success-bg text-success border-emerald-200/60';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'rose':
        return 'bg-danger-bg text-danger border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/60';
    }
  }
}