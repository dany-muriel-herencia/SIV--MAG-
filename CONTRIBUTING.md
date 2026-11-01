# Guia de Contribución y Desarrollo — SIV MAG

¡Bienvenidos al desarrollo del sistema **SIV MAG** (Sistema de Inventario y Ventas)!

Este documento establece las normativas, estándares de arquitectura, convenciones de código y el flujo de trabajo en Git/GitHub para los 4 integrantes del equipo. Esta alineado con las buenas prácticas de **Clean Code**, **Clean Architecture** y desarrollo ágil **Scrum**.

---

## 1. Stack Tecnológico y Herramientas

### Backend

- **Framework:** .NET 9 Web API
- **Arquitectura:** Clean Architecture (`Domain`, `Application`, `Infrastructure`, `Api`, `Tests`)
- **ORM:** Entity Framework Core 9
- **Pruebas:** xUnit + FluentAssertions + Moq

### Frontend

- **Framework:** Angular 19+
- **Gestor de paquetes:** `pnpm` (**Queda prohibido el uso directo de `npm` o `yarn`**)
- **Estructura:** Modular basada en `Core`, `Shared` y `Features`

---

## 2. Estructura del Repositorio (Monorepo)

```text
SIV--MAG/
├── .gitignore
├── CODESTYLE.MD
├── CONTRIBUTING.md
├── README.md
├── backend/
│   ├── SivMag.sln
│   ├── src/
│   │   ├── SivMag.Api/           # Controllers, Middlewares, DTOs de entrada/salida
│   │   ├── SivMag.Application/   # Casos de uso, interfaces, Mappings, validaciones
│   │   ├── SivMag.Domain/        # Entidades, Enums, Excepciones de negocio, Interfaces de Repositorios
│   │   └── SivMag.Infrastructure/# DbContext, EF Core, Repositorios, Servicios externos
│   └── tests/
│       └── SivMag.Tests/         # Pruebas unitarias e integración (xUnit)
└── frontend/
    ├── package.json
    ├── pnpm-lock.yaml
    └── src/
        └── app/
            ├── core/             # Guards, Interceptors, Servicios globales, Modelos
            ├── shared/           # Componentes UI reutilizables (Tablas, Modales, Directivas, Pipes)
            └── features/         # Módulos del negocio (AUTH, PRODUCTOS, VENTAS, etc.)
```

---

## 3. Estrategia de Ramas (Git Branching)

Aplica un flujo de trabajo basado en ramas cortas (**Feature Branch Workflow**).

⚠️ **REGLA DE ORO:** Está estrictamente **PROHIBIDO** hacer `git push` directo a la rama `main`.

### Convención de Nombres para Ramas:

- **Funcionalidades (Features):** `feature/HU-<número>-<nombre-corto>`
- **Corrección de Bugs (Fixes):** `fix/HU-<número>-<descripcion-error>`
- **Tareas Técnicas/Configuración:** `chore/<descripcion-tarea>`
- **Documentación:** `docs/<descripcion-documento>`

### Ejemplos:

- `feature/HU-01-login-usuario`
- `feature/HU-04-crud-productos`
- `fix/HU-04-error-paginacion`
- `chore/configuracion-inicial-efcore`

---

## 4. Estándar de Commits (Conventional Commits)

Todos los commits deben redactarse en español y seguir el formato estándar:

```text
<tipo>(<alcance>): <descripción breve en presente o infinitivo>
```

### Tipos permitidos:

- **`feat`**: Nueva funcionalidad (ej. `feat(auth): implementar endpoint de login con JWT`)
- **`fix`**: Corrección de un fallo (ej. `fix(producto): corregir validación de stock mínimo`)
- **`docs`**: Cambios en documentación (ej. `docs: actualizar CONTRIBUTING.md con reglas de pnpm`)
- **`test`**: Creación o modificación de pruebas (ej. `test(auth): agregar prueba unitaria para clave incorrecta`)
- **`refactor`**: Cambios de código sin modificar comportamiento (ej. `refactor(caja): simplificar calculo de arqueo`)
- **`chore`**: Tareas administrativas o de configuración (ej. `chore(deps): agregar paquete EF Core SQL Server`)

---

## 5. Flujo de Trabajo Diario (Paso a Paso)

### 1. Iniciar una tarea

Antes de comenzar a programar una Historia de Usuario:

```bash
# Cambiar a la rama principal y sincronizar con GitHub
git checkout main
git pull origin main

# Crear la rama de tu funcionalidad
git checkout -b feature/HU-01-login-usuario
```

### 2. Desarrollo y Guardado Local

Realiza cambios en módulos específicos y guarda puntos de control pequeños:

```bash
# Revisar archivos modificados
git status

# Agregar archivos y guardar el commit
git add .
git commit -m "feat(auth): agregar servicio de generacion de tokens JWT"
```

### 3. Verificación antes de publicar

Asegúrate de que tu código compila y las pruebas pasan localmente:

**En el Backend (.NET):**

```bash
cd backend
dotnet build
dotnet test
cd ..
```

**En el Frontend (Angular):**

```bash
cd frontend
pnpm run build
cd ..
```

### 4. Subir la rama a GitHub

```bash
git push origin feature/HU-01-login-usuario
```

---

## 6. Integración mediante Pull Request (PR)

Cuando termines tu funcionalidad:

1. Ve a la plataforma de **GitHub** y selecciona la opción **Compare & pull request**.
2. **Título del PR:** Debe incluir el tipo y el número de HU.  
   _Ejemplo:_ `feat(auth): implementar HU-01 Autenticación de Usuario`
3. **Descripción:** Completa los siguientes puntos:
   - Resumen de lo realizado.
   - Enlace al Issue correspondiente: `Closes #<número-de-issue>`.
   - Evidencia de pruebas locales ejecutadas.
4. **Revisión Obligatoria:** Asigna como mínimo a **1 compañero del equipo** como `Reviewer`.
5. **Merge:** Tras recibir la aprobación del revisor y confirmar que no existen conflictos, se realiza el **Merge** a `main` y se elimina la rama remota.

---

## 7. Seguridad y Buenas Prácticas

- **Cero credenciales en Git:** Nunca subas contraseñas, cadenas de conexión reales ni claves JWT al repositorio.
- Usa `appsettings.Development.json` o variables de entorno locales (asegúrate de que estén excluidas en el `.gitignore`).
- **Respetar la arquitectura:**
  - `Domain` no debe depender de ninguna otra capa.
  - `Application` solo conoce a `Domain`.
  - `Infrastructure` y `Api` dependen de `Application` y `Domain`.
- **Manejo de pnpm en Angular:** Nunca ejecutes `npm install`. Usa siempre:
  ```bash
  pnpm install
  pnpm add <nombre-paquete>
  ```
