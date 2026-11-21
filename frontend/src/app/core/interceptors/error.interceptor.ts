import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export interface AppError extends Error {
  status?: number;
  originalError?: unknown;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Log técnico completo solo para el desarrollador en la consola
      console.error('[HTTP Technical Error]:', {
        url: req.url,
        status: error.status,
        message: error.message,
        rawError: error.error
      });

      // 2. Determinar el mensaje seguro para el usuario final
      let userFriendlyMessage = 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.';

      if (error.status === 0) {
        userFriendlyMessage = 'No se pudo establecer conexión con el servidor.';
      } else if (error.status === 404) {
        userFriendlyMessage = 'El recurso o servicio solicitado no está disponible.';
      } else if (error.status >= 500) {
        userFriendlyMessage = 'Ocurrió un problema interno en el servidor.';
      } else if (typeof error.error?.message === 'string') {
        // Solo mostrar mensajes explícitos que devuelva tu backend (ej. validaciones de negocio)
        userFriendlyMessage = error.error.message;
      }

      // 3. Devolver un objeto Error limpio con el mensaje sanitizado,
      //    preservando el status HTTP y el error original para la lógica de negocio.
      const appError = new Error(userFriendlyMessage) as AppError;
      appError.status = error.status;
      appError.originalError = error.error;
      return throwError(() => appError);
    })
  );
};