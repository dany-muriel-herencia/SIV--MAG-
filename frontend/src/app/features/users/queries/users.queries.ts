import { inject, isSignal, Signal, signal } from '@angular/core';
import { injectMutation, injectQuery, keepPreviousData, QueryClient } from '@tanstack/angular-query-experimental';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../services/user.service';
import { CreateUserRequest, UpdateUserRequest } from '../models/user.model';

export function useUsersQuery() {
  const userService = inject(UserService);

  return injectQuery(() => ({
    queryKey: ['users'],
    queryFn: () => firstValueFrom(userService.getPaged()),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  }));
}

export function useUserByIdQuery(
  idParam: Signal<string | null | undefined> | string | null | undefined
) {
  const userService = inject(UserService);
  const idSignal = isSignal(idParam) ? idParam : signal(idParam);

  return injectQuery(() => {
    const id = idSignal();

    return {
      queryKey: ['users', id],
      queryFn: () => firstValueFrom(userService.getById(id!)),
      enabled: !!id && id.trim().length > 0,
      staleTime: 1000 * 60 * 5,
    };
  });
}

export function useCreateUserMutation() {
  const userService = inject(UserService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: (request: CreateUserRequest) =>
      firstValueFrom(userService.create(request)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.navigate(['/users']);
    },
  }));
}

export function useUpdateUserMutation() {
  const userService = inject(UserService);
  const queryClient = inject(QueryClient);
  const router = inject(Router);

  return injectMutation(() => ({
    mutationFn: ({ id, request }: { id: string; request: UpdateUserRequest }) =>
      firstValueFrom(userService.update(id, request)),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      router.navigate(['/users']);
    },
  }));
}

export function useToggleUserActiveMutation() {
  const userService = inject(UserService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: (userId: string) =>
      firstValueFrom(userService.toggleActive(userId)),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  }));
}