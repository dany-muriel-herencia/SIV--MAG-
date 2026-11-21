using TiendaApi.Application.Features.Reports.Response;
using TiendaApi.Application.Interfaces.Services;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Interfaces;

namespace TiendaApi.Application.Features.Reports;

public class ReportService(IUnitOfWork _uow) : IReportService
{

    // ─── Dashboard ────────────────────────────────────────────────────────────

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        // Ejecución secuencial de consultas
        var todaySales = await _uow.Sales.GetPagedAsync(
            page: 1,
            pageSize: int.MaxValue,
            from: today,
            to: tomorrow,
            status: SaleStatus.Completada);

        var lowStockProducts = await _uow.Products.GetLowStockProductsAsync();
        var unreadAlerts = await _uow.Alerts.GetUnreadAsync();
        var customersWithDebt = await _uow.Customers.GetCustomersWithDebtAsync();
        var pendingPurchases = await _uow.Purchases.GetPagedAsync(
            page: 1,
            pageSize: 1,
            status: PurchaseStatus.Pendiente);

        return new DashboardDto
        {
            TodaySalesCount = todaySales.TotalCount,
            TodayRevenue = todaySales.Items.Sum(s => s.Total),
            LowStockCount = lowStockProducts.Count(p => !p.IsOutOfStock()),
            OutOfStockCount = lowStockProducts.Count(p => p.IsOutOfStock()),
            UnreadAlertsCount = unreadAlerts.Count,
            CustomersWithDebtCount = customersWithDebt.Count,
            TotalDebt = customersWithDebt.Sum(c => c.CurrentDebt),
            PendingPurchasesCount = pendingPurchases.TotalCount
        };
    }

    // ─── Resumen de ventas ────────────────────────────────────────────────────

    public async Task<SalesSummaryDto> GetSalesSummaryAsync(
        DateTime from, DateTime to)
    {
        var result = await _uow.Sales.GetPagedAsync(
            page: 1,
            pageSize: int.MaxValue,
            from: from,
            to: to);

        var allSales = result.Items.ToList();

        var activeSales = allSales
            .Where(s => s.Status != SaleStatus.Cancelada)
            .ToList();

        // Agrupar por día
        var dailySales = activeSales
            .GroupBy(s => s.Date.Date)
            .Select(g => new DailySaleDto
            {
                Date = g.Key,
                SalesCount = g.Count(),
                Revenue = g.Sum(s => s.Total)
            })
            .OrderBy(d => d.Date)
            .ToList();

        var totalRevenue = activeSales.Sum(s => s.Total);
        var totalCount = activeSales.Count;

        return new SalesSummaryDto
        {
            From = from,
            To = to,
            TotalSales = totalCount,
            CancelledSales = allSales.Count - totalCount,
            TotalRevenue = totalRevenue,
            TotalCash = activeSales
                .Where(s => s.PaymentType == SalePaymentType.Efectivo)
                .Sum(s => s.Total),
            TotalCard = activeSales
                .Where(s => s.PaymentType == SalePaymentType.Tarjeta)
                .Sum(s => s.Total),
            TotalTransfer = activeSales
                .Where(s => s.PaymentType == SalePaymentType.Transferencia)
                .Sum(s => s.Total),
            TotalCredit = activeSales
                .Where(s => s.PaymentType == SalePaymentType.Fiado)
                .Sum(s => s.Total),
            AverageTicket = totalCount > 0
                ? Math.Round(totalRevenue / totalCount, 2)
                : 0,
            DailySales = dailySales
        };
    }

    // ─── Top productos ────────────────────────────────────────────────────────

    public async Task<IReadOnlyCollection<TopProductDto>> GetTopProductsAsync(
    DateTime from, DateTime to, int limit = 10)
    {
        // Una sola query con todos los detalles
        var sales = await _uow.Sales
            .GetWithDetailsByDateRangeAsync(from, to);

        var topProducts = sales
            .SelectMany(s => s.Details)
            .GroupBy(d => d.ProductId)
            .Select(g => new TopProductDto
            {
                ProductId = g.Key,
                ProductName = g.First().Product?.Name ?? string.Empty,
                ProductSKU = g.First().Product?.SKU ?? string.Empty,
                CategoryName = g.First().Product?.Category?.Name ?? string.Empty,
                TotalQuantitySold = g.Sum(d => d.Quantity),
                TotalRevenue = g.Sum(d => d.Subtotal),
                AveragePrice = Math.Round(g.Average(d => d.UnitPrice), 2)
            })
            .OrderByDescending(p => p.TotalQuantitySold)
            .Take(limit)
            .ToList();

        return topProducts;
    }

    // ─── Valorización de stock ────────────────────────────────────────────────

    public async Task<StockValuationDto> GetStockValuationAsync()
    {
        var products = await _uow.Products.GetPagedAsync(
            page: 1,
            pageSize: int.MaxValue,
            isActive: true);

        var items = products.Items.Select(p => new StockValuationItemDto
        {
            ProductId = p.Id,
            ProductName = p.Name,
            SKU = p.SKU,
            CategoryName = p.Category?.Name ?? string.Empty,
            Stock = p.Stock,
            PurchasePrice = p.PurchasePrice,
            SalePrice = p.SalePrice,
            CostValue = p.Stock * p.PurchasePrice,
            SaleValue = p.Stock * p.SalePrice,
            MarginPercent = p.GetMarginPercent()
        }).ToList();

        var totalCostValue = items.Sum(i => i.CostValue);
        var totalSaleValue = items.Sum(i => i.SaleValue);

        return new StockValuationDto
        {
            TotalProducts = items.Count,
            ActiveProducts = items.Count(i => i.Stock > 0),
            LowStockProducts = products.Items
                .Count(p => p.IsLowStock() && !p.IsOutOfStock()),
            OutOfStockProducts = products.Items
                .Count(p => p.IsOutOfStock()),
            TotalCostValue = totalCostValue,
            TotalSaleValue = totalSaleValue,
            PotentialProfit = totalSaleValue - totalCostValue,
            Items = items
                .OrderBy(i => i.CategoryName)
                .ThenBy(i => i.ProductName)
                .ToList()
        };
    }

    // ─── Reporte de deuda ─────────────────────────────────────────────────────

    public async Task<CustomerDebtReportDto> GetCustomerDebtReportAsync()
    {
        var allCustomers = await _uow.Customers.GetPagedAsync(
            page: 1,
            pageSize: int.MaxValue,
            isActive: true);

        var customersWithDebt = allCustomers.Items
            .Where(c => c.HasDebt())
            .ToList();

        var totalDebt = customersWithDebt.Sum(c => c.CurrentDebt);

        var items = customersWithDebt
            .Select(c => new CustomerDebtItemDto
            {
                CustomerId = c.Id,
                FullName = c.FullName,
                Phone = c.Phone,
                CurrentDebt = c.CurrentDebt,
                CreditLimit = c.CreditLimit,
                AvailableCredit = c.GetAvailableCredit(),
                DebtPercent = c.CreditLimit > 0
                    ? Math.Round(c.CurrentDebt / c.CreditLimit * 100, 1)
                    : 0
            })
            .OrderByDescending(c => c.CurrentDebt)
            .ToList();

        return new CustomerDebtReportDto
        {
            TotalCustomers = allCustomers.TotalCount,
            CustomersWithDebt = customersWithDebt.Count,
            TotalDebt = totalDebt,
            AverageDebt = customersWithDebt.Count > 0
                ? Math.Round(totalDebt / customersWithDebt.Count, 2)
                : 0,
            Items = items
        };
    }
}