using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TiendaApi.Application.Features.CreditPayments.Request;
using TiendaApi.Application.Features.CreditPayments.Response;
using TiendaApi.Application.Interfaces.Services;
using TiendaApi.Domain.Common;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CreditPaymentsController(ICreditPaymentService _creditPaymentService) : BaseController
{
    // Registra un nuevo abono/pago de deuda para un cliente en la caja activa del usuario.
    [HttpPost]
    public async Task<ActionResult<CreditPaymentResponse>> ProcessPayment([FromBody] CreateCreditPaymentRequest request)
    {
        var userId = GetUserIdFromClaims();
        var result = await _creditPaymentService.ProcessPaymentAsync(request, userId);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // Anula un abono registrado previamente y restaura la deuda al cliente.
    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> CancelPayment(Guid id, [FromBody] CancelCreditPaymentRequest request)
    {
        var userId = GetUserIdFromClaims();
        await _creditPaymentService.CancelPaymentAsync(id, request, userId);

        return NoContent();
    }


    // Obtiene el listado paginado de abonos con filtros opcionales por cliente o turno de caja.
    [HttpGet]
    public async Task<ActionResult<PagedResult<CreditPaymentResponse>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? cashRegisterId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var result = await _creditPaymentService.GetPagedAsync(page, pageSize, customerId, cashRegisterId, from, to);
        return Ok(result);
    }

    // Obtiene el detalle de un abono específico por su ID.
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CreditPaymentResponse>> GetById(Guid id)
    {
        var result = await _creditPaymentService.GetByIdAsync(id);
        return Ok(result);
    }

}