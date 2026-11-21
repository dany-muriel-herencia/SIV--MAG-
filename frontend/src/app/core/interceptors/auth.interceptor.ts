import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, take, filter } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
// Usamos null como estado 'esperando respuesta del backend'
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Asegurar siempre withCredentials para envío de cookies HttpOnly
  const reqWithCredentials = req.clone({ withCredentials: true });

  return next(reqWithCredentials).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos 401 y NO es una llamada a los endpoints de auth
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        return handleUnauthorized(reqWithCredentials, next, auth, router);
      }
      return throwError(() => error);
    })
  );
};

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  router: Router
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Pausa las peticiones concurrentes

    return auth.refreshToken().pipe(
      switchMap(() => {
        isRefreshing = false;
        refreshTokenSubject.next(true); // Notifica éxito: la nueva cookie ya fue guardada por el navegador
        
        // Reintenta la petición original (A). El navegador incluirá la nueva cookie actualizada.
        return next(req); 
      }),
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next(false); // Notifica fallo a las peticiones en espera
        
        auth.clearSession();
        router.navigate(['/login']);
        return throwError(() => err);
      })
    );
  } else {
    // Peticiones paralelas (B, C, D) se quedan en cola hasta que refreshTokenSubject emita true o false
    return refreshTokenSubject.pipe(
      filter((refreshed): refreshed is boolean => refreshed !== null),
      take(1),
      switchMap((success) => {
        if (success) {
          // Reintentar la petición una vez renovada la cookie de acceso
          return next(req);
        }
        return throwError(() => new Error('Sesión expirada. Redirigiendo al login.'));
      })
    );
  }
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  );
}