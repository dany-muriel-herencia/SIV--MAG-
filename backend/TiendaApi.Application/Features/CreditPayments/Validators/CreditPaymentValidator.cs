using FluentValidation;
using TiendaApi.Application.Features.CreditPayments.Request;

namespace TiendaApi.Application.Features.CreditPayments.Validators;

public class RegisterPaymentValidator : AbstractValidator<CreateCreditPaymentRequest>
{
    public RegisterPaymentValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("El ID del cliente es obligatorio.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("El monto debe ser mayor a cero.");

        RuleFor(x => x.PaymentType)
            .IsInEnum().WithMessage("Tipo de pago inválido.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Las notas no pueden superar 500 caracteres.")
            .When(x => x.Notes is not null);
    }
}