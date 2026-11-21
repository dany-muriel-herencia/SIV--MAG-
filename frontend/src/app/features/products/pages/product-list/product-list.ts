import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { CategoryService } from '../../../categories/services/category.service';
import { SupplierService } from '../../../suppliers/services/supplier.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import {
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ProductFilters } from './components/product-filters/product-filters';
import { ProductTable } from './components/product-table/product-table';
import { TableSkeleton } from '../../../../shared/components/table-skeleton/table-skeleton';
import { AuthService } from '../../../../core/auth/auth.service';
import { useSearchState } from '../../../../shared/utils/use-search-state';
import {
  useCategoriesQuery,
  useProductsQuery,
  useSuppliersQuery,
  useToggleProductActiveMutation,
} from '../../queries/products.queries';

@Component({
  selector: 'app-product-list',
  imports: [FormsModule, Pagination, PageHeader, ProductFilters, ProductTable, TableSkeleton],
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly supplierService = inject(SupplierService);
  private readonly productsService = inject(ProductService);
  private readonly queryClient = inject(QueryClient);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  selectedCategory = signal('');
  selectedSupplier = signal('');
  filterActive = signal<boolean | undefined>(undefined);
  filterLowStock = signal(false);
  currentPage = signal(1);
  readonly pageSize = 10;

  readonly searchState = useSearchState({
    currentPage: this.currentPage,
    debounceMs: 350,
  });
  readonly search = this.searchState.search;
  readonly debouncedSearch = this.searchState.debouncedSearch;

  constructor() {
    effect(() => {
      this.selectedCategory();
      this.selectedSupplier();
      this.filterActive();
      this.filterLowStock();

      untracked(() => this.currentPage.set(1));
    });
  }

  private readonly queryParams = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    search: this.debouncedSearch().trim() || undefined,
    categoryId: this.selectedCategory() || undefined,
    supplierId: this.selectedSupplier() || undefined,
    isActive: this.filterActive(),
    lowStock: this.filterLowStock() || undefined,
  }));

  readonly productsQuery = useProductsQuery(this.queryParams);
  readonly categoriesQuery = useCategoriesQuery({ pageSize: 100, isActive: true });
  readonly suppliersQuery = useSuppliersQuery({ page: 1, pageSize: 100, isActive: true });

  readonly toggleActiveMutation = useToggleProductActiveMutation();

  categories = computed(() => this.categoriesQuery.data()?.items ?? []);
  suppliers = computed(() => this.suppliersQuery.data()?.items ?? []);

  products = computed(() => this.productsQuery.data()?.items ?? []);
  totalCount = computed(() => this.productsQuery.data()?.totalCount ?? 0);
  totalPages = computed(() => this.productsQuery.data()?.totalPages ?? 0);
  activesCount = computed(() => this.productsQuery.data()?.activesCount ?? 0);
  inactivesCount = computed(() => this.productsQuery.data()?.inactivesCount ?? 0);

  isLoading = computed(() => this.productsQuery.isLoading());
  isSearching = computed(() => this.productsQuery.isFetching() && !this.productsQuery.isLoading());

  errorMessage = computed(() => {
    const prodErr = this.productsQuery.error() as any;
    const mutErr = this.toggleActiveMutation.error() as any;
    const err = mutErr || prodErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar los productos.';
  });

  // 💡 Detecta si el usuario modificó algún filtro
  readonly hasActiveFilters = computed(() => {
    return (
      this.search().trim() !== '' ||
      this.selectedCategory() !== '' ||
      this.selectedSupplier() !== '' ||
      this.filterActive() !== undefined ||
      this.filterLowStock()
    );
  });

  // 🧹 Restablece todo el estado a su valor por defecto
  resetFilters(): void {
    this.searchState.onSearch(''); // Limpia el buscador y resetea a página 1
    this.selectedCategory.set('');
    this.selectedSupplier.set('');
    this.filterActive.set(undefined);
    this.filterLowStock.set(false);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onToggleActive(productId: string): void {
    this.toggleActiveMutation.mutate(productId);
  }

  openProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }

  newProduct(): void {
    this.router.navigate(['/products/new']);
  }
}
