import { Component, input, output } from "@angular/core";

@Component({
  selector: 'app-confirm-cancel-modal',
  template: `
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-red-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800">Cancelar compra</h3>
            <p class="text-xs text-slate-500">Esta acción es irreversible</p>
          </div>
        </div>
        <p class="text-sm text-slate-600 mb-6">
          Se cancelará la orden de compra. No se registrará ningún ingreso de stock en el inventario.
        </p>
        <div class="flex gap-3">
          <button (click)="cancel.emit()" class="flex-1 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cerrar
          </button>
          <button (click)="confirm.emit()" [disabled]="isCancelling()" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
            @if(isCancelling()) { <i class="pi pi-spin pi-spinner mr-2 text-xs"></i> }
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmCancelModal {
  isCancelling = input.required<boolean>();
  confirm = output<void>();
  cancel = output<void>();
}