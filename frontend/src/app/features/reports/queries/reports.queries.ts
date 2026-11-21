import { inject, Signal } from "@angular/core";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { ReportsService } from "../services/reports.service";
import { firstValueFrom } from "rxjs";

export function useSalesReportQuery(dateFilter: Signal<{ from: string; to: string }>) {
  const service = inject(ReportsService);

  return injectQuery(() => ({
    queryKey: ['reports', 'sales-summary', dateFilter()],
    queryFn: () => {
      const { from, to } = dateFilter();
      return firstValueFrom(service.getSalesSummary(from, to));
    },
    staleTime: 1000 * 60 * 5,
  }));
}

export function useTopProductsQuery(dateFilter: Signal<{ from: string; to: string }>) {
  const service = inject(ReportsService);

  return injectQuery(() => ({
    queryKey: ['reports', 'top-products', dateFilter()],
    queryFn: () => {
      const { from, to } = dateFilter();
      return firstValueFrom(service.getTopProducts(from, to,5));
    },
    staleTime: 1000 * 60 * 5,
  }));
}

export function useStockValuationQuery() {
  const service = inject(ReportsService);

  return injectQuery(() => ({
    queryKey: ['reports', 'stock-valuation'],
    queryFn: () => firstValueFrom(service.getStockValuation()),
    staleTime: 1000 * 60 * 5,
  }));
}

export function useCustomerDebtReportQuery() {
  const service = inject(ReportsService);

  return injectQuery(() => ({
    queryKey: ['reports', 'debt-report'],
    queryFn: () => firstValueFrom(service.getCustomerDebtReport()),
    staleTime: 1000 * 60 * 5,
  }));
}