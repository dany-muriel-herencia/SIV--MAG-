import { Injectable, computed, signal } from '@angular/core';
import { PurchaseCartItem } from './../models/purchase.model';
import { Product } from '../../products/models/product.model';

/**
 * Estado del carrito de una orden de compra en construcción.
 *
 * Centraliza la lógica de agregar/actualizar/eliminar ítems y el cálculo de
 * totales, de modo que el formulario de compra solo orquesta la UI y el envío.
 *
 * Se provee a nivel de componente (`PurchaseForm`) para que el carrito se
 * reinicie automáticamente al entrar a una nueva orden y no persista ítems
 * de órdenes abandonadas.
 */
@Injectable()
export class PurchaseCartService {
  readonly items = signal<PurchaseCartItem[]>([]);

  /** Total monetario de la orden en construcción. */
  readonly total = computed(() => this.items().reduce((acc, item) => acc + item.subtotal, 0));

  /**
   * Agrega un producto al carrito. Si ya existe, incrementa su cantidad en 1.
   * Devuelve `true` si se agregó/incrementó un producto con costo unitario 0
   * (para que la UI pueda advertir al usuario).
   */
  addProduct(product: Product): { added: boolean; zeroCostAdded: boolean } {
    const existing = this.items().find((i) => i.product.id === product.id);

    if (existing) {
      this.updateQuantity(product.id, existing.quantity + 1);
      return { added: true, zeroCostAdded: existing.unitCost === 0 };
    }

    const unitCost = product.purchasePrice ?? 0;
    this.items.update((cart) => [...cart, { product, quantity: 1, unitCost, subtotal: unitCost }]);

    return { added: true, zeroCostAdded: unitCost === 0 };
  }

  updateQuantity(productId: string, qty: number): void {
    const quantity = Number(qty);
    if (!Number.isFinite(quantity) || quantity < 1) return;

    this.items.update((cart) =>
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity, subtotal: quantity * item.unitCost }
          : item,
      ),
    );
  }

  updateUnitCost(productId: string, cost: number): void {
    const unitCost = Number(cost);
    if (!Number.isFinite(unitCost) || unitCost < 0) return;

    this.items.update((cart) =>
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, unitCost, subtotal: item.quantity * unitCost }
          : item,
      ),
    );
  }

  removeItem(productId: string): void {
    this.items.update((cart) => cart.filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this.items.set([]);
  }
}
