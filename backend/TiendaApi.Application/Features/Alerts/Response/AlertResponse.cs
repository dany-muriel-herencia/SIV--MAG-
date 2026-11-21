using TiendaApi.Domain.Enums;

namespace TiendaApi.Application.Features.Alerts.Response;

public class AlertResponse
{
    public Guid Id { get; set; }
    public AlertType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public Guid? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public DateTime CreatedAt { get; set; }
}