using FluentValidation;
using TiendaApi.Application.Features.Purchases.Request;

namespace TiendaApi.Application.Features.Purchases.Validator;

public class CreatePurchaseValidator : AbstractValidator<CreatePurchaseRequest>
{
    public CreatePurchaseValidator()
    {
        RuleFor(x => x.PaymentType)
            .IsInEnum().WithMessage("Tipo de pago inválido.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("La compra debe tener al menos un producto.");

        // Delegamos la validación de cada ítem a CreatePurchaseItemRequestValidator
        RuleForEach(x => x.Items)
            .SetValidator(new CreatePurchaseItemRequestValidator());
    }
}

public class CreatePurchaseItemRequestValidator : AbstractValidator<CreatePurchaseItemRequest>
{
    public CreatePurchaseItemRequestValidator()
    {
        // 1. Regla Excluyente: Debe venir ProductId O NewProduct (nunca ambos, nunca ninguno)
        RuleFor(x => x)
            .Must(x => (x.ProductId.HasValue && x.NewProduct == null) ||
                       (!x.ProductId.HasValue && x.NewProduct != null))
            .WithMessage("Cada ítem debe especificar un producto existente o los datos de uno nuevo.");

        // 2. Si se envió un ProductId, validar que no sea Guid.Empty
        When(x => x.ProductId.HasValue, () =>
        {
            RuleFor(x => x.ProductId!.Value)
                .NotEmpty()
                .WithMessage("El ID del producto especificado no es válido.");
        });

        // 3. Si se envió NewProduct, validar los campos del producto nuevo
        When(x => x.NewProduct != null, () =>
        {
            RuleFor(x => x.NewProduct!.Name)
                .NotEmpty()
                .WithMessage("El nombre del producto nuevo es obligatorio.");

            RuleFor(x => x.NewProduct!.CategoryId)
                .NotEmpty()
                .WithMessage("La categoría del producto nuevo es obligatoria.");

            RuleFor(x => x.NewProduct!.SalePrice)
                .GreaterThanOrEqualTo(0)
                .WithMessage("El precio de venta no puede ser negativo.");
        });

        // 4. Cantidad y Costo
        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("La cantidad debe ser mayor a cero.");

        RuleFor(x => x.UnitCost)
            .GreaterThanOrEqualTo(0)
            .WithMessage("El costo unitario no puede ser negativo.");
    }
}

public class ReceivePurchaseValidator : AbstractValidator<ReceivePurchaseRequest>
{
    public ReceivePurchaseValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Debe enviar los ítems recibidos.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("El producto es obligatorio.");

            // Se permite 0 por si un producto no fue entregado por el proveedor
            item.RuleFor(x => x.ReceivedQuantity)
                .GreaterThanOrEqualTo(0)
                .WithMessage("La cantidad recibida no puede ser negativa.");

            item.RuleFor(x => x.ActualUnitCost)
                .GreaterThanOrEqualTo(0)
                .WithMessage("El costo real no puede ser negativo.");
        });
    }
}