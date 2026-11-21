import { Product } from "../../products/models/product.model";

export enum SalePaymentType {
    Efectivo = 1,
    Tarjeta = 2,
    Transferencia = 3,
    Fiado = 4        // Genera deuda en el cliente
}


export enum SaleStatus {
  Completada = 1,
  Cancelada = 2
}

export interface SaleSummary {
  id: string;
  ticketNumber: string;
  date: string;
  status: SaleStatus;
  paymentType: SalePaymentType;
  total: number;
  customerName?: string;
  userFullName: string;
}

export interface Sale extends SaleSummary {
  subtotal: number;
  igv: number;
  total: number;
  customerId?: string;
  userId: string;
  details: SaleDetail[];
  createdAt: string;
}

export interface SaleDetail {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleRequest {
  paymentType: SalePaymentType;
  customerId?: string;
  items: SaleItem[];
}

export interface SaleItem {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}