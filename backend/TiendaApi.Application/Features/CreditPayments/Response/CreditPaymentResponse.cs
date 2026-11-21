using TiendaApi.Domain.Enums;

namespace TiendaApi.Application.Features.CreditPayments.Response;

public record CreditPaymentResponse
(
    Guid Id,
    DateTime Date,
    decimal Amount,
    SalePaymentType PaymentType,
    string? Notes,
    bool IsCancelled,
    DateTime? CancelledAt,
    string? CancellationReason,
    // Datos relacionales aplanados para la UI
    Guid CustomerId,
    string CustomerFullName,

    Guid UserId,
    string UserFullName,
    Guid CashRegisterId,
    DateTime CreatedAt
);