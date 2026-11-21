import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { withDevtools } from '@tanstack/angular-query-experimental/devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimización de change detection
    provideZonelessChangeDetection(),

    // Router con transiciones y binding de inputs
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),

    // HttpClient con interceptores funcionales (Fetch ya está activo por defecto)
    provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])),
    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Considera los datos "frescos" por 5 min
            retry: 1, // Máximo 1 reintento si la red falla
          },
        },
      }),
      withDevtools()
    ),
  ],
};
