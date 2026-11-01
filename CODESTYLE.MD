# Guía de Estilo y Convenciones de Código — SIV MAG

Este documento establece las reglas de estilo de código (**Code Style**) para garantizar uniformidad, legibilidad y mantenibilidad en el proyecto **SIV MAG**. Todos los desarrolladores deben seguir estas convenciones antes de enviar un Pull Request.

---

## 🔷 1. Backend: C# / .NET 9 (Clean Architecture)

### 1.1 Convención de Nombres (Naming Conventions)

* **PascalCase:** Clases, Interfaces, Métodos, Propiedades, Enums, Namespaces.
  * *Ejemplo:* `ProductoService`, `CalcularTotalVenta()`, `PrecioUnitario`.
* **camelCase:** Parámetros de métodos y variables locales.
  * *Ejemplo:* `int cantidadProducto`, `decimal precioTotal`.
* **_camelCase (con guion bajo):** Campos privados en clases.
  * *Ejemplo:* `private readonly IProductoRepository _productoRepository;`
* **Interfaces:** Siempre deben llevar el prefijo `I`.
  * *Ejemplo:* `IUsuarioService`, `IUnitOfWork`.

### 1.2 Reglas de Clean Code en C#

1. **Responsabilidad Única (SRP):** Cada clase y método debe hacer solo una cosa.
2. **Métodos Cortos:** Los métodos no deben exceder las 20-30 líneas de código.
3. **Retorno Temprano (Guard Clauses):** Evita la anidación excesiva de `if/else`.
   ```csharp
   // ❌ Evitar
   if (estudiante != null) {
       if (estudiante.EstaActivo) {
           // Lógica larga...
       }
   }

   // ✅ Recomendado
   if (estudiante is null || !estudiante.EstaActivo)
       return Resultado.Error("Estudiante no válido");
       
   // Lógica principal aquí...
   ```
4. **Manejo Explicito de Excepciones:** No uses bloques `catch` vacíos. Captura excepciones específicas o delega al middleware global de errores.
5. **Uso de LINQ Legible:** Si una consulta LINQ es muy larga, divídela en varias líneas.

---

## 🔶 2. Frontend: TypeScript / Angular 19+

### 2.1 Convención de Nombres

* **kebab-case (Archivos y Componentes):**
  * Componentes: `tabla-productos.component.ts`
  * Servicios: `auth.service.ts`
  * Guards: `auth.guard.ts`
* **PascalCase:** Clases, Interfaces, Enums, Tipos.
  * *Ejemplo:* `interface ClienteDto`, `enum EstadoVenta`.
* **camelCase:** Variables, funciones, métodos y propiedades de componentes.
  * *Ejemplo:* `obtenerListadoProductos()`, `totalPagar`.
* **UPPER_SNAKE_CASE:** Constantes globales.
  * *Ejemplo:* `API_URL_BASE`, `MAX_INTENTOS_LOGIN`.

### 2.2 Estructura y Buenas Prácticas en Angular

1. **Inyección de Dependencias:** Usar la función `inject()` de Angular moderna en lugar de inyectar por constructor siempre que sea posible.
   ```typescript
   // ✅ Recomendado en Angular moderno
   private readonly authService = inject(AuthService);
   ```
2. **Tipado Estricto:** **Prohibido el uso de `any`**. Define interfaces o tipos DTO para todas las respuestas de la API.
3. **Manejo de Suscripciones (RxJS):** Evita fugas de memoria (*memory leaks*). Usa `takeUntilDestroyed()`, `async pipe` en las plantillas HTML o Signals.
4. **Standalone Components:** Utiliza la arquitectura de componentes Standalone recomendada a partir de Angular 14+.

---

## 🎨 3. HTML y SCSS / Tailwind CSS

1. **Formato HTML:** 
   * Usar 2 espacios para sangría (indentación).
   * Eventos de Angular siempre entre paréntesis: `(click)="guardar()"`
   * Propiedades pasadas entre corchetes: `[disabled]="cargando"`
2. **Nombres de Clases SCSS:** Seguir la metodología BEM si se crea CSS personalizado (`.modulo-card`, `.modulo-card__header`, `.modulo-card__button--active`).

---

## 🧪 4. Formato Automático y Análisis Estático (Linters)

Antes de hacer commit, asegúrate de aplicar el formateador oficial:

* **Backend (.NET):** Corre el formateador automático con:
  ```bash
  dotnet format backend/SivMag.sln
  ```
* **Frontend (Angular/TS):** Corre el linter/formateador de código:
  ```bash
  cd frontend
  pnpm run lint
  ```