import { inject, isSignal, Signal, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { AuthService } from '../../../core/auth/auth.service';

export function useDashboardQuery() {
  const dashboardService = inject(DashboardService);

  return injectQuery(() => ({
    queryKey: ['dashboard'],
    queryFn: () => firstValueFrom(dashboardService.getDashboardData()),
    staleTime: 60_000,
    refetchInterval: 300_000,
  }));
}

export function useTopProductsQuery(
  dateRangeParam: Signal<{ from: Date; to: Date }> | { from: Date; to: Date }
) {
  const dashboardService = inject(DashboardService);
  const auth = inject(AuthService);
  const rangeSignal = isSignal(dateRangeParam) ? dateRangeParam : signal(dateRangeParam);

  return injectQuery(() => {
    const range = rangeSignal();

    return {
      queryKey: ['top-products', range],
      queryFn: () => firstValueFrom(dashboardService.getTopProducts(range.from, range.to, 5)),
      enabled: auth.isAdmin(),
    };
  });
}