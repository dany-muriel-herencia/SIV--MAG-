import { Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../../../products/models/product.model';
import { useProductSearchQuery } from '../../../../../../shared/queries/product.queries';

@Component({
  selector: 'app-sale-product-search',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 p-4 relative z-30 shadow-sm">
      <div class="relative">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input
          type="text"
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearchChange($event)"
          (keydown.enter)="onEnterKey()"
          placeholder="Buscar por nombre o SKU (Presiona Enter para agregar)..."
          class="w-full pl-9 pr-8 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        @if (isSearching()) {
          <i class="pi pi-spin pi-spinner absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        }
      </div>

      <!-- Resultados flotantes -->
      @if (searchResults().length > 0) {
        <div
          class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-50 z-30 max-h-64 overflow-y-auto animate-fade-in"
        >
          @for (product of searchResults(); track product.id) {
            <button
              type="button"
              (click)="selectProduct(product)"
              [disabled]="product.isOutOfStock"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 truncate">
                  {{ product.name }}
                </p>
                <p class="text-xs text-slate-400">
                  SKU: {{ product.sku }}
                  @if (product.isOutOfStock) {
                    · <span class="text-red-500 font-medium">Agotado</span>
                  } @else if (product.isLowStock) {
                    · <span class="text-amber-500 font-medium">{{ product.stock }} disponibles</span>
                  } @else {
                    · {{ product.stock }} disponibles
                  }
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold text-slate-700">
                  S/ {{ product.salePrice | number: '1.2-2' }}
                </p>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class SaleProductSearch {
  readonly searchTerm = signal('');
  readonly productSelected = output<Product>();

  private readonly productsQuery = useProductSearchQuery(this.searchTerm);

  readonly searchResults = computed<Product[]>(() => {
    if (this.searchTerm().trim().length < 2) return [];
    return (this.productsQuery.data() as Product[]) ?? [];
  });

  readonly isSearching = computed(
    () => this.searchTerm().trim().length >= 2 && this.productsQuery.isFetching()
  );

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onEnterKey(): void {
    const results = this.searchResults();
    const available = results.find((p: Product) => !p.isOutOfStock);
    if (available) {
      this.selectProduct(available);
    }
  }

  selectProduct(product: Product): void {
    this.productSelected.emit(product);
    this.searchTerm.set('');
  }
}
