using FluentAssertions;
using Moq;
using TiendaApi.Application.Common.Services;
using TiendaApi.Application.Features.Purchases;
using TiendaApi.Application.Features.Purchases.Request;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;
using TiendaApi.UnitTests.Helpers;

namespace TiendaApi.UnitTests.Application;

public class PurchaseServiceTests
{
    private readonly MockUnitOfWork _mockUow;
    private readonly PurchaseService _purchaseService;
    private readonly SkuService _skuService;

    public PurchaseServiceTests()
    {
        _mockUow = new MockUnitOfWork();

        // Se asegura de que las transacciones se ejecuten inmediatamente en los mocks
        _mockUow.Mock
            .Setup(u => u.ExecuteTransactionAsync(It.IsAny<Func<Task>>()))
            .Returns<Func<Task>>(async action => await action());

        _skuService = new SkuService(_mockUow.Object);
        _purchaseService = new PurchaseService(_mockUow.Object, _skuService);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private static void SetPrivateProperty(object instance, string propertyName, object? value)
    {
        var property = instance.GetType().GetProperty(propertyName) ??
            throw new ArgumentException($"La propiedad '{propertyName}' no existe en {instance.GetType().Name}");

        property.SetValue(instance, value);
    }

    private static Supplier CreateActiveSupplier(string name = "Proveedor Test")
    {
        return Supplier.Create(name);
    }

    private static Product CreateActiveProduct(
        int stock = 10,
        decimal purchasePrice = 2.00m,
        decimal salePrice = 5.00m)
    {
        return Product.Create(
            name: "Producto Test",
            sku: "TST-001",
            purchasePrice: purchasePrice,
            salePrice: salePrice,
            stock: stock,
            minStock: 5,
            categoryId: Guid.NewGuid());
    }

    private static CreatePurchaseRequest CreateRequest(
        Guid? supplierId = null,
        Guid? productId = null,
        CreateInlineProductRequest? newProduct = null,
        string invoiceNumber = "",
        int quantity = 5,
        decimal unitCost = 10.00m)
    {
        return new CreatePurchaseRequest
        (
            SupplierId: supplierId ?? Guid.NewGuid(),
            PaymentType: PurchasePaymentType.Contado,
            InvoiceNumber: invoiceNumber,
            Items:
            [
                new CreatePurchaseItemRequest
                (
                    productId,
                    newProduct,
                    quantity,
                    unitCost
                )
            ]
        );
    }

    private static User CreateUser()
    {
        return User.Create(
            username: "admin@test.com",
            name: "Administrador",
            lastName: "Sistema",
            passwordHash: "hashedpassword",
            role: UserRole.Admin
        );
    }

    // ─── CreateAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_WithValidRequest_ShouldCreatePurchase()
    {
        // Arrange
        var product = CreateActiveProduct();
        var supplier = CreateActiveSupplier();
        var supplierId = supplier.Id;
        var productId = product.Id;
        var userId = Guid.NewGuid();

        _mockUow.Suppliers
            .Setup(r => r.GetByIdAsync(supplierId))
            .ReturnsAsync(supplier);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([product]);

        var purchase = Purchase.Create(supplier.Id, userId, PurchasePaymentType.Contado, "F001-123");
        purchase.AddDetails([(product.Id, 5, 2.00m)]);

        var user = CreateUser();

        SetPrivateProperty(purchase, nameof(Purchase.Supplier), supplier);
        SetPrivateProperty(purchase, nameof(Purchase.User), user);

        foreach (var detail in purchase.Details)
        {
            SetPrivateProperty(detail, nameof(PurchaseDetail.Product), product);
        }

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(It.IsAny<Guid>()))
            .ReturnsAsync(purchase);

        var request = CreateRequest(supplierId, productId);

        // Act
        var result = await _purchaseService.CreateAsync(request, userId);

        // Assert
        result.Should().NotBeNull();
        result.Total.Should().Be(10.00m);

        _mockUow.Purchases.Verify(
            r => r.AddAsync(It.IsAny<Purchase>()), Times.Once);

        _mockUow.Mock.Verify(
            u => u.SaveChangesAsync(), Times.AtLeastOnce);
    }

