using TiendaApi.Domain.Common;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.Domain.Entities;
public class Purchase : BaseEntity
{
    public DateTime Date { get; private set; } = DateTime.UtcNow;
    public PurchaseStatus Status { get; private set; } = PurchaseStatus.Pendiente;
    public PurchasePaymentType PaymentType { get; private set; }
    public decimal Subtotal { get; private set; }
    public decimal IGV { get; private set; }
    public decimal Total { get; private set; }
    public string? InvoiceNumber { get; private set; }
    // FK
    public Guid? SupplierId { get; private set; }
    public Guid UserId { get; private set; }

    // Navegación
    public Supplier? Supplier { get; private set; }
    public User User { get; private set; } = null!;
    public ICollection<PurchaseDetail> Details { get; private set; } = [];

    private Purchase() { }
    public static Purchase Create(
        Guid? supplierId,
        Guid userId,
        PurchasePaymentType paymentType,
        string? invoiceNumber = null)
    {
        if (userId == Guid.Empty)
            throw new DomainException("El usuario es obligatorio.");

        return new Purchase(supplierId, userId, paymentType, invoiceNumber);
    }

    private Purchase(
        Guid? supplierId,
        Guid userId,
        PurchasePaymentType paymentType,
        string? invoiceNumber)
    {
        SupplierId = supplierId;
        UserId = userId;
        PaymentType = paymentType;
        InvoiceNumber = invoiceNumber?.Trim();

        // Estado inicial por defecto de toda nueva compra
        Status = PurchaseStatus.Pendiente;
        Date = DateTime.UtcNow;
        Details = new List<PurchaseDetail>();

        // Valores monetarios iniciales en cero
        Subtotal = 0;
        IGV = 0;
        Total = 0;
    }


    // Predicados de estado
    public bool IsPending() => Status == PurchaseStatus.Pendiente;
    public bool IsReceived() => Status == PurchaseStatus.RecibidaConforme || Status == PurchaseStatus.RecibidaConDiferencia;
    public bool IsCancelled() => Status == PurchaseStatus.Cancelada;
    public bool CanBeReceived() => IsPending();
    public bool CanBeCancelled() => IsPending();


    public void AddDetails(IEnumerable<(Guid ProductId, int Quantity, decimal UnitPrice)> items)
    {
        if (IsCancelled())
            throw new InvalidEntityStateException("Compra", "Cancelada", "agregar detalles");
        if (!IsPending())
            throw new InvalidEntityStateException("Compra", Status.ToString(), "agregar detalles");
        foreach (var (ProductId, Quantity, UnitPrice) in items)
        {
            var detail = PurchaseDetail.Create(ProductId, Quantity, UnitPrice);
            Details.Add(detail);
        }

        RecalculateTotal();
    }
    // Opera la recepción física global de la compra, evaluando diferencias.
    public void Receive(List<(Guid ProductId, int ReceivedQty, decimal ActualCost)> itemsReceived, string? invoiceNumber = null)
    {
        if (!CanBeReceived())
            throw new InvalidEntityStateException("Compra", Status.ToString(), "recibir");

        if (!string.IsNullOrWhiteSpace(invoiceNumber))
            InvoiceNumber = invoiceNumber.Trim();

        bool hasDiscrepancy = false;

        foreach (var item in itemsReceived)
        {
            var detail = Details.FirstOrDefault(d => d.ProductId == item.ProductId)
                ?? throw new DomainException($"El producto enviado no pertenece a esta compra.");

            detail.RegisterReception(item.ReceivedQty, item.ActualCost);

            if (detail.HasDiscrepancy)
                hasDiscrepancy = true;
        }

        // Si algún detalle de la compra original no vino en la lista enviada, se marca con 0 recibidos
        foreach (var detail in Details.Where(d => !d.ReceivedQuantity.HasValue))
        {
            detail.RegisterReception(0, detail.ExpectedUnitCost);
            hasDiscrepancy = true;
        }

        // Evaluamos estado final del Enum
        Status = hasDiscrepancy
            ? PurchaseStatus.RecibidaConDiferencia
            : PurchaseStatus.RecibidaConforme;

        RecalculateTotal();
    }
    public void Cancel()
    {
        if (!CanBeCancelled())
            throw new InvalidEntityStateException("Compra", Status.ToString(), "cancelar");

        Status = PurchaseStatus.Cancelada;
    }

    public void UpdateInvoiceNumber(string invoiceNumber)
    {
        if (string.IsNullOrWhiteSpace(invoiceNumber))
            throw new DomainException("El número de factura no puede estar vacío.");

        InvoiceNumber = invoiceNumber.Trim();
    }

    private void RecalculateTotal()
    {
        decimal totalDetalles = Details.Sum(d => d.Subtotal);

        Total = Math.Round(totalDetalles, 2);
        Subtotal = Math.Round(totalDetalles / 1.18m, 2);
        IGV = Math.Round(Total - Subtotal, 2);
    }
}