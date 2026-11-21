import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';

import { AuthService } from '../../../core/auth/auth.service';
import { StatCardComponent } from '../components/stat-card/stat-card';
import { TopProductsCardComponent } from '../components/top-products-card/top-products-card';
import { ShiftWidgetComponent } from '../components/shift-widget/shift-widget';
import { QuickActionsCardComponent } from '../components/quick-actions-card/quick-actions-card';
import { PendingPurchasesBannerComponent } from '../components/pending-purchases-banner/pending-purchases-banner';
import { useDashboardQuery, useTopProductsQuery } from '../queries/dashboard.queries';

@Component({
  selector: 'app-dashboard',
  imports: [
    DecimalPipe,
    DatePipe,
    StatCardComponent,
    TopProductsCardComponent,
    ShiftWidgetComponent,
    QuickActionsCardComponent,
    PendingPurchasesBannerComponent,
  ],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  });

  readonly today = new Date();

  readonly dateRange = computed(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from, to: now };
  });

  readonly dashboardQuery = useDashboardQuery();
  readonly topProductsQuery = useTopProductsQuery(this.dateRange);

  readonly isLoading = computed(() => this.dashboardQuery.isLoading());
  readonly isFetching = computed(() => this.dashboardQuery.isFetching() || this.topProductsQuery.isFetching());

  readonly error = computed(() => {
    const err = this.dashboardQuery.error();
    if (!err) return null;
    return (
      (err as any)?.error?.message || (err as any)?.message || 'No se pudieron cargar las métricas del dashboard.'
    );
  });

  readonly data = computed(() => this.dashboardQuery.data());

  readonly todaySalesCount = computed(() => this.data()?.todaySalesCount ?? 0);
  readonly todayRevenue = computed(() => this.data()?.todayRevenue ?? 0);
  readonly lowStockCount = computed(() => this.data()?.lowStockCount ?? 0);
  readonly outOfStockCount = computed(() => this.data()?.outOfStockCount ?? 0);
  readonly customersWithDebtCount = computed(() => this.data()?.customersWithDebtCount ?? 0);
  readonly totalDebt = computed(() => this.data()?.totalDebt ?? 0);
  readonly unreadAlertsCount = computed(() => this.data()?.unreadAlertsCount ?? 0);

  readonly topProducts = computed(() => this.topProductsQuery.data() ?? []);
  readonly isTopProductsLoading = computed(() => this.topProductsQuery.isLoading());

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  refresh(): void {
    this.dashboardQuery.refetch();
    if (this.auth.isAdmin()) {
      this.topProductsQuery.refetch();
    }
  }
}