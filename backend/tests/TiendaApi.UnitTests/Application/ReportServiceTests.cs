// tests/TiendaApi.UnitTests/Application/ReportServiceTests.cs
using FluentAssertions;
using Moq;
using TiendaApi.Application.Features.Reports;
using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.UnitTests.Helpers;

namespace TiendaApi.UnitTests.Application;

public class ReportServiceTests
{
    private readonly MockUnitOfWork _mockUow;
    private readonly ReportService _reportService;

    public ReportServiceTests()
    {
        _mockUow = new MockUnitOfWork();
        _reportService = new ReportService(_mockUow.Object);
    }

    // ─── Dashboard ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetDashboardAsync_ShouldReturnCorrectCounts()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;

        _mockUow.Sales
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
                It.IsAny<Guid?>(), It.IsAny<Guid?>(),
                It.IsAny<Guid?>(), It.IsAny<SaleStatus?>()))
            .ReturnsAsync(new PagedResult<Sale>([], 3, 1, int.MaxValue));

        _mockUow.Products
            .Setup(r => r.GetLowStockProductsAsync())
            .ReturnsAsync(new List<Product>());

        _mockUow.Alerts
            .Setup(r => r.GetUnreadAsync())
            .ReturnsAsync(new List<Alert>());

        _mockUow.Customers
            .Setup(r => r.GetCustomersWithDebtAsync())
            .ReturnsAsync(new List<Customer>());

        _mockUow.Purchases
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                It.IsAny<Guid?>(), It.IsAny<PurchaseStatus?>(),
                It.IsAny<DateTime?>(), It.IsAny<DateTime?>()))
            .ReturnsAsync(new PagedResult<Purchase>([], 2, 1, 1));

        // Act
        var result = await _reportService.GetDashboardAsync();

        // Assert
        result.Should().NotBeNull();
        result.TodaySalesCount.Should().Be(3);
        result.PendingPurchasesCount.Should().Be(2);
        result.LowStockCount.Should().Be(0);
        result.UnreadAlertsCount.Should().Be(0);
    }

    // ─── SalesSummary ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetSalesSummaryAsync_ShouldGroupByDayCorrectly()
    {
        // Arrange
        var from = new DateTime(2024, 1, 1);
        var to = new DateTime(2024, 1, 31);

        var sale1 = Sale.Create(Guid.NewGuid(), SalePaymentType.Efectivo, cashRegisterId: Guid.NewGuid());
        sale1.AddDetails([(Guid.NewGuid(), 2, 5.00m)]);

        var sale2 = Sale.Create(Guid.NewGuid(), SalePaymentType.Tarjeta, cashRegisterId: Guid.NewGuid());
        sale2.AddDetails([(Guid.NewGuid(), 1, 20.00m)]);

        _mockUow.Sales
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                from, to,
                It.IsAny<Guid?>(), It.IsAny<Guid?>(),
                It.IsAny<Guid?>(), It.IsAny<SaleStatus?>()))
            .ReturnsAsync(new PagedResult<Sale>(
                [sale1, sale2], 2, 1, int.MaxValue));

        // Act
        var result = await _reportService.GetSalesSummaryAsync(from, to);

        // Assert
        result.TotalSales.Should().Be(2);
        result.CancelledSales.Should().Be(0);
        result.TotalRevenue.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetSalesSummaryAsync_CancelledSalesShouldNotCountInRevenue()
    {
        // Arrange
        var from = DateTime.UtcNow.AddDays(-7);
        var to = DateTime.UtcNow;

        var activeSale = Sale.Create(Guid.NewGuid(), SalePaymentType.Efectivo, cashRegisterId: Guid.NewGuid());
        activeSale.AddDetails([(Guid.NewGuid(), 1, 100.00m)]);

        var cancelledSale = Sale.Create(Guid.NewGuid(), SalePaymentType.Efectivo, cashRegisterId: Guid.NewGuid());
        cancelledSale.AddDetails([(Guid.NewGuid(), 1, 50.00m)]);
        cancelledSale.Cancel();

        _mockUow.Sales
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
                It.IsAny<Guid?>(), It.IsAny<Guid?>(),
                It.IsAny<Guid?>(), It.IsAny<SaleStatus?>()))
            .ReturnsAsync(new PagedResult<Sale>(
                [activeSale, cancelledSale], 2, 1, int.MaxValue));

        // Act
        var result = await _reportService.GetSalesSummaryAsync(from, to);

        // Assert
        result.TotalSales.Should().Be(1);       // solo la activa
        result.CancelledSales.Should().Be(1);   // la cancelada
        result.TotalRevenue.Should().Be(activeSale.Total);
    }

    // ─── StockValuation ───────────────────────────────────────────────────────

    [Fact]
    public async Task GetStockValuationAsync_ShouldCalculateTotalsCorrectly()
    {
        // Arrange — 2 productos con stock
        var product1 = Product.Create(
            "Coca Cola", "BEB-COC-0001", 1.50m, 2.50m, 10, Guid.NewGuid(),
            Guid.NewGuid(), 10);

        var product2 = Product.Create(
            "Agua", "BEB-AGU-0001", 0.50m, 1.00m, 20, Guid.NewGuid(),
            Guid.NewGuid(), 20);

        _mockUow.Products
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                It.IsAny<string?>(), It.IsAny<Guid?>(),
                It.IsAny<Guid?>(), It.IsAny<bool?>(),
                It.IsAny<bool?>()))
            .ReturnsAsync(new PagedResultWithStatus<Product>(
                [product1, product2], 2, 1, int.MaxValue, 2, 0));

        // Act
        var result = await _reportService.GetStockValuationAsync();

        // Assert
        result.TotalProducts.Should().Be(2);

        // Coca Cola: 10 * 1.50 = 15 costo, 10 * 2.50 = 25 venta
        // Agua: 20 * 0.50 = 10 costo, 20 * 1.00 = 20 venta
        result.TotalCostValue.Should().Be(25.00m);
        result.TotalSaleValue.Should().Be(45.00m);
        result.PotentialProfit.Should().Be(20.00m);
    }

    // ─── CustomerDebtReport ───────────────────────────────────────────────────

    [Fact]
    public async Task GetCustomerDebtReportAsync_ShouldCalculateAverageDebt()
    {
        // Arrange
        var customer1 = Customer.Create("Juan", null, null, 500);
        customer1.AddDebt(200);

        var customer2 = Customer.Create("María", null, null, 0);
        customer2.AddDebt(400);

        _mockUow.Customers
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                It.IsAny<string?>(), It.IsAny<bool?>(),
                It.IsAny<bool?>()))
            .ReturnsAsync(new PagedResultWithStatus<Customer>(
                [customer1, customer2], 2, 1, int.MaxValue, 2, 0));

        // Act
        var result = await _reportService.GetCustomerDebtReportAsync();

        // Assert
        result.CustomersWithDebt.Should().Be(2);
        result.TotalDebt.Should().Be(600);
        result.AverageDebt.Should().Be(300);

        // Verificar el porcentaje de deuda
        var juan = result.Items.First(i => i.FullName == "Juan");
        juan.DebtPercent.Should().Be(40); // 200/500 = 40%

        var maria = result.Items.First(i => i.FullName == "María");
        maria.DebtPercent.Should().Be(0); // sin límite → 0%
    }

    [Fact]
    public async Task GetCustomerDebtReportAsync_ShouldOrderByDebtDescending()
    {
        // Arrange
        var customerSmall = Customer.Create("Juan", null, null, 0);
        customerSmall.AddDebt(100);

        var customerLarge = Customer.Create("María", null, null, 0);
        customerLarge.AddDebt(500);

        _mockUow.Customers
            .Setup(r => r.GetPagedAsync(
                It.IsAny<int>(), It.IsAny<int>(),
                It.IsAny<string?>(), It.IsAny<bool?>(),
                It.IsAny<bool?>()))
            .ReturnsAsync(new PagedResultWithStatus<Customer>(
                [customerSmall, customerLarge], 2, 1, int.MaxValue, 2, 0));

        // Act
        var result = await _reportService.GetCustomerDebtReportAsync();

        // Assert — María primero porque debe más
        result.Items[0].FullName.Should().Be("María");
        result.Items[1].FullName.Should().Be("Juan");
    }
}