import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Product } from '../../../../models/product.model';


@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './product-table.html'
})
export class ProductTable {
  readonly products = input.required<Product[]>();
  
  readonly rowClick = output<string>();
  readonly toggleActive = output<string>();

  onToggleActive(product: Product, event: Event): void {
    event.stopPropagation();
    this.toggleActive.emit(product.id);
  }

  onRowClick(id: string): void {
    this.rowClick.emit(id);
  }

  // Visual Helpers aislados
  getStockClass(product: Product): string {
    if (product.isOutOfStock) return 'text-red-600 font-semibold';
    if (product.isLowStock) return 'text-amber-600 font-semibold';
    return 'text-slate-700';
  }

  getStockBadge(product: Product): string {
    if (product.isOutOfStock) return 'Agotado';
    if (product.isLowStock) return 'Stock bajo';
    return '';
  }
}