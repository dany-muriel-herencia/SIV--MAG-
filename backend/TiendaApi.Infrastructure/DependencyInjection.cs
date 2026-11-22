using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TiendaApi.Domain.Interfaces;
using TiendaApi.Infrastructure.Data;
using TiendaApi.Infrastructure.Data.Seed;
using TiendaApi.Infrastructure.Repositories;
using TiendaApi.Infrastructure.Security;

namespace TiendaApi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddDatabase(configuration)
            .AddRepositories()
            .AddSecurity(configuration);

        return services;
    }

    public static string BuildPostgresConnectionString(IConfiguration configuration)
    {
        // Prioridad 1: Variables individuales 12-Factor (DB_HOST, DB_PORT, etc.)
        var host = configuration["DB_HOST"];
        var port = configuration["DB_PORT"] ?? "5432";
        var db = configuration["DB_DATABASE"];
        var user = configuration["DB_USERNAME"];
        var pass = configuration["DB_PASSWORD"];

        if (!string.IsNullOrWhiteSpace(host) &&
            !string.IsNullOrWhiteSpace(db) &&
            !string.IsNullOrWhiteSpace(user) &&
            !string.IsNullOrWhiteSpace(pass))
        {
            return $"Host={host};Port={port};Database={db};Username={user};Password={pass};Include Error Detail=false";
        }

        // Prioridad 2: ConnectionStrings__DefaultConnection
        var connString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connString))
        {
            return connString;
        }

        throw new InvalidOperationException(
            "CONFIG_ERROR: Faltan variables obligatorias de base de datos (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD o ConnectionStrings__DefaultConnection).");
    }

    private static IServiceCollection AddDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = BuildPostgresConnectionString(configuration);

        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(
                connectionString,
                npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null
                    );
                }
            );
        });

        services.AddScoped<DataSeeder>();
        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        return services;
    }

    private static IServiceCollection AddSecurity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        return services;
    }
}