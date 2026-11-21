import { Component, computed, inject, input, signal } from '@angular/core'; 
import { Router } from '@angular/router'; 
import { PurchaseStatus, ReceivePurchaseRequest } from '../../models/purchase.model'; 
import { ReceivePurchaseModal } from './components/receive-purchase-modal/receive-purchase-modal'; 
import { ConfirmCancelModal } from './components/confirm-cancel-modal/confirm-cancel-modal'; 
import { PurchaseDetailTableComponent } from './components/purchase-detail-table/purchase-detail-table'; 
import { AuthService } from '../../../../core/auth/auth.service'; 
import { useCancelPurchaseMutation, usePurchaseByIdQuery, useReceivePurchaseMutation } from '../../queries/purchase.queries'; 

@Component({
  selector: 'app-purchase-detail',
  imports: [ReceivePurchaseModal, ConfirmCancelModal, PurchaseDetailTableComponent],
  templateUrl: './purchase-detail.html',
})
export class PurchaseDetail {
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin;
  
  PurchaseStatus = PurchaseStatus;
  
  // 1. El input se define como señal reactiva
  id = input.required<string>(); 

  // 2. Pasamos la señal completa o una función que la evalúe 
  // para que TanStack Query sea reactivo al cambio de ID
  private readonly purchaseQuery = usePurchaseByIdQuery(this.id);
  protected readonly receiveMutation = useReceivePurchaseMutation(this.id);
  protected readonly cancelMutation = useCancelPurchaseMutation(this.id);

  // Computed State
  purchase = computed(() => this.purchaseQuery.data() ?? null);
  isLoading = computed(() => this.purchaseQuery.isLoading());
  
  isPending = computed(() => {
    const status = this.purchase()?.status;
    return status === PurchaseStatus.Pendiente;
  });
  
  error = computed(() => this.extractError(this.purchaseQuery.error()));
  actionError = computed(() => 
    this.extractError(this.receiveMutation.error()) || 
    this.extractError(this.cancelMutation.error())
  );

  // UI State
  showConfirmCancel = signal(false);
  showReceiveModal = signal(false);

  // Handlers
  handleReceive(request: ReceivePurchaseRequest): void {
    this.receiveMutation.mutate(request);
    this.showReceiveModal.set(false);
  }

  handleCancel(): void {
    this.cancelMutation.mutate();
    this.showConfirmCancel.set(false);
  }

  goBack(): void {
    this.router.navigate(['/purchases']);
  }

  private extractError(err: unknown): string | null {
    if (!err) return null;
    return (
      (err as any)?.error?.message || 
      (err as any)?.message || 
      'Ha ocurrido un error inesperado.'
    );
  }
}
