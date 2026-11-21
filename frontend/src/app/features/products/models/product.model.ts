export interface Product {
  id: string;
  name: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  margin: number;
  marginPercent: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  categoryId: string;
  categoryName: string;
  supplierId?: string;
  supplierName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  purchasePrice: number;
  salePrice: number;
  initialStock: number;
  minStock: number;
  categoryId: string;
  supplierId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  categoryId?: string;
  supplierId?: string;
}