using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TiendaApi.Application.Interfaces.Services;

namespace TiendaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(IReportService _reportService) : BaseController
{

    // Dashboard — disponible para Admin y Cajero
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _reportService.GetDashboardAsync();
        return Ok(result);
    }

    // Los siguientes solo para Admin
    [HttpGet("sales")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetSalesSummary(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        if (from > to)
            return BadRequest(new
            {
                message = "La fecha de inicio no puede ser mayor a la de fin."
            });

        var result = await _reportService.GetSalesSummaryAsync(from, to);
        return Ok(result);
    }

    [HttpGet("top-products")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTopProducts(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int limit = 10)
    {
        if (limit < 1 || limit > 50)
            return BadRequest(new
            {
                message = "El límite debe estar entre 1 y 50."
            });

        var result = await _reportService.GetTopProductsAsync(from, to, limit);
        return Ok(result);
    }

    [HttpGet("stock-valuation")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStockValuation()
    {
        var result = await _reportService.GetStockValuationAsync();
        return Ok(result);
    }

    [HttpGet("customer-debt")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetCustomerDebt()
    {
        var result = await _reportService.GetCustomerDebtReportAsync();
        return Ok(result);
    }
}