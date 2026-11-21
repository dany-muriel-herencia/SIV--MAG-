import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { UserService } from '../../features/users/services/user.service';

export function useAllUsersQuery() {
  const userService = inject(UserService);

  return injectQuery(() => ({
    queryKey: ['users', 'all'],
    queryFn: () => firstValueFrom(userService.getPaged()),
    staleTime: 1000 * 60 * 10,
  }));
}