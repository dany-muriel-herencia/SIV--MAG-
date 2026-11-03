using FluentAssertions;
using SivMag.Domain.Fiados;

namespace SivMag.Tests.Fiados;

public class CuentaFiadoTests
{
    [Fact]
    public void RegistrarAbono_AbonoParcial_ReduceElSaldo()
    {
        var cuenta = new CuentaFiado(100m);

        cuenta.RegistrarAbono(40m);

        cuenta.Saldo.Should().Be(60m);
    }

    [Fact]
    public void RegistrarAbono_AbonosSucesivos_ReduceElSaldoAcumulativamente()
    {
        var cuenta = new CuentaFiado(100m);

        cuenta.RegistrarAbono(30m);
        cuenta.RegistrarAbono(20m);

        cuenta.Saldo.Should().Be(50m);
    }

    [Fact]
    public void RegistrarAbono_ImporteCero_RechazaYConservaElSaldo()
    {
        var cuenta = new CuentaFiado(100m);

        var accion = () => cuenta.RegistrarAbono(0m);

        accion.Should().Throw<ArgumentOutOfRangeException>();
        cuenta.Saldo.Should().Be(100m);
    }

    [Fact]
    public void RegistrarAbono_ImporteNegativo_RechazaYConservaElSaldo()
    {
        var cuenta = new CuentaFiado(100m);

        var accion = () => cuenta.RegistrarAbono(-15m);

        accion.Should().Throw<ArgumentOutOfRangeException>();
        cuenta.Saldo.Should().Be(100m);
    }

    [Fact]
    public void RegistrarAbono_ImporteMayorQueLaDeuda_RechazaYConservaElSaldo()
    {
        var cuenta = new CuentaFiado(100m);

        var accion = () => cuenta.RegistrarAbono(101m);

        accion.Should().Throw<ArgumentOutOfRangeException>();
        cuenta.Saldo.Should().Be(100m);
    }

    [Fact]
    public void RegistrarAbono_ImporteIgualALaDeuda_DejaSaldoEnCero()
    {
        var cuenta = new CuentaFiado(100m);

        cuenta.RegistrarAbono(100m);

        cuenta.Saldo.Should().Be(0m);
    }
}
