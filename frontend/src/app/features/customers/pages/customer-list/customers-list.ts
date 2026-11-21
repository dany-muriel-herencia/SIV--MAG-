import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { MetricCards } from '../../../../shared/components/metric-cards/metric-cards';
import { TableSkeleton } from '../../../../shared/components/table-skeleton/table-skeleton';
import { useSearchState } from '../../../../shared/utils/use-search-state';
import { CustomerTable } from "./components/customer-table/customer-table";
import { PageHeader } from "../../../../shared/components/page-header/page-header";
import { CustomerFilters } from "./components/customer-filters/customer-filter";
import { useCustomersQuery, useToggleCustomersActiveMutation } from '../../queries/customers.queries';

@Component({
  selector: 'app-customers-list',
  imports: [FormsModule, Pagination, MetricCards, TableSkeleton, CustomerTable, PageHeader, CustomerFilters],
  templateUrl: './customers-list.html',
})
export class CustomersList {
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin();

  filterActive = signal<boolean | undefined>(undefined);
  hasDebt = signal<boolean | undefined>(undefined);
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
    hasDebt: this.hasDebt(),
  }));

  // Queries
  readonly customersQuery = useCustomersQuery(this.queryParams)
  readonly toggleActiveMutation = useToggleCustomersActiveMutation()

  customers = computed(() => this.customersQuery.data()?.items ?? []);
  totalCount = computed(() => this.customersQuery.data()?.totalCount ?? 0);
  totalPages = computed(() => this.customersQuery.data()?.totalPages ?? 0);
  debtCount = computed(() => this.customers().filter((c) => c.currentDebt > 0).length ?? 0);
  activesCount = computed(() => this.customersQuery.data()?.activesCount ?? 0);
  inactivesCount = computed(() => this.customersQuery.data()?.inactivesCount ?? 0);

  // Estados de carga automáticos sin parpadeos
  isLoading = computed(() => this.customersQuery.isLoading());
  isRefetching = computed(
    () => this.customersQuery.isFetching() && !this.customersQuery.isLoading(),
  );
  error = computed(() => {
    const customersErr = this.customersQuery.error() as any;
    const mutErr = this.toggleActiveMutation.error() as any;
    const err = mutErr || customersErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar los clientes.';
  });

  onSearch(search: string) {
    this.search.set(search);
    this.currentPage.set(1);
  }

  onActiveFilter(filter: boolean | undefined) {
    this.filterActive.set(filter);
    this.currentPage.set(1);
  }
  onDebtFilter(hasDebt: boolean | undefined) {
    this.hasDebt.set(hasDebt);
    this.currentPage.set(1);
  }
  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  toggleActive(id: string): void {
    this.toggleActiveMutation.mutate(id);
  }
  
  openCustomer(id: string) {
    this.router.navigate(['/customers', id]);
  }

  editCustomer(id: string) {
    this.router.navigate(['/customers', id, 'edit']);
  }

  newCustomer(): void {
    this.router.navigate(['/customers/new']);
  }
}
