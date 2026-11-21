import { Component, computed, effect, inject, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { CreateUserRequest, UpdateUserRequest, UserRole } from '../../models/user.model';
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUserByIdQuery,
} from '../../queries/users.queries';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
})
export class UserForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly userId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id && id !== 'new' ? id : null;
      }),
    ),
    { initialValue: null },
  );

  readonly userQuery = useUserByIdQuery(this.userId);
  readonly createMutation = useCreateUserMutation();
  readonly updateMutation = useUpdateUserMutation();

  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    role: [UserRole.CAJERO, [Validators.required]],
    password: [''],
  });

  readonly isEditMode = computed(() => !!this.userId());
  readonly isLoading = computed(() => this.isEditMode() && this.userQuery.isLoading());
  readonly isSaving = computed(
    () => this.createMutation.isPending() || this.updateMutation.isPending(),
  );

  readonly errorMessage = computed(() => {
    const queryErr = this.userQuery.error() as any;
    const mutErr = (this.createMutation.error() as any) || (this.updateMutation.error() as any);

    const err = mutErr || queryErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar la solicitud.';
  });

  constructor() {
    effect(() => {
      const user = this.userQuery.data();
      if (user) {
        untracked(() => {
          this.form.patchValue({
            fullName: user.fullName,
            username: user.username,
            role: user.role,
          });
          this.form.get('username')?.disable();
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isPasswordInvalid(): boolean {
    const password = this.form.get('password')?.value ?? '';
    if (!this.isEditMode()) {
      return password.trim().length < 6;
    }
    return password.length > 0 && password.length < 6;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isPasswordInvalid()) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const id = this.userId();

    if (id) {
      const request: UpdateUserRequest = {
        fullName: rawValue.fullName.trim(),
        role: rawValue.role,
        ...(rawValue.password ? { password: rawValue.password } : {}),
      };
      this.updateMutation.mutate({ id, request });
    } else {
      const request: CreateUserRequest = {
        fullName: rawValue.fullName.trim(),
        username: rawValue.username.trim(),
        role: rawValue.role,
        password: rawValue.password,
      };
      this.createMutation.mutate(request);
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
