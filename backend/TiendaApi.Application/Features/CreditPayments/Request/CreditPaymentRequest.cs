using TiendaApi.Domain.Enums;
namespace TiendaApi.Application.Features.CreditPayments.Request;

public record CreateCreditPaymentRequest(
    Guid CustomerId,
    decimal Amount,
    SalePaymentType PaymentType,
    string? Notes
   
);

public record CancelCreditPaymentRequest(
    string Reason
);
