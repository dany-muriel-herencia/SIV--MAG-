import { Component, input, output, signal, inject, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../../../../categories/services/category.service';
import { ProductService } from '../../../../../products/services/product.service';
import { CreateProductRequest, Product } from '../../../../../products/models/product.model';

@Component({
  selector: 'app-create-product-modal',
  imports: [FormsModule],
  template: `
    <div
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="font-semibold text-slate-800 text-base">Crear Producto Rápido</h3>
          <button (click)="cancel.emit()" class="text-slate-400 hover:text-slate-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1"
              >Nombre del Producto *</label
            >
            <input
              type="text"
              [ngModel]="name()"
              (ngModelChange)="name.set($event)"
              placeholder="Ej: Leche Entera 1L"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Categoría *</label>
            <select
              [ngModel]="categoryId()"
              (ngModelChange)="categoryId.set($event)"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option [ngValue]="null" disabled>Selecciona una categoría</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1"
                >Costo Unit. Compra *</label
              >
              <input
                type="number"
                step="0.01"
                [ngModel]="purchasePrice()"
                (ngModelChange)="purchasePrice.set($event)"
                min="0"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1"
                >Precio Venta Sugerido *</label
              >
              <input
                type="number"
                step="0.01"
                [ngModel]="salePrice()"
                (ngModelChange)="salePrice.set($event)"
                min="0"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Stock Mínimo *</label>
            <input
              type="number"
              [ngModel]="minStock()"
              (ngModelChange)="minStock.set($event)"
              min="1"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        @if (errorMessage()) {
          <p class="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{{ errorMessage() }}</p>
        }

        <div class="flex gap-3 pt-2">
          <button
            (click)="cancel.emit()"
            class="flex-1 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            (click)="onSave()"
            [disabled]="createProductMutation.isPending() || !isFormValid()"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            @if (createProductMutation.isPending()) {
              <i class="pi pi-spin pi-spinner mr-1 text-xs"></i>
            }
            Guardar y Agregar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CreateProductModalComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly queryClient = inject(QueryClient);

  // Initial Name (opcional, por si viene lo que escribió en el buscador)
  initialName = input<string>('');

  created = output<Product>();
  cancel = output<void>();

  name = signal('');
  categoryId = signal<string | null>(null);
  purchasePrice = signal<number>(0);
  salePrice = signal<number>(0);
  minStock = signal<number>(5);
  errorMessage = signal<string | null>(null);

  categoriesQuery = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => firstValueFrom(this.categoryService.getPaged({ pageSize: 100 })),
  }));

  categories = computed(() => this.categoriesQuery.data()?.items ?? []);

  createProductMutation = injectMutation(() => ({
    mutationFn: (payload: CreateProductRequest) =>
      firstValueFrom(this.productService.create(payload)),
    onSuccess: (newProduct: Product) => {
      // 💡 Refresca las consultas de productos/categorías para que el nuevo
      // producto aparezca en el autocompletado sin esperar a que expire la caché.
      this.queryClient.invalidateQueries({ queryKey: ['products'] });
      this.queryClient.invalidateQueries({ queryKey: ['categories'] });
      this.created.emit(newProduct);
    },
    onError: (err: any) => {
      this.errorMessage.set(err?.error?.message || 'Error al registrar el producto');
    },
  }));

  constructor() {
    effect(() => {
      const init = this.initialName();
      if (init) {
        this.name.set(init);
      }
    });
  }

  isFormValid(): boolean {
    return (
      !!this.name().trim() &&
      !!this.categoryId() &&
      Number(this.salePrice()) >= 0 &&
      Number(this.purchasePrice()) >= 0 &&
      Number(this.minStock()) >= 1
    );
  }

  onSave(): void {
    if (!this.isFormValid()) return;

    this.createProductMutation.mutate({
      name: this.name().trim(),
      categoryId: this.categoryId()!,
      purchasePrice: Number(this.purchasePrice()),
      salePrice: Number(this.salePrice()),
      initialStock: 0,
      minStock: Number(this.minStock()),
    });
  }
}
