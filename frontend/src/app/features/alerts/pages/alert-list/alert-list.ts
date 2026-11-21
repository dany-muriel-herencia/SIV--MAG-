import { Component, signal, computed, inject } from '@angular/core';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { AlertType } from '../../models/alert.model';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { TableSkeleton } from '../../../../shared/components/table-skeleton/table-skeleton';
import { extractErrorMessage } from '../../../../shared/utils/error';
import { AlertsService } from '../../services/alerts.service';
import { AlertFilters } from './componentes/alert-filters/alert-filters';
import { AlertTable } from './componentes/alert-table/alert-table';

@Component({
  selector: 'app-alert-list',
  imports: [Pagination, TableSkeleton, AlertFilters, AlertTable],
  templateUrl: './alert-list.html',
})
export class AlertList {
  private readonly alertsService = inject(AlertsService);
  private readonly queryClient = inject(QueryClient);

  filterIsRead = signal<boolean | undefined>(undefined);
  filterType = signal<AlertType | undefined>(undefined);
  currentPage = signal(1);
  readonly pageSize = 10;

  readonly queryParams = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    type: this.filterType(),
    isRead: this.filterIsRead(),
  }));

  readonly alertsQuery = injectQuery(() => ({
    queryKey: ['alerts', this.queryParams()],
    queryFn: () => firstValueFrom(this.alertsService.getPaged(this.queryParams())),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5,
    refetchOnMount: true,
  }));

  readonly markAsReadMutation = injectMutation(() => ({
    mutationFn: (id: string) => firstValueFrom(this.alertsService.markAsRead(id)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  }));

  readonly makAsUnreadMutation = injectMutation(() => ({
    mutationFn: (id: string) => firstValueFrom(this.alertsService.markAsUnread(id)),
    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  }));

  markAsRead(id: string) {
    this.markAsReadMutation.mutate(id);
  }

  markAsUnread(id: string) {
    this.makAsUnreadMutation.mutate(id);
  }

  alerts = computed(() => this.alertsQuery.data()?.items ?? []);
  totalCount = computed(() => this.alertsQuery.data()?.totalCount ?? 0);
  totalPages = computed(() => this.alertsQuery.data()?.totalPages ?? 0);
  isLoading = computed(() => this.alertsQuery.isLoading());
  isPending = computed(
    () => this.markAsReadMutation.isPending() || this.makAsUnreadMutation.isPending(),
  );
  error = computed(() => {
    return extractErrorMessage(
      [this.alertsQuery.error(), this.markAsReadMutation.error(), this.makAsUnreadMutation.error()],
      'Ocurrió un error al procesar las alertas.',
    );
  });

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onFilterTypeChange(filterType: AlertType | undefined) {
    this.filterType.set(filterType);
    this.currentPage.set(1);
  }

  onFilterIsReadChange(filterIsRead: boolean | undefined) {
    this.filterIsRead.set(filterIsRead);
    this.currentPage.set(1);
  }
}
