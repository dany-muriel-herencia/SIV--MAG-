import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CreateCategoryRequest } from '../../models/category.model';
import {
  useCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../queries/categories.queries';

@Component({
  selector: 'app-category-form',
  imports: [FormsModule],
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Form Signals
  name = signal('');
  description = signal('');

  readonly categoryId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');
        return id && id !== 'new' ? id : null;
      }),
    ),
    { initialValue: null },
  );

  private readonly categoryQuery = useCategoryByIdQuery(this.categoryId);
  private readonly createMutation = useCreateCategoryMutation();
  private readonly updateMutation = useUpdateCategoryMutation();

  readonly isEditMode = computed(() => !!this.categoryId());
  readonly isLoading = computed(() => this.categoryQuery.isLoading());
  readonly isSaving = computed(
    () => this.createMutation.isPending() || this.updateMutation.isPending(),
  );

  error = computed(() => {
    const queryErr = this.categoryQuery.error() as any;
    const saveErr = this.createMutation.error() as any;
    const err = queryErr || saveErr;
    if (!err) return null;
    return err?.error?.message || err?.message || 'Error al procesar la solicitud.';
  });

  constructor() {
    // Sincroniza los datos cuando la query de edición retorna la respuesta
    effect(() => {
      const category = this.categoryQuery.data();
      if (category) {
        untracked(() => {
          this.name.set(category.name);
          this.description.set(category.description ?? '');
        });
      }
    });
  }

  isFormValid = computed(() => this.name().trim().length >= 3);

  onSubmit(): void {
    if (!this.isFormValid() || this.isSaving()) return;

    const request: CreateCategoryRequest = {
      name: this.name().trim(),
      description: this.description().trim() || undefined,
    };

    const id = this.categoryId();

    if (id) {
      this.updateMutation.mutate({ id, request });
    } else {
      this.createMutation.mutate(request);
    }
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}
