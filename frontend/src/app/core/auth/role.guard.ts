import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  // userRole es un Signal
  const role = authService.userRole();

  if (role && requiredRoles.includes(role)) return true;

  return router.createUrlTree(['/dashboard']);
};