export enum MovementType {
  CompraProveedor = 1,
  AjustePositivo = 2,
  Venta = 3,
  AjusteNegativo = 4,
  DevolucionVenta = 5,
  DevolucionCompra = 6,
}

export interface StockMovement {
  id: string;
  date: string;
  type: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  productId: string;
  productName: string;
  productSKU: string;
  userId: string;
  userFullName: string;
  createdAt: string;
}

export interface ManualAdjustmentRequest {
  productId: string;
  quantity: number;
  isPositive: boolean;
  reason: string;
}
