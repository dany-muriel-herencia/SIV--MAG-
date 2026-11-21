import {
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { SupplierService } from '../services/supplier.service';
import { inject, isSignal, signal, Signal } from '@angular/core';
import { PagedParams } from '../../../shared/models/paged-result.model';
import { CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier.model';
import { Router } from '@angular/router';

interface SupplierQueryParams extends PagedParams {
  search?: string;
  isActive?: boolean;
}

export function useSuppliersQuery(queryParams: Signal<SupplierQueryParams> | SupplierQueryParams) {
  const supplierService = inject(SupplierService);
  const paramsSignal = isSignal(queryParams) ? queryParams : signal(queryParams ?? {});

  return injectQuery(() => ({
    queryKey: ['suppliers', paramsSignal()],
    queryFn: () => firstValueFrom(supplierService.getPaged(paramsSignal())),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  }));
}

export function useToggleSupplierActiveMutation() {
  const supplierService = inject(SupplierService);
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (supplierId: string) => firstValueFrom(supplierService.toggleActive(supplierId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  }));
}

export function useSupplierByIdQuery(supplierId: Signal<string | null>, isEdit: Signal<boolean>) {
  const supplierService = inject(SupplierService);
  return injectQuery(() => ({
    queryKey: ['suppliers', supplierId()],
    queryFn: () => firstValueFrom(supplierService.getById(supplierId()!)),
    enabled: isEdit() && !!supplierId(),
    staleTime: 1000 * 60 * 5,
  }));
}

export function useSaveSupplierMutation(supplierId?: string) {
  const supplierService = inject(SupplierService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (request: CreateSupplierRequest | UpdateSupplierRequest) => {
      return supplierId
        ? firstValueFrom(supplierService.update(supplierId, request as UpdateSupplierRequest))
        : firstValueFrom(supplierService.create(request as CreateSupplierRequest));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      router.navigate(['/suppliers']);
    },
  }));
}
