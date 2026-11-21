using TiendaApi.Application.Features.CreditPayments.Request;
using TiendaApi.Application.Features.CreditPayments.Response;
using TiendaApi.Application.Interfaces.Services;
using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Exceptions;
using TiendaApi.Domain.Interfaces;

namespace TiendaApi.Application.Features.CreditPayments;

public class CreditPaymentService(IUnitOfWork _uow) : ICreditPaymentService
{
    public async Task<CreditPaymentResponse> ProcessPaymentAsync(
        CreateCreditPaymentRequest request, Guid userId)
    {
        //  Se define la variable fuera del scope para poder retornarla al final
        CreditPaymentResponse response = null!;

        await _uow.ExecuteTransactionAsync(async () =>
        {
            // 1. Obtener la caja abierta del usuario que cobra
            var cashRegister = await _uow.CashRegisters.GetOpenByUserAsync(userId)
                ?? throw new DomainException("Debes tener un turno de caja abierto para procesar cobros.");

            // 2. Obtener al cliente
            var customer = await _uow.Customers.GetByIdAsync(request.CustomerId)
                ?? throw new NotFoundException("Cliente", request.CustomerId);

            // 3. Registrar el pago en el dominio del cliente (Disminuye CurrentDebt)
            customer.RegisterPayment(request.Amount);

            // 4. Crear la entidad del Abono
            var payment = CreditPayment.Create(
                customerId: customer.Id,
                userId: userId,
                cashRegisterId: cashRegister.Id,
                amount: request.Amount,
                paymentType: request.PaymentType,
                notes: request.Notes);

            // 5. Persistir en repositorio
            await _uow.CreditPayments.AddAsync(payment);
            _uow.Customers.Update(customer);

            await _uow.SaveChangesAsync();

            // Cargar datos de navegación para retornar el DTO completo
            var createdPayment = await _uow.CreditPayments.GetByIdAsync(payment.Id);
            response = MapToDto(createdPayment!);
        });

        return response;
    }

    public async Task CancelPaymentAsync(
        Guid paymentId, CancelCreditPaymentRequest request, Guid userId)
    {
        await _uow.ExecuteTransactionAsync(async () =>
        {
            var payment = await _uow.CreditPayments.GetByIdAsync(paymentId)
                ?? throw new NotFoundException("Abono", paymentId);

            var customer = await _uow.Customers.GetByIdAsync(payment.CustomerId)
                ?? throw new NotFoundException("Cliente", payment.CustomerId);

            // 1. Marcar abono como cancelado
            payment.Cancel(request.Reason, userId);

            // 2. Devolver la deuda al cliente
            customer.AddDebt(payment.Amount);

            _uow.CreditPayments.Update(payment);
            _uow.Customers.Update(customer);

            await _uow.SaveChangesAsync();
        });
    }

    // ─── CONSULTAS (Queries) ──────────────────────────────────────────────────

    public async Task<CreditPaymentResponse> GetByIdAsync(Guid id)
    {
        var payment = await _uow.CreditPayments.GetByIdAsync(id)
            ?? throw new NotFoundException("Abono", id);

        return MapToDto(payment);
    }

    public async Task<PagedResult<CreditPaymentResponse>> GetPagedAsync(
        int page, int pageSize, Guid? customerId = null, Guid? cashRegisterId = null, DateTime? from = null, DateTime? to = null)
    {
        var payments = await _uow.CreditPayments.GetPagedAsync(
            page, pageSize, customerId, cashRegisterId, from, to);

        var dtos = payments.Items.Select(MapToDto).ToList();

        return new PagedResult<CreditPaymentResponse>(
            dtos, payments.TotalCount, payments.Page, payments.PageSize);
    }

    private static CreditPaymentResponse MapToDto(CreditPayment payment)
    {
        return new CreditPaymentResponse
        (
            payment.Id,
            payment.Date,
            payment.Amount,
            payment.PaymentType,
            payment.Notes,
            payment.IsCancelled,
            payment.CancelledAt,
            payment.CancellationReason,
            payment.CustomerId,
            payment.Customer?.FullName ?? string.Empty,
            payment.UserId,
            payment.User?.FullName ?? string.Empty,
            payment.CashRegisterId,
            payment.CreatedAt
        );
    }
}
