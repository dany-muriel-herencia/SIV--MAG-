import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly queryClient = inject(QueryClient);

  // Estados locales de formulario
  username = signal('');
  password = signal('');
  showPassword = signal(false);

  // 1. Mutación de Login con TanStack
  readonly loginMutation = injectMutation(() => ({
    mutationFn: (credentials: LoginRequest) =>
      firstValueFrom(this.auth.login(credentials)),
    onSuccess: () => {
      // 💡 Limpia cualquier caché previa de TanStack Query antes de entrar a la app
      this.queryClient.clear();
      this.router.navigate(['/dashboard']);
    },
  }));

  // 2. Validación derivada
  isFormValid = computed(() => 
    this.username().trim().length >= 3 && this.password().length >= 6
  );

  // 3. Estados de UI derivados de la mutación
  isSubmitting = computed(() => this.loginMutation.isPending());

  error = computed(() => {
    const err = this.loginMutation.error() as any;
    if (!err) return null;
    return err?.error?.message ?? 'Credenciales inválidas o fallo de conexión.';
  });

  // 4. Submit
  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loginMutation.mutate({
      username: this.username().trim(),
      password: this.password(),
    });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}