import { inject, Signal } from "@angular/core";
import { injectMutation, injectQuery, keepPreviousData, QueryClient } from "@tanstack/angular-query-experimental";
import { firstValueFrom } from "rxjs";
import { PurchaseService } from "../services/purchase.service";
import { CreatePurchaseRequest, PurchaseStatus, ReceivePurchaseRequest } from "../models/purchase.model";
import { PagedParams } from "../../../shared/models/paged-result.model";

interface PurchasePagedParams extends PagedParams {
  supplierId?: string;
  status?: PurchaseStatus;
  from?: string;
  to?: string;
}

export function usePurchasesQuery(queryParams: Signal<PurchasePagedParams>) {
  const purchaseService = inject(PurchaseService);

  return injectQuery(() => ({
    queryKey: ['purchases', queryParams()],
    queryFn: () => firstValueFrom(purchaseService.getPaged(queryParams())),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  }));
}

export function useCreatePurchaseMutation() {
  const purchaseService = inject(PurchaseService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (payload: CreatePurchaseRequest) => firstValueFrom(purchaseService.create(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  }));
}

export function usePurchaseByIdQuery(id: Signal<string>) {
  const purchaseService = inject(PurchaseService);

  return injectQuery(() => ({
    queryKey: ['purchases', id()],
    queryFn: () => firstValueFrom(purchaseService.getById(id())),
    staleTime: 30_000,
  }));
}

export function useReceivePurchaseMutation(id: Signal<string>) {
  const purchaseService = inject(PurchaseService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (payload: ReceivePurchaseRequest) => firstValueFrom(purchaseService.receive(id(), payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  }));
}

export function useCancelPurchaseMutation(id: Signal<string>) {
  const purchaseService = inject(PurchaseService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: () => firstValueFrom(purchaseService.cancel(id())),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases', id] });
    },
  }));
}


