import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

import { MovementsFilters } from './components/movements-filters/movements-filters';
import { MovementsTable } from './components/movements-table/movements-table';
import { AuthService } from '../../../../core/auth/auth.service';
import { Product } from '../../../products/models/product.model';
import { MovementType } from '../../models/stock.model';
import { useProductSearchQuery } from '../../../../shared/queries/product.queries';
import { formatIsoDate } from '../../../../shared/utils/formatDate';
import { useMovementsQuery } from '../../queries/stock.queries';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [MovementsFilters, MovementsTable],
  templateUrl: './movements-list.html',
})
export class MovementsList {
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin();

  readonly filterType = signal<MovementType | undefined>(undefined);
  readonly fromDate = signal('');
  readonly toDate = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 15;

  readonly selectedProduct = signal<Product | null>(null);
  readonly productQuery = signal('');
  private readonly productSearch = useProductSearchQuery(this.productQuery);
  readonly productResults = computed(() => this.productSearch.data() ?? []);
  readonly isSearchingProduct = computed(() => this.productSearch.isFetching());

  readonly queryParams = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    type: this.filterType(),
    productId: this.selectedProduct()?.id ?? undefined,
    from: formatIsoDate(this.fromDate(), '00:00:00'),
    to: formatIsoDate(this.toDate(), '23:59:59'),
  }));

  private readonly movementsQuery = useMovementsQuery(this.queryParams);

  readonly movements = computed(() => this.movementsQuery.data()?.items ?? []);
  readonly totalCount = computed(() => this.movementsQuery.data()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.movementsQuery.data()?.totalPages ?? 0);
  readonly isLoading = computed(() => this.movementsQuery.isLoading());

  readonly error = computed(() => {
    const err = this.movementsQuery.error();
    if (!err) return null;
    return (
      (err as any)?.error?.message ||
      (err as any)?.message ||
      'No se pudieron cargar los movimientos de stock.'
    );
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.selectedProduct() !== null ||
      this.filterType() !== undefined ||
      this.fromDate().trim() !== '' ||
      this.toDate().trim() !== ''
    );
  });

  onProductChange(product: Product | null): void {
    this.selectedProduct.set(product);
    this.currentPage.set(1);
  }

  onProductQueryChange(query: string): void {
    this.productQuery.set(query);
  }

  onFilterTypeChange(filterType: MovementType | undefined): void {
    this.filterType.set(filterType);
    this.currentPage.set(1);
  }

  onFilterFromDateChange(filterFromDate: string): void {
    this.fromDate.set(filterFromDate);
    this.currentPage.set(1);
  }

  onFilterToDateChange(filterToDate: string): void {
    this.toDate.set(filterToDate);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.selectedProduct.set(null);
    this.productQuery.set('');
    this.filterType.set(undefined);
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  openAdjustModal(): void {
    this.router.navigate(['/stock/adjust']);
  }
}