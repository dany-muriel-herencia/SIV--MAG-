using TiendaApi.Domain.Enums;

namespace TiendaApi.Application.Features.Sales.Request;

public record CreateSaleRequest(
    SalePaymentType PaymentType,
    Guid? CustomerId,
    List<SaleItemRequest> Items
    
);
public record SaleItemRequest(
    Guid ProductId,
    int Quantity
);