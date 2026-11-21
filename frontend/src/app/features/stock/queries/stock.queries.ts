import { inject, isSignal, Signal, signal } from '@angular/core';
import { injectQuery, keepPreviousData } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { StockService } from '../services/stock.service';
import { MovementType } from '../models/stock.model';
import { PagedParams } from '../../../shared/models/paged-result.model';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { Router } from '@angular/router';
import { ManualAdjustmentRequest } from '../models/stock.model';
interface StockMovementQueryParams extends PagedParams {
  type?: MovementType;
  productId?: string;
  from?: string;
  to?: string;
}

export function useMovementsQuery(
  queryParams?: Signal<StockMovementQueryParams> | StockMovementQueryParams,
) {
  const stockService = inject(StockService);
  const paramsSignal = isSignal(queryParams) ? queryParams : signal(queryParams ?? {});

  return injectQuery(() => ({
    queryKey: ['movements', paramsSignal()],
    queryFn: () => firstValueFrom(stockService.getMovements(paramsSignal())),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  }));
}

export function useManualAdjustmentMutation() {
  const stockService = inject(StockService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (request: ManualAdjustmentRequest) =>
      firstValueFrom(stockService.manualAdjustment(request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.navigate(['/stock']);
    },
  }));
}
