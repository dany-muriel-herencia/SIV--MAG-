export interface DashboardData {
  todaySalesCount: number;
  todayRevenue: number;
  lowStockCount: number;
  outOfStockCount: number;
  unreadAlertsCount: number;
  customersWithDebtCount: number;
  totalDebt: number;
  pendingPurchasesCount: number;
}

export interface DailySaleDto {
  date: string;
  salesCount: number;
  revenue: number;
}

export interface SalesSummary {
  from: string;
  to: string;
  totalSales: number;
  cancelledSales: number;
  totalRevenue: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalCredit: number;
  averageTicket: number;
  dailySales: DailySaleDto[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  productSKU: string;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface StockValuationItemDto {
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  stock: number;
  purchasePrice: number;
  salePrice: number;
  costValue: number;
  saleValue: number;
  marginPercent: number;
}

export interface StockValuationDto {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCostValue: number;
  totalSaleValue: number;
  potentialProfit: number;
  items: StockValuationItemDto[];
}

export interface CustomerDebtItemDto {
  customerId: string;
  fullName: string;
  phone?: string;
  currentDebt: number;
  creditLimit: number;
  availableCredit?: number;
  debtPercent: number;
}

export interface CustomerDebtReportDto {
  totalCustomers: number;
  customersWithDebt: number;
  totalDebt: number;
  averageDebt: number;
  items: CustomerDebtItemDto[];
}