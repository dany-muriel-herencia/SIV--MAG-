    using TiendaApi.Application.Common.Interfaces;
using TiendaApi.Application.Features.Purchases.Request;
using TiendaApi.Application.Features.Purchases.Response;
using TiendaApi.Application.Interfaces.Services;
using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;
using TiendaApi.Domain.Enums;
using TiendaApi.Domain.Exceptions;
using TiendaApi.Domain.Interfaces;

namespace TiendaApi.Application.Features.Purchases;

public class PurchaseService(IUnitOfWork _uow, ISkuService _skuService) : IPurchaseService
{
    public async Task<PurchaseResponse> GetByIdAsync(Guid id)
    {
        var purchase = await _uow.Purchases.GetWithDetailsAsync(id)
            ?? throw new NotFoundException("Compra", id);

        return MapToResponse(purchase);
    }
    public async Task<PurchaseResponse> CreateAsync(CreatePurchaseRequest request, Guid userId)
    {
        Supplier? supplier = null;
        if (request.SupplierId.HasValue)
        {
            supplier = await _uow.Suppliers.GetByIdAsync(request.SupplierId.Value)
                ?? throw new NotFoundException("Proveedor", request.SupplierId.Value);

            if (!supplier.IsActive)
                throw new DomainException($"El proveedor '{supplier.Name}' está inactivo.");
        }

        PurchaseResponse response = null!;

        // Envolvemos todo en la transacción del Unit of Work
        await _uow.ExecuteTransactionAsync(async () =>
        {
            // 1. Buscamos solo los productos EXISTENTES que vienen en la petición
            var existingProductIds = request.Items
                .Where(i => i.ProductId.HasValue)
                .Select(i => i.ProductId!.Value)
                .Distinct()
                .ToList();

            var existingProducts = await _uow.Products.GetByIdsAsync(existingProductIds);
            var productDict = existingProducts.ToDictionary(p => p.Id);

            var detailsToCreate = new List<(Guid ProductId, int Quantity, decimal UnitCost)>();

            // 2. Recorremos cada ítem de la compra
            foreach (var item in request.Items)
            {
                Guid finalProductId;

                if (item.ProductId.HasValue)
                {
                    // Si el producto existe, validamos que esté en el diccionario y activo
                    if (!productDict.TryGetValue(item.ProductId.Value, out var existingProduct))
                        throw new NotFoundException("Producto", item.ProductId.Value);

                    if (!existingProduct.IsActive)
                        throw new DomainException($"El producto '{existingProduct.Name}' no está activo.");

                    finalProductId = existingProduct.Id;
                }
                else if (item.NewProduct != null)
                {
                    // Si es un producto nuevo INLINE, generamos su SKU de forma desacoplada
                    var generatedSku = await _skuService.GenerateForCategoryAsync(
                        item.NewProduct.Name,
                        item.NewProduct.CategoryId
                    );

                    // Instanciamos el producto con costo inicial
                    var newProduct = Product.Create(
                        name: item.NewProduct.Name,
                        sku: generatedSku,
                        purchasePrice: item.UnitCost,
                        salePrice: item.NewProduct.SalePrice,
                        minStock: item.NewProduct.MinStock,
                        categoryId: item.NewProduct.CategoryId,
                        supplierId: supplier?.Id
                    );

                    await _uow.Products.AddAsync(newProduct);
                    finalProductId = newProduct.Id; // El Id (GUID) ya existe en memoria gracias a DDD
                }
                else
                {
                    throw new DomainException("Cada ítem debe ser un producto existente o los datos de uno nuevo.");
                }

                // Guardamos la tupla con la cantidad ordenada y costo presupuestado
                detailsToCreate.Add((finalProductId, item.Quantity, item.UnitCost));
            }

            // 3. Fabricamos el Agregado de Compra
            var purchase = Purchase.Create(
                supplierId: supplier?.Id,
                userId: userId,
                paymentType: request.PaymentType,
                invoiceNumber: request.InvoiceNumber);

            // Agregamos los detalles (esta llamada ejecuta internamente RecalculateTotal())
            purchase.AddDetails(detailsToCreate);

            await _uow.Purchases.AddAsync(purchase);

            // Guarda en base de datos tanto los nuevos productos como la compra y sus detalles
            await _uow.SaveChangesAsync();

            var created = await _uow.Purchases.GetWithDetailsAsync(purchase.Id);
            response = MapToResponse(created!);
        });

        return response;
    }

