using FluentAssertions;
using Moq;
using TiendaApi.Application.Features.CreditPayments;
using TiendaApi.Application.Features.CreditPayments.Request;
using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;
using TiendaApi.UnitTests.Helpers;

namespace TiendaApi.UnitTests.Application;

public class CreditPaymentServiceTests
{
    private readonly MockUnitOfWork _mockUow;
    private readonly CreditPaymentService _creditPaymentService;

    public CreditPaymentServiceTests()
    {
        _mockUow = new MockUnitOfWork();
        _creditPaymentService = new CreditPaymentService(_mockUow.Object);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static void SetPrivateProperty(object instance, string propertyName, object? value)
    {
        var property = instance.GetType().GetProperty(propertyName) ??
            throw new ArgumentException($"La propiedad '{propertyName}' no existe en {instance.GetType().Name}");

        property.SetValue(instance, value);
    }

    private static Customer CreateCustomerWithDebt(decimal initialDebt = 50.00m)
    {
        var customer = Customer.Create("Sebastián Pérez", "987654321", "Av. Principal 123", creditLimit: 100.00m);
        customer.AddDebt(initialDebt);
        return customer;
    }

    private static CashRegister CreateOpenCashRegister(Guid userId)
    {
        return CashRegister.Create(userId, openingBalance: 100.00m, openingNotes: "Turno Mañana");
    }

    private static User CreateUser()
    {
        return User.Create(
            username: "cajero@test.com",
            name: "Juan",
            lastName: "Pérez",
            passwordHash: "hashedpassword",
            role: UserRole.Cajero
        );
    }

    // ─── ProcessPaymentAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task ProcessPaymentAsync_WithValidRequest_ShouldCreatePaymentAndReduceCustomerDebt()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var customer = CreateCustomerWithDebt(initialDebt: 50.00m);
        var cashRegister = CreateOpenCashRegister(userId);
        var user = CreateUser();

        var request = new CreateCreditPaymentRequest(
            CustomerId: customer.Id,
            Amount: 20.00m,
            PaymentType: SalePaymentType.Efectivo,
            Notes: "Abono parcial en efectivo"
        );

        _mockUow.CashRegisters
            .Setup(r => r.GetOpenByUserAsync(userId))
            .ReturnsAsync(cashRegister);

        _mockUow.Customers
            .Setup(r => r.GetByIdAsync(customer.Id))
            .ReturnsAsync(customer);

        _mockUow.CreditPayments
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Guid id) =>
            {
                var payment = CreditPayment.Create(
                    customer.Id, userId, cashRegister.Id, request.Amount, request.PaymentType, request.Notes);
                SetPrivateProperty(payment, nameof(CreditPayment.Customer), customer);
                SetPrivateProperty(payment, nameof(CreditPayment.User), user);
                return payment;
            });

        // Act
        var result = await _creditPaymentService.ProcessPaymentAsync(request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Amount.Should().Be(20.00m);
        customer.CurrentDebt.Should().Be(30.00m); // 50.00 - 20.00

        _mockUow.Mock.Verify(u => u.BeginTransactionAsync(), Times.Once);
        _mockUow.Mock.Verify(u => u.CommitTransactionAsync(), Times.Once);
        _mockUow.CreditPayments.Verify(r => r.AddAsync(It.IsAny<CreditPayment>()), Times.Once);
        _mockUow.Customers.Verify(r => r.Update(customer), Times.Once);
        _mockUow.Mock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ProcessPaymentAsync_WhenNoOpenCashRegister_ShouldThrowAndRollback()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockUow.CashRegisters
            .Setup(r => r.GetOpenByUserAsync(userId))
            .ReturnsAsync((CashRegister?)null);

        var request = new CreateCreditPaymentRequest(
            CustomerId: Guid.NewGuid(),
            Amount: 10.00m,
            PaymentType: SalePaymentType.Efectivo,
            Notes: null
        );

        // Act
        var action = async () => await _creditPaymentService.ProcessPaymentAsync(request, userId);

        // Assert
        await action.Should().ThrowAsync<DomainException>()
            .WithMessage("*turno de caja abierto*");

        _mockUow.Mock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
    }

    [Fact]
    public async Task ProcessPaymentAsync_WhenCustomerNotFound_ShouldThrowAndRollback()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cashRegister = CreateOpenCashRegister(userId);
        var customerId = Guid.NewGuid();

        _mockUow.CashRegisters
            .Setup(r => r.GetOpenByUserAsync(userId))
            .ReturnsAsync(cashRegister);

        _mockUow.Customers
            .Setup(r => r.GetByIdAsync(customerId))
            .ReturnsAsync((Customer?)null);

        var request = new CreateCreditPaymentRequest(
            CustomerId: customerId,
            Amount: 10.00m,
            PaymentType: SalePaymentType.Efectivo,
            Notes: null
        );

        // Act
        var action = async () => await _creditPaymentService.ProcessPaymentAsync(request, userId);

        // Assert
        await action.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*Cliente*");

        _mockUow.Mock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
    }

    [Fact]
    public async Task ProcessPaymentAsync_WhenAmountExceedsDebt_ShouldThrowAndRollback()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var customer = CreateCustomerWithDebt(initialDebt: 10.00m);
        var cashRegister = CreateOpenCashRegister(userId);

        _mockUow.CashRegisters
            .Setup(r => r.GetOpenByUserAsync(userId))
            .ReturnsAsync(cashRegister);

        _mockUow.Customers
            .Setup(r => r.GetByIdAsync(customer.Id))
            .ReturnsAsync(customer);

        var request = new CreateCreditPaymentRequest(
            CustomerId: customer.Id,
            Amount: 50.00m, // Intenta pagar 50 teniendo solo 10 de deuda
            PaymentType: SalePaymentType.Efectivo,
            Notes: null
        );

        // Act
        var action = async () => await _creditPaymentService.ProcessPaymentAsync(request, userId);

        // Assert
        await action.Should().ThrowAsync<DomainException>()
            .WithMessage("*supera la deuda actual*");

        _mockUow.Mock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
    }

    // ─── CancelPaymentAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task CancelPaymentAsync_WithValidPayment_ShouldCancelPaymentAndRestoreCustomerDebt()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var customer = CreateCustomerWithDebt(initialDebt: 30.00m); // Tenía 50, pagó 20, le quedan 30
        var cashRegister = CreateOpenCashRegister(userId);

        var payment = CreditPayment.Create(
            customer.Id, userId, cashRegister.Id, amount: 20.00m, SalePaymentType.Efectivo, notes: "Abono");

        var request = new CancelCreditPaymentRequest(Reason: "Error en el monto ingresado");

        _mockUow.CreditPayments
            .Setup(r => r.GetByIdAsync(payment.Id))
            .ReturnsAsync(payment);

        _mockUow.Customers
            .Setup(r => r.GetByIdAsync(customer.Id))
            .ReturnsAsync(customer);

        // Act
        await _creditPaymentService.CancelPaymentAsync(payment.Id, request, userId);

        // Assert
        payment.IsCancelled.Should().BeTrue();
        payment.CancellationReason.Should().Be("Error en el monto ingresado");
        customer.CurrentDebt.Should().Be(50.00m); // Restaura deuda: 30 + 20

        _mockUow.Mock.Verify(u => u.BeginTransactionAsync(), Times.Once);
        _mockUow.Mock.Verify(u => u.CommitTransactionAsync(), Times.Once);
        _mockUow.CreditPayments.Verify(r => r.Update(payment), Times.Once);
        _mockUow.Customers.Verify(r => r.Update(customer), Times.Once);
        _mockUow.Mock.Verify(u => u.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CancelPaymentAsync_WhenPaymentNotFound_ShouldThrowAndRollback()
    {
        // Arrange
        var paymentId = Guid.NewGuid();
        var request = new CancelCreditPaymentRequest(Reason: "Error de digitación");

        _mockUow.CreditPayments
            .Setup(r => r.GetByIdAsync(paymentId))
            .ReturnsAsync((CreditPayment?)null);

        // Act
        var action = async () => await _creditPaymentService.CancelPaymentAsync(paymentId, request, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*Abono*");

        _mockUow.Mock.Verify(u => u.RollbackTransactionAsync(), Times.Once);
    }

    // ─── GetByIdAsync & GetPagedAsync ─────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ShouldReturnMappedResponse()
    {
        // Arrange
        var customer = CreateCustomerWithDebt(20.00m);
        var user = CreateUser();
        var payment = CreditPayment.Create(customer.Id, user.Id, Guid.NewGuid(), 20.00m, SalePaymentType.Efectivo);

        SetPrivateProperty(payment, nameof(CreditPayment.Customer), customer);
        SetPrivateProperty(payment, nameof(CreditPayment.User), user);

        _mockUow.CreditPayments
            .Setup(r => r.GetByIdAsync(payment.Id))
            .ReturnsAsync(payment);

        // Act
        var result = await _creditPaymentService.GetByIdAsync(payment.Id);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(payment.Id);
        result.CustomerFullName.Should().Be("Sebastián Pérez");
        result.UserFullName.Should().Be("Juan Pérez");
    }

    [Fact]
    public async Task GetPagedAsync_ShouldReturnPagedResultOfResponse()
    {
        // Arrange
        var customer = CreateCustomerWithDebt(20.00m);
        var user = CreateUser();
        var payment = CreditPayment.Create(customer.Id, user.Id, Guid.NewGuid(), 20.00m, SalePaymentType.Efectivo);

        SetPrivateProperty(payment, nameof(CreditPayment.Customer), customer);
        SetPrivateProperty(payment, nameof(CreditPayment.User), user);

        var pagedResult = new PagedResult<CreditPayment>([payment], totalCount: 1, page: 1, pageSize: 10);

        _mockUow.CreditPayments
            .Setup(r => r.GetPagedAsync(1, 10, null, null, null, null))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _creditPaymentService.GetPagedAsync(page: 1, pageSize: 10, customerId: null, cashRegisterId: null);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(1);
        result.TotalCount.Should().Be(1);
        result.Items.First().CustomerFullName.Should().Be("Sebastián Pérez");
    }
}