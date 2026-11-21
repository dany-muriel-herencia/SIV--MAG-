import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { SalePaymentType } from '../../../../models/sale.model';

export interface PaymentOption {
  value: SalePaymentType;
  label: string;
}

@Component({
  selector: 'app-sale-payment-summary',
  imports: [DecimalPipe],
  template: `
    <div class="space-y-4">
      <!-- Forma de pago -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 space-y-3 shadow-sm">
        <h2 class="text-sm font-semibold text-slate-700">Forma de pago</h2>

        <div class="grid grid-cols-2 gap-2">
          @for (pt of paymentOptions; track pt.value) {
            <button
              type="button"
              (click)="paymentTypeChange.emit(pt.value)"
              [disabled]="pt.value === SalePaymentType.Fiado && !hasCustomer()"
              [class]="
                paymentType() === pt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              "
              class="px-3 py-2.5 text-xs border rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {{ pt.label }}
            </button>
          }
        </div>

        @if (paymentType() === SalePaymentType.Fiado && !hasCustomer()) {
          <p class="text-xs text-amber-600 flex items-center gap-1">
            <i class="pi pi-exclamation-triangle text-xs"></i>
            <span>Seleccioná un cliente para habilitar venta al fiado.</span>
          </p>
        }
      </div>

      <!-- Resumen de totales -->
      <div class="bg-white rounded-xl border border-slate-100 p-4 space-y-3 shadow-sm">
        <div class="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>S/ {{ subtotal() | number: '1.2-2' }}</span>
        </div>

        <div class="flex justify-between text-sm text-slate-500">
          <span>IGV (18%)</span>
          <span>S/ {{ igv() | number: '1.2-2' }}</span>
        </div>

        <div class="flex justify-between text-lg font-bold text-slate-800 pt-3 border-t border-slate-100">
          <span>Total</span>
          <span class="text-blue-700">S/ {{ total() | number: '1.2-2' }}</span>
        </div>
      </div>

      <!-- Notificación de Error -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-600 text-sm flex items-center gap-2 animate-fade-in">
          <i class="pi pi-exclamation-circle text-sm shrink-0"></i>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- Botón confirmar -->
      <button
        type="button"
        (click)="submitSale.emit()"
        [disabled]="!isValid() || isSaving()"
        class="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow cursor-pointer"
      >
        @if (isSaving()) {
          <i class="pi pi-spin pi-spinner"></i>
          <span>Registrando venta...</span>
        } @else {
          <i class="pi pi-check"></i>
          <span>Confirmar venta · S/ {{ total() | number: '1.2-2' }}</span>
        }
      </button>
    </div>
  `,
})
export class SalePaymentSummary {
  readonly subtotal = input.required<number>();
  readonly igv = input.required<number>();
  readonly total = input.required<number>();
  readonly paymentType = input.required<SalePaymentType>();
  readonly hasCustomer = input.required<boolean>();
  readonly isValid = input.required<boolean>();
  readonly isSaving = input.required<boolean>();
  readonly errorMessage = input<string | null>(null);

  readonly paymentTypeChange = output<SalePaymentType>();
  readonly submitSale = output<void>();

  protected readonly SalePaymentType = SalePaymentType;

  readonly paymentOptions: PaymentOption[] = [
    { value: SalePaymentType.Efectivo, label: '💵 Efectivo' },
    { value: SalePaymentType.Tarjeta, label: '💳 Tarjeta' },
    { value: SalePaymentType.Transferencia, label: '🏦 Transferencia' },
    { value: SalePaymentType.Fiado, label: '📋 Fiado' },
  ];
}
