# Documento de Diseño: Adiction Boutique Suite

## Visión General

Adiction Boutique Suite es un sistema integral de gestión para dos tiendas de ropa construido completamente con Google Apps Script. El sistema utiliza Google Sheets como base de datos normalizada, Google Drive para almacenamiento de archivos y Gmail para envío de comprobantes. La arquitectura sigue un patrón de capas con separación clara entre presentación (WebApp), lógica de negocio (Services) y acceso a datos (Repositories).

### Objetivos de Diseño

- **Simplicidad**: Arquitectura de capas clara sin dependencias externas
- **Confiabilidad**: Manejo robusto de concurrencia con LockService e idempotencia con requestId
- **Rendimiento**: Caché de catálogos y paginación de listados grandes
- **Seguridad**: Autenticación Google, allowlist, RBAC y auditoría completa
- **Usabilidad**: UI responsive Bootstrap 5 con DataTables para laptops y móviles

### Stack Tecnológico

**Backend:**
- Google Apps Script (JavaScript ES5/ES6)
- Google Sheets API (persistencia)
- Google Drive API (archivos)
- GmailApp (envío de emails)
- LockService (concurrencia)
- CacheService (rendimiento)

**Frontend:**
- Bootstrap 5.3 (framework CSS)
- DataTables 1.13 (tablas interactivas)
- Bootstrap Icons 1.11 (iconografía)
- HTML5 + CSS3 + JavaScript vanilla
- Responsive design (mobile-first)

## Arquitectura

### Patrón Arquitectónico: Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   doGet()    │  │   doPost()   │  │  HTML Views  │  │
│  │   Router     │  │   Router     │  │  Bootstrap   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Business Logic Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │AuthService   │  │ POSService   │  │CashService   │  │
│  │InventoryServ │  │CreditService │  │ReportService │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Data Access Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  UserRepo    │  │  SaleRepo    │  │  StockRepo   │  │
│  │ ProductRepo  │  │ PaymentRepo  │  │  ClientRepo  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Persistence Layer                     │
│              Google Sheets (Database Tables)             │
│              Google Drive (File Storage)                 │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Solicitud

1. **Cliente** → Envía solicitud HTTP (GET/POST) al WebApp
2. **Router** → Parsea la ruta y parámetros, valida autenticación
3. **Service** → Ejecuta lógica de negocio, aplica locks si es necesario
4. **Repository** → Lee/escribe datos en Google Sheets
5. **Response** → Retorna JSON o HTML al cliente

### Componentes Principales

#### 1. Router (Main.gs)

Punto de entrada del WebApp que maneja solicitudes HTTP:

```javascript
function doGet(e) {
  const session = Session.getActiveUser().getEmail();
  const authService = new AuthService();
  
  if (!authService.isUserAllowed(session)) {
    return HtmlService.createHtmlOutput('Acceso denegado');
  }
  
  const route = e.parameter.page || 'dashboard';
  return routeGet(route, e, session);
}

function doPost(e) {
  const session = Session.getActiveUser().getEmail();
  const authService = new AuthService();
  
  if (!authService.isUserAllowed(session)) {
    return ContentService.createTextOutput(
      JSON.stringify({success: false, error: 'No autorizado'})
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = e.parameter.action;
  return routePost(action, e, session);
}
```

#### 2. Services (Lógica de Negocio)

**AuthService.gs**: Autenticación y autorización
- `isUserAllowed(email)`: Valida si el usuario está en allowlist
- `getUserRoles(email)`: Obtiene roles del usuario
- `hasPermission(email, permission)`: Verifica permisos

**POSService.gs**: Punto de venta
- `createSale(saleData, requestId)`: Crea venta con idempotencia
- `addItemToCart(cartId, productId, quantity)`: Agrega item al carrito
- `calculateTotal(cartItems, discounts)`: Calcula total de venta
- `voidSale(saleId, reason, userId)`: Anula venta

**InventoryService.gs**: Gestión de inventario
- `checkStock(warehouseId, productId)`: Consulta stock disponible
- `reserveStock(warehouseId, productId, quantity)`: Reserva stock
- `releaseStock(warehouseId, productId, quantity)`: Libera stock
- `transferStock(fromWarehouse, toWarehouse, productId, quantity, requestId)`: Transfiere entre almacenes
- `recordMovement(movementData)`: Registra movimiento de inventario

**CreditService.gs**: Crédito y cobranzas
- `createCreditPlan(saleId, installments)`: Crea plan de crédito
- `recordPayment(paymentData, requestId)`: Registra pago con idempotencia
- `applyPaymentToInstallments(paymentAmount, installments)`: Aplica pago a cuotas
- `getOverdueInstallments(clientId)`: Obtiene cuotas vencidas
- `rescheduleInstallment(installmentId, newDate, reason, userId)`: Reprograma cuota

**CashService.gs**: Gestión de caja
- `openShift(shiftData)`: Abre turno de caja
- `closeShift(shiftId, closingData)`: Cierra turno con arqueo
- `recordExpense(expenseData)`: Registra egreso
- `getShiftBalance(shiftId)`: Calcula balance del turno

**InvoiceService.gs**: Facturación electrónica
- `generateInvoice(saleId)`: Genera factura electrónica
- `sendInvoiceByEmail(invoiceId, recipientEmail)`: Envía factura por email
- `getInvoicePDF(invoiceId)`: Obtiene PDF de factura desde Drive

