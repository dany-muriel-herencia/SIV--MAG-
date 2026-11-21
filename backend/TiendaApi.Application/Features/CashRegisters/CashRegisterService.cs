using TiendaApi.Application.Features.CashRegisters.Requests;
using TiendaApi.Application.Features.CashRegisters.Response;
using TiendaApi.Application.Interfaces.Services;
using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;
using TiendaApi.Domain.Interfaces;

namespace TiendaApi.Application.Features.CashRegisters;

public class CashRegisterService(IUnitOfWork _uow) : ICashRegisterService
{

    public async Task<CashRegisterResponse> GetByIdAsync(Guid id)
    {
        var session = await _uow.CashRegisters.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException("Turno de caja", id);

        var summary = BuildSummary(session);

        return MapToDto(session, summary);
    }

    public async Task<CashRegisterResponse?> GetCurrentSessionAsync(Guid userId)
    {
        var session = await _uow.CashRegisters.GetOpenByUserAsync(userId);

        if (session is null) return null;
        
        var summary = BuildSummary(session);
        return MapToDto(session, summary);
    }

    public async Task<PagedResult<CashRegisterResponse>> GetPagedAsync(
        int page, int pageSize,
        Guid? userId = null,
        DateTime? from = null,
        DateTime? to = null,
        bool? isOpen = null)
    {
        var result = await _uow.CashRegisters.GetPagedAsync(
            page, pageSize, userId, from, to, isOpen);

        var dtos = result.Items
         .Select(cr => MapToDto(cr, null)) 
         .ToList();

        return new PagedResult<CashRegisterResponse>(
            dtos, result.TotalCount,
            result.Page, result.PageSize);
    }

    public async Task<CashRegisterResponse> OpenAsync(OpenCashRegisterRequest request, Guid userId)
    {
        // Verificar que el cajero no tiene ya un turno abierto
        var hasOpenSession = await _uow.CashRegisters.HasOpenSessionAsync(userId);

        if (hasOpenSession)
            throw new DomainException(
                "Ya tenés un turno de caja abierto. " +
                "Ciérralo antes de abrir uno nuevo.");

        var session = CashRegister.Create(
            userId: userId,
            openingBalance: request.OpeningBalance,
            openingNotes: request.OpeningNotes);

        await _uow.CashRegisters.AddAsync(session);
        await _uow.SaveChangesAsync();

        return MapToDto(session, null);
    }

    public async Task<CashRegisterResponse> CloseAsync(
        Guid id,
        CloseCashRegisterRequest request,
        Guid userId)
    {
        // Traemos la caja cargando las colecciones de ventas y abonos del turno
        var session = await _uow.CashRegisters.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException("Turno de caja", id);

        var requestingUser = await _uow.Users.GetByIdAsync(userId)
            ?? throw new NotFoundException("Usuario", userId);

        if (session.UserId != userId && !requestingUser.IsAdmin())
            throw new DomainException("Solo puedes cerrar tu propio turno de caja.");

        // La entidad calcula internamente el esperado en efectivo y la diferencia
        session.Close(request.ClosingBalance, request.ClosingNotes);

        _uow.CashRegisters.Update(session);
        await _uow.SaveChangesAsync();

        var summary = BuildSummary(session);
        return MapToDto(session, summary);
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private static CashRegisterSummaryResponse BuildSummary(CashRegister session)
    {
        var activeSales = session.Sales
            .Where(s => s.Status != SaleStatus.Cancelada)
            .ToList();

        var payments = session.CreditPayments.ToList();

        // Totales desglosados combinando Ventas + Abonos de Fiados por método de pago
        decimal totalCashSales = activeSales.Where(s => s.PaymentType == SalePaymentType.Efectivo).Sum(s => s.Total);
        decimal totalCashPayments = payments.Where(p => p.PaymentType == SalePaymentType.Efectivo).Sum(p => p.Amount);

        decimal totalCardSales = activeSales.Where(s => s.PaymentType == SalePaymentType.Tarjeta).Sum(s => s.Total);
        decimal totalCardPayments = payments.Where(p => p.PaymentType == SalePaymentType.Tarjeta).Sum(p => p.Amount);

        decimal totalTransferSales = activeSales.Where(s => s.PaymentType == SalePaymentType.Transferencia).Sum(s => s.Total);
        decimal totalTransferPayments = payments.Where(p => p.PaymentType == SalePaymentType.Transferencia).Sum(s => s.Amount);

        return new CashRegisterSummaryResponse
        {
            TotalSales = activeSales.Count,
            CancelledSales = session.Sales.Count - activeSales.Count,

            // Total ingresado en efectivo (Ventas al contado + Cobro de fiados)
            TotalCash = totalCashSales + totalCashPayments,

            // Total ingresado en tarjetas
            TotalCard = totalCardSales + totalCardPayments,

            // Total ingresado en Yape / Plin / Transferencias
            TotalTransfer = totalTransferSales + totalTransferPayments,

            // Fiados emitidos en este turno (Informativo - No afecta efectivo en cajón)
            TotalCreditIssued = activeSales.Where(s => s.IsCredit()).Sum(s => s.Total),

            // Total abonos cobrados de fiados anteriores en este turno
            TotalCreditCollected = payments.Sum(p => p.Amount),

            // Ingreso total real recaudado (Efectivo + Tarjeta + Transferencias)
            TotalRevenue = (totalCashSales + totalCashPayments) +
                           (totalCardSales + totalCardPayments) +
                           (totalTransferSales + totalTransferPayments)
        };
    }

    // ─── Mapeo ────────────────────────────────────────────────────────────────

    private static CashRegisterResponse MapToDto(
        CashRegister session,
        CashRegisterSummaryResponse? summary) => new()
        {
            Id = session.Id,
            OpenedAt = session.OpenedAt,
            ClosedAt = session.ClosedAt,
            OpeningBalance = session.OpeningBalance,
            ClosingBalance = session.ClosingBalance,
            ExpectedBalance = session.ExpectedBalance,
            Difference = session.Difference,
            IsOpen = session.IsOpen,
            OpeningNotes = session.OpeningNotes,
            ClosingNotes = session.ClosingNotes,
            UserId = session.UserId,
            UserFullName = session.User?.FullName ?? string.Empty,
            Summary = summary,
            CreatedAt = session.CreatedAt,
            UpdatedAt = session.UpdatedAt
        };
}