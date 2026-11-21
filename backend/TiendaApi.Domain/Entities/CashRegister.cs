using TiendaApi.Domain.Common;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.Domain.Entities;
public class CashRegister : BaseEntity
{
    public DateTime OpenedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; private set; }
    public decimal OpeningBalance { get; private set; } // Monto inicial de caja
    public decimal? ClosingBalance { get; private set; } // Monto final de caja al cerrar
    public decimal? ExpectedBalance { get; private set; } // Monto esperado de caja al cerrar
    public decimal? Difference { get; private set; }
    public bool IsOpen { get; private set; } = true;
    public string? OpeningNotes { get; private set; }
    public string? ClosingNotes { get; private set; }
    public Guid UserId { get; private set; }

    // Navegación
    public User User { get; private set; } = null!;

    public ICollection<Sale> Sales { get; private set; } = [];

    public ICollection<CreditPayment> CreditPayments { get; private set; } = [];
    private CashRegister() { }
    public static CashRegister Create(Guid userId, decimal openingBalance, string? openingNotes = null)
    {
        return new CashRegister(userId, openingBalance, openingNotes);
    }

    private CashRegister(Guid userId, decimal openingBalance, string? openingNotes)
    {
        if (userId == Guid.Empty)
            throw new DomainException("El usuario es obligatorio.");

        if (openingBalance < 0)
            throw new DomainException("El monto inicial de caja no puede ser negativo.");

        UserId = userId;
        OpeningBalance = openingBalance;
        OpeningNotes = openingNotes?.Trim();
        IsOpen = true;
    }

   
    // Calcula el efectivo real que debe existir en el cajón físico.

    public decimal GetExpectedCash()
    {
        decimal cashFromSales = Sales
            .Where(s => s.IsCompleted() && s.PaymentType == SalePaymentType.Efectivo)
            .Sum(s => s.Total);

        decimal cashFromPayments = CreditPayments
            .Where(p => !p.IsCancelled && p.PaymentType == SalePaymentType.Efectivo)
            .Sum(p => p.Amount);

        return OpeningBalance + cashFromSales + cashFromPayments;
    }

    //Total cobrado por Yape / Plin / Transferencias en este turno.
 
    public decimal GetTotalDigital()
    {
        decimal digitalFromSales = Sales
            .Where(s => s.IsCompleted() && s.PaymentType == SalePaymentType.Transferencia)
            .Sum(s => s.Total);

        decimal digitalFromPayments = CreditPayments
            .Where(p => p.PaymentType == SalePaymentType.Transferencia)
            .Sum(p => p.Amount);

        return digitalFromSales + digitalFromPayments;
    }

    // Total de mercadería entregada a crédito (fiado) durante este turno (Informativo, no afecta efectivo).
    public decimal GetTotalCreditIssued()
    {
        return Sales
            .Where(s => s.IsCompleted() && s.IsCredit())
            .Sum(s => s.Total);
    }
    public bool HasDifference() => Difference.HasValue && Difference.Value != 0;
    public bool HasShortage() => Difference.HasValue && Difference.Value < 0;

    public void Close(decimal physicalCashCount, string? closingNotes = null)
    {
        if (!IsOpen)
            throw new InvalidEntityStateException("Caja", "Cerrada", "cerrar");

        if (physicalCashCount < 0)
            throw new DomainException("El monto contado en caja no puede ser negativo.");

        // 1. PRIMERO calculamos y asignamos los balances
        decimal expectedCash = GetExpectedCash();

        ClosingBalance = physicalCashCount;
        ExpectedBalance = expectedCash;
        Difference = physicalCashCount - expectedCash; // <-- Difference toma su valor aquí

        // 2. DESPUÉS validamos si hay diferencia y si la nota es obligatoria
        if (HasDifference() && string.IsNullOrWhiteSpace(closingNotes))
        {
            string tipoDescuadre = HasShortage() ? "faltante" : "sobrante";
            throw new DomainException(
                $"La caja presenta un {tipoDescuadre} de {Math.Abs(Difference.Value):C2}. " +
                "Es obligatorio ingresar una nota explicativa para cerrar la caja.");
        }

        ClosingNotes = closingNotes?.Trim();
        ClosedAt = DateTime.UtcNow;
        IsOpen = false;
    }

}