**ReportService.gs**: Reportes y análisis
- `getSalesReport(filters)`: Reporte de ventas
- `getInventoryReport(warehouseId)`: Reporte de inventario
- `getAccountsReceivableReport(filters)`: Reporte de cuentas por cobrar
- `getTopClientsReport(limit)`: Top clientes por monto

#### 3. Repositories (Acceso a Datos)

Cada repositorio encapsula el acceso a una hoja de Google Sheets:

**BaseRepository.gs**: Clase base con operaciones comunes
```javascript
class BaseRepository {
  constructor(sheetName) {
    this.ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    this.sheet = this.ss.getSheetByName(sheetName);
  }
  
  findAll() {
    const data = this.sheet.getDataRange().getValues();
    const headers = data[0];
    return data.slice(1).map(row => this._rowToObject(row, headers));
  }
  
  findById(id) {
    const data = this.findAll();
    return data.find(item => item.id === id);
  }
  
  create(obj) {
    const row = this._objectToRow(obj);
    this.sheet.appendRow(row);
    return obj;
  }
  
  update(id, obj) {
    const data = this.sheet.getDataRange().getValues();
    const rowIndex = data.findIndex((row, idx) => idx > 0 && row[0] === id);
    if (rowIndex > 0) {
      const row = this._objectToRow(obj);
      this.sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
    }
    return obj;
  }
  
  _rowToObject(row, headers) {
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx];
    });
    return obj;
  }
  
  _objectToRow(obj) {
    const headers = this.sheet.getRange(1, 1, 1, this.sheet.getLastColumn()).getValues()[0];
    return headers.map(header => obj[header] || '');
  }
}
```

**Repositorios específicos**:
- `UserRepository`: CFG_Users
- `ProductRepository`: CAT_Products
- `StockRepository`: INV_Stock
- `MovementRepository`: INV_Movements
- `ClientRepository`: CRM_Clients
- `SaleRepository`: POS_Sales
- `SaleItemRepository`: POS_SaleItems
- `CreditPlanRepository`: CRD_Plans
- `InstallmentRepository`: CRD_Installments
- `PaymentRepository`: CRD_Payments
- `ShiftRepository`: CASH_Shifts
- `ExpenseRepository`: CASH_Expenses
- `AuditRepository`: AUD_Log

#### 4. Utilities

**LockManager.gs**: Gestión de locks para concurrencia
```javascript
class LockManager {
  static acquireLock(lockKey, timeoutMs = 30000) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(timeoutMs);
      return lock;
    } catch (e) {
      Logger.log('Error acquiring lock: ' + e.message);
      throw new Error('No se pudo adquirir el lock. Intente nuevamente.');
    }
  }
  
  static releaseLock(lock) {
    if (lock) {
      lock.releaseLock();
    }
  }
  
  static withLock(lockKey, fn) {
    const lock = this.acquireLock(lockKey);
    try {
      return fn();
    } finally {
      this.releaseLock(lock);
    }
  }
}
```

**IdempotencyManager.gs**: Gestión de idempotencia
```javascript
class IdempotencyManager {
  static checkAndStore(requestId, operation) {
    const cache = CacheService.getScriptCache();
    const key = 'req_' + requestId;
    
    // Verificar si ya fue procesado
    const cached = cache.get(key);
    if (cached) {
      return {processed: true, result: JSON.parse(cached)};
    }
    
    // Ejecutar operación
    const result = operation();
    
    // Almacenar resultado por 24 horas
    cache.put(key, JSON.stringify(result), 86400);
    
    return {processed: false, result: result};
  }
}
```

**Validator.gs**: Validaciones de datos
```javascript
class Validator {
  static isRequired(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      throw new Error(fieldName + ' es requerido');
    }
  }
  
  static isNumber(value, fieldName) {
    if (isNaN(value)) {
      throw new Error(fieldName + ' debe ser un número');
    }
  }
  
  static isPositive(value, fieldName) {
    this.isNumber(value, fieldName);
    if (value <= 0) {
      throw new Error(fieldName + ' debe ser positivo');
    }
  }
  
  static isEmail(value, fieldName) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error(fieldName + ' debe ser un email válido');
    }
  }
  
  static isInRange(value, min, max, fieldName) {
    this.isNumber(value, fieldName);
    if (value < min || value > max) {
      throw new Error(fieldName + ' debe estar entre ' + min + ' y ' + max);
    }
  }
}
```

**CacheManager.gs**: Gestión de caché
```javascript
class CacheManager {
  static get(key) {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  static put(key, value, ttlSeconds = 300) {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(value), ttlSeconds);
  }
  
  static invalidate(key) {
    const cache = CacheService.getScriptCache();
    cache.remove(key);
  }
  
  static invalidatePattern(pattern) {
    // Apps Script no soporta invalidación por patrón
    // Se debe invalidar manualmente cada key relacionada
  }
}
```

## Componentes e Interfaces

### Modelo de Datos (Google Sheets)

#### CFG_Users (Usuarios y Roles)
```
| id | email | name | roles | stores | active | created_at |
```
- `id`: UUID único
- `email`: Email de cuenta Google
- `name`: Nombre completo
- `roles`: JSON array de roles ["Admin", "Vendedor"]
- `stores`: JSON array de tiendas ["Mujeres", "Hombres"]
- `active`: Boolean (TRUE/FALSE)
- `created_at`: Timestamp

#### CFG_Params (Parámetros del Sistema)
```
| key | value | description | type |
```
- `key`: Nombre del parámetro (ej: "MIN_STOCK_ALERT")
- `value`: Valor del parámetro
- `description`: Descripción del parámetro
- `type`: Tipo de dato (NUMBER, STRING, BOOLEAN, JSON)

