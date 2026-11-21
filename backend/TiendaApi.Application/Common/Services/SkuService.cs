using TiendaApi.Application.Common.Interfaces;
using TiendaApi.Domain.Exceptions;
using TiendaApi.Domain.Helpers;
using TiendaApi.Domain.Interfaces;

namespace TiendaApi.Application.Common.Services;

public class SkuService(IUnitOfWork _uow) : ISkuService
{

    public async Task<string> GenerateForCategoryAsync(string productName, Guid categoryId)
    {
        var category = await _uow.Categories.GetByIdAsync(categoryId)
            ?? throw new NotFoundException("Categoría", categoryId);

        var sequence = await _uow.Products.CountAsync(p => p.CategoryId == categoryId) + 1;

        var sku = SkuGenerator.Generate(category.Name, productName, sequence);

        var skuExists = await _uow.Products.SkuExistsAsync(sku);
        if (skuExists)
        {
            sku = $"{sku}-{Guid.NewGuid().ToString()[..4]}";
        }

        return sku;
    }
}