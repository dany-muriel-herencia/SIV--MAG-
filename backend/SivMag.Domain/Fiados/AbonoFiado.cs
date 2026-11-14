namespace SivMag.Domain.Fiados;

public sealed record AbonoFiado(
    Guid Id,
    decimal Monto,
    DateTimeOffset FechaRegistro);