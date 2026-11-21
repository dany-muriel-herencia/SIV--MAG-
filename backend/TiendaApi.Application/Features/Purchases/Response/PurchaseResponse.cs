using TiendaApi.Domain.Enums;

namespace TiendaApi.Application.Features.Purchases.Response;

public record PurchaseResponse(
    Guid Id,
    DateTime Date,
    PurchaseStatus Status,
    PurchasePaymentType PaymentType,
    decimal Subtotal,
    decimal Total,
    decimal IGV,
    string? InvoiceNumber,
    Guid? SupplierId,
    string? SupplierName,
    Guid UserId,
    string UserFullName,
    List<PurchaseDetailResponse> Details,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record PurchaseDetailResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string ProductSKU,
    int OrderedQuantity,
    decimal ExpectedUnitCost,
    int? ReceivedQuantity,
    decimal? ActualUnitCost,
    decimal Subtotal,
    bool HasDiscrepancy
);

public record PurchaseSummaryResponse(
    Guid Id,
    DateTime Date,
    PurchaseStatus Status,
    PurchasePaymentType PaymentType,
    decimal Total,
    string? InvoiceNumber,
    string? SupplierName,
    string UserFullName,
    bool HasDiscrepancy
);