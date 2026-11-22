# syntax=docker/dockerfile:1

# --- STAGE 1: BUILDER ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar manifiestos primero para aprovechar caché de capas
COPY ["TiendaApi/TiendaApi.csproj", "TiendaApi/"]
COPY ["TiendaApi.Application/TiendaApi.Application.csproj", "TiendaApi.Application/"]
COPY ["TiendaApi.Domain/TiendaApi.Domain.csproj", "TiendaApi.Domain/"]
COPY ["TiendaApi.Infrastructure/TiendaApi.Infrastructure.csproj", "TiendaApi.Infrastructure/"]
RUN dotnet restore "TiendaApi/TiendaApi.csproj"

# Copiar código fuente y compilar release
COPY . .
WORKDIR "/src/TiendaApi"
RUN dotnet publish "TiendaApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# --- STAGE 2: RUNTIME ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

COPY --from=build /app/publish .

# Ejecutar como usuario no-root (Factor Seguridad / Sec. 8)
USER app

EXPOSE 8080
ENTRYPOINT ["dotnet", "TiendaApi.dll"]