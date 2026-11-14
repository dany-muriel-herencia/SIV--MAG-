using System.Collections.ObjectModel;

namespace SivMag.Domain.Fiados;

public class CuentaFiado
{
    private const decimal ImporteMinimoPermitido = 0m;
    private readonly List<AbonoFiado> _abonos = new();
    private readonly ReadOnlyCollection<AbonoFiado> _historialAbonos;

    public CuentaFiado(Guid clienteId, decimal saldoInicialDeuda)
    {
        ClienteId = clienteId;
        SaldoDeudor = saldoInicialDeuda;
        _historialAbonos = _abonos.AsReadOnly();
    }

    public Guid ClienteId { get; }

    public decimal SaldoDeudor { get; private set; }

    public IReadOnlyList<AbonoFiado> HistorialAbonos => _historialAbonos;

    public void RegistrarAbono(decimal importe)
    {
        ValidarImportePositivo(importe);
        ValidarImporteNoMayorQueSaldoDeudor(importe);

        var abono = new AbonoFiado(
            Guid.NewGuid(),
            importe,
            DateTimeOffset.UtcNow);

        _abonos.Add(abono);
        SaldoDeudor -= importe;
    }

    private static void ValidarImportePositivo(decimal importe)
    {
        if (importe <= ImporteMinimoPermitido)
        {
            throw new ArgumentOutOfRangeException(
                nameof(importe),
                "El abono debe ser mayor que cero.");
        }
    }

    private void ValidarImporteNoMayorQueSaldoDeudor(decimal importe)
    {
        if (importe > SaldoDeudor)
        {
            throw new InvalidOperationException(
                "El abono no puede superar el saldo deudor pendiente.");
        }
    }
}