    [Fact]
    public async Task CreateAsync_WithValidRequestAndNewProductItems_ShouldCreatePurchase()
    {
        // Arrange
        var supplier = CreateActiveSupplier();
        var supplierId = supplier.Id;
        var userId = Guid.NewGuid();

        // 1. Instanciamos la categoría de prueba
        var category = Category.Create("Categoría Test");

        // 2. MOCKEAMOS EL REPOSITORIO DE CATEGORÍAS (Soluciona el NotFoundException)
        _mockUow.Categories
            .Setup(r => r.GetByIdAsync(category.Id))
            .ReturnsAsync(category);

        _mockUow.Suppliers
            .Setup(r => r.GetByIdAsync(supplierId))
            .ReturnsAsync(supplier);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([]);

        var createdProduct = CreateActiveProduct();
        var purchase = Purchase.Create(supplier.Id, userId, PurchasePaymentType.Contado, "F001-123");
        purchase.AddDetails([(createdProduct.Id, 1, 10.00m)]);

        var user = CreateUser();

        SetPrivateProperty(purchase, nameof(Purchase.Supplier), supplier);
        SetPrivateProperty(purchase, nameof(Purchase.User), user);

        foreach (var detail in purchase.Details)
        {
            SetPrivateProperty(detail, nameof(PurchaseDetail.Product), createdProduct);
        }

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(It.IsAny<Guid>()))
            .ReturnsAsync(purchase);

        var newProductRequest = new CreateInlineProductRequest(
            Name: "Nuevo Producto",
            CategoryId: category.Id, // Se utiliza el ID mockeado
            SalePrice: 15.00m,
            MinStock: 5
        );

        var request = CreateRequest(supplierId, null, newProductRequest);

        // Act
        var result = await _purchaseService.CreateAsync(request, userId);

        // Assert
        result.Should().NotBeNull();

        _mockUow.Products.Verify(
            r => r.AddAsync(It.IsAny<Product>()), Times.Once);

        _mockUow.Purchases.Verify(
            r => r.AddAsync(It.IsAny<Purchase>()), Times.Once);

