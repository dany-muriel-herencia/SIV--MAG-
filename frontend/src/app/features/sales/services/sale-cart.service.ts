import { Injectable, signal, computed } from '@angular/core';
import { CartItem, SalePaymentType } from '../models/sale.model';
import { Customer } from '../../customers/models/customer.model';
import { Product } from '../../products/models/product.model';

@Injectable({ providedIn: 'root' })
export class SaleCartService {
  readonly cart = signal<CartItem[]>([]);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly paymentType = signal<SalePaymentType>(SalePaymentType.Efectivo);
  readonly error = signal<string | null>(null);

  // Cálculos consolidados y seguros
  readonly total = computed(() =>
    this.cart().reduce((sum, item) => sum + item.subtotal, 0)
  );

  readonly subtotal = computed(() => Number((this.total() / 1.18).toFixed(2)));
  readonly igv = computed(() => Number((this.total() - this.subtotal()).toFixed(2)));

  readonly isFormValid = computed(() =>
    this.cart().length > 0 &&
    (this.paymentType() !== SalePaymentType.Fiado || !!this.selectedCustomer())
  );

  addToCart(product: Product): void {
    if (product.isOutOfStock || product.stock <= 0) {
      this.error.set(`"${product.name}" no tiene stock disponible.`);
      return;
    }

    this.error.set(null);
    const current = this.cart();
    const index = current.findIndex(i => i.product.id === product.id);

    if (index >= 0) {
      const item = current[index];
      if (item.quantity + 1 > product.stock) {
        this.error.set(`Stock máximo alcanzado para "${product.name}" (${product.stock} unids).`);
        return;
      }
      this.updateQuantity(index, item.quantity + 1);
    } else {
      this.cart.update(items => [
        ...items,
        { product, quantity: 1, unitPrice: product.salePrice, subtotal: product.salePrice }
      ]);
    }
  }

  updateQuantity(index: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(index);
      return;
    }

    const item = this.cart()[index];
    if (quantity > item.product.stock) {
      this.error.set(`Stock máximo de "${item.product.name}": ${item.product.stock}.`);
      return;
    }

    this.error.set(null);
    this.cart.update(items =>
      items.map((it, idx) =>
        idx === index
          ? { ...it, quantity, subtotal: quantity * it.unitPrice }
          : it
      )
    );
  }

  removeFromCart(index: number): void {
    this.error.set(null);
    this.cart.update(items => items.filter((_, i) => i !== index));
  }

  clear(): void {
    this.cart.set([]);
    this.selectedCustomer.set(null);
    this.paymentType.set(SalePaymentType.Efectivo);
    this.error.set(null);
  }
}