
using TiendaApi.Application.Features.CreditPayments.Request;
using TiendaApi.Application.Features.CreditPayments.Response;
using TiendaApi.Domain.Common;

namespace TiendaApi.Application.Interfaces.Services;

public interface ICreditPaymentService
{
    // Mutaciones (Commands)
    Task<CreditPaymentResponse> ProcessPaymentAsync(CreateCreditPaymentRequest request, Guid userId);
    Task CancelPaymentAsync(Guid paymentId, CancelCreditPaymentRequest request, Guid userId);

    // Lecturas (Queries)
    Task<PagedResult<CreditPaymentResponse>> GetPagedAsync(
        int page, int pageSize, Guid? customerId = null, 
        Guid? cashRegisterId = null, DateTime? from = null, DateTime? to = null);
    Task<CreditPaymentResponse> GetByIdAsync(Guid id);
}