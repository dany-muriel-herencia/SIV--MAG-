import {
  injectQuery,
  injectMutation,
  QueryClient,
  keepPreviousData,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { inject, isSignal, signal, Signal } from '@angular/core';
import { CategoryService } from '../services/category.service';
import { PagedParams } from '../../../shared/models/paged-result.model';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../models/category.model';
import { Router } from '@angular/router';
import { UpdateCustomerRequest } from '../../customers/models/customer.model';

interface CategoryQueryParams extends PagedParams {
  search?: string;
  isActive?: boolean;
}

export function useCategoriesQuery(queryParams: Signal<CategoryQueryParams> | CategoryQueryParams) {
  const categoriesService = inject(CategoryService);

  const paramsSignal = isSignal(queryParams) ? queryParams : signal(queryParams ?? {});

  return injectQuery(() => ({
    queryKey: ['categories', paramsSignal()],
    queryFn: () => firstValueFrom(categoriesService.getPaged(paramsSignal())),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  }));
}

export function useToggleCategoriesActiveMutation() {
  const categoriesService = inject(CategoryService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (categoryId: string) => firstValueFrom(categoriesService.toggleActive(categoryId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  }));
}

export function useCategoryByIdQuery(
  idParam: Signal<string | null | undefined> | string | null | undefined,
) {
  const categoriesService = inject(CategoryService);
  const idSignal = isSignal(idParam) ? idParam : signal(idParam);

  return injectQuery(() => {
    const id = idSignal();

    return {
      queryKey: ['categories', id],
      queryFn: () => firstValueFrom(categoriesService.getById(id!)),
      enabled: !!id && id.trim().length > 0,
      staleTime: 1000 * 60 * 5,
    };
  });
}

export function useCreateCategoryMutation() {
  const categoryService = inject(CategoryService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (request: CreateCategoryRequest) => firstValueFrom(categoryService.create(request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.navigate(['/categories']);
    },
  }));
}

export function useUpdateCategoryMutation() {
  const categoryService = inject(CategoryService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: ({ id, request }: { id: string; request: UpdateCategoryRequest }) =>
      firstValueFrom(categoryService.update(id, request)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', id] });
      router.navigate(['/categories']);
    },
  }));
}
