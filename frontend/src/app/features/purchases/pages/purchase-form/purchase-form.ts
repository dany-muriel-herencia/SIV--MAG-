import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseCartTableComponent } from './components/purchase-cart-table/purchase-cart-table';
import { SelectorComponent } from '../../../../shared/components/selector/selector';

import { CreatePurchaseRequest, PurchasePayment } from '../../models/purchase.model';

import { useProductSearchQuery } from '../../../../shared/queries/product.queries';
import { useCreatePurchaseMutation } from '../../queries/purchase.queries';
import { useSuppliersQuery } from '../../../suppliers/queries/suppliers.queries';

import { PurchaseCartService } from '../../services/purchase-cart.service';
import { CreateProductModalComponent } from './components/create-product-modal/create-product-modal';
import { AutocompleteInputComponent } from '../../../../shared/components/autocomplete-input/autocomplete-input';
import { Supplier } from '../../../suppliers/models/supplier.model';
import { Product } from '../../../products/models/product.model';

@Component({
  selector: 'app-purchase-form',
  imports: [
    FormsModule,
    PurchaseCartTableComponent,
    SelectorComponent,
    CreateProductModalComponent,
    AutocompleteInputComponent
  ],
  providers: [PurchaseCartService],
  templateUrl: './purchase-form.html',
})
export class PurchaseForm {
  private readonly router = inject(Router);
  private readonly cartService = inject(PurchaseCartService);

  // 1. Estados del Formulario (Alineados a los tipos primitivos de tu API payload)
  protected readonly supplierQuery = signal('');
  protected readonly productQuery = signal('');

  protected readonly selectedSupplier = signal<Supplier | null>(null);
  protected readonly paymentType = signal<PurchasePayment | null>(null);
  protected readonly invoiceNumber = signal<string | null>(null);

  // Estado del carrito delegado al servicio
  protected readonly cart = this.cartService.items;
  protected readonly total = this.cartService.total;

  // Advertencia cuando se agrega un producto sin costo unitario definido
  protected readonly zeroCostWarning = signal<string | null>(null);

  // Reutilizado en el template para el selector de método de pago
  protected readonly paymentTypes = computed(() => {
    return [
      { value: PurchasePayment.Contado, label: 'Contado' },
      { value: PurchasePayment.Credito, label: 'Crédito' },
    ];
  });

  // 2. TanStack Queries & Mutations
  private readonly productSearch = useProductSearchQuery(this.productQuery);
  private readonly createPurchaseMutation = useCreatePurchaseMutation();
  private readonly allSuppliersQuery = useSuppliersQuery({ page: 1, pageSize: 100, isActive: true });

  // Signals derivados para la UI
  protected readonly productResults = computed(() => this.productSearch.data() ?? []);
  protected readonly isSearchingProduct = computed(() => this.productSearch.isFetching());
  protected readonly allSuppliers = computed(() => this.allSuppliersQuery.data()?.items ?? []);

  // 3. Computados del Estado del Formulario
  protected readonly isSaving = computed(() => this.createPurchaseMutation.isPending());
  protected readonly error = computed(() => {
    const err = this.createPurchaseMutation.error() as any;
    if (!err) return null;
    return err?.error?.message || err?.message || 'Error al registrar la orden de compra.';
  });

  // Es válido si tiene proveedor seleccionado y por lo menos un ítem en el carrito
  protected readonly isFormValid = computed(
    () => !!this.selectedSupplier() && this.cart().length > 0,
  );

  // 4. Gestión de Proveedor
  protected onSupplierSearch(query: string): void {
    this.supplierQuery.set(query);
  }

  protected selectSupplier(supplier: Supplier | null): void {
    this.selectedSupplier.set(supplier);
  }

  // 5. Gestión del Carrito (Productos)
  protected onProductSearch(query: string): void {
    this.productQuery.set(query);
  }

  protected selectProduct(product: Product | null): void {
    if (!product) return;

    const { zeroCostAdded } = this.cartService.addProduct(product);

    this.zeroCostWarning.set(
      zeroCostAdded
        ? `El producto "${product.name}" no tiene costo de compra registrado. Se agregó a S/ 0.`
        : null,
    );

    this.productQuery.set(''); // Reseteamos la query
  }

  protected readonly showCreateProductModal = signal(false);

  // Se ejecuta cuando el modal crea exitosamente el producto
  protected onProductCreated(newProduct: Product): void {
    this.showCreateProductModal.set(false);
    this.selectProduct(newProduct); // Lo inserta directamente al carrito
  }

  protected updateQuantity(productId: string, qty: number): void {
    this.cartService.updateQuantity(productId, qty);
  }

  protected updateUnitCost(productId: string, cost: number): void {
    this.cartService.updateUnitCost(productId, cost);
  }

  protected removeItem(productId: string): void {
    this.cartService.removeItem(productId);
  }

  // 6. Envío estructurado del Formulario al API
  protected onSubmit(): void {
    if (!this.isFormValid()) return;

    const invoice = this.invoiceNumber()?.trim();
    const payload: CreatePurchaseRequest = {
      paymentType: this.paymentType()!,
      supplierId: this.selectedSupplier()!.id,
      ...(invoice ? { invoiceNumber: invoice } : {}),
      items: this.cart().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    };

    this.createPurchaseMutation.mutate(payload, {
      onSuccess: () => {
        this.cartService.clear();
        this.goBack();
      },
    });
  }

  protected goBack(): void {
    this.router.navigate(['/purchases']);
  }
}
