import { inject, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { injectMutation, injectQuery, keepPreviousData, QueryClient } from '@tanstack/angular-query-experimental';
import { SalesService } from '../services/sales.service';
import { CreateSaleRequest, SaleStatus } from '../models/sale.model';
import { useCurrentCashRegisterQuery } from '../../cash-register/queries/cash-register.queries';
import { useCustomersQuery } from '../../customers/queries/customers.queries';
import { useUsersQuery } from '../../users/queries/users.queries';

export { useCurrentCashRegisterQuery, useCustomersQuery, useUsersQuery };

export interface SalesPagedFilters {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  customerId?: string;
  userId?: string;
  status?: SaleStatus;
}

export function useSalesPagedQuery(filtersSignal: Signal<SalesPagedFilters>) {
  const salesService = inject(SalesService);

  return injectQuery(() => ({
    queryKey: ['sales', filtersSignal()],
    queryFn: () => firstValueFrom(salesService.getPaged(filtersSignal())),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  }));
}

export function useSaleDetailQuery(idSignal: Signal<string>) {
  const salesService = inject(SalesService);

  return injectQuery(() => ({
    queryKey: ['sales', 'detail', idSignal()],
    queryFn: () => firstValueFrom(salesService.getById(idSignal())),
    enabled: !!idSignal(),
    staleTime: 1000 * 60 * 5,
  }));
}

export function useCreateSaleMutation() {
  const salesService = inject(SalesService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (request: CreateSaleRequest) => firstValueFrom(salesService.create(request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  }));
}

export function useCancelSaleMutation() {
  const salesService = inject(SalesService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (id: string) => firstValueFrom(salesService.cancel(id)),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['cash-register'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  }));
}
