namespace TiendaApi.Application.Common.Interfaces;
public interface ISkuService
{
    Task<string> GenerateForCategoryAsync(string productName, Guid categoryId);
}