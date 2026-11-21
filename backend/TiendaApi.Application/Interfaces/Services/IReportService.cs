using TiendaApi.Application.Features.Reports.Response;

namespace TiendaApi.Application.Interfaces.Services;

public interface IReportService
{
    Task<DashboardDto> GetDashboardAsync();
    Task<SalesSummaryDto> GetSalesSummaryAsync(DateTime from, DateTime to);
    Task<IReadOnlyCollection<TopProductDto>> GetTopProductsAsync(
        DateTime from, DateTime to, int limit = 10);
    Task<StockValuationDto> GetStockValuationAsync();
    Task<CustomerDebtReportDto> GetCustomerDebtReportAsync();
}