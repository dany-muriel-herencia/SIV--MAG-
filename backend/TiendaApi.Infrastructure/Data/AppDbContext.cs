using Microsoft.EntityFrameworkCore;
using System.Reflection;
using TiendaApi.Domain.Common;
using TiendaApi.Domain.Entities;

namespace TiendaApi.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleDetail> SaleDetails => Set<SaleDetail>();
    public DbSet<Purchase> Purchases => Set<Purchase>();
    public DbSet<PurchaseDetail> PurchaseDetails => Set<PurchaseDetail>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<CreditPayment> CreditPayments => Set<CreditPayment>();
    public DbSet<CashRegister> CashRegisters => Set<CashRegister>();
    public DbSet<Alert> Alerts => Set<Alert>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(modelBuilder);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var properties = entityType.GetProperties();

            foreach (var property in properties)
            {
                // Si la propiedad es DateTime, forzar a que al leer se marque como UTC
                if (property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                        v => v, // Al guardar se queda igual (ya viene en Utc por tu código)
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc) // Al leer, le inyecta Kind.Utc
                    ));
                }
                // Si la propiedad es DateTime? (nullable) como tu UpdatedAt
                else if (property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime?, DateTime?>(
                        v => v,
                        v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : null
                    ));
                }
            }
        }
    }


    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auditoría automática — antes de guardar cualquier cambio,
        // actualiza CreatedAt y UpdatedAt automáticamente
        UpdateAuditFields();

        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    // Nunca permitir que se modifique CreatedAt
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    break;
            }
        }
    }
}