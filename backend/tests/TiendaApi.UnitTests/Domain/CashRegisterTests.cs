//using FluentAssertions;
//using TiendaApi.Domain.Entities;
//using TiendaApi.Domain.Enums;
//using TiendaApi.Domain.Exceptions;

//namespace TiendaApi.UnitTests.Domain;

//public class CashRegisterTests
//{
//    // ─── Helpers ─────────────────────────────────────────────────────────────

//    private static void AddSaleToCashRegister(
//        CashRegister cashRegister,
//        SalePaymentType paymentType,
//        decimal amount,
//        SaleStatus status = SaleStatus.Completada)
//    {
//        var sale = Sale.Create(cashRegister.UserId, paymentType, cashRegister.Id);

//        // Simular detalles de la venta para llegar al total esperado
//        sale.AddDetails([(Guid.NewGuid(), 1, amount)]);

//        if (status == SaleStatus.Cancelada)
//        {
//            sale.Cancel();
//        }

//        // Agregar a la colección privada via reflexión
//        var field = typeof(CashRegister).GetField("_sales", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
//        var salesList = (List<Sale>)field!.GetValue(cashRegister)!;
//        salesList.Add(sale);
//    }

//    private static void AddCreditPaymentToCashRegister(
//        CashRegister cashRegister,
//        SalePaymentType paymentType,
//        decimal amount,
//        bool isCancelled = false)
//    {
//        var payment = CreditPayment.Create(
//            customerId: Guid.NewGuid(),
//            userId: cashRegister.UserId,
//            cashRegisterId: cashRegister.Id,
//            amount: amount,
//            paymentType: paymentType
//        );

//        if (isCancelled)
//        {
//            payment.Cancel("Error en el monto", Guid.NewGuid());
//        }

//        // Agregar a la colección privada via reflexión
//        var field = typeof(CashRegister).GetField("_creditPayments", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
//        var paymentsList = (List<CreditPayment>)field!.GetValue(cashRegister)!;
//        paymentsList.Add(payment);
//    }

//    // ─── Create ───────────────────────────────────────────────────────────────

//    [Fact]
//    public void Create_WithValidParameters_ShouldCreateOpenCashRegister()
//    {
//        // Arrange
//        var userId = Guid.NewGuid();
//        var openingBalance = 50.00m;
//        var notes = "Turno mañana";

//        // Act
//        var cashRegister = CashRegister.Create(userId, openingBalance, notes);

//        // Assert
//        cashRegister.Should().NotBeNull();
//        cashRegister.UserId.Should().Be(userId);
//        cashRegister.OpeningBalance.Should().Be(50.00m);
//        cashRegister.OpeningNotes.Should().Be("Turno mañana");
//        cashRegister.IsOpen.Should().BeTrue();
//        cashRegister.ClosedAt.Should().BeNull();
//        cashRegister.ClosingBalance.Should().BeNull();
//    }

//    [Fact]
//    public void Create_WithEmptyUserId_ShouldThrowDomainException()
//    {
//        // Act
//        var action = () => CashRegister.Create(Guid.Empty, 50.00m);

//        // Assert
//        action.Should().Throw<DomainException>()
//            .WithMessage("*usuario es obligatorio*");
//    }

//    [Fact]
//    public void Create_WithNegativeOpeningBalance_ShouldThrowDomainException()
//    {
//        // Act
//        var action = () => CashRegister.Create(Guid.NewGuid(), -10.00m);

//        // Assert
//        action.Should().Throw<DomainException>()
//            .WithMessage("*no puede ser negativo*");
//    }

//    // ─── GetExpectedCash ──────────────────────────────────────────────────────

//    [Fact]
//    public void GetExpectedCash_ShouldCalculateOpeningBalancePlusCashSalesAndPayments()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 100.00m);

//        // Venta en efectivo (S/ 50.00)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Efectivo, 50.00m);

//        // Venta por transferencia (S/ 30.00 - NO debe sumar a cash)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Transferencia, 30.00m);

//        // Venta cancelada en efectivo (S/ 20.00 - NO debe sumar)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Efectivo, 20.00m, status: SaleStatus.Cancelada);

//        // Abono de fiado en efectivo (S/ 25.00)
//        AddCreditPaymentToCashRegister(cashRegister, SalePaymentType.Efectivo, 25.00m);

//        // Abono de fiado en efectivo CANCELADO (S/ 10.00 - NO debe sumar)
//        AddCreditPaymentToCashRegister(cashRegister, SalePaymentType.Efectivo, 10.00m, isCancelled: true);

