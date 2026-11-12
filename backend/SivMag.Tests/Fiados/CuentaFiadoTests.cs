using FluentAssertions;
using SivMag.Domain.Fiados;

namespace SivMag.Tests.Fiados;

public class CuentaFiadoTests
{
    [Fact]
    public void RegistrarAbono_AbonoParcial_ReduceElSaldo()
    {
        var clienteId = Guid.NewGuid();
        var cuenta = new CuentaFiado(clienteId, 100m);

        cuenta.RegistrarAbono(40m);

        cuenta.ClienteId.Should().Be(clienteId);
        cuenta.SaldoDeudor.Should().Be(60m);
    }

    [Fact]
    public void RegistrarAbono_AbonosSucesivos_ReduceElSaldoAcumulativamente()
    {
        var clienteId = Guid.NewGuid();
        var cuenta = new CuentaFiado(clienteId, 100m);

        cuenta.RegistrarAbono(30m);
        cuenta.RegistrarAbono(20m);

        cuenta.ClienteId.Should().Be(clienteId);
        cuenta.SaldoDeudor.Should().Be(50m);
    }

    [Fact]
    public void RegistrarAbono_ImporteCero_RechazaYConservaElSaldo()
    {
        var clienteId = Guid.NewGuid();
        var cuenta = new CuentaFiado(clienteId, 100m);

        var accion = () => cuenta.RegistrarAbono(0m);

        accion.Should().Throw<ArgumentOutOfRangeException>();
        cuenta.ClienteId.Should().Be(clienteId);
        cuenta.SaldoDeudor.Should().Be(100m);
    }

    [Fact]
    public void RegistrarAbono_ImporteNegativo_RechazaYConservaElSaldo()
    {
        var clienteId = Guid.NewGuid();
        var cuenta = new CuentaFiado(clienteId, 100m);

        var accion = () => cuenta.RegistrarAbono(-15m);

        accion.Should().Throw<ArgumentOutOfRangeException>();
        cuenta.ClienteId.Should().Be(clienteId);
        cuenta.SaldoDeudor.Should().Be(100m);
    }

    [Fact]
    public void RegistrarAbono_ImporteMayorQueLaDeuda_RechazaYConservaElSaldo()
    {
        var clienteId = Guid.NewGuid();
        var cuenta = new CuentaFiado(clienteId, 100m);

        var accion = () => cuenta.RegistrarAbono(101m);

        accion.Should().Throw<InvalidOperationException>();
        cuenta.ClienteId.Should().Be(clienteId);
        cuenta.SaldoDeudor.Should().Be(100m);
    }

    [Fact]
    public void RegistrarAbono_ImporteIgualALaDeuda_DejaSaldoEnCero()
    {
        var clienteId = Guid.NewGuid();
        var cuenta = new CuentaFiado(clienteId, 100m);

        cuenta.RegistrarAbono(100m);

        cuenta.ClienteId.Should().Be(clienteId);
        cuenta.SaldoDeudor.Should().Be(0m);
    }
}
