using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;

namespace TiendaApi.Domain.Interfaces.Repositories;
public interface ISaleRepository : IGenericRepository<Sale>
{
    Task<Sale?> GetWithDetailsAsync(Guid id);
    Task<PagedResult<Sale>> GetPagedAsync(
        int page, int pageSize,
        DateTime? from = null,
        DateTime? to = null,
        Guid? customerId = null,
        Guid? userId = null,
        Guid? cashRegisterId = null,
        SaleStatus? status = null);
    Task<decimal> GetTotalByDateRangeAsync(DateTime from, DateTime to);
    Task<IReadOnlyCollection<Sale>> GetWithDetailsByDateRangeAsync(
        DateTime from, DateTime to, bool includeCancelled = false);
}