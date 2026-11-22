using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.Middleware;

public class ExceptionHandlingMiddleware(
    RequestDelegate _next,
    ILogger<ExceptionHandlingMiddleware> _logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // Asegurar un request_id único por petición y devolverlo en la cabecera HTTP
        var requestId = context.Request.Headers["X-Request-Id"].FirstOrDefault()
                        ?? context.TraceIdentifier;
        context.Response.Headers["X-Request-Id"] = requestId;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex, requestId);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex, string requestId)
    {
        var (statusCode, errorCode, message) = ex switch
        {
            NotFoundException e => (404, "RESOURCE_NOT_FOUND", e.Message),
            DomainException e => (400, "BUSINESS_RULE_ERROR", e.Message),
            UnauthorizedAccessException => (401, "UNAUTHORIZED", "No autorizado."),
            DbUpdateConcurrencyException => (409, "CONCURRENCY_CONFLICT", "Conflicto al actualizar el recurso."),
            DbUpdateException => (409, "DATABASE_CONFLICT", "No se pudo completar la operación por restricción de datos."),
            _ => (500, "INTERNAL_SERVER_ERROR", "Ocurrió un error interno inesperado.")
        };

        var operation = $"{context.Request.Method} {context.Request.Path}";

        // Factor XI (Sec. 6.3): Registrar request_id, evento, error_code y causa interna sin exponer SQL al cliente
        if (statusCode == 500)
        {
            _logger.LogError(ex,
                "unhandled_exception | request_id={RequestId} | error_code={ErrorCode} | operation={Operation} | status={StatusCode}",
                requestId, errorCode, operation, statusCode);
        }
        else
        {
            _logger.LogWarning(
                "handled_exception | request_id={RequestId} | error_code={ErrorCode} | operation={Operation} | status={StatusCode} | detail={Detail}",
                requestId, errorCode, operation, statusCode, ex.Message);
        }

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        // Sec. 6.2: Contrato público consistente, seguro y accionable (sin SQL ni stack trace)
        var response = new
        {
            status = statusCode,
            error_code = errorCode,
            message,
            request_id = requestId,
            timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}