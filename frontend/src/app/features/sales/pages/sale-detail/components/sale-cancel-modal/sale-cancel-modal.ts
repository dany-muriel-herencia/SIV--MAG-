import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sale-cancel-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <i class="pi pi-exclamation-triangle text-lg"></i>
            </div>
            <div>
              <p class="font-semibold text-slate-800 text-base">Cancelar venta</p>
              <p class="text-xs text-slate-400">Esta acción no se puede revertir</p>
            </div>
          </div>

          <p class="text-sm text-slate-600 leading-relaxed">
            Se revertirá el stock de todos los productos y, si fue al fiado, se recalculará la deuda del cliente.
          </p>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              (click)="close.emit()"
              [disabled]="isCancelling()"
              class="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              No cancelar
            </button>
            <button
              type="button"
              (click)="confirm.emit()"
              [disabled]="isCancelling()"
              class="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              @if (isCancelling()) {
                <i class="pi pi-spin pi-spinner text-xs"></i>
                <span>Cancelando...</span>
              } @else {
                <span>Sí, cancelar</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SaleCancelModal {
  readonly isOpen = input.required<boolean>();
  readonly isCancelling = input.required<boolean>();

  readonly confirm = output<void>();
  readonly close = output<void>();
}
