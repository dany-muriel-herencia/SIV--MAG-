using FluentAssertions;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.UnitTests.Domain;

public class CreditPaymentTests
{
    // ─── Create ───────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidParameters_ShouldCreateCreditPayment()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var cashRegisterId = Guid.NewGuid();
        var amount = 50.00m;
        var paymentType = SalePaymentType.Efectivo;
        var notes = " Abono inicial ";

        // Act
        var payment = CreditPayment.Create(
            customerId, userId, cashRegisterId, amount, paymentType, notes);

        // Assert
        payment.Should().NotBeNull();
        payment.CustomerId.Should().Be(customerId);
        payment.UserId.Should().Be(userId);
        payment.CashRegisterId.Should().Be(cashRegisterId);
        payment.Amount.Should().Be(50.00m);
        payment.PaymentType.Should().Be(SalePaymentType.Efectivo);
        payment.Notes.Should().Be("Abono inicial");
        payment.IsCancelled.Should().BeFalse();
        payment.CancelledAt.Should().BeNull();
        payment.CancellationReason.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyCustomerId_ShouldThrowDomainException()
    {
        // Act
        var action = () => CreditPayment.Create(
            Guid.Empty, Guid.NewGuid(), Guid.NewGuid(), 50.00m, SalePaymentType.Efectivo);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*cliente es obligatorio*");
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrowDomainException()
    {
        // Act
        var action = () => CreditPayment.Create(
            Guid.NewGuid(), Guid.Empty, Guid.NewGuid(), 50.00m, SalePaymentType.Efectivo);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*usuario es obligatorio*");
    }

    [Fact]
    public void Create_WithEmptyCashRegisterId_ShouldThrowDomainException()
    {
        // Act
        var action = () => CreditPayment.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.Empty, 50.00m, SalePaymentType.Efectivo);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*turno de caja es obligatorio*");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10.5)]
    public void Create_WithZeroOrNegativeAmount_ShouldThrowDomainException(double invalidAmountDouble)
    {
        // Convertimos double a decimal dentro del test para evitar desbordamiento del runner
        var invalidAmount = (decimal)invalidAmountDouble;

        // Act
        var action = () => CreditPayment.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), invalidAmount, SalePaymentType.Efectivo);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*monto del pago debe ser mayor a cero*");
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    [Fact]
    public void Cancel_WithValidReason_ShouldMarkAsCancelled()
    {
        // Arrange
        var payment = CreditPayment.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 30.00m, SalePaymentType.Efectivo);
        var reason = " Error de digitación en monto ";

        // Act
        payment.Cancel(reason);

        // Assert
        payment.IsCancelled.Should().BeTrue();
        payment.CancelledAt.Should().NotBeNull();
        payment.CancellationReason.Should().Be("Error de digitación en monto");
    }

    [Fact]
    public void Cancel_WhenAlreadyCancelled_ShouldThrowDomainException()
    {
        // Arrange
        var payment = CreditPayment.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 30.00m, SalePaymentType.Efectivo);
        payment.Cancel("Primer motivo");

        // Act
        var action = () => payment.Cancel("Segundo motivo");

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*ya se encuentra anulado*");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Cancel_WithNullOrEmptyReason_ShouldThrowDomainException(string? invalidReason)
    {
        // Arrange
        var payment = CreditPayment.Create(
            Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 30.00m, SalePaymentType.Efectivo);

        // Act
        var action = () => payment.Cancel(invalidReason!);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*proporcionar un motivo*");
    }
}