using TiendaApi.Domain.Enums;

namespace TiendaApi.Application.Features.Purchases.Request;

public record CreatePurchaseRequest(
    Guid? SupplierId,
    PurchasePaymentType PaymentType,
    string? InvoiceNumber,
    List<CreatePurchaseItemRequest> Items
);

public record CreatePurchaseItemRequest(
    Guid? ProductId,
    CreateInlineProductRequest? NewProduct,
    int Quantity,
    decimal UnitCost
);

public record CreateInlineProductRequest(
    string Name,
    Guid CategoryId,
    decimal SalePrice,
    int MinStock = 5 // Mantiene el valor por defecto
);