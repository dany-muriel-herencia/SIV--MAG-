import { Component, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  ReceivePurchaseItem, 
  PurchaseDetailResponse, 
  ReceivePurchaseRequest 
} from '../../../../models/purchase.model';

@Component({
  selector: 'app-receive-purchase-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center gap-3 mb-4 shrink-0">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <i class="pi pi-check-circle text-emerald-600"></i>
          </div>
          <div>
            <h3 class="font-semibold text-slate-800">Confirmar recepción de mercancía</h3>
            <p class="text-xs text-slate-500">Ajusta las cantidades recibidas y costos reales</p>
          </div>
        </div>

        <!-- Input N° Factura (Opcional) -->
        <div class="mb-4 shrink-0">
          <label class="block text-xs font-medium text-slate-600 mb-1">
            Número de Factura / Guía (Opcional)
          </label>
          <input
            type="text"
            [ngModel]="invoiceNumber()"
            (ngModelChange)="invoiceNumber.set($event)"
            placeholder="Ej: F001-0001234"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          />
        </div>

        <!-- Lista de Productos a verificar -->
        <div class="space-y-3 mb-4 overflow-y-auto pr-2 flex-1">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Productos</p>
          
          @for (detail of details(); track detail.id) {
            <div class="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
              <div>
                <p class="text-sm font-medium text-slate-700 truncate">{{ detail.productName }}</p>
                <p class="text-xs text-slate-400">
                  Ordenado originalmente: {{ detail.orderedQuantity }} unid. a S/ {{ detail.expectedUnitCost | number: '1.2-2' }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-1">
                <!-- Cantidad recibida -->
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Cant. Recibida</label>
                  <input
                    type="number"
                    [ngModel]="quantities()[detail.id]"
                    (ngModelChange)="updateQty(detail.id, $event)"
                    [min]="0"
                    class="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <!-- Costo unitario real -->
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 mb-1">Costo Unit. Real</label>
                  <div class="relative">
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      [ngModel]="actualCosts()[detail.id]"
                      (ngModelChange)="updateCost(detail.id, $event)"
                      [min]="0"
                      class="w-full pl-6 pr-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Resumen de Recepción -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 shrink-0 text-xs space-y-1">
          <div class="flex justify-between text-slate-500">
            <span>Total Orden Original:</span>
            <span class="font-medium">S/ {{ originalTotal() | number: '1.2-2' }}</span>
          </div>
          <div class="flex justify-between text-slate-800 font-semibold text-sm pt-1 border-t border-slate-200/60">
            <span>Total a Recepcionar:</span>
            <span [class.text-emerald-700]="!hasDifference()" [class.text-blue-700]="hasDifference()">
              S/ {{ totalReception() | number: '1.2-2' }}
            </span>
          </div>
          @if (hasDifference()) {
            <p class="text-[11px] text-blue-600 font-medium pt-0.5">
              <i class="pi pi-info-circle mr-1"></i> Se registrará como recepción con diferencia.
            </p>
          }
        </div>

        <!-- Acciones -->
        <div class="flex gap-3 mt-auto shrink-0">
          <button 
            type="button"
            (click)="cancel.emit()" 
            class="flex-1 px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button"
            (click)="onConfirm()" 
            [disabled]="isReceiving() || !isValid()"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            @if(isReceiving()) { 
              <i class="pi pi-spin pi-spinner text-xs"></i> 
            }
            Confirmar Recepción
          </button>
        </div>

      </div>
    </div>
  `
})
export class ReceivePurchaseModal {
  details = input.required<PurchaseDetailResponse[]>();
  initialInvoiceNumber = input<string | undefined>();
  isReceiving = input.required<boolean>();
  
  confirm = output<ReceivePurchaseRequest>();
  cancel = output<void>();

  invoiceNumber = signal<string>('');
  quantities = signal<Record<string, number>>({});
  actualCosts = signal<Record<string, number>>({});

  readonly originalTotal = computed(() =>
    this.details().reduce((acc, d) => acc + (d.orderedQuantity * d.expectedUnitCost), 0)
  );

  readonly totalReception = computed(() => {
    const qtys = this.quantities();
    const costs = this.actualCosts();
    return this.details().reduce((acc, d) => {
      const q = qtys[d.id] ?? d.orderedQuantity;
      const c = costs[d.id] ?? d.expectedUnitCost;
      return acc + (q * c);
    }, 0);
  });

  readonly hasDifference = computed(() => {
    const qtys = this.quantities();
    const costs = this.actualCosts();
    return this.details().some(d => {
      const q = qtys[d.id] ?? d.orderedQuantity;
      const c = costs[d.id] ?? d.expectedUnitCost;
      return q !== d.orderedQuantity || c !== d.expectedUnitCost;
    });
  });

  constructor() {
    effect(() => {
      const initialQty: Record<string, number> = {};
      const initialCost: Record<string, number> = {};

      for (const d of this.details()) {
        initialQty[d.id] = d.orderedQuantity;
        initialCost[d.id] = d.expectedUnitCost;
      }

      this.quantities.set(initialQty);
      this.actualCosts.set(initialCost);
    });

    effect(() => {
      const initInvoice = this.initialInvoiceNumber();
      if (initInvoice) {
        this.invoiceNumber.set(initInvoice);
      }
    });
  }

  updateQty(detailId: string, value: any): void {
    const val = Math.max(0, Number(value) || 0);
    this.quantities.update((qtys) => ({ ...qtys, [detailId]: val }));
  }

  updateCost(detailId: string, value: any): void {
    const val = Math.max(0, Number(value) || 0);
    this.actualCosts.update((costs) => ({ ...costs, [detailId]: val }));
  }

  isValid(): boolean {
    const qtys = this.quantities();
    // Valid if at least one item has quantity > 0
    return this.details().some((d) => (qtys[d.id] ?? 0) > 0);
  }

  onConfirm(): void {
    if (!this.isValid()) return;

    const qtys = this.quantities();
    const costs = this.actualCosts();

    const items: ReceivePurchaseItem[] = this.details().map((d) => ({
      productId: d.productId,
      receivedQuantity: qtys[d.id] ?? 0,
      actualUnitCost: costs[d.id] ?? d.expectedUnitCost,
    }));

    const request: ReceivePurchaseRequest = {
      invoiceNumber: this.invoiceNumber().trim() || undefined,
      items,
    };

    this.confirm.emit(request);
  }
}