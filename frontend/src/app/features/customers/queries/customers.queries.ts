import {
  injectQuery,
  injectMutation,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { firstValueFrom } from 'rxjs';
import { CustomersService } from '../services/customers.service';
import { inject, isSignal, signal, Signal } from '@angular/core';
import { PagedParams } from '../../../shared/models/paged-result.model';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../models/customer.model';
import { Router } from '@angular/router';

interface CustomerQueryParams extends PagedParams {
  search?: string;
  isActive?: boolean;
  hasDebt?: boolean;
}

export function useCustomersQuery(queryParams: Signal<CustomerQueryParams> | CustomerQueryParams) {
  const customersService = inject(CustomersService);
  const paramsSignal = isSignal(queryParams) ? queryParams : signal(queryParams ?? {});
  return injectQuery(() => ({
    queryKey: ['customers', paramsSignal()],
    queryFn: () => firstValueFrom(customersService.getPaged(paramsSignal())),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  }));
}

export function useToggleCustomersActiveMutation() {
  const customersService = inject(CustomersService);
  const queryClient = inject(QueryClient);
  return injectMutation(() => ({
    mutationFn: (customerId: string) => firstValueFrom(customersService.toggleActive(customerId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  }));
}

export function useCustomerByIdQuery(
  idParam: Signal<string | null | undefined> | string | null | undefined,
) {
  const customersService = inject(CustomersService);

  const idSignal = isSignal(idParam) ? idParam : signal(idParam);

  return injectQuery(() => {
    const id = idSignal();

    return {
      queryKey: ['customers', id],
      queryFn: () => firstValueFrom(customersService.getById(id!)),
      enabled: !!id && id.trim().length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutos
    };
  });
}

export function useCreateCustomerMutation() {
  const customersService = inject(CustomersService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (request: CreateCustomerRequest) =>
      firstValueFrom(customersService.create(request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.navigate(['/customers']);
    },
  }));
}

export function useUpdateCustomerMutation() {
  const customersService = inject(CustomersService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: ({ id, request }: { id: string; request: UpdateCustomerRequest }) =>
      firstValueFrom(customersService.update(id, request)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
      router.navigate(['/customers']);
    },
  }));
}
