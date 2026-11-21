using FluentAssertions;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.UnitTests.Domain;

public class PurchaseTests
{
    // ─── Create ───────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidParameters_ShouldCreatePendingPurchase()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var supplierId = Guid.NewGuid();
        var paymentType = PurchasePaymentType.Contado;
        var invoiceNumber = " F001-0001 ";

        // Act
        var purchase = Purchase.Create(supplierId, userId, paymentType, invoiceNumber);

        // Assert
        purchase.Should().NotBeNull();
        purchase.SupplierId.Should().Be(supplierId);
        purchase.UserId.Should().Be(userId);
        purchase.PaymentType.Should().Be(paymentType);
        purchase.InvoiceNumber.Should().Be("F001-0001"); // Trimmed
        purchase.Status.Should().Be(PurchaseStatus.Pendiente);
        purchase.IsPending().Should().BeTrue();
        purchase.CanBeReceived().Should().BeTrue();
        purchase.CanBeCancelled().Should().BeTrue();
        purchase.Total.Should().Be(0);
        purchase.Subtotal.Should().Be(0);
        purchase.IGV.Should().Be(0);
        purchase.Details.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrowDomainException()
    {
        // Act
        var action = () => Purchase.Create(Guid.NewGuid(), Guid.Empty, PurchasePaymentType.Contado);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*usuario es obligatorio*");
    }

    // ─── AddDetails & RecalculateTotal ────────────────────────────────────────

    [Fact]
    public void AddDetails_WithValidItems_ShouldAddDetailsAndRecalculateTotalsWithIGV()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var productId1 = Guid.NewGuid();
        var productId2 = Guid.NewGuid();

        // 2 items a S/ 10.00 = S/ 20.00 | 1 item a S/ 39.00 = S/ 39.00 -> Total = S/ 59.00
        var items = new List<(Guid ProductId, int Quantity, decimal UnitPrice)>
        {
            (productId1, 2, 10.00m),
            (productId2, 1, 39.00m)
        };

        // Act
        purchase.AddDetails(items);