        _mockUow.Mock.Verify(
            u => u.SaveChangesAsync(), Times.AtLeastOnce);
    }

    [Fact]
    public async Task CreateAsync_WithInactiveSupplier_ShouldThrow()
    {
        // Arrange
        var supplier = CreateActiveSupplier();
        var supplierId = supplier.Id;
        supplier.Deactivate();

        _mockUow.Suppliers
            .Setup(r => r.GetByIdAsync(supplierId))
            .ReturnsAsync(supplier);

        var request = CreateRequest(supplierId: supplierId);

        // Act
        var action = async () =>
            await _purchaseService.CreateAsync(request, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<DomainException>()
            .WithMessage("*inactivo*");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentSupplier_ShouldThrow()
    {
        // Arrange
        _mockUow.Suppliers
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Supplier?)null);

        var request = CreateRequest();

        // Act
        var action = async () =>
            await _purchaseService.CreateAsync(request, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*Proveedor*");
    }

    [Fact]
    public async Task CreateAsync_WithNonExistentProduct_ShouldThrow()
    {
        // Arrange
        var supplier = CreateActiveSupplier();
        var productId = Guid.NewGuid();
        var supplierId = supplier.Id;

        _mockUow.Suppliers
            .Setup(r => r.GetByIdAsync(supplierId))
            .ReturnsAsync(supplier);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([]);

        var request = CreateRequest(supplierId, productId);

        // Act
        var action = async () =>
            await _purchaseService.CreateAsync(request, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<NotFoundException>()
            .WithMessage("*Producto*");
    }

    // ─── ReceiveAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task ReceiveAsync_WithValidPurchase_ShouldIncreaseStock()
    {
        // Arrange
        var product = CreateActiveProduct(stock: 5);
        var productId = product.Id;
        var userId = Guid.NewGuid();
        var supplier = CreateActiveSupplier();

        var purchase = Purchase.Create(supplier.Id, userId, PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;
        purchase.AddDetails([(productId, 10, 2.00m)]);

        var user = CreateUser();

        SetPrivateProperty(purchase, nameof(Purchase.Supplier), supplier);
        SetPrivateProperty(purchase, nameof(Purchase.User), user);
        foreach (var detail in purchase.Details)
        {
            SetPrivateProperty(detail, nameof(PurchaseDetail.Product), product);
        }

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(purchaseId))
            .ReturnsAsync(purchase);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([product]);

        var request = new ReceivePurchaseRequest(null, new List<ReceivePurchaseItemRequest>
            { new(product.Id, 10, 2.00m) }
        );

        // Act
        await _purchaseService.ReceiveAsync(purchaseId, request, userId);

        // Assert
        product.Stock.Should().Be(15);
        purchase.Status.Should().Be(PurchaseStatus.RecibidaConforme);

        _mockUow.StockMovements.Verify(
            r => r.AddAsync(It.IsAny<StockMovement>()), Times.Once);
    }

    [Fact]
    public async Task ReceiveAsync_WithPartialQuantity_ShouldUpdateDetailQuantityAndStockPartially()
    {
        // Arrange
        var product = CreateActiveProduct(stock: 5, purchasePrice: 10.00m, salePrice: 15.00m);
        var productId = product.Id;
        var userId = Guid.NewGuid();
        var supplier = CreateActiveSupplier();

        var purchase = Purchase.Create(supplier.Id, userId, PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;
        purchase.AddDetails([(productId, 2, 10.00m)]);

        SetPrivateProperty(purchase, nameof(Purchase.Supplier), supplier);
        SetPrivateProperty(purchase, nameof(Purchase.User), CreateUser());
        foreach (var d in purchase.Details)
        {
            SetPrivateProperty(d, nameof(PurchaseDetail.Product), product);
        }

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(purchaseId))
            .ReturnsAsync(purchase);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([product]);

        var request = new ReceivePurchaseRequest(null, new List<ReceivePurchaseItemRequest>
            { new ReceivePurchaseItemRequest(productId, 1, 11.00m) }
        );

        // Act
        await _purchaseService.ReceiveAsync(purchaseId, request, userId);

        // Assert
        product.Stock.Should().Be(6);

        var detail = purchase.Details.First(d => d.ProductId == productId);
        detail.OrderedQuantity.Should().Be(2);
        detail.ReceivedQuantity.Should().Be(1);
        detail.ExpectedUnitCost.Should().Be(10.00m);
        detail.ActualUnitCost.Should().Be(11.00m);
        purchase.Total.Should().Be(11.00m);
        purchase.Status.Should().Be(PurchaseStatus.RecibidaConDiferencia);
    }

    [Fact]
    public async Task ReceiveAsync_ShouldUpdateProductPurchasePrice()
    {
        // Arrange
        var product = CreateActiveProduct(purchasePrice: 2.00m);
        var productId = product.Id;
        var userId = Guid.NewGuid();
        var supplier = CreateActiveSupplier();

        var purchase = Purchase.Create(supplier.Id, userId, PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;
        purchase.AddDetails([(productId, 5, 2.00m)]);

        SetPrivateProperty(purchase, nameof(Purchase.Supplier), supplier);
        SetPrivateProperty(purchase, nameof(Purchase.User), CreateUser());
        foreach (var detail in purchase.Details)
        {
            SetPrivateProperty(detail, nameof(PurchaseDetail.Product), product);
        }

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(purchaseId))
            .ReturnsAsync(purchase);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([product]);

        var request = new ReceivePurchaseRequest(null, new List<ReceivePurchaseItemRequest>
            { new ReceivePurchaseItemRequest(productId, 5, 2.5m) }
        );

        // Act
        await _purchaseService.ReceiveAsync(purchaseId, request, userId);

        // Assert
        product.PurchasePrice.Should().Be(2.50m);
        purchase.Details.First().ActualUnitCost.Should().Be(2.50m);
        purchase.Total.Should().Be(12.50m);
    }

    [Fact]
    public async Task ReceiveAsync_WithAlreadyReceivedPurchase_ShouldThrow()
    {
        // Arrange
        var purchase = Purchase.Create(
            Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;
        Product product = CreateActiveProduct();
        purchase.AddDetails([(product.Id, 5, 10.00m)]);

        purchase.Receive([(product.Id, 5, 10.00m)], "F001-123");

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(purchaseId))
            .ReturnsAsync(purchase);

        var request = new ReceivePurchaseRequest(null, new List<ReceivePurchaseItemRequest>
            { new(Guid.NewGuid(), 5, 10.00m) }
        );

        // Act
        var action = async () =>
            await _purchaseService.ReceiveAsync(purchaseId, request, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<DomainException>();
    }

    [Fact]
    public async Task ReceiveAsync_WithNonExistentPurchase_ShouldThrow()
    {
        // Arrange
        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Purchase?)null);

        var request = new ReceivePurchaseRequest(null, new List<ReceivePurchaseItemRequest>
            { new(Guid.NewGuid(), 5, 10.00m) }
        );

        // Act
        var action = async () =>
            await _purchaseService.ReceiveAsync(
                Guid.NewGuid(), request, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task ReceiveAsync_WithZeroQuantity_ShouldNotCreateStockMovementNorIncreaseStock()
    {
        // Arrange
        var product = CreateActiveProduct(stock: 10);
        var productId = product.Id;
        var userId = Guid.NewGuid();
        var supplier = CreateActiveSupplier();

        var purchase = Purchase.Create(supplier.Id, userId, PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;
        purchase.AddDetails([(productId, 5, 2.00m)]);

        SetPrivateProperty(purchase, nameof(Purchase.Supplier), supplier);
        SetPrivateProperty(purchase, nameof(Purchase.User), CreateUser());
        foreach (var detail in purchase.Details)
        {
            SetPrivateProperty(detail, nameof(PurchaseDetail.Product), product);
        }

        _mockUow.Purchases
            .Setup(r => r.GetWithDetailsAsync(purchaseId))
            .ReturnsAsync(purchase);

        _mockUow.Products
            .Setup(r => r.GetByIdsAsync(It.IsAny<IEnumerable<Guid>>()))
            .ReturnsAsync([product]);

        var request = new ReceivePurchaseRequest(null, new List<ReceivePurchaseItemRequest>
            { new(productId, 0, 2.00m) }
        );

        // Act
        await _purchaseService.ReceiveAsync(purchaseId, request, userId);

        // Assert
        product.Stock.Should().Be(10);

        _mockUow.StockMovements.Verify(
            r => r.AddAsync(It.IsAny<StockMovement>()),
            Times.Never);
    }

    // ─── CancelAsync ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CancelAsync_WhenPending_ShouldCancel()
    {
        // Arrange
        var purchase = Purchase.Create(
            Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;

        _mockUow.Purchases
           .Setup(r => r.GetByIdAsync(purchaseId))
           .ReturnsAsync(purchase);

        // Act
        await _purchaseService.CancelAsync(purchaseId, Guid.NewGuid());

        // Assert
        purchase.Status.Should().Be(PurchaseStatus.Cancelada);
        _mockUow.Purchases.Verify(r => r.Update(purchase), Times.Once);
    }

    [Fact]
    public async Task CancelAsync_WhenReceived_ShouldThrow()
    {
        // Arrange
        var purchase = Purchase.Create(
            Guid.NewGuid(), Guid.NewGuid(), PurchasePaymentType.Contado);
        var purchaseId = purchase.Id;
        Product product = CreateActiveProduct();
        purchase.AddDetails([(product.Id, 5, 10.00m)]);
        purchase.Receive([(product.Id, 5, 10.00m)], "F001-123");

        _mockUow.Purchases
            .Setup(r => r.GetByIdAsync(purchaseId))
            .ReturnsAsync(purchase);

        // Act
        var action = async () =>
            await _purchaseService.CancelAsync(purchaseId, Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<InvalidEntityStateException>();
    }

    [Fact]
    public async Task CancelAsync_WithNonExistentPurchase_ShouldThrow()
    {
        // Arrange
        _mockUow.Purchases
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Purchase?)null);

        // Act
        var action = async () =>
            await _purchaseService.CancelAsync(Guid.NewGuid(), Guid.NewGuid());

        // Assert
        await action.Should().ThrowAsync<NotFoundException>();
    }
}