import { Component, computed, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { useSaveSupplierMutation, useSupplierByIdQuery } from '../../queries/suppliers.queries';

@Component({
  selector: 'app-supplier-form',
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-form.html',
})
export class SupplierForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  // Obtener ID
  readonly supplierId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id && id !== 'new' ? id : null;
      }),
    ),
    { initialValue: null },
  );

  readonly isEditMode = computed(() => !!this.supplierId());

  // Queries
  readonly supplierQuery = useSupplierByIdQuery(this.supplierId, this.isEditMode);
  readonly saveMutation = useSaveSupplierMutation();

  //Estructura del Formulario
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    contactEmail: ['', [Validators.email]],
    address: [''],
  });

  isLoading = computed(() => this.isEditMode() && this.supplierQuery.isLoading());
  isSaving = computed(() => this.saveMutation.isPending());

  errorMessage = computed(() => {
    const queryErr = this.supplierQuery.error() as any;
    const mutErr = this.saveMutation.error() as any;

    const err = mutErr || queryErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar la solicitud.';
  });

  constructor() {
    effect(() => {
      const supplier = this.supplierQuery.data();
      if (supplier) {
        this.form.patchValue({
          name: supplier.name,
          phone: supplier.phone ?? '',
          contactEmail: supplier.contactEmail ?? '',
          address: supplier.address ?? '',
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

    const rawValue = this.form.getRawValue();

    const request = {
      name: rawValue.name.trim(),
      phone: rawValue.phone.trim() || undefined,
      contactEmail: rawValue.contactEmail.trim() || undefined,
      address: rawValue.address.trim() || undefined,
    };

    this.saveMutation.mutate(request);
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }
}
