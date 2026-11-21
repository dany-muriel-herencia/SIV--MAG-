import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseStatus } from '../../models/purchase.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PurchaseFilter } from './components/purchase-filters/purchase-filters';
import { PurchaseTableComponent } from './components/purchase-table/purchase-table';
import { formatIsoDate } from '../../../../shared/utils/formatDate';
import { usePurchasesQuery } from '../../queries/purchase.queries';
import { useSuppliersQuery } from '../../../products/queries/products.queries';

@Component({
  selector: 'app-purchase-list',
  imports: [FormsModule, PageHeader, PurchaseFilter, PurchaseTableComponent],
  templateUrl: './purchase-list.html',
})
export class PurchaseList {
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin;

  fromDate = signal<string>('');
  toDate = signal<string>('');
  filterSupplier = signal<string | undefined>(undefined);
  filterStatus = signal<PurchaseStatus | undefined>(undefined);
  currentPage = signal(1);
  readonly pageSize = 10;

  private readonly queryParams = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    supplierId: this.filterSupplier(),
    status: this.filterStatus(),
    from: formatIsoDate(this.fromDate(), '00:00:00'),
    to: formatIsoDate(this.toDate(), '23:59:59'),
  }));

  private readonly purchasesQuery = usePurchasesQuery(this.queryParams);
  private readonly allSuppliersQuery = useSuppliersQuery({ page: 1, pageSize: 100, isActive: true });

  suppliers = computed(() => this.allSuppliersQuery.data?.()?.items ?? []);
  purchases = computed(() => this.purchasesQuery.data?.()?.items ?? []);
  totalCount = computed(() => this.purchasesQuery.data?.()?.totalCount ?? 0);
  totalPages = computed(() => this.purchasesQuery.data?.()?.totalPages ?? 0);
  isLoading = computed(() => this.purchasesQuery.isLoading());
  isSearching = computed(() => this.purchasesQuery.isFetching() && !this.purchasesQuery.isLoading());

  error = computed(() => {
    const err = this.purchasesQuery.error();
    if (!err) return null;
    return (
      (err as any)?.error?.message || (err as any)?.message || 'No se pudieron cargar las compras.'
    );
  });

  onFromDateChange(date: string): void {
    this.fromDate.set(date);
    this.currentPage.set(1);
  }

  onToDateChange(date: string): void {
    this.toDate.set(date);
    this.currentPage.set(1);
  }

  onStatusChange(status: PurchaseStatus | undefined): void {
    this.filterStatus.set(status);
    this.currentPage.set(1);
  }

  onSupplierChange(supplierId: string | undefined): void {
    this.filterSupplier.set(supplierId);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  openPurchase(id: string): void {
    this.router.navigate(['/purchases', id]);
  }

  newPurchase(): void {
    this.router.navigate(['/purchases/new']);
  }
}
