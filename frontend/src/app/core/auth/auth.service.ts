import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  AuthState,
  LoginRequest,
  UserMeResponse,
  UserSession,
} from '../../features/auth/models/auth.model';
import { QueryClient } from '@tanstack/angular-query-experimental';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly queryClient = inject(QueryClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Estado reactivo con Signals
  private readonly _state = signal<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  // Signals derivados — computados automáticamente
  readonly currentUser = computed(() => this._state().user);
  readonly isAuthenticated = computed(() => this._state().isAuthenticated);
  readonly userRole = computed(() => this._state().user?.role ?? null);
  readonly isAdmin = computed(() => this._state().user?.role === 'Admin');
  readonly isCajero = computed(() => this._state().user?.role === 'Cajero');

  constructor() {
    // Restaurar sesión desde sessionStorage al iniciar
    this.restoreSession();
  }

  login(request: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request, { withCredentials: true })
      .pipe(
        tap((response) => {
          const user: UserSession = {
            userId: response.userId,
            username: response.username,
            fullName: response.fullName,
            role: response.role,
          };
          this.setSession(user);
        }),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
      );
  }

  refreshToken() {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          const user: UserSession = {
            userId: response.userId,
            username: response.username,
            fullName: response.fullName,
            role: response.role,
          };
          this.setSession(user);
        })
      );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      finalize(() => {
        this.clearSession();
        // 💡 Vacia todo el almacén de peticiones HTTP en caché
        this.queryClient.clear();
        this.router.navigate(['/login']);
      }),
      catchError(() => of(null))
    );
  }

  getMe() {
    return this.http.get<UserMeResponse>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      tap((response) => {
        const user: UserSession = {
          userId: response.userId,
          username: response.username,
          role: response.role,
        };
        this.setSession(user);
      }),
    );
  }

  clearSession(): void {
    this._state.set({ user: null, isAuthenticated: false });
    sessionStorage.removeItem('auth_user');
  }

  private setSession(user: UserSession): void {
    this._state.set({
      user,
      isAuthenticated: true,
    });
    sessionStorage.setItem('auth_user', JSON.stringify(user));
  }

  private restoreSession(): void {
    const stored = sessionStorage.getItem('auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as UserSession;
        this._state.set({ user, isAuthenticated: true });
      } catch {
        this.clearSession();
      }
    }
  }
}
