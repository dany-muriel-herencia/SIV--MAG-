import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { SaleStatus } from '../../models/sale.model';
import { SaleFilters } from './components/sale-filters/sale-filters';
import { SaleTable } from './components/sale-table/sale-table';
import { formatIsoDate } from '../../../../shared/utils/formatDate';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import {
  useSalesPagedQuery,
  SalesPagedFilters,
  useCurrentCashRegisterQuery,
  useCustomersQuery,
  useUsersQuery,
} from '../../queries/sales.queries';
import { extractErrorMessage } from '../../../../shared/utils/error';

@Component({
  selector: 'app-sale-list',
  imports: [FormsModule, SaleFilters, SaleTable, PageHeader],
  templateUrl: './sale-list.html',
})
export class SaleList {
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin();
  readonly customersQuery = useCustomersQuery({ page: 1, pageSize: 100, isActive: true });
  readonly usersQuery = useUsersQuery();
  private readonly currentCashRegisterQuery = useCurrentCashRegisterQuery();

  readonly customers = computed(() => this.customersQuery.data()?.items ?? []);
  readonly users = computed(() => this.usersQuery.data() ?? []);
  readonly isCashRegisterOpen = computed(() => this.currentCashRegisterQuery.data()?.isOpen);

  // Filtros como Signals
  fromDate = signal('');
  toDate = signal('');
  filterStatus = signal<SaleStatus | undefined>(undefined);
  filterCustomer = signal<string | undefined>(undefined);
  filterUser = signal<string | undefined>(undefined);

  currentPage = signal(1);
  readonly pageSize = 10;

  // Parámetros de búsqueda reactivos
  readonly queryParams = computed<SalesPagedFilters>(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    from: formatIsoDate(this.fromDate(), '00:00:00'),
    to: formatIsoDate(this.toDate(), '23:59:59'),
    customerId: this.filterCustomer() || undefined,
    userId: this.filterUser() || undefined,
    status: this.filterStatus() || undefined,
  }));

  // Query TanStack
  private readonly saleQuery = useSalesPagedQuery(this.queryParams);

  readonly sales = computed(() => this.saleQuery.data()?.items ?? []);
  readonly totalCount = computed(() => this.saleQuery.data()?.totalCount ?? 0);
  readonly totalPages = computed(() => this.saleQuery.data()?.totalPages ?? 0);
  readonly isLoading = computed(() => this.saleQuery.isLoading());
  readonly error = computed(() => extractErrorMessage(this.saleQuery.error(), ''));

  showNoShiftModal = signal<boolean>(false);

  onStatusFilter(value: SaleStatus | undefined): void {
    this.filterStatus.set(value);
    this.currentPage.set(1);
  }

  onCustomerFilter(value: string): void {
    this.filterCustomer.set(value);
    this.currentPage.set(1);
  }

  onUserFilter(value: string): void {
    this.filterUser.set(value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  openSale(id: string): void {
    this.router.navigate(['/sales', id]);
  }

  newSale(): void {
    if (this.isCashRegisterOpen()) {
      this.router.navigate(['/sales/new']);
    } else {
      this.showNoShiftModal.set(true);
    }
  }

  closeNoShiftModal(): void {
    this.showNoShiftModal.set(false);
  }

  goToCashRegister(): void {
    this.showNoShiftModal.set(false);
    this.router.navigate(['/cash-register']);
  }
}
