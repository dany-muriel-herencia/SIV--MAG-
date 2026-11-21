import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseCartItem } from '../../../../models/purchase.model';

@Component({
  selector: 'app-purchase-cart-table',
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div>
      @if (items().length === 0) {
        <div
          class="flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-xl"
        >
          <i class="pi pi-shopping-bag text-3xl mb-2 text-slate-300"></i>
          <p class="text-sm font-medium text-slate-400">Busca y agrega productos a la orden</p>
          <p class="text-xs text-slate-300 mt-1">
            Usa el buscador o presiona "+ Nuevo" si no existe
          </p>
        </div>
      } @else {
        <div class="divide-y divide-slate-100">
          <!-- Table Header -->
          <div
            class="grid grid-cols-12 gap-2 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide"
          >
            <div class="col-span-4">Producto</div>
            <div class="col-span-2 text-center">Cantidad</div>
            <div class="col-span-3 text-center">Costo Unit.</div>
            <div class="col-span-2 text-right">Subtotal</div>
            <div class="col-span-1"></div>
          </div>

          <!-- Items -->
          @for (item of items(); track item.product.id) {
            <div class="grid grid-cols-12 gap-2 items-center py-3">
              <div class="col-span-4 min-w-0 pr-2">
                <p class="text-sm font-medium text-slate-700 truncate" [title]="item.product.name">
                  {{ item.product.name }}
                </p>
                <p class="text-xs font-mono text-slate-400">{{ item.product.sku }}</p>
              </div>

              <!-- Cantidad -->
              <div class="col-span-2 flex justify-center">
                <input
                  type="number"
                  [ngModel]="item.quantity"
                  (ngModelChange)="onQuantityChange(item, $event)"
                  min="1"
                  class="w-16 px-2 py-1 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <!-- Costo Unitario -->
              <div class="col-span-3 flex justify-center">
                <div class="relative">
                  <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                    >S/</span
                  >
                  <input
                    type="number"
                    [ngModel]="item.unitCost"
                    (ngModelChange)="onUnitCostChange(item, $event)"
                    min="0"
                    step="0.01"
                    class="w-24 pl-7 pr-2 py-1 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <!-- Subtotal -->
              <div class="col-span-2 text-right text-sm font-semibold text-slate-700">
                S/ {{ item.subtotal | number: '1.2-2' }}
              </div>

              <!-- Eliminar -->
              <div class="col-span-1 flex justify-center">
                <button
                  type="button"
                  (click)="itemRemove.emit(item.product.id)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Eliminar producto"
                >
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Total General -->
        <div class="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
          <span class="text-sm font-semibold text-slate-600">Total de la Orden</span>
          <span class="text-lg font-bold text-slate-800">S/ {{ total() | number: '1.2-2' }}</span>
        </div>
      }
    </div>
  `,
})
export class PurchaseCartTableComponent {
  readonly items = input.required<PurchaseCartItem[]>();
  readonly total = input.required<number>();

  readonly quantityChange = output<{ productId: string; quantity: number }>();
  readonly unitCostChange = output<{ productId: string; unitCost: number }>();
  readonly itemRemove = output<string>();

  protected onQuantityChange(item: PurchaseCartItem, value: unknown): void {
    const quantity = Math.max(1, Number(value) || 1);
    this.quantityChange.emit({ productId: item.product.id, quantity });
  }

  protected onUnitCostChange(item: PurchaseCartItem, value: unknown): void {
    const unitCost = Math.max(0, Number(value) || 0);
    this.unitCostChange.emit({ productId: item.product.id, unitCost });
  }
}
