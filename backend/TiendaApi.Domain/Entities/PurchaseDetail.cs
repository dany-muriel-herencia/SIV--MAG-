using TiendaApi.Domain.Common;
using TiendaApi.Domain.Exceptions;

namespace TiendaApi.Domain.Entities;
public class PurchaseDetail : BaseEntity
{
    // Pactado originalmente
    public int OrderedQuantity { get; private set; }
    public decimal ExpectedUnitCost { get; private set; }

    // Real recibido (Nulo mientras esté Pendiente)
    public int? ReceivedQuantity { get; private set; }
    public decimal? ActualUnitCost { get; private set; }

    public decimal Subtotal { get; private set; }

    // FKs protegidas
    public Guid PurchaseId { get; private set; }
    public Guid ProductId { get; private set; }

    // Navegación
    public Purchase Purchase { get; private set; } = null!;
    public Product Product { get; private set; } = null!;

    // Propiedades calculadas útiles
    public decimal ExpectedSubtotal => OrderedQuantity * ExpectedUnitCost;
    public decimal ActualSubtotal => (ReceivedQuantity ?? 0) * (ActualUnitCost ?? ExpectedUnitCost);

    public bool HasDiscrepancy => ReceivedQuantity.HasValue &&
        (ReceivedQuantity.Value != OrderedQuantity || ActualUnitCost != ExpectedUnitCost);

    private PurchaseDetail() { }

    public static PurchaseDetail Create(Guid productId, int orderedQuantity, decimal expectedUnitCost)
    {
        if (productId == Guid.Empty)
            throw new DomainException("El producto es obligatorio.");

        if (orderedQuantity <= 0)
            throw new DomainException("La cantidad ordenada debe ser mayor a cero.");

        if (expectedUnitCost < 0)
            throw new DomainException("El costo esperado no puede ser negativo.");

        var detail = new PurchaseDetail
        {
            ProductId = productId,
            OrderedQuantity = orderedQuantity,
            ExpectedUnitCost = expectedUnitCost
        };

        // Calculamos el subtotal inicial proyectado
        detail.CalculateSubtotal();

        return detail;
    }

    // Registra la recepción real de este ítem.
    public void RegisterReception(int receivedQuantity, decimal actualUnitCost)
    {
        if (receivedQuantity < 0)
            throw new DomainException("La cantidad recibida no puede ser negativa.");

        if (actualUnitCost < 0)
            throw new DomainException("El costo unitario real no puede ser negativo.");

        ReceivedQuantity = receivedQuantity;
        ActualUnitCost = actualUnitCost;

        CalculateSubtotal();
    }
    private void CalculateSubtotal()
    {
        // Si ya se recibió, el subtotal real es sobre lo recibido. 
        // Si aún está pendiente, el subtotal se calcula sobre lo ordenado.
        if (ReceivedQuantity.HasValue)
        {
            Subtotal = ReceivedQuantity.Value * (ActualUnitCost ?? ExpectedUnitCost);
        }
        else
        {
            Subtotal = OrderedQuantity * ExpectedUnitCost;
        }
    }
}
