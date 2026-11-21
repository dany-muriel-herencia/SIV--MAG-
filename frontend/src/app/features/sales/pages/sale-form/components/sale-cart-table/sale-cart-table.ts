import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CartItem } from '../../../../models/sale.model';

@Component({
  selector: 'app-sale-cart-table',
  imports: [DecimalPipe],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-700">
          Carrito ({{ items().length }} {{ items().length === 1 ? 'ítem' : 'ítems' }})
        </h2>
        @if (items().length > 0) {
          <button
            type="button"
            (click)="clearCart.emit()"
            class="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium cursor-pointer"
          >
            Limpiar carrito
          </button>
        }
      </div>

      @if (items().length === 0) {
        <div class="flex flex-col items-center justify-center py-12 text-slate-300">
          <i class="pi pi-shopping-cart text-3xl mb-2"></i>
          <p class="text-sm">Escaneá o buscá productos para agregar</p>
        </div>
      } @else {
        <div class="divide-y divide-slate-50">
          @for (item of items(); track item.product.id; let i = $index) {
            <div class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <!-- Info producto -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 truncate">
                  {{ item.product.name }}
                </p>
                <p class="text-xs text-slate-400">
                  S/ {{ item.unitPrice | number: '1.2-2' }} c/u ·
                  <span class="text-slate-500">Stock: {{ item.product.stock }}</span>
                </p>
              </div>

              <!-- Cantidad -->
              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  (click)="updateQuantity.emit({ index: i, quantity: item.quantity - 1 })"
                  aria-label="Disminuir cantidad"
                  class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <i class="pi pi-minus text-xs"></i>
                </button>

                <span class="w-8 text-center text-sm font-medium text-slate-700 select-none">
                  {{ item.quantity }}
                </span>

                <button
                  type="button"
                  (click)="updateQuantity.emit({ index: i, quantity: item.quantity + 1 })"
                  [disabled]="item.quantity >= item.product.stock"
                  aria-label="Aumentar cantidad"
                  class="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <i class="pi pi-plus text-xs"></i>
                </button>
              </div>

              <!-- Subtotal -->
              <div class="w-24 text-right shrink-0">
                <p class="text-sm font-semibold text-slate-700">
                  S/ {{ item.subtotal | number: '1.2-2' }}
                </p>
              </div>

              <!-- Eliminar -->
              <button
                type="button"
                (click)="removeItem.emit(i)"
                aria-label="Eliminar producto"
                class="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
              >
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SaleCartTable {
  readonly items = input.required<CartItem[]>();

  readonly updateQuantity = output<{ index: number; quantity: number }>();
  readonly removeItem = output<number>();
  readonly clearCart = output<void>();
}
