namespace TiendaApi.Domain.Enums;
public enum PurchaseStatus
{
    Pendiente = 1,              // Registrada, en espera de recepción
    RecibidaConforme = 2,       // Recibida exacta (cantidades y costos iguales)
    RecibidaConDiferencia = 3,  // Recibida pero con variación en cantidades o costos
    Cancelada = 4
}