//        // Act
//        var expectedCash = cashRegister.GetExpectedCash();

//        // Assert: 100 (inicio) + 50 (venta cash) + 25 (abono cash) = 175.00
//        expectedCash.Should().Be(175.00m);
//    }

//    // ─── GetTotalDigital ──────────────────────────────────────────────────────

//    [Fact]
//    public void GetTotalDigital_ShouldSumTransferSalesAndPayments()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 0.00m);

//        // Venta en efectivo (S/ 40.00 - NO debe sumar a digital)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Efectivo, 40.00m);

//        // Venta por transferencia (S/ 60.00)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Transferencia, 60.00m);

//        // Abono por transferencia (S/ 20.00)
//        AddCreditPaymentToCashRegister(cashRegister, SalePaymentType.Transferencia, 20.00m);

//        // Act
//        var totalDigital = cashRegister.GetTotalDigital();

//        // Assert: 60 (venta digital) + 20 (abono digital) = 80.00
//        totalDigital.Should().Be(80.00m);
//    }

//    // ─── GetTotalCreditIssued ─────────────────────────────────────────────────

//    [Fact]
//    public void GetTotalCreditIssued_ShouldSumOnlyCreditSales()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 0.00m);

//        // Venta al contado (S/ 15.00)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Efectivo, 15.00m);

//        // Venta a crédito / fiado (S/ 45.00)
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Fiado, 45.00m);

//        // Act
//        var totalCredit = cashRegister.GetTotalCreditIssued();

//        // Assert
//        totalCredit.Should().Be(45.00m);
//    }

//    // ─── Close ────────────────────────────────────────────────────────────────

//    [Fact]
//    public void Close_WhenBalanced_ShouldCloseSuccessfullyWithoutNotes()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 100.00m);
//        AddSaleToCashRegister(cashRegister, SalePaymentType.Efectivo, 50.00m); // Esperado: 150.00

//        // Act
//        cashRegister.Close(physicalCashCount: 150.00m);

//        // Assert
//        cashRegister.IsOpen.Should().BeFalse();
//        cashRegister.ClosingBalance.Should().Be(150.00m);
//        cashRegister.ExpectedBalance.Should().Be(150.00m);
//        cashRegister.Difference.Should().Be(0.00m);
//        cashRegister.HasDifference().Should().BeFalse();
//        cashRegister.ClosedAt.Should().NotBeNull();
//    }

//    [Fact]
//    public void Close_WithShortageAndNotes_ShouldCloseAndRegisterDifference()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 100.00m); // Esperado: 100.00

//        // Act: Falta dinero (Contado: 90.00, Esperado: 100.00 -> Diferencia: -10.00)
//        cashRegister.Close(physicalCashCount: 90.00m, closingNotes: "Faltaron 10 soles por falta de cambio");

//        // Assert
//        cashRegister.IsOpen.Should().BeFalse();
//        cashRegister.Difference.Should().Be(-10.00m);
//        cashRegister.HasDifference().Should().BeTrue();
//        cashRegister.HasShortage().Should().BeTrue();
//        cashRegister.ClosingNotes.Should().Be("Faltaron 10 soles por falta de cambio");
//    }

//    [Fact]
//    public void Close_WithDifferenceAndNoNotes_ShouldThrowDomainException()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 100.00m);

//        // Act: Hay un sobrante pero no se envían notas
//        var action = () => cashRegister.Close(physicalCashCount: 110.00m, closingNotes: null);

//        // Assert
//        action.Should().Throw<DomainException>()
//            .WithMessage("*obligatorio ingresar una nota explicativa*");
//    }

//    [Fact]
//    public void Close_WhenAlreadyClosed_ShouldThrowInvalidEntityStateException()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 100.00m);
//        cashRegister.Close(physicalCashCount: 100.00m); // Ya cerrada

//        // Act
//        var action = () => cashRegister.Close(physicalCashCount: 100.00m);

//        // Assert
//        action.Should().Throw<InvalidEntityStateException>();
//    }

//    [Fact]
//    public void Close_WithNegativePhysicalCount_ShouldThrowDomainException()
//    {
//        // Arrange
//        var cashRegister = CashRegister.Create(Guid.NewGuid(), openingBalance: 100.00m);

//        // Act
//        var action = () => cashRegister.Close(physicalCashCount: -50.00m);

//        // Assert
//        action.Should().Throw<DomainException>()
//            .WithMessage("*no puede ser negativo*");
//    }
//}