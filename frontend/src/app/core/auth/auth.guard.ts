import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAuthenticated es un Signal — se llama como función
  if (authService.isAuthenticated()) return true;

  return router.createUrlTree(['/login']);
};