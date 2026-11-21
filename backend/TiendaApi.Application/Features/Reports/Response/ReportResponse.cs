namespace TiendaApi.Application.Features.Reports.Response;

public class DashboardDto
{
    public int TodaySalesCount { get; set; }
    public decimal TodayRevenue { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public int UnreadAlertsCount { get; set; }
    public int CustomersWithDebtCount { get; set; }
    public decimal TotalDebt { get; set; }
    public int PendingPurchasesCount { get; set; }
}

public class SalesSummaryDto
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public int TotalSales { get; set; }
    public int CancelledSales { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public decimal TotalTransfer { get; set; }
    public decimal TotalCredit { get; set; }
    public decimal AverageTicket { get; set; }
    public List<DailySaleDto> DailySales { get; set; } = [];
}

public class DailySaleDto
{
    public DateTime Date { get; set; }
    public int SalesCount { get; set; }
    public decimal Revenue { get; set; }
}

public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSKU { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal AveragePrice { get; set; }
}

public class StockValuationDto
{
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int LowStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
    public decimal TotalCostValue { get; set; }
    public decimal TotalSaleValue { get; set; }
    public decimal PotentialProfit { get; set; }
    public List<StockValuationItemDto> Items { get; set; } = [];
}

public class StockValuationItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int Stock { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public decimal CostValue { get; set; }
    public decimal SaleValue { get; set; }
    public decimal MarginPercent { get; set; }
}

public class CustomerDebtReportDto
{
    public int TotalCustomers { get; set; }
    public int CustomersWithDebt { get; set; }
    public decimal TotalDebt { get; set; }
    public decimal AverageDebt { get; set; }
    public List<CustomerDebtItemDto> Items { get; set; } = [];
}

public class CustomerDebtItemDto
{
    public Guid CustomerId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal CurrentDebt { get; set; }
    public decimal CreditLimit { get; set; }
    public decimal? AvailableCredit { get; set; }
    public decimal DebtPercent { get; set; }
}