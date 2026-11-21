import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { Purchase, PurchaseStatus, PURCHASE_PAYMENT_LABELS, PURCHASE_STATUS_BADGE } from "../../../../models/purchase.model";
import { BadgeComponent } from "../../../../../../shared/components/badge/badge";

@Component({
  selector: 'app-purchase-detail-table',
  imports: [CommonModule, DecimalPipe, DatePipe, BadgeComponent],
  template: `
    @if (isLoading()) {
      <div class="bg-white rounded-xl border border-slate-100 p-8 flex items-center justify-center">
        <i class="pi pi-spin pi-spinner text-blue-600 text-2xl"></i>
      </div>
    }

    @if (purchase(); as p) {
      <!-- Info general -->
      <div class="bg-white rounded-xl border border-slate-100 p-5 shadow-2xs">
        <div class="flex items-start justify-between mb-4">
          <div>
            <p class="text-xs text-slate-400 font-medium">Comprobante / N° Factura</p>
            <p class="text-lg font-mono font-bold text-slate-800">{{ p.invoiceNumber || 'SIN-COMPROBANTE' }}</p>
          </div>
          @let config = getBadgeConfig(p.status);
          <app-badge
            [label]="config.label"
            [class]="config.class"
          />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-2 border-t border-slate-100">
          <div>
            <p class="text-slate-400 text-xs">Fecha</p>
            <p class="text-slate-700 mt-0.5 font-medium">{{ p.date | date: 'dd/MM/yyyy HH:mm' }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs">Proveedor</p>
            <p class="text-slate-700 mt-0.5 font-medium truncate" [title]="p.supplierName">{{ p.supplierName }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs">Método de Pago</p>
            <p class="text-slate-700 mt-0.5 font-medium">{{ getPaymentLabel(p.paymentType) }}</p>
          </div>
          <div>
            <p class="text-slate-400 text-xs">Registrado por</p>
            <p class="text-slate-700 mt-0.5 font-medium truncate" [title]="p.userFullName">{{ p.userFullName }}</p>
          </div>
        </div>
      </div>

      <!-- Detalle de productos -->
      <div class="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-2xs">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Productos de la Orden</h2>
          <span class="text-xs text-slate-400">{{ p.details.length }} ítem(s)</span>
        </div>

        <div class="divide-y divide-slate-50">
          @for (detail of p.details; track detail.id) {
            <div class="flex items-center gap-4 px-5 py-4">
              <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <i class="pi pi-box text-slate-400 text-sm"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 truncate" [title]="detail.productName">
                  {{ detail.productName }}
                </p>
                <p class="text-xs font-mono text-slate-400">{{ detail.productSKU }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm text-slate-600">
                  {{ detail.orderedQuantity }} unid. x S/ {{ detail.expectedUnitCost | number: '1.2-2' }}
                </p>
                @if (detail.receivedQuantity !== undefined && detail.receivedQuantity !== null) {
                  <p class="text-xs text-emerald-600 font-medium">
                    Recibido: {{ detail.receivedQuantity }} unid.
                    @if (detail.actualUnitCost !== undefined && detail.actualUnitCost !== detail.expectedUnitCost) {
                      (a S/ {{ detail.actualUnitCost | number: '1.2-2' }})
                    }
                  </p>
                }
                <p class="text-sm font-bold text-slate-800 mt-0.5">
                  S/ {{ detail.subtotal | number: '1.2-2' }}
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Total Breakdown -->
        <div class="border-t border-slate-100 p-5 bg-slate-50/50 space-y-1.5">
          @if (p.subtotal !== undefined && p.igv !== undefined && p.igv > 0) {
            <div class="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>S/ {{ p.subtotal | number: '1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-500">
              <span>IGV (18%)</span>
              <span>S/ {{ p.igv | number: '1.2-2' }}</span>
            </div>
          }
          <div class="flex justify-between text-base font-bold text-slate-800 pt-1 border-t border-slate-200/60">
            <span>Total</span>
            <span class="text-slate-900">S/ {{ p.total | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class PurchaseDetailTableComponent { 
  readonly purchase = input<Purchase | null>(null);
  readonly isLoading = input<boolean>(false);
  
  getBadgeConfig(status: PurchaseStatus) {
    return PURCHASE_STATUS_BADGE[status] ?? { label: 'Desconocido', class: 'bg-slate-100 text-slate-600' };
  }

  getPaymentLabel(type: any): string {
    return PURCHASE_PAYMENT_LABELS[type] ?? 'Contado';
  }
}