    public async Task<PurchaseResponse> ReceiveAsync(Guid id, ReceivePurchaseRequest request, Guid userId)
    {
        PurchaseResponse response = null!;

        await _uow.ExecuteTransactionAsync(async () =>
        {
            // 1. Obtenemos la compra con sus detalles e inclusiones desde la DB
            var purchase = await _uow.Purchases.GetWithDetailsAsync(id)
                ?? throw new NotFoundException("Compra", id);

            if(purchase.Status != PurchaseStatus.Pendiente)
                throw new DomainException($"La compra '{purchase.Id}' no está en estado Pendiente y no puede recibir productos.");

            // Convertimos la lista del DTO a las tuplas que espera la entidad de Dominio
            var itemsReceived = request.Items
                .Select(i => (i.ProductId, i.ReceivedQuantity, i.ActualUnitCost))
                .ToList();

            // 2. El Agregado de Dominio procesa la recepción y detecta si hay discrepancias
            purchase.Receive(itemsReceived, request.InvoiceNumber);

            // 3. Obtenemos de la DB los productos que SÍ tuvieron recepción física (> 0)
            var physicalItems = request.Items.Where(i => i.ReceivedQuantity > 0).ToList();

            if (physicalItems.Count != 0)
            {
                var productIds = physicalItems.Select(i => i.ProductId).Distinct().ToList();
                var products = await _uow.Products.GetByIdsAsync(productIds);
                var productDict = products.ToDictionary(p => p.Id);

                foreach (var item in physicalItems)
                {
                    if (!productDict.TryGetValue(item.ProductId, out var product))
                        throw new NotFoundException("Producto", item.ProductId);

                    // Capturamos el stock antes del movimiento para la trazabilidad/auditoría
                    var stockBefore = product.Stock;

                    // Incrementar stock físico en el producto
                    product.AddStock(item.ReceivedQuantity);

                    // Actualizamos el costo de compra en el catálogo con el costo real que cobró el proveedor
                    product.Update(
                        name: product.Name,
                        purchasePrice: item.ActualUnitCost,
                        salePrice: product.SalePrice,
                        minStock: product.MinStock,
                        categoryId: product.CategoryId,
                        supplierId: product.SupplierId
                    );

                    _uow.Products.Update(product);

                    // 4. Creamos el registro en la tabla de Kardex (StockMovements)
                    var movement = StockMovement.ForPurchase(
                        productId: product.Id,
                        userId: userId,
                        quantity: item.ReceivedQuantity, // Cantidad física REAL
                        stockBefore: stockBefore,
                        purchaseId: purchase.Id
                    );

                    await _uow.StockMovements.AddAsync(movement);
                }
            }

            // 5. Guardamos el estado final de la compra y los productos actualizados
            _uow.Purchases.Update(purchase);
            await _uow.SaveChangesAsync();

            var received = await _uow.Purchases.GetWithDetailsAsync(purchase.Id);
            response = MapToResponse(received!);
        });

        return response;
    }

    public async Task<PagedResult<PurchaseSummaryResponse>> GetPagedAsync(int page, int pageSize, 
        Guid? supplierId = null, PurchaseStatus? status = null, DateTime? from = null, DateTime? to = null)
    {
        var result = await _uow.Purchases.GetPagedAsync(page, pageSize, supplierId, status, from, to);
        var dtos = result.Items.Select(MapToSummary).ToList();

        return new PagedResult<PurchaseSummaryResponse>(dtos, result.TotalCount, result.Page, result.PageSize);
    }

    public async Task CancelAsync(Guid id, Guid userId)
    {
        var purchase = await _uow.Purchases.GetByIdAsync(id)
            ?? throw new NotFoundException("Compra", id);

        // La entidad valida que esté en estado Pendiente
        purchase.Cancel();

        _uow.Purchases.Update(purchase);
        await _uow.SaveChangesAsync();
    }

    private static PurchaseResponse MapToResponse(Purchase purchase)
    {
        return new PurchaseResponse(
            purchase.Id,
            purchase.Date,
            purchase.Status,
            purchase.PaymentType,
            purchase.Subtotal,
            purchase.Total,
            purchase.IGV,
            purchase.InvoiceNumber,
            purchase.SupplierId,
            purchase.Supplier?.Name ?? string.Empty,
            purchase.UserId,
            purchase.User.FullName ?? string.Empty,
            [.. purchase.Details.Select(d => new PurchaseDetailResponse(
            d.Id,
            d.ProductId,
            d.Product.Name,
            d.Product.SKU,
            d.OrderedQuantity,
            d.ExpectedUnitCost,
            d.ReceivedQuantity,
            d.ActualUnitCost,
            d.Subtotal,
            d.HasDiscrepancy
        ))],
            purchase.CreatedAt,
            purchase.UpdatedAt
        );
    }

    private static PurchaseSummaryResponse MapToSummary(Purchase purchase)
    {
        return new PurchaseSummaryResponse(
            purchase.Id,
            purchase.Date,
            purchase.Status,
            purchase.PaymentType,
            purchase.Total,
            purchase.InvoiceNumber ?? string.Empty,
            purchase.Supplier?.Name ?? string.Empty,
            purchase.User.FullName ?? string.Empty,
            purchase.Details.Any(d => d.HasDiscrepancy) // Faltaba mapear HasDiscrepancy en tu código original
        );
    }

}