import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CashRegisterService } from '../services/cash-register.service';
import { map, catchError, of } from 'rxjs';

export const activeCashRegisterGuard: CanActivateFn = () => {
  const cashRegisterService = inject(CashRegisterService);
  const router = inject(Router);

  return cashRegisterService.getCurrent().pipe(
    map((session) => {
      if (session && session.isOpen) {
        return true;
      }
      // Si la caja está cerrada o no existe, redirigir
      return router.createUrlTree(['/cash-register']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/cash-register']));
    })
  );
};