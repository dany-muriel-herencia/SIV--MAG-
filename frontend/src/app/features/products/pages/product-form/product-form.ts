import { Component, computed, effect, inject, untracked } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  useCategoriesQuery,
  useCreateProductMutation,
  useProductByIdQuery,
  useSuppliersQuery,
  useUpdateProductMutation,
} from '../../queries/products.queries';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './product-form.html',
})
export class ProductForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly productId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id && id !== 'new' ? id : null;
      }),
    ),
    { initialValue: null },
  );

  // Queries
  readonly productQuery = useProductByIdQuery(this.productId);
  readonly categoriesQuery = useCategoriesQuery({ pageSize: 100, isActive: true });
  readonly suppliersQuery = useSuppliersQuery({ pageSize: 100, isActive: true });

  // Mutations
  readonly createMutation = useCreateProductMutation();
  readonly updateMutation = useUpdateProductMutation();

  // Signals
  readonly categories = computed(() => this.categoriesQuery.data()?.items ?? []);
  readonly suppliers = computed(() => this.suppliersQuery.data()?.items ?? []);

  // Validador personalizado de precios
  private readonly priceValidator = (control: AbstractControl): ValidationErrors | null => {
    const purchase = control.get('purchasePrice')?.value ?? 0;
    const sale = control.get('salePrice')?.value ?? 0;
    return sale >= purchase ? null : { priceInvalid: true };
  };

  // Formulario Reactivo
  readonly form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.required, Validators.min(0.01)]],
      initialStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [5, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      supplierId: [''],
    },
    { validators: [this.priceValidator] },
  );

  // Estados de UI
  readonly isEditMode = computed(() => !!this.productId());
  readonly isLoading = computed(
    () =>
      (this.isEditMode() && this.productQuery.isLoading()) ||
      this.categoriesQuery.isLoading() ||
      this.suppliersQuery.isLoading(),
  );

  readonly isSaving = computed(
    () => this.createMutation.isPending() || this.updateMutation.isPending(),
  );

  readonly errorMessage = computed(() => {
    const queryErr = this.productQuery.error() as any;
    const mutErr = (this.createMutation.error() as any) || (this.updateMutation.error() as any);

    const err = mutErr || queryErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar la solicitud.';
  });

  // Cálculo de Margen de Ganancia Reactivo
  private readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  readonly margin = computed(() => {
    const values = this.formValues();
    const purchase = values.purchasePrice ?? 0;
    const sale = values.salePrice ?? 0;

    if (purchase <= 0) return 0;
    return Math.round(((sale - purchase) / purchase) * 100 * 100) / 100;
  });

  constructor() {
    // Sincronizar datos del producto con el formulario en modo edición
    effect(() => {
      const product = this.productQuery.data();
      if (product) {
        untracked(() => {
          this.form.patchValue({
            name: product.name,
            purchasePrice: product.purchasePrice,
            salePrice: product.salePrice,
            minStock: product.minStock,
            categoryId: product.categoryId,
            supplierId: product.supplierId ?? '',
          });
          // El stock inicial solo se define en la creación, en edición se deshabilita
          this.form.get('initialStock')?.disable();
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
    const supplierIdTrimmed = raw.supplierId.trim();

    const request = {
      name: raw.name.trim(),
      purchasePrice: raw.purchasePrice,
      salePrice: raw.salePrice,
      minStock: raw.minStock,
      initialStock: raw.initialStock,
      categoryId: raw.categoryId,
      supplierId: supplierIdTrimmed ? supplierIdTrimmed : undefined,
    };

    const id = this.productId();
    if (id) {
      this.updateMutation.mutate({ id, request });
    } else {
      this.createMutation.mutate(request);
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
