namespace SivMag.Domain.Fiados;

public class CuentaFiado
{
    public CuentaFiado(decimal deuda)
    {
        Saldo = deuda;
    }

    public decimal Saldo { get; private set; }

    public void RegistrarAbono(decimal importe)
    {
        if (importe <= 0m || importe > Saldo)
        {
            throw new ArgumentOutOfRangeException(
                nameof(importe),
                "El abono debe ser mayor que cero y no superar el saldo de la deuda.");
        }

        Saldo -= importe;
    }
}
