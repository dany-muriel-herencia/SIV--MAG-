namespace SivMag.Domain.Fiados;

public class CuentaFiado
{
    private const decimal ImporteMinimoPermitido = 0m;

    public CuentaFiado(Guid clienteId, decimal saldoInicialDeuda)
    {
        ClienteId = clienteId;
        SaldoDeudor = saldoInicialDeuda;
    }

    public Guid ClienteId { get; }

    public decimal SaldoDeudor { get; private set; }

    public void RegistrarAbono(decimal importe)
    {
        ValidarImportePositivo(importe);
        ValidarImporteNoMayorQueSaldoDeudor(importe);

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
