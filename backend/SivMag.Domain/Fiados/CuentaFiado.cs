using System.Collections.ObjectModel;

namespace SivMag.Domain.Fiados;

public class CuentaFiado
{
    private const decimal ImporteMinimoPermitido = 0m;
    private readonly List<decimal> _abonos = new();
    private readonly ReadOnlyCollection<decimal> _historialAbonos;

    public CuentaFiado(Guid clienteId, decimal saldoInicialDeuda)
    {
        ClienteId = clienteId;
        SaldoDeudor = saldoInicialDeuda;
        _historialAbonos = _abonos.AsReadOnly();
    }

    public Guid ClienteId { get; }

    public decimal SaldoDeudor { get; private set; }

    public IReadOnlyList<decimal> HistorialAbonos => _historialAbonos;

    public void RegistrarAbono(decimal importe)
    {
        ValidarImportePositivo(importe);
        ValidarImporteNoMayorQueSaldoDeudor(importe);

        SaldoDeudor -= importe;
        _abonos.Add(importe);
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
