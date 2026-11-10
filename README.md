# SIV MAG — Sistema de Inventario y Ventas

![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4?style=for-the-badge&logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-19+-DD0031?style=for-the-badge&logo=angular)
![pnpm](https://img.shields.io/badge/pnpm-9+-F69220?style=for-the-badge&logo=pnpm)
![Architecture](https://img.shields.io/badge/Architecture-Clean_Architecture-blue?style=for-the-badge)

**SIV MAG** es una solución web integral diseñada para resolver la gestión operativa del día a día en pequeñas y medianas tiendas comerciales. El sistema abarca el control de ventas rápidas, seguimiento del inventario en tiempo real, arqueo de caja, gestión de compras y control de créditos/fiados a clientes.

---

## Propósito y Alcance

El objetivo del proyecto es transformar la gestión tradicional en un proceso digital eficiente, seguro y auditable. El sistema se desarrolla en el marco de la asignatura **Ingeniería de Software I**, aplicando la metodología **Scrum** (25 historias de usuario distribuidas en 4 Sprints), principios de **Clean Code** y arquitectura limpia.
a
---

## Módulos del Sistema

El sistema está dividido en 11 módulos interconectados:

1. 🔐 **AUTH:** Autenticación mediante tokens JWT, manejo de sesiones y recuperación de acceso.
2. 👥 **USUARIO:** Gestión de usuarios y asignación de roles/permisos (Administrador, Vendedor, Cajero).
3. 🏷️ **CATEGORIAS:** Clasificación jerárquica de productos comercializados.
4. 📦 **PRODUCTO:** Catálogo de productos, control de stock mínimo, precios, códigos de barras e imágenes.
5. 🤝 **CLIENTE (y Submódulo FIADOS):** Registro de clientes y control detallado de líneas de crédito/cuentas por cobrar.
6. 🛒 **VENTAS:** Punto de venta (POS) para generación de tickets/facturas, cálculo de vuelto y aplicación de promociones.
7. 🚚 **COMPRAS:** Registro de proveedores y recepción de mercadería para abastecimiento de stock.
8. 🔄 **MOVIMIENTOS:** Historial y trazabilidad de entradas, salidas y ajustes manuales de inventario.
9. 💵 **CAJA:** Control de apertura, cierres, ingresos/egresos directos y arqueo diario de caja.
10. 📊 **REPORTES:** Dashboards gráficos y reportes exportables de ventas, ganancias, productos más vendidos y cartera de fiados.
11. 🚨 **ALERTAS:** Notificaciones automáticas de stock bajo, vencimientos y productos agotados.

---

## 🏗️ Arquitectura del Proyecto

El repositorio adopta una estructura de **Monorepo** que separa las responsabilidades de Backend y Frontend:

```text
SIV--MAG/
├── backend/                  # Solución en .NET 9
│   ├── SivMag.sln
│   ├── src/
│   │   ├── SivMag.Api/           # Endpoints Controllers, Middlewares y DTOs
│   │   ├── SivMag.Application/   # Casos de uso (Services, Commands, Queries, Validations)
│   │   ├── SivMag.Domain/        # Entidades del negocio, Value Objects y Excepciones
│   │   └── SivMag.Infrastructure/# EF Core 9, DbContext, Migraciones y Repositorios
│   └── tests/
│       └── SivMag.Tests/         # Pruebas unitarias e integración (xUnit)
└── frontend/                 # Aplicación cliente Angular 19+
    ├── package.json
    ├── pnpm-lock.yaml
    └── src/
        └── app/
            ├── core/             # Guards, Interceptors, Servicios globales y DTOs
            ├── shared/           # Componentes UI reutilizables (Tablas, Modales, Pipes)
            └── features/         # Módulos de negocio (Auth, Productos, Ventas, etc.)
```

---

## 💻 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas antes de ejecutar el proyecto:

* [SDK de .NET 9.0](https://dotnet.microsoft.com/download/dotnet/9.0) o superior.
* [Node.js](https://nodejs.org/) (Versión LTS recomendada v20+).
* [pnpm](https://pnpm.io/) (`npm install -g pnpm`).
* Motor de base de datos (PostgreSQL / SQL Server).

---

## 🛠️ Instalación y Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/dany-muriel-herencia/SIV--MAG-.git
cd SIV--MAG-
```

### 2. Configuración del Backend (.NET 9)
```bash
# Navegar a la carpeta backend
cd backend

# Restaurar paquetes de la solución
dotnet restore

# Configurar la cadena de conexión en appsettings.Development.json dentro de SivMag.Api

# Aplicar migraciones a la base de datos
dotnet ef database update --project src/SivMag.Infrastructure --startup-project src/SivMag.Api

# Ejecutar la Web API
dotnet run --project src/SivMag.Api
```
> La API se ejecutará por defecto en `https://localhost:7123` (Swagger disponible en `/swagger`).

### 3. Configuración del Frontend (Angular + pnpm)
```bash
# Abrir una nueva terminal y navegar a frontend
cd frontend

# Instalar dependencias con pnpm
pnpm install

# Iniciar servidor de desarrollo
pnpm start
```
> El servidor local se iniciará en `http://localhost:4200/`.

---

## 🧪 Pruebas Unitarias

Para ejecutar la suite de pruebas unitarias y de integración en el backend:

```bash
cd backend
dotnet test
```

Para verificar que el frontend compila correctamente sin errores de TypeScript:

```bash
cd frontend
pnpm run build
```

---

## 🤝 Normas de Contribución

Todo desarrollo en el repositorio debe seguir las pautas detalladas en el archivo [CONTRIBUTING.md](./CONTRIBUTING.md):

* **No realizar commits ni push directo a la rama `main`**.
* Crear ramas descriptivas por funcionalidad (`feature/HU-xx-nombre`).
* Utilizar la convención de **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`).
* Todo cambio debe integrarse mediante **Pull Request** con la aprobación de al menos 1 integrante.

---

## 👥 Equipo de Desarrollo

Proyecto desarrollado para el curso de **Ingeniería de Software I**:

* Dany Muriel Herencia (*Analista y Developer Frontend*)
* Jhon Andrioly Zenteno Sosa (*QA y Analista*)
* Adrian Eliel Socualaya Feliciano (*Code review*)
* Willian Arturo Salazar Quispe (*Developer Backend*)

---

## 📜 Licencia

Este proyecto es de uso exclusivamente académico.
