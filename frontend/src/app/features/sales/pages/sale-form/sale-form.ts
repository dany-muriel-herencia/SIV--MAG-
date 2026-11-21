import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { SaleCartService } from '../../services/sale-cart.service';
import { SalePaymentType, CreateSaleRequest } from '../../models/sale.model';
import { useCreateSaleMutation } from '../../queries/sales.queries';
import { extractErrorMessage } from '../../../../shared/utils/error';
import { SaleProductSearch } from './components/sale-product-search/sale-product-search';
import { SaleCartTable } from './components/sale-cart-table/sale-cart-table';
import { SaleCustomerSearch } from './components/sale-customer-search/sale-customer-search';
import { SalePaymentSummary } from './components/sale-payment-summary/sale-payment-summary';
import { Product } from '../../../products/models/product.model';
import { Customer } from '../../../customers/models/customer.model';

@Component({
  selector: 'app-sale-form',
  imports: [
    SaleProductSearch,
    SaleCartTable,
    SaleCustomerSearch,
    SalePaymentSummary,
  ],
  templateUrl: './sale-form.html',
})
export class SaleForm {
  readonly cartService = inject(SaleCartService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  private readonly createSaleMutation = useCreateSaleMutation();

  readonly isSaving = computed(() => this.createSaleMutation.isPending());

  readonly errorMessage = computed(() => {
    const mutErr = this.createSaleMutation.error();
    if (mutErr) {
      return extractErrorMessage(mutErr, 'Error al registrar la venta.');
    }
    return this.cartService.error();
  });

  onProductSelected(product: Product): void {
    this.cartService.addToCart(product);
  }

  onUpdateQuantity(event: { index: number; quantity: number }): void {
    this.cartService.updateQuantity(event.index, event.quantity);
  }

  onRemoveItem(index: number): void {
    this.cartService.removeFromCart(index);
  }

  onClearCart(): void {
    this.cartService.clear();
  }

  onCustomerSelected(customer: Customer): void {
    this.cartService.selectedCustomer.set(customer);
  }

  onCustomerCleared(): void {
    this.cartService.selectedCustomer.set(null);
    if (this.cartService.paymentType() === SalePaymentType.Fiado) {
      this.cartService.paymentType.set(SalePaymentType.Efectivo);
    }
  }

  onPaymentTypeChange(paymentType: SalePaymentType): void {
    this.cartService.paymentType.set(paymentType);
  }

  onSubmit(): void {
    if (!this.cartService.isFormValid() || this.isSaving()) return;

    const request: CreateSaleRequest = {
      customerId: this.cartService.selectedCustomer()?.id,
      paymentType: this.cartService.paymentType(),
      items: this.cartService.cart().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    this.createSaleMutation.mutate(request, {
      onSuccess: (sale) => {
        this.cartService.clear();
        this.router.navigate(['/sales', sale.id]);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }
}
