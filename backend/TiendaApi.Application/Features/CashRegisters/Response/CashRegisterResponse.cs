namespace TiendaApi.Application.Features.CashRegisters.Response;
public record CashRegisterResponse
{
    public Guid Id { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal? ClosingBalance { get; set; }
    public decimal? ExpectedBalance { get; set; }
    public decimal? Difference { get; set; }
    public bool IsOpen { get; set; }
    public string? OpeningNotes { get; set; }
    public string? ClosingNotes { get; set; }

    // Usuario que abrió el turno
    public Guid UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;

    // Resumen de ventas del turno
    public CashRegisterSummaryResponse? Summary { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CashRegisterSummaryResponse
{
    public int TotalSales { get; set; }
    public int CancelledSales { get; set; }
    public decimal TotalCash { get; set; }
    public decimal TotalCard { get; set; }
    public decimal TotalTransfer { get; set; }
    public decimal TotalCreditIssued { get; set; } // Fiados otorgados hoy
    public decimal TotalCreditCollected { get; set; } // Deudas cobradas hoy
    public decimal TotalRevenue { get; set; }
}
