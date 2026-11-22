using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using System.Text;
using System.Text.Json;
using TiendaApi.Application;
using TiendaApi.Infrastructure;
using TiendaApi.Infrastructure.Data;
using TiendaApi.Infrastructure.Data.Seed;
using TiendaApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ─── FACTOR XI: LOGS ESTRUCTURADOS EN JSON A STDOUT/STDERR ───────────────────
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
    options.JsonWriterOptions = new JsonWriterOptions { Indented = false };
});

// ─── FACTOR III: VALIDACIÓN FAIL-FAST DE CONFIGURACIÓN OBLIGATORIA ───────────
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
{
    throw new InvalidOperationException(
        "CONFIG_ERROR: La variable obligatoria 'JwtSettings__SecretKey' no está definida o tiene menos de 32 caracteres.");
}

// También valida que exista configuración de PostgreSQL al arrancar (AC-03)
var postgresConnectionString = TiendaApi.Infrastructure.DependencyInjection.BuildPostgresConnectionString(builder.Configuration);

// ─── 1. REGISTRO DE SERVICIOS DE CAPAS ───────────────────────────────────────
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

// ─── HEALTHCHECKS (AC-04: VERIFICACIÓN REAL DE POSTGRESQL) ───────────────────
builder.Services.AddHealthChecks()
    .AddNpgSql(postgresConnectionString, name: "postgresql", tags: ["db", "ready"]);

// ─── CONFIGURACIÓN JWT Y COOKIES ─────────────────────────────────────────────
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue("access_token", out var accessToken) &&
                !string.IsNullOrEmpty(accessToken))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers();

// ─── CORS CONFIGURABLE POR ENTORNO ───────────────────────────────────────────
var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:4200,http://localhost:8080")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddValidatorsFromAssembly(typeof(TiendaApi.Application.DependencyInjection).Assembly);
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("SIV MAG - Tienda API")
            .WithTheme(ScalarTheme.DeepSpace)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

// En contenedor detrás de proxy/compose HTTP, evitar redirección HTTPS forzada si no hay TLS configurado
if (!app.Environment.IsProduction() && app.Configuration.GetValue<bool>("EnableHttpsRedirection"))
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ─── ENDPOINT DE SALUD ESTRUCTURADO (AC-04) ──────────────────────────────────
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var payload = new
        {
            status = report.Status.ToString(),
            service = "sivmag-tienda-api",
            environment = app.Environment.EnvironmentName,
            timestamp = DateTime.UtcNow,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                durationMs = e.Value.Duration.TotalMilliseconds
            })
        };
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload));
    }
});

app.MapControllers();

// ─── MIGRACIONES Y SEEDER AL INICIAR (FAIL-FAST SI DB NO RESPONDE) ───────────
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();

        var seeder = services.GetRequiredService<DataSeeder>();
        await seeder.SeedAsync();
        logger.LogInformation("startup_complete: Migraciones y DataSeeder ejecutados correctamente.");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "startup_failed: Error crítico al inicializar PostgreSQL o ejecutar DataSeeder.");
        throw; // Fail-fast: no levantar el contenedor si la BD falló
    }
}

app.Run();