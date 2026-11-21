import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchInput } from '../../../../../../shared/components/search-input/search-input';
import { SelectorComponent } from '../../../../../../shared/components/selector/selector';
import { SegmentedControlComponent } from '../../../../../../shared/components/segmented-control/segmented-control';
import { statusOptions } from '../../../../../../shared/models/segmented-control.model';
import { Category } from '../../../../../categories/models/category.model';
import { Supplier } from '../../../../../suppliers/models/supplier.model';

@Component({
  selector: 'app-product-filters',
  imports: [FormsModule, SearchInput, SelectorComponent, SegmentedControlComponent],
  templateUrl: './product-filters.html',
})
export class ProductFilters {
  readonly hasActiveFilters = input<boolean>(false);
  readonly search = input<string>('');
  readonly selectedCategory = input<string>('');
  readonly selectedSupplier = input<string>('');
  readonly filterActive = input<boolean | undefined>(undefined);
  readonly filterLowStock = input<boolean>(false);
  readonly totalCount = input<number>(0);
  readonly activeCount = input<number>(0);
  readonly inactiveCount = input<number>(0);

  readonly categories = input<Category[]>([]);
  readonly suppliers = input<Supplier[]>([]);

  // Outputs con Signal Outputs
  readonly searchChange = output<string>();
  readonly categoryChange = output<string>();
  readonly supplierChange = output<string>();
  readonly activeFilterChange = output<boolean | undefined>();
  readonly lowStockChange = output<boolean>();
  readonly reset = output<void>();

  readonly statusOptions = statusOptions;

  readonly currentCategory = computed(() => {
    const id = this.selectedCategory();
    return id ? (this.categories().find((c) => c.id === id) ?? null) : null;
  });

  readonly currentSupplier = computed(() => {
    const id = this.selectedSupplier();
    return id ? (this.suppliers().find((s) => s.id === id) ?? null) : null;
  });

  protected onCategoryChange(category: Category | null): void {
    this.categoryChange.emit(category ? category.id : '');
  }

  protected onSupplierChange(supplier: Supplier | null): void {
    this.supplierChange.emit(supplier ? supplier.id : '');
  }
}
