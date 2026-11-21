import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { SupplierService } from '../../services/supplier.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { useSearchState } from '../../../../shared/utils/use-search-state';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { MetricCards } from '../../../../shared/components/metric-cards/metric-cards';
import { TableSkeleton } from '../../../../shared/components/table-skeleton/table-skeleton';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { SupplierFilters } from './components/supplier-filters/supplier-filters';
import { SupplierTable } from './components/supplier-table/supplier-table';
import { useSuppliersQuery, useToggleSupplierActiveMutation } from '../../queries/suppliers.queries';

@Component({
  selector: 'app-supplier-list',
  imports: [
    FormsModule,
    PageHeader,
    MetricCards,
    SupplierFilters,
    SupplierTable,
    TableSkeleton,
    Pagination,
  ],
  templateUrl: './supplier-list.html',
})
export class SupplierList {
  private readonly supplierService = inject(SupplierService);
  private readonly queryClient = inject(QueryClient);
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin();

  filterActive = signal<boolean | undefined>(undefined);
  currentPage = signal(1);
  readonly pageSize = 10;

  readonly searchState = useSearchState({
    currentPage: this.currentPage,
    debounceMs: 350,
  });
  readonly search = this.searchState.search;
  readonly debouncedSearch = this.searchState.debouncedSearch;

  private readonly queryParams = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    search: this.debouncedSearch().trim() || undefined,
    isActive: this.filterActive(),
  }));

  // Queries
  readonly suppliersQuery = useSuppliersQuery(this.queryParams)
  readonly toggleActiveMutation = useToggleSupplierActiveMutation()

  // 4. Exposición para la Plantilla HTML
  suppliers = computed(() => this.suppliersQuery.data()?.items ?? []);
  totalCount = computed(() => this.suppliersQuery.data()?.totalCount ?? 0);
  totalPages = computed(() => this.suppliersQuery.data()?.totalPages ?? 0);
  activesCount = computed(() => this.suppliersQuery.data()?.activesCount ?? 0);
  inactivesCount = computed(() => this.suppliersQuery.data()?.inactivesCount ?? 0);

  // Estados de carga y error
  isLoading = computed(() => this.suppliersQuery.isLoading());
  isRefetching = computed(
    () => this.suppliersQuery.isFetching() && !this.suppliersQuery.isLoading(),
  );
  error = computed(() => {
    const suppliersErr = this.suppliersQuery.error() as any;
    const mutErr = this.toggleActiveMutation.error() as any;
    const err = mutErr || suppliersErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar los proveedores.';
  });

  onSearch(search: string) {
    this.search.set(search);
    this.currentPage.set(1);
  }

  onActiveFilter(filter: boolean | undefined) {
    this.filterActive.set(filter);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  toggleActive(id: string): void {
    this.toggleActiveMutation.mutate(id);
  }

  openSupplier(id: string) {
    this.router.navigate(['/suppliers', id]);
  }

  editSupplier(id: string) {
    this.router.navigate(['/suppliers', id]);
  }

  newSupplier(): void {
    this.router.navigate(['/suppliers/new']);
  }
}
