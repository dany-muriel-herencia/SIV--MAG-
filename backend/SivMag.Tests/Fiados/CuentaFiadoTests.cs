using System.Linq;
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
        cuenta.HistorialAbonos.Should().BeEmpty();
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
        cuenta.HistorialAbonos.Should().BeEmpty();
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
        cuenta.HistorialAbonos.Should().BeEmpty();
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

    [Fact]
    public void RegistrarAbono_AbonoValido_AgregaImporteAlHistorial()
    {
        var cuenta = new CuentaFiado(Guid.NewGuid(), 100m);

        cuenta.RegistrarAbono(40m);

        cuenta.SaldoDeudor.Should().Be(60m);
        cuenta.HistorialAbonos.Should().ContainSingle();

        var abono = cuenta.HistorialAbonos.Single();
        abono.Monto.Should().Be(40m);
        abono.Id.Should().NotBe(Guid.Empty);
        abono.FechaRegistro.Offset.Should().Be(TimeSpan.Zero);
    }

    [Fact]
    public void RegistrarAbono_AbonosSucesivos_RegistraImportesEnOrden()
    {
        var cuenta = new CuentaFiado(Guid.NewGuid(), 100m);

        cuenta.RegistrarAbono(30m);
        cuenta.RegistrarAbono(20m);

        cuenta.SaldoDeudor.Should().Be(50m);
        cuenta.HistorialAbonos
            .Select(abono => abono.Monto)
            .Should().Equal(30m, 20m);

        cuenta.HistorialAbonos
            .Select(abono => abono.Id)
            .Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public void HistorialAbonos_NoPermiteModificarLaColeccion()
    {
        var cuenta = new CuentaFiado(Guid.NewGuid(), 100m);
        cuenta.RegistrarAbono(40m);

        var historialMutable = cuenta.HistorialAbonos as IList<AbonoFiado>;

        historialMutable.Should().NotBeNull();

        var accion = () => historialMutable!.Add(
            new AbonoFiado(Guid.NewGuid(), 10m, DateTimeOffset.UtcNow));

        accion.Should().Throw<NotSupportedException>();

        cuenta.HistorialAbonos
            .Select(abono => abono.Monto)
            .Should().Equal(40m);
    }
}