using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TiendaApi.Application.Features.Sales.Request;
using TiendaApi.Application.Interfaces.Services;
using TiendaApi.Domain.Enums;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SalesController(ISaleService _saleService) : BaseController
{

    [HttpGet]
    public async Task<IActionResult> GetPaged(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] DateTime? from = null,
    [FromQuery] DateTime? to = null,
    [FromQuery] Guid? customerId = null,
    [FromQuery] Guid? userId = null, 
    [FromQuery] SaleStatus? status = null)
    {
        // 1. Si NO es Admin, ignoramos el userId del query string y asignamos forzosamente el suyo
        if (!User.IsInRole("Admin"))
        {
            // Si NO se está buscando un cliente específico, filtra por el cajero actual.
            // Si SÍ se está buscando un cliente, asigna null a userId para ver todo su historial.
            if (!customerId.HasValue)
            {
                userId = GetUserIdFromClaims();
            }
            else
            {
                userId = null;
            }
        }

        var result = await _saleService.GetPagedAsync(
            page, pageSize, from, to,
            customerId, userId, status);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _saleService.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSaleRequest request)
    {
        var userId = GetUserIdFromClaims();
        var result = await _saleService.CreateAsync(request, userId);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = GetUserIdFromClaims();
        await _saleService.CancelAsync(id, userId);
        return NoContent();
    }

    [HttpGet("total")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTotal(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var total = await _saleService.GetTotalByDateRangeAsync(from, to);
        return Ok(new { from, to, total });
    }
}