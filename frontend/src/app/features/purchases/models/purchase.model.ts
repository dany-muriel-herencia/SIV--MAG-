import { Product } from "../../products/models/product.model";

export enum PurchaseStatus {
  Pendiente = 1,
  RecibidaConforme = 2,
  RecibidaConDiferencia = 3,
  Cancelada = 4,
}

export enum PurchasePayment {
  Contado = 1,
  Credito = 2,
}

// Response de Compra
export interface PurchaseSummary {
  id: string;
  date: string;
  status: PurchaseStatus;
  paymentType: PurchasePayment;
  total: number;
  invoiceNumber: string;
  supplierName: string;
  userFullName: string;
  hasDiscrepancy: boolean;
}

export interface Purchase extends PurchaseSummary {
  subtotal: number;
  igv: number;
  supplierId: string;
  userId: string;
  details: PurchaseDetailResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseDetailResponse {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  orderedQuantity: number;
  expectedUnitCost: number;
  receivedQuantity?: number;
  actualUnitCost?: number;
  subtotal: number;
}

// Crear Compra Request

export interface CreateInlineProductRequest {
  name: string;
  categoryId: string;
  salePrice: number;
  minStock: number;
}

export interface CreatePurchaseItemRequest {
  productId?: string;
  newProduct?: CreateInlineProductRequest;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseRequest {
  supplierId?: string;
  paymentType: PurchasePayment;
  invoiceNumber?: string;
  items: CreatePurchaseItemRequest[];
}

// Recibir Compra Request

export interface ReceivePurchaseRequest {
  invoiceNumber?: string;
  items: ReceivePurchaseItem[];
}

export interface ReceivePurchaseItem {
  productId: string;
  receivedQuantity: number;
  actualUnitCost: number;
}

// Helpers
export interface PurchaseCartItem {
  product: Product;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export const PURCHASE_STATUS_BADGE: Record<number, { label: string; class: string }> = {
  [PurchaseStatus.Pendiente]: {
    label: 'Pendiente',
    class: 'bg-amber-50 text-amber-700 border-amber-200/60',
  },
  [PurchaseStatus.RecibidaConforme]: {
    label: 'Recibida Conforme',
    class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  },
  [PurchaseStatus.RecibidaConDiferencia]: {
    label: 'Recibida con Diferencia',
    class: 'bg-blue-50 text-blue-700 border-blue-200/60',
  },
  [PurchaseStatus.Cancelada]: {
    label: 'Cancelada',
    class: 'bg-red-50 text-red-600 border-red-200/60',
  },
};

export const PURCHASE_PAYMENT_LABELS: Record<number, string> = {
  [PurchasePayment.Contado]: 'Contado',
  [PurchasePayment.Credito]: 'Crédito',
};
