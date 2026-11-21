import { Component, computed, effect, inject, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import {
  useCreateCustomerMutation,
  useCustomerByIdQuery,
  useUpdateCustomerMutation,
} from '../../queries/customers.queries';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule],
  templateUrl: './customer-form.html',
})
export class CustomerForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly customerId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id && id !== 'new' ? id : null;
      }),
    ),
    { initialValue: null },
  );

  // Queries y Mutaciones
  readonly customerQuery = useCustomerByIdQuery(this.customerId);
  readonly createMutation = useCreateCustomerMutation();
  readonly updateMutation = useUpdateCustomerMutation();

  // Formulario Reactivo
  readonly form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.minLength(7), Validators.maxLength(15)]],
    address: ['', [Validators.minLength(5), Validators.maxLength(100)]],
    creditLimit: [0, [Validators.required, Validators.min(0)]],
  });

  readonly isEditMode = computed(() => !!this.customerId());
  readonly isLoading = computed(() => this.customerQuery.isLoading());
  readonly isSaving = computed(() => this.createMutation.isPending() || this.updateMutation.isPending());

  readonly errorMessage = computed(() => {
    const queryErr = this.customerQuery.error() as any;
    const mutErr = (this.createMutation.error() as any) || (this.updateMutation.error() as any);

    const err = mutErr || queryErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar la solicitud.';
  });

  constructor() {
    // Sincronizar datos de la API con el Formulario
    effect(() => {
      const customer = this.customerQuery.data();
      if (customer) {
        untracked(() => {
          this.form.patchValue({
            fullName: customer.fullName,
            phone: customer.phone ?? '',
            address: customer.address ?? '',
            creditLimit: customer.creditLimit,
          });
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    const phoneTrimmed = raw.phone.trim();
    const addressTrimmed = raw.address.trim();

    const request = {
      fullName: raw.fullName.trim(),
      phone: phoneTrimmed ? phoneTrimmed : undefined,
      address: addressTrimmed ? addressTrimmed : undefined,
      creditLimit: raw.creditLimit,
    };

    const id = this.customerId();
    if (id) {
      this.updateMutation.mutate({ id, request });
    } else {
      this.createMutation.mutate(request);
    }
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
}