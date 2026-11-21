import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { AutocompleteInputComponent } from '../../../../../../shared/components/autocomplete-input/autocomplete-input';
import { useProductSearchQuery } from '../../../../../../shared/queries/product.queries';
import { Product } from '../../../../../products/models/product.model';
import { useManualAdjustmentMutation } from '../../../../queries/stock.queries';


@Component({
  selector: 'app-manual-adjustment-form',
  imports: [FormsModule, ReactiveFormsModule, AutocompleteInputComponent],
  templateUrl: './manual-adjustment-form.html',
})
export class ManualAdjustmentForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  protected readonly productQuery = signal('');
  private readonly productSearch = useProductSearchQuery(this.productQuery);
  protected readonly productResults = computed(() => this.productSearch.data() ?? []);
  protected readonly isSearching = computed(() => this.productSearch.isFetching());

  readonly form = this.fb.group({
    product: [null as Product | null, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    isPositive: [true, Validators.required],
    reason: ['', [Validators.required, Validators.minLength(3)]],
  });

  protected readonly selectedProduct = toSignal(
    this.form.controls.product.valueChanges,
    { initialValue: null }
  );

  protected readonly hasInsufficientStock = computed(() => {
    const product = this.selectedProduct();
    const isPositive = this.form.controls.isPositive.value;
    const quantity = this.form.controls.quantity.value;

    if (!product || isPositive) return false;
    return quantity > product.stock;
  });

  readonly saveMutation = useManualAdjustmentMutation();

  readonly isSaving = computed(() => this.saveMutation.isPending());
  readonly errorMessage = computed(() => {
    const err = this.saveMutation.error() as any;
    if (!err) return null;
    return err?.error?.message ?? err?.message ?? 'Ocurrió un error al procesar la solicitud.';
  });

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control?.invalid && !!(control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid || this.hasInsufficientStock()) {
      this.form.markAllAsTouched();
      return;
    }

    const { product, quantity, isPositive, reason } = this.form.getRawValue();

    this.saveMutation.mutate({
      productId: product!.id,
      quantity: Number(quantity),
      isPositive: Boolean(isPositive),
      reason: reason.trim(),
    });
  }

  goBack(): void {
    this.router.navigate(['/stock']);
  }
}