import { inject, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { useDebouncedSignal } from '../utils/signal.utils';
import { CustomersService } from '../../features/customers/services/customers.service';

export function useCustomerSearchQuery(querySignal: Signal<string>) {
  const customersService = inject(CustomersService);
  const debouncedQuery = useDebouncedSignal(querySignal, 300);

  return injectQuery(() => ({
    queryKey: ['customers', 'search', debouncedQuery()],
    queryFn: async () => {
      const query = debouncedQuery();
      if (query.trim().length < 2) return [];
      const res = await firstValueFrom(customersService.search(query));
      return res?.items ?? [];
    },
    enabled: debouncedQuery().trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  }));
}
