import { inject, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { useDebouncedSignal } from '../utils/signal.utils';
import { ProductService } from '../../features/products/services/product.service';

export function useProductSearchQuery(querySignal: Signal<string>) {
  const productService = inject(ProductService);
  const debouncedQuery = useDebouncedSignal(querySignal, 300);
  return injectQuery(() => ({
    queryKey: ['products', 'search', debouncedQuery()],
    queryFn: async () => {
      const query = debouncedQuery();
      if (query.trim().length < 2) return [];
      const res = await firstValueFrom(
        productService.getPaged({ search: query, isActive: true, pageSize: 8 }),
      );
      return res?.items ?? [];
    },
    enabled: debouncedQuery().trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  }));
}