        // Assert
        purchase.Details.Should().HaveCount(2);
        purchase.Total.Should().Be(59.00m);
        purchase.Subtotal.Should().Be(50.00m); // 59 / 1.18
        purchase.IGV.Should().Be(9.00m);       // 59 - 50
    }

    [Fact]
    public void AddDetails_WhenPurchaseIsCancelled_ShouldThrowInvalidEntityStateException()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        purchase.Cancel();

        // Act
        var action = () => purchase.AddDetails([(Guid.NewGuid(), 1, 10.00m)]);

        // Assert
        action.Should().Throw<InvalidEntityStateException>();
    }

    [Fact]
    public void AddDetails_WhenPurchaseIsAlreadyReceived_ShouldThrowInvalidEntityStateException()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var productId = Guid.NewGuid();
        purchase.AddDetails([(productId, 5, 10.00m)]);
        purchase.Receive([(productId, 5, 10.00m)]);

        // Act
        var action = () => purchase.AddDetails([(Guid.NewGuid(), 1, 10.00m)]);

        // Assert
        action.Should().Throw<InvalidEntityStateException>();
    }

    // ─── Receive ──────────────────────────────────────────────────────────────

    [Fact]
    public void Receive_ConformQuantityAndCost_ShouldSetStatusToRecibidaConforme()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var productId = Guid.NewGuid();
        purchase.AddDetails([(productId, 10, 5.00m)]); // Ordenado: 10 u a S/ 5.00 (Total = S/ 50.00)

        var itemsReceived = new List<(Guid ProductId, int ReceivedQty, decimal ActualCost)>
        {
            (productId, 10, 5.00m) // Recibido exactamente igual
        };

        // Act
        purchase.Receive(itemsReceived, invoiceNumber: "F001-999");

        // Assert
        purchase.Status.Should().Be(PurchaseStatus.RecibidaConforme);
        purchase.IsReceived().Should().BeTrue();
        purchase.InvoiceNumber.Should().Be("F001-999");
        purchase.Total.Should().Be(50.00m);
    }

    [Fact]
    public void Receive_WithQuantityOrCostDiscrepancy_ShouldSetStatusToRecibidaConDiferencia()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var productId = Guid.NewGuid();
        purchase.AddDetails([(productId, 10, 5.00m)]); // Solicitado: 10 u a S/ 5.00

        var itemsReceived = new List<(Guid ProductId, int ReceivedQty, decimal ActualCost)>
        {
            (productId, 8, 6.00m) // Recibido: 8 u a S/ 6.00 (Hay diferencia en cantidad y costo)
        };

        // Act
        purchase.Receive(itemsReceived);

        // Assert
        purchase.Status.Should().Be(PurchaseStatus.RecibidaConDiferencia);
        purchase.IsReceived().Should().BeTrue();
        purchase.Total.Should().Be(48.00m); // 8 * 6.00 = 48.00
    }

    [Fact]
    public void Receive_WhenMissingItemInReceptionList_ShouldMarkMissingItemAsZeroAndSetRecibidaConDiferencia()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var productId1 = Guid.NewGuid();
        var productId2 = Guid.NewGuid();

        purchase.AddDetails([
            (productId1, 5, 10.00m),
            (productId2, 2, 20.00m)
        ]);

        // Solo enviamos recepción para el producto 1 (el producto 2 no vino)
        var itemsReceived = new List<(Guid ProductId, int ReceivedQty, decimal ActualCost)>
        {
            (productId1, 5, 10.00m)
        };

        // Act
        purchase.Receive(itemsReceived);

        // Assert
        purchase.Status.Should().Be(PurchaseStatus.RecibidaConDiferencia);

        var missingDetail = purchase.Details.First(d => d.ProductId == productId2);
        missingDetail.ReceivedQuantity.Should().Be(0);
        missingDetail.HasDiscrepancy.Should().BeTrue();
        purchase.Total.Should().Be(50.00m); // Solo cuenta el producto 1 (5 * 10)
    }

    [Fact]
    public void Receive_WithUnrelatedProductId_ShouldThrowDomainException()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        purchase.AddDetails([(Guid.NewGuid(), 5, 10.00m)]);

        var unlistedProductId = Guid.NewGuid();
        var itemsReceived = new List<(Guid ProductId, int ReceivedQty, decimal ActualCost)>
        {
            (unlistedProductId, 5, 10.00m)
        };

        // Act
        var action = () => purchase.Receive(itemsReceived);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*no pertenece a esta compra*");
    }

    [Fact]
    public void Receive_WhenNotPending_ShouldThrowInvalidEntityStateException()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        purchase.Cancel();

        // Act
        var action = () => purchase.Receive([]);

        // Assert
        action.Should().Throw<InvalidEntityStateException>();
    }

    // ─── Cancel ───────────────────────────────────────────────────────────────

    [Fact]
    public void Cancel_WhenPending_ShouldSetStatusToCancelada()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);

        // Act
        purchase.Cancel();

        // Assert
        purchase.Status.Should().Be(PurchaseStatus.Cancelada);
        purchase.IsCancelled().Should().BeTrue();
        purchase.CanBeCancelled().Should().BeFalse();
        purchase.CanBeReceived().Should().BeFalse();
    }

    [Fact]
    public void Cancel_WhenAlreadyReceived_ShouldThrowInvalidEntityStateException()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var productId = Guid.NewGuid();
        purchase.AddDetails([(productId, 5, 10.00m)]);
        purchase.Receive([(productId, 5, 10.00m)]);

        // Act
        var action = () => purchase.Cancel();

        // Assert
        action.Should().Throw<InvalidEntityStateException>();
    }

    // ─── UpdateInvoiceNumber ──────────────────────────────────────────────────

    [Fact]
    public void UpdateInvoiceNumber_WithValidString_ShouldUpdateAndTrim()
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);

        // Act
        purchase.UpdateInvoiceNumber(" F002-888 ");

        // Assert
        purchase.InvoiceNumber.Should().Be("F002-888");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void UpdateInvoiceNumber_WithNullOrEmpty_ShouldThrowDomainException(string? invalidInvoice)
    {
        // Arrange
        var purchase = Purchase.Create(Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);

        // Act
        var action = () => purchase.UpdateInvoiceNumber(invalidInvoice!);

        // Assert
        action.Should().Throw<DomainException>()
            .WithMessage("*número de factura no puede estar vacío*");
    }
}