import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { CashRegisterService } from '../services/cash-register.service';
import { CloseCashRegisterRequest, OpenCashRegisterRequest } from '../models/cash-register.model';

export function useCurrentCashRegisterQuery() {
  const service = inject(CashRegisterService);

  return injectQuery(() => ({
    queryKey: ['cash-register', 'current'],
    queryFn: () => firstValueFrom(service.getCurrent()),
    staleTime: 1000 * 30,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 2;
    },
  }));
}

export interface CashRegisterHistoryFilters {
  userId?: string;
  from?: string;
  to?: string;
  isOpen?: boolean;
}

export function useHistoryQuery(filters: () => CashRegisterHistoryFilters) {
  const service = inject(CashRegisterService);

  return injectQuery(() => ({
    queryKey: ['cash-register', 'history', filters()],
    queryFn: () => firstValueFrom(service.getPaged({ ...filters(), pageSize: 100 })),
    staleTime: 1000 * 30,
  }));
}

export function useOpenCashRegisterMutation() {
  const service = inject(CashRegisterService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (dto: OpenCashRegisterRequest) =>
      firstValueFrom(service.open(dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-register'] });
    },
  }));
}

export function useCloseCashRegisterMutation() {
  const service = inject(CashRegisterService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: ({ id, dto }: { id: string; dto: CloseCashRegisterRequest }) =>
      firstValueFrom(service.close(id, dto)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-register'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  }));
}
