import {
  injectQuery,
  injectMutation,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { inject, isSignal, signal, Signal } from '@angular/core';
import { ProductService } from '../services/product.service';
import { PagedParams } from '../../../shared/models/paged-result.model';
import { useCategoriesQuery } from '../../categories/queries/categories.queries';
import { useSuppliersQuery } from '../../suppliers/queries/suppliers.queries';
import { Router } from '@angular/router';
import { CreateProductRequest, UpdateProductRequest } from '../models/product.model';

interface ProductQueryParams extends PagedParams {
  search?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}
export { useCategoriesQuery, useSuppliersQuery };
export function useProductsQuery(queryParams: Signal<ProductQueryParams>) {
  const productsService = inject(ProductService);

  return injectQuery(() => ({
    queryKey: ['products', queryParams()],
    queryFn: () => firstValueFrom(productsService.getPaged(queryParams())),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  }));
}

export function useToggleProductActiveMutation() {
  const productsService = inject(ProductService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (productId: string) =>
      firstValueFrom(productsService.toggleActive(productId)),
    onSuccess: (_, productId) => {
      // Invalida el listado global de productos
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Invalida también la consulta individual por si está abierto en detalle/edición
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
    },
  }));
}

export function useProductByIdQuery(
  idParam: Signal<string | null | undefined> | string | null | undefined,
) {
  const productsService = inject(ProductService);
  const idSignal = isSignal(idParam) ? idParam : signal(idParam);

  return injectQuery(() => {
    const id = idSignal();

    return {
      queryKey: ['products', id],
      queryFn: () => firstValueFrom(productsService.getById(id!)),
      enabled: !!id && id.trim().length > 0,
      staleTime: 1000 * 60 * 5, // 5 minutos
    };
  });
}

export function useCreateProductMutation() {
  const productsService = inject(ProductService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (request: CreateProductRequest) => firstValueFrom(productsService.create(request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.navigate(['/products']);
    },
  }));
}

export function useUpdateProductMutation() {
  const productsService = inject(ProductService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: ({ id, request }: { id: string; request: UpdateProductRequest }) =>
      firstValueFrom(productsService.update(id, request)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      router.navigate(['/products']);
    },
  }));
}
