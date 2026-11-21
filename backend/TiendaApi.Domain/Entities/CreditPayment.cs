using TiendaApi.Domain.Common;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.Domain.Entities;
public class CreditPayment : BaseEntity
{
    public DateTime Date { get; private set; } = DateTime.UtcNow;
    public decimal Amount { get; private set; }
    public SalePaymentType PaymentType { get; private set; } 
    public string? Notes { get; private set; }
    public bool IsCancelled { get; private set; } = false;
    public DateTime? CancelledAt { get; private set; }
    public string? CancellationReason { get; private set; }
    // Claves Foráneas
    public Guid CustomerId { get; private set; }
    public Guid UserId { get; private set; }
    public Guid CashRegisterId { get; private set; }
    // Navegación
    public Customer Customer { get; set; } = null!;
    public User User { get; set; } = null!;
    public CashRegister CashRegister { get; set; } = null!;

    private CreditPayment() { }
    public static CreditPayment Create(
        Guid customerId,
        Guid userId,
        Guid cashRegisterId,
        decimal amount,
        SalePaymentType paymentType,
        string? notes = null)
    {
        if (customerId == Guid.Empty)
            throw new DomainException("El cliente es obligatorio.");

        if (userId == Guid.Empty)
            throw new DomainException("El usuario es obligatorio.");

        if (cashRegisterId == Guid.Empty)
            throw new DomainException("El turno de caja es obligatorio.");

        if (amount <= 0)
            throw new DomainException("El monto del pago debe ser mayor a cero.");

        return new CreditPayment(customerId, userId, cashRegisterId, amount, paymentType, notes);
    }
    private CreditPayment(
        Guid customerId,
        Guid userId,
        Guid cashRegisterId,
        decimal amount,
        SalePaymentType paymentType,
        string? notes)
    {
        CustomerId = customerId;
        UserId = userId;
        CashRegisterId = cashRegisterId;
        Amount = amount;
        PaymentType = paymentType;
        Notes = notes?.Trim();
    }


    public void Cancel(string reason, Guid userId)
    {
        if (IsCancelled)
            throw new DomainException("El pago ya se encuentra anulado.");

        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("Debe proporcionar un motivo para anular el pago.");

        UserId = userId;
        IsCancelled = true;
        CancelledAt = DateTime.UtcNow;
        CancellationReason = reason.Trim();
    }
}