#### CAT_Products (Catálogo de Productos)
```
| id | barcode | name | description | price | category | min_stock | active | created_at | updated_at |
```

#### INV_Stock (Stock por Almacén)
```
| id | warehouse_id | product_id | quantity | last_updated |
```

#### INV_Movements (Movimientos de Inventario)
```
| id | warehouse_id | product_id | type | quantity | reference_id | user_id | reason | created_at |
```
- `type`: ENTRADA, SALIDA, AJUSTE, TRANSFERENCIA_OUT, TRANSFERENCIA_IN
- `reference_id`: ID de venta, transferencia, etc.

#### CRM_Clients (Clientes)
```
| id | dni | name | phone | email | address | lat | lng | credit_limit | credit_used | dni_photo_url | active | created_at |
```

#### POS_Sales (Ventas)
```
| id | sale_number | store_id | client_id | user_id | sale_type | subtotal | discount | total | payment_status | created_at | voided | void_reason | void_user_id | void_at |
```
- `sale_type`: CONTADO, CREDITO
- `payment_status`: PAID, PENDING, PARTIAL

#### POS_SaleItems (Items de Venta)
```
| id | sale_id | product_id | quantity | unit_price | subtotal |
```

#### CRD_Plans (Planes de Crédito)
```
| id | sale_id | client_id | total_amount | installments_count | installment_amount | status | created_at |
```
- `status`: ACTIVE, COMPLETED, CANCELLED

#### CRD_Installments (Cuotas)
```
| id | plan_id | installment_number | amount | due_date | paid_amount | status | paid_at |
```
- `status`: PENDING, PARTIAL, PAID, OVERDUE

#### CRD_Payments (Pagos)
```
| id | client_id | amount | payment_date | user_id | receipt_url | created_at |
```

#### CASH_Shifts (Turnos de Caja)
```
| id | store_id | user_id | opening_amount | opening_at | closing_amount | expected_amount | difference | closing_at | supervisor_id |
```

#### CASH_Expenses (Egresos)
```
| id | shift_id | amount | concept | category | receipt_url | user_id | authorized_by | created_at |
```

#### AUD_Log (Auditoría)
```
| id | timestamp | user_id | operation | entity_type | entity_id | old_values | new_values | ip_address |
```

### Interfaces de Servicio

#### AuthService Interface
```javascript
interface AuthService {
  isUserAllowed(email: string): boolean
  getUserRoles(email: string): string[]
  hasPermission(email: string, permission: string): boolean
  logAccess(email: string, success: boolean): void
}
```

#### POSService Interface
```javascript
interface POSService {
  createSale(saleData: SaleData, requestId: string): Sale
  addItemToCart(cartId: string, productId: string, quantity: number): CartItem
  calculateTotal(cartItems: CartItem[], discounts: Discount[]): number
  voidSale(saleId: string, reason: string, userId: string): void
}

interface SaleData {
  storeId: string
  clientId: string
  userId: string
  saleType: 'CONTADO' | 'CREDITO'
  items: SaleItem[]
  discount: number
  installments?: number
}

interface SaleItem {
  productId: string
  quantity: number
  unitPrice: number
}
```

#### InventoryService Interface
```javascript
interface InventoryService {
  checkStock(warehouseId: string, productId: string): number
  reserveStock(warehouseId: string, productId: string, quantity: number): void
  releaseStock(warehouseId: string, productId: string, quantity: number): void
  transferStock(fromWarehouse: string, toWarehouse: string, productId: string, quantity: number, requestId: string): void
  recordMovement(movementData: MovementData): Movement
}
```

#### CreditService Interface
```javascript
interface CreditService {
  createCreditPlan(saleId: string, installments: number): CreditPlan
  recordPayment(paymentData: PaymentData, requestId: string): Payment
  applyPaymentToInstallments(paymentAmount: number, installments: Installment[]): void
  getOverdueInstallments(clientId: string): Installment[]
  rescheduleInstallment(installmentId: string, newDate: Date, reason: string, userId: string): void
}
```

### Interfaces de UI

#### Layout Principal (Bootstrap 5)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Adiction Boutique Suite</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
  <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
</head>
<body>
  <!-- Topbar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Adiction Boutique</a>
      <div class="navbar-nav ms-auto">
        <span class="navbar-text me-3">Usuario: <?= userName ?></span>
        <a class="nav-link" href="?action=logout">Salir</a>
      </div>
    </div>
  </nav>
  
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <nav class="col-md-2 d-md-block bg-light sidebar">
        <div class="position-sticky pt-3">
          <ul class="nav flex-column">
            <li class="nav-item">
              <a class="nav-link" href="?page=dashboard">
                <i class="bi bi-speedometer2"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="?page=pos">
                <i class="bi bi-cart"></i> Punto de Venta
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="?page=inventory">
                <i class="bi bi-box-seam"></i> Inventario
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="?page=clients">
                <i class="bi bi-people"></i> Clientes
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="?page=collections">
                <i class="bi bi-cash-coin"></i> Cobranzas
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="?page=cash">
                <i class="bi bi-wallet2"></i> Caja
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="?page=reports">
                <i class="bi bi-graph-up"></i> Reportes
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      <!-- Main Content -->
      <main class="col-md-10 ms-sm-auto px-md-4">
        <?!= content ?>
      </main>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
  <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
</body>
</html>
```

#### Vista POS (Punto de Venta)
- Buscador de productos (input + botón escanear)
- Tabla de carrito con items agregados
- Panel de totales (subtotal, descuento, total)
- Selector de tipo de venta (contado/crédito)
- Selector de cliente (para crédito)
- Selector de cuotas (1-6)
- Botón confirmar venta

#### Vista Cobranzas
- Tabs: Vencidas / Hoy / Esta Semana
- DataTable con: Cliente, Cuota, Monto, Vencimiento, Días vencido
- Botón "Registrar Pago" por fila
- Modal de pago: Monto, Método, Generar recibo

## Modelo de Datos

Ver sección "Componentes e Interfaces" para el esquema completo de las hojas de Google Sheets.

### Relaciones entre Entidades

```
CFG_Users (1) ──── (N) POS_Sales
CFG_Users (1) ──── (N) CASH_Shifts
CFG_Users (1) ──── (N) AUD_Log

CAT_Products (1) ──── (N) INV_Stock
CAT_Products (1) ──── (N) INV_Movements
CAT_Products (1) ──── (N) POS_SaleItems

CRM_Clients (1) ──── (N) POS_Sales
CRM_Clients (1) ──── (N) CRD_Plans
CRM_Clients (1) ──── (N) CRD_Payments

POS_Sales (1) ──── (N) POS_SaleItems
POS_Sales (1) ──── (1) CRD_Plans

CRD_Plans (1) ──── (N) CRD_Installments

CASH_Shifts (1) ──── (N) CASH_Expenses
```

### Índices y Optimizaciones

**Caché de Catálogos:**
- Productos: 5 minutos TTL
- Usuarios y roles: 10 minutos TTL
- Parámetros: 15 minutos TTL

**Paginación:**
- Listados > 100 registros se paginan automáticamente
- Tamaños de página: 25, 50, 100

**Named Ranges (para validaciones):**
- `ProductList`: Columna de nombres de productos
- `ClientList`: Columna de nombres de clientes
- `StoreList`: Lista de tiendas ["Mujeres", "Hombres"]

## Propiedades de Correctitud

*Una propiedad es una característica o comportamiento que debe mantenerse verdadero en todas las ejecuciones válidas del sistema—esencialmente, una declaración formal sobre lo que el sistema debe hacer. Las propiedades sirven como puente entre las especificaciones legibles por humanos y las garantías de correctitud verificables por máquina.*


### Reflexión de Propiedades

Después de analizar todos los criterios de aceptación, he identificado las siguientes redundancias y consolidaciones:

**Redundancias Identificadas:**
1. Propiedades 1.1 y 1.2 (allowlist) → Se combinan en una sola propiedad de validación de acceso
2. Propiedades 2.4 y 2.5 (permisos) → Se combinan en una propiedad de autorización
3. Propiedades 5.3, 5.4 y 5.5 (transferencias) → Se combinan en una propiedad de atomicidad de transferencia
4. Propiedades 6.3 (venta contado) y 7.3 (venta crédito) → Se combinan en una propiedad general de completitud de venta
5. Propiedades de auditoría (1.4, 3.4, 18.1, 23.5, 24.5, 25.5) → Se combinan en una propiedad general de trazabilidad
6. Propiedades de idempotencia (6.4, 20.2, 20.3) → Se combinan en una propiedad general de idempotencia
7. Propiedades de cálculo de totales (7.4, 11.3, 11.4, 25.4) → Se agrupan por tipo de cálculo

**Propiedades Consolidadas:**
- Validación de acceso y permisos (1.1, 1.2, 2.4, 2.5)
- Invariantes de stock (4.2, 4.5, 5.3, 23.3)
- Completitud de operaciones transaccionales (6.3, 7.3, 9.5, 10.1)
- Idempotencia de operaciones críticas (6.4, 20.2, 20.3, 20.5)
- Trazabilidad en auditoría (1.4, 3.4, 18.1, 18.2, 23.5, 24.5, 25.5)
- Unicidad de identificadores (3.2, 8.2, 11.2)
- Cálculos matemáticos (7.4, 11.3, 11.4, 25.4)
- Integridad referencial (8.4, 10.4, 14.1)

### Propiedades de Correctitud

#### Propiedad 1: Validación de Acceso por Allowlist
*Para cualquier* usuario que intenta acceder al sistema, el acceso debe ser permitido si y solo si su email está en la lista de usuarios permitidos (allowlist).
**Valida: Requisitos 1.1, 1.2**

#### Propiedad 2: Carga de Roles en Autenticación
*Para cualquier* usuario autenticado en la allowlist, el sistema debe retornar un conjunto no vacío de roles asociados a ese usuario.
**Valida: Requisitos 1.3**

#### Propiedad 3: Unión de Permisos para Múltiples Roles
*Para cualquier* usuario con múltiples roles, el conjunto de permisos efectivos debe ser la unión de los permisos de todos sus roles.
**Valida: Requisitos 1.5**

#### Propiedad 4: Autorización de Operaciones
*Para cualquier* operación y usuario, la operación debe ejecutarse si y solo si el usuario tiene los permisos necesarios; de lo contrario, debe rechazarse y registrarse en auditoría.
**Valida: Requisitos 2.4, 2.5**

#### Propiedad 5: Asociación de Roles con Tienda
*Para cualquier* asignación de rol a un usuario, el registro debe incluir una tienda específica asociada.
**Valida: Requisitos 2.2**

#### Propiedad 6: Unicidad de Código de Barras
*Para cualquier* producto en el catálogo, no debe existir otro producto con el mismo código de barras.
**Valida: Requisitos 3.2**

#### Propiedad 7: Búsqueda de Productos
*Para cualquier* producto existente en el catálogo, una búsqueda por su código de barras, nombre o categoría debe retornar ese producto en los resultados.
**Valida: Requisitos 3.3**

#### Propiedad 8: Invariante de Stock en Ventas
*Para cualquier* venta confirmada, el stock del almacén después de la venta debe ser igual al stock antes de la venta menos la cantidad vendida de cada producto.
**Valida: Requisitos 4.2**

#### Propiedad 9: Alerta de Stock Mínimo
*Para cualquier* producto cuyo stock actual es menor que su nivel mínimo configurado, debe existir una alerta activa para ese producto.
**Valida: Requisitos 4.3**

#### Propiedad 10: Trazabilidad de Movimientos de Inventario
*Para cualquier* cambio en el stock de un producto, debe existir un movimiento de inventario registrado con fecha, tipo, cantidad, usuario y motivo.
**Valida: Requisitos 4.4**

#### Propiedad 11: Rechazo de Ventas sin Stock
*Para cualquier* intento de venta donde la cantidad solicitada de un producto excede el stock disponible, la operación debe ser rechazada.
**Valida: Requisitos 4.5**

#### Propiedad 12: Validación de Stock en Transferencias
*Para cualquier* solicitud de transferencia entre almacenes, el almacén origen debe tener stock mayor o igual a la cantidad a transferir.
**Valida: Requisitos 5.1**

#### Propiedad 13: Atomicidad de Transferencias
*Para cualquier* transferencia ejecutada entre almacenes, el stock del almacén origen debe decrementar en la cantidad exacta que incrementa el stock del almacén destino, y deben existir exactamente dos movimientos de inventario vinculados (salida en origen, entrada en destino) con el mismo identificador de transferencia.
**Valida: Requisitos 5.3, 5.4, 5.5**

#### Propiedad 14: Validación de Stock en Carrito
*Para cualquier* producto agregado al carrito de compra, debe existir stock disponible mayor o igual a la cantidad agregada en el almacén correspondiente.
**Valida: Requisitos 6.1**

#### Propiedad 15: Completitud de Operaciones de Venta
*Para cualquier* venta confirmada (contado o crédito), deben crearse: (1) el registro de venta, (2) los registros de items de venta, (3) los movimientos de inventario correspondientes, y (4) si es a crédito, el plan de crédito con sus cuotas.
**Valida: Requisitos 6.3, 7.3**

#### Propiedad 16: Idempotencia de Operaciones Críticas
*Para cualquier* operación crítica (venta, pago, transferencia) ejecutada con un requestId, si se intenta ejecutar nuevamente con el mismo requestId, el sistema debe retornar el resultado de la ejecución original sin ejecutar la operación nuevamente.
**Valida: Requisitos 6.4, 20.2, 20.3, 20.5**

#### Propiedad 17: Validación de Cupo de Crédito
*Para cualquier* venta a crédito, el cupo disponible del cliente (cupo_límite - cupo_usado) debe ser mayor o igual al monto total de la venta.
**Valida: Requisitos 7.1**

#### Propiedad 18: Invariante de Suma de Cuotas
*Para cualquier* plan de crédito, la suma de los montos de todas las cuotas debe ser igual al monto total de la venta.
**Valida: Requisitos 7.4**

#### Propiedad 19: Invariante de Cupo de Cliente
*Para cualquier* venta a crédito confirmada, el cupo usado del cliente después de la venta debe ser igual al cupo usado antes de la venta más el monto total de la venta.
**Valida: Requisitos 7.5**

#### Propiedad 20: Unicidad de DNI de Clientes
*Para cualquier* cliente en el sistema, no debe existir otro cliente con el mismo número de DNI.
**Valida: Requisitos 8.2**

#### Propiedad 21: Integridad Referencial de Archivos en Drive
*Para cualquier* cliente con foto de DNI, recibo de pago o factura, el enlace almacenado debe corresponder a un archivo existente y accesible en Google Drive.
**Valida: Requisitos 8.4, 10.2, 13.3**

#### Propiedad 22: Completitud de Historial de Cliente
*Para cualquier* cliente, su historial debe incluir todas las ventas y pagos registrados donde el cliente es el titular.
**Valida: Requisitos 8.5**

#### Propiedad 23: Aplicación de Pagos en Orden de Antigüedad
*Para cualquier* pago registrado, el monto debe aplicarse primero a las cuotas vencidas más antiguas (oldest_due_first), luego a las cuotas por vencer en orden de fecha de vencimiento.
**Valida: Requisitos 9.2**

#### Propiedad 24: Actualización de Estado de Cuotas
*Para cualquier* cuota donde el monto pagado acumulado es mayor o igual al monto de la cuota, el estado de la cuota debe ser "PAID".
**Valida: Requisitos 9.4**

#### Propiedad 25: Generación de Recibo por Pago
*Para cualquier* pago registrado, debe existir un recibo vinculado con número correlativo, fecha, cliente, monto, cuotas pagadas y saldo pendiente.
**Valida: Requisitos 9.5, 10.1**

#### Propiedad 26: Integridad Referencial de Recibos
*Para cualquier* recibo generado, debe existir un registro de pago válido asociado mediante payment_id.
**Valida: Requisitos 10.4**

#### Propiedad 27: Unicidad de Turno Abierto por Tienda
*Para cualquier* tienda en cualquier momento, debe existir como máximo un turno de caja en estado abierto.
**Valida: Requisitos 11.2**

#### Propiedad 28: Cálculo de Monto Esperado en Cierre de Caja
*Para cualquier* cierre de turno de caja, el monto esperado debe calcularse como: monto_apertura + suma(ventas_contado) + suma(cobros) - suma(egresos).
**Valida: Requisitos 11.3**

#### Propiedad 29: Cálculo de Diferencia en Cierre de Caja
*Para cualquier* cierre de turno de caja, la diferencia debe calcularse como: monto_real - monto_esperado.
**Valida: Requisitos 11.4**

#### Propiedad 30: Validación de Turno Abierto para Egresos
*Para cualquier* egreso registrado, debe existir un turno de caja abierto en la tienda correspondiente al momento del registro.
**Valida: Requisitos 12.2**

#### Propiedad 31: Invariante de Efectivo en Egresos
*Para cualquier* egreso registrado, el efectivo disponible en el turno después del egreso debe ser igual al efectivo antes del egreso menos el monto del egreso.
**Valida: Requisitos 12.4**

#### Propiedad 32: Autorización de Egresos Mayores
*Para cualquier* egreso cuyo monto supera el umbral configurado, el registro debe incluir un authorized_by válido con rol de supervisor.
**Valida: Requisitos 12.5**

#### Propiedad 33: Completitud de Datos en Facturas
*Para cualquier* factura electrónica generada, debe contener todos los datos fiscales requeridos: RUC emisor, razón social, dirección, RUC/DNI cliente, items con IGV, subtotal, IGV, total.
**Valida: Requisitos 13.1**

#### Propiedad 34: Adjunto de PDF en Envío de Facturas
*Para cualquier* factura enviada por email, el mensaje debe incluir el archivo PDF de la factura como adjunto.
**Valida: Requisitos 13.4, 14.3**

#### Propiedad 35: Formato HTML en Emails de Comprobantes
*Para cualquier* email de comprobante enviado, el cuerpo del mensaje debe contener elementos HTML válidos incluyendo logo y datos de la tienda.
**Valida: Requisitos 14.2**

#### Propiedad 36: Trazabilidad de Auditoría
*Para cualquier* operación crítica ejecutada (venta, pago, movimiento de inventario, cambio de precio, egreso, cierre de caja, anulación, reprogramación, descuento), debe existir una entrada en el log de auditoría con timestamp, usuario, operación, entidad afectada y valores anteriores/nuevos.
**Valida: Requisitos 1.4, 3.4, 18.1, 18.2, 23.5, 24.5, 25.5**

#### Propiedad 37: Inmutabilidad del Log de Auditoría
*Para cualquier* entrada existente en el log de auditoría, no debe ser posible modificar sus valores; solo se permiten inserciones de nuevas entradas.
**Valida: Requisitos 18.5**

#### Propiedad 38: Autorización de Anulaciones
*Para cualquier* anulación de venta, el usuario que ejecuta la anulación debe tener rol de supervisor y debe proporcionarse un motivo obligatorio.
**Valida: Requisitos 23.1, 23.2**

#### Propiedad 39: Reversión de Stock en Anulaciones
*Para cualquier* venta anulada, el stock del almacén después de la anulación debe ser igual al stock antes de la anulación más la cantidad que fue vendida de cada producto.
**Valida: Requisitos 23.3**

#### Propiedad 40: Reversión de Cupo en Anulaciones de Crédito
*Para cualquier* venta a crédito anulada, el cupo usado del cliente después de la anulación debe ser igual al cupo usado antes de la anulación menos el monto total de la venta, y el plan de crédito debe cambiar a estado CANCELLED.
**Valida: Requisitos 23.4**

#### Propiedad 41: Autorización de Reprogramaciones
*Para cualquier* reprogramación de cuota, el usuario que ejecuta la reprogramación debe tener permisos de supervisor y debe proporcionarse un motivo obligatorio.
**Valida: Requisitos 24.1, 24.3**

#### Propiedad 42: Cálculo de Total con Descuento
*Para cualquier* venta con descuento aplicado, el total debe calcularse como: subtotal - descuento, donde descuento puede ser un monto fijo o un porcentaje del subtotal.
**Valida: Requisitos 25.4**

#### Propiedad 43: Autorización de Descuentos Mayores
*Para cualquier* descuento cuyo monto o porcentaje supera el umbral configurado, el registro de venta debe incluir un authorized_by válido con rol de supervisor.
**Valida: Requisitos 25.2**

#### Propiedad 44: Validación de Datos de Entrada
*Para cualquier* dato de entrada en operaciones críticas, el sistema debe validar: tipos de datos correctos, rangos numéricos válidos, formatos de fecha válidos, longitudes de texto dentro de límites y presencia de campos requeridos; si alguna validación falla, la operación debe rechazarse con mensaje de error descriptivo.
**Valida: Requisitos 30.1, 30.3, 30.4**

## Manejo de Errores

### Estrategia General

El sistema implementa una estrategia de manejo de errores en tres niveles:

1. **Validación de Entrada**: Validaciones síncronas antes de ejecutar operaciones
2. **Manejo de Excepciones**: Try-catch en servicios con logging y mensajes descriptivos
3. **Respuestas de Error**: JSON estructurado con códigos de error y mensajes

### Tipos de Errores

**Errores de Validación (400)**:
- Datos faltantes o inválidos
- Formato incorrecto
- Valores fuera de rango

**Errores de Autorización (403)**:
- Usuario no en allowlist
- Permisos insuficientes
- Operación no permitida para el rol

**Errores de Negocio (422)**:
- Stock insuficiente
- Cupo de crédito excedido
- Turno de caja no abierto
- Código de barras duplicado
- DNI duplicado

**Errores de Concurrencia (409)**:
- No se pudo adquirir lock
- Operación ya procesada (idempotencia)
- Turno ya abierto en tienda

**Errores de Sistema (500)**:
- Error al acceder a Google Sheets
- Error al acceder a Google Drive
- Error al enviar email
- Error inesperado

### Formato de Respuesta de Error

```javascript
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Stock insuficiente para el producto XYZ",
    "details": {
      "productId": "123",
      "requested": 10,
      "available": 5
    }
  }
}
```

### Manejo de Errores en Operaciones Críticas

```javascript
function createSale(saleData, requestId) {
  let lock = null;
  try {
    // Validaciones
    Validator.isRequired(saleData.storeId, 'storeId');
    Validator.isRequired(saleData.userId, 'userId');
    Validator.isPositive(saleData.total, 'total');
    
    // Idempotencia
    const idempotency = IdempotencyManager.checkAndStore(requestId, () => {
      // Adquirir lock
      lock = LockManager.acquireLock('create_sale');
      
      // Validar stock
      for (const item of saleData.items) {
        const stock = inventoryService.checkStock(saleData.warehouseId, item.productId);
        if (stock < item.quantity) {
          throw new BusinessError('INSUFFICIENT_STOCK', 
            'Stock insuficiente para ' + item.productId,
            {productId: item.productId, requested: item.quantity, available: stock});
        }
      }
      
      // Ejecutar operación
      const sale = saleRepo.create(saleData);
      // ... resto de la lógica
      
      return sale;
    });
    
    return idempotency.result;
    
  } catch (e) {
    Logger.log('Error creating sale: ' + e.message);
    if (e instanceof BusinessError) {
      throw e;
    }
    throw new SystemError('SALE_CREATION_FAILED', 'Error al crear venta', {originalError: e.message});
  } finally {
    if (lock) {
      LockManager.releaseLock(lock);
    }
  }
}
```

### Logging y Auditoría de Errores

Todos los errores se registran en:
1. **Logger de Apps Script**: Para debugging y monitoreo
2. **Log de Auditoría**: Para errores de operaciones críticas
3. **Respuesta al Cliente**: Mensaje descriptivo sin exponer detalles internos

## Estrategia de Testing

### Enfoque Dual: Unit Tests + Property-Based Tests

El sistema requiere dos tipos complementarios de testing:

**Unit Tests (Ejemplos y Casos Específicos)**:
- Validación de casos de borde específicos
- Ejemplos concretos de flujos de negocio
- Integración entre componentes
- Manejo de errores específicos

**Property-Based Tests (Propiedades Universales)**:
- Validación de invariantes matemáticos
- Verificación de propiedades en múltiples escenarios generados
- Cobertura exhaustiva de combinaciones de entrada
- Detección de casos de borde no anticipados

### Configuración de Property-Based Testing

**Librería**: [fast-check](https://github.com/dubzzz/fast-check) para JavaScript

**Configuración Mínima**:
- 100 iteraciones por test (debido a randomización)
- Seed fijo para reproducibilidad de fallos
- Shrinking automático para encontrar caso mínimo de fallo

**Formato de Tags**:
```javascript
// Feature: adiction-boutique-suite, Property 8: Invariante de Stock en Ventas
test('stock decrements correctly on sale', () => {
  fc.assert(
    fc.property(
      fc.record({
        warehouseId: fc.string(),
        productId: fc.string(),
        initialStock: fc.integer({min: 10, max: 1000}),
        quantity: fc.integer({min: 1, max: 10})
      }),
      (data) => {
        // Setup
        stockRepo.setStock(data.warehouseId, data.productId, data.initialStock);
        
        // Execute
        posService.createSale({
          warehouseId: data.warehouseId,
          items: [{productId: data.productId, quantity: data.quantity}]
        }, generateRequestId());
        
        // Assert
        const finalStock = stockRepo.getStock(data.warehouseId, data.productId);
        expect(finalStock).toBe(data.initialStock - data.quantity);
      }
    ),
    {numRuns: 100}
  );
});
```

### Estrategia de Testing por Módulo

**Auth & Roles**:
- Unit: Login exitoso/fallido, carga de roles
- Property: Validación de allowlist, unión de permisos

**Inventario**:
- Unit: Creación de producto, movimiento manual
- Property: Invariante de stock, atomicidad de transferencias

**POS**:
- Unit: Venta contado simple, venta crédito 3 cuotas
- Property: Completitud de venta, idempotencia, cálculo de totales

**Crédito**:
- Unit: Pago completo de cuota, pago parcial
- Property: Aplicación oldest_due_first, suma de cuotas, invariante de cupo

**Caja**:
- Unit: Apertura/cierre de turno, egreso simple
- Property: Unicidad de turno abierto, cálculo de monto esperado

**Facturación**:
- Unit: Generación de factura, envío por email
- Property: Completitud de datos fiscales, adjunto de PDF

**Auditoría**:
- Unit: Registro de operación específica
- Property: Trazabilidad de operaciones críticas, inmutabilidad del log

### Balance de Testing

- **No escribir demasiados unit tests**: Los property tests cubren muchos casos automáticamente
- **Enfocarse en**:
  - Ejemplos que demuestran comportamiento correcto
  - Casos de borde específicos conocidos
  - Puntos de integración entre componentes
  - Condiciones de error específicas
- **Property tests para**:
  - Propiedades universales que deben cumplirse siempre
  - Cobertura exhaustiva de combinaciones de entrada
  - Invariantes matemáticos y de negocio

### Ejecución de Tests

**Entorno de Testing**:
- Google Apps Script no soporta frameworks de testing nativamente
- Opción 1: [clasp](https://github.com/google/clasp) + Jest local
- Opción 2: [gas-unit](https://github.com/WildH0g/gas-unit) para testing en Apps Script
- Opción 3: Mocks de Google APIs para testing local completo

**CI/CD**:
- Tests automáticos en cada commit
- Despliegue a entorno de staging después de tests exitosos
- Validación manual en staging antes de producción

## Notas de Implementación

### Iteraciones Sugeridas

**Milestone 1: Fundamentos (Router + Auth + Sheet Seed)**
- Router doGet/doPost con manejo de rutas
- AuthService con allowlist y roles
- Plantilla de Google Sheets con todas las hojas
- Layout Bootstrap base con sidebar/topbar
- Datos de ejemplo (seed data)

**Milestone 2: Catálogo e Inventario**
- ProductRepository y StockRepository
- InventoryService con movimientos
- Vistas de listado con DataTables
- CRUD de productos
- Consulta de stock

**Milestone 3: POS Contado**
- POSService para ventas contado
- Vista de POS con carrito
- Integración con inventario
- Generación de tickets
- Auditoría de ventas

**Milestone 4: Crédito y Cobranzas**
- CreditService con planes y cuotas
- Registro de pagos con oldest_due_first
- Generación de recibos
- Vistas de cobranza con bandejas
- Gestión de clientes

**Milestone 5: Caja y Reportes**
- CashService con turnos y egresos
- Apertura/cierre de caja con arqueo
- Reportes básicos (ventas, inventario, cartera)
- Gráficos con Chart.js

**Milestone 6: Facturación y Hardening**
- InvoiceService con generación de facturas
- Integración con API de facturación (mock → real)
- Envío por Gmail con adjuntos
- Optimizaciones de rendimiento
- Testing exhaustivo
- Documentación completa

### Reglas de Desarrollo

**Tamaño de Iteraciones**:
- 150-250 líneas de código por PR
- Máximo 10 archivos .gs + 3 archivos HTML por iteración
- Solo diffs, no reimprimir archivos completos

**Validación**:
- Validación estricta sin librerías externas
- Usar funciones nativas de JavaScript
- Mensajes de error descriptivos en español

**Concurrencia**:
- Locks obligatorios para operaciones críticas
- Timeout de 30 segundos para locks
- Retry con backoff exponencial (3 intentos)

**Idempotencia**:
- RequestId obligatorio para operaciones críticas
- Caché de 24 horas para requestIds procesados
- Retornar resultado original en duplicados

**Caché**:
- Productos: 5 minutos TTL
- Usuarios: 10 minutos TTL
- Parámetros: 15 minutos TTL
- Invalidación manual en modificaciones

**Paginación**:
- Obligatoria para listados > 100 registros
- Tamaños: 25, 50, 100 registros por página
- Mantener filtros y ordenamiento entre páginas

**UI**:
- Bootstrap 5.3 para estilos
- DataTables 1.13 para tablas
- Bootstrap Icons 1.11 para iconos
- Responsive mobile-first
- Accesibilidad WCAG 2.1 AA

**Testing**:
- Mínimo pero siempre presente
- Property tests para invariantes críticos
- Unit tests para casos de borde
- 100 iteraciones por property test

### Consideraciones de Seguridad

**Autenticación**:
- Solo cuentas Google en allowlist
- Session.getActiveUser() para identificación
- No almacenar contraseñas

**Autorización**:
- RBAC con roles por tienda
- Validación de permisos en cada operación
- Auditoría de intentos denegados

**Datos Sensibles**:
- Fotos de DNI en Drive con permisos restringidos
- No exponer datos fiscales en logs
- Sanitizar inputs para prevenir injection

**Auditoría**:
- Log inmutable de operaciones críticas
- Timestamp y usuario en cada operación
- Retención indefinida del log

### Limitaciones de Google Apps Script

**Cuotas y Límites**:
- 6 minutos máximo de ejecución por request
- 20,000 llamadas a servicios de Google por día
- 100 MB máximo de datos en caché
- 50 MB máximo por archivo en Drive

**Workarounds**:
- Operaciones largas divididas en chunks
- Caché para reducir lecturas a Sheets
- Paginación para grandes volúmenes
- Batch operations donde sea posible

**Concurrencia**:
- LockService tiene límites de tiempo
- Posibles timeouts en alta concurrencia
- Implementar retry logic robusto

### Documentación Requerida

**Setup**:
- Instrucciones de instalación paso a paso
- Configuración de permisos de Google
- Creación de allowlist inicial
- Configuración de parámetros

**Roles y Permisos**:
- Matriz de roles vs permisos
- Guía de asignación de roles
- Casos de uso por rol

**Publicación**:
- Despliegue como WebApp
- Configuración de URL pública
- Gestión de versiones
- Rollback en caso de errores

**Operación**:
- Flujos de trabajo principales
- Resolución de problemas comunes
- Mantenimiento de datos
- Backup y recuperación
