namespace TiendaApi.Application.Features.Purchases.Request;

public record ReceivePurchaseRequest
(
    // Permite actualizar el número de factura al recibir
    // si no se tenía al crear la compra
    string? InvoiceNumber,

    // Permite ajustar los costos reales al recibir
    // por si hubo cambio de precio respecto a lo pactado
    List<ReceivePurchaseItemRequest> Items 
);

public record ReceivePurchaseItemRequest
(
    Guid ProductId,
    int ReceivedQuantity,
    decimal ActualUnitCost
);