# AuthService - Documentación

## Descripción

El `AuthService` es el servicio de autenticación y autorización del sistema Adiction Boutique Suite. Implementa el modelo RBAC (Role-Based Access Control) con soporte para múltiples roles por usuario y roles por tienda.

## Ubicación

- **Archivo**: `gas/Services.gs`
- **Clase**: `AuthService`
- **Repositorio auxiliar**: `AuditRepository` (también en Services.gs)

## Métodos Implementados

### 1. `isUserAllowed(email)`

Valida si un usuario está en la allowlist (lista de usuarios permitidos).

**Parámetros:**
- `email` (string): Email del usuario a validar

**Retorna:**
- `boolean`: `true` si el usuario está permitido y activo, `false` si no

**Requisitos:** 1.1, 1.2

**Características:**
- Normaliza el email (lowercase, trim)
- Usa caché para mejorar rendimiento (TTL: 10 minutos)
- Verifica que el usuario exista en CFG_Users
- Verifica que el campo `active` sea `true`
- Manejo robusto de errores (retorna `false` en caso de error)

**Ejemplo:**
```javascript
const authService = new AuthService();
const isAllowed = authService.isUserAllowed('usuario@example.com');
// Retorna: true o false
```

### 2. `getUserRoles(email)`

Obtiene los roles asignados a un usuario.

**Parámetros:**
- `email` (string): Email del usuario

**Retorna:**
- `Array<string>`: Array de roles del usuario (vacío si no tiene roles o no existe)

**Requisitos:** 1.3

**Características:**
- Normaliza el email (lowercase, trim)
- Usa caché para mejorar rendimiento (TTL: 10 minutos)
- Parsea el campo `roles` desde JSON (formato: `["Admin", "Vendedor"]`)
- Retorna array vacío si el usuario no existe o no tiene roles
- Manejo robusto de errores de parsing JSON

**Ejemplo:**
```javascript
const authService = new AuthService();
const roles = authService.getUserRoles('admin@example.com');
// Retorna: ["Admin", "Vendedor"]
```

### 3. `hasPermission(email, permission)`

Verifica si un usuario tiene un permiso específico.

**Parámetros:**
- `email` (string): Email del usuario
- `permission` (string): Permiso a verificar (ej: 'create_sale', 'void_sale')

**Retorna:**
- `boolean`: `true` si el usuario tiene el permiso, `false` si no

**Requisitos:** 2.4, 1.5

**Características:**
- Obtiene los roles del usuario usando `getUserRoles()`
- Implementa la **unión de permisos** cuando el usuario tiene múltiples roles
- Consulta la constante `PERMISSIONS` de Const.gs para obtener permisos por rol
- Retorna `true` si **alguno** de los roles del usuario tiene el permiso
- Manejo robusto de errores (retorna `false` en caso de error)

**Ejemplo:**
```javascript
const authService = new AuthService();
const canCreateSale = authService.hasPermission('vendedor@example.com', 'create_sale');
// Retorna: true o false
```

### 4. `logAccess(email, success)`

Registra un intento de acceso en el log de auditoría.

**Parámetros:**
- `email` (string): Email del usuario que intenta acceder
- `success` (boolean): `true` si el acceso fue exitoso, `false` si fue denegado

**Retorna:**
- `void`

**Requisitos:** 1.4

**Características:**
- Crea una entrada en la hoja AUD_Log
- Registra tanto accesos exitosos como fallidos
- Incluye timestamp, usuario, operación (LOGIN_SUCCESS/LOGIN_FAILED)
- Usa `AuditRepository` para persistir la entrada
- No lanza errores para no interrumpir el flujo de autenticación
- Registra errores en el log pero continúa la ejecución

**Ejemplo:**
```javascript
const authService = new AuthService();

// Registrar acceso exitoso
authService.logAccess('usuario@example.com', true);

// Registrar acceso fallido
authService.logAccess('intruso@example.com', false);
```

## AuditRepository

El `AuditRepository` es un repositorio auxiliar incluido en Services.gs para gestionar el log de auditoría.

### Métodos

#### `log(operation, entityType, entityId, oldValues, newValues, userId)`

Método de conveniencia para crear entradas de auditoría.

**Parámetros:**
- `operation` (string): Operación realizada (ej: 'CREATE_SALE', 'LOGIN_SUCCESS')
- `entityType` (string): Tipo de entidad afectada (ej: 'SALE', 'AUTH', 'PRODUCT')
- `entityId` (string): ID de la entidad afectada
- `oldValues` (Object): Valores anteriores (para updates)
- `newValues` (Object): Valores nuevos
- `userId` (string): Email del usuario que realizó la operación

**Retorna:**
- `Object`: Entrada de auditoría creada

#### `findByFilters(filters)`

Busca entradas de auditoría con filtros.

**Parámetros:**
- `filters` (Object): Objeto con filtros opcionales
  - `userId`: Email del usuario
  - `operation`: Operación específica
  - `entityType`: Tipo de entidad
  - `startDate`: Fecha inicio (Date)
  - `endDate`: Fecha fin (Date)

**Retorna:**
- `Array<Object>`: Entradas de auditoría que coinciden con los filtros

## Caché

El AuthService utiliza `CacheManager` (de Util.gs) para mejorar el rendimiento:

- **isUserAllowed**: Caché de 10 minutos (LIMITS.CACHE_TTL_USERS)
- **getUserRoles**: Caché de 10 minutos (LIMITS.CACHE_TTL_USERS)

El caché se invalida automáticamente después del TTL. Para invalidar manualmente:

```javascript
CacheManager.invalidate('user_allowed_usuario@example.com');
CacheManager.invalidate('user_roles_usuario@example.com');
```

## Dependencias

El AuthService depende de:

1. **UserRepository** (Repo.gs): Para acceder a CFG_Users
2. **AuditRepository** (Services.gs): Para registrar accesos
3. **CacheManager** (Util.gs): Para caché de usuarios
4. **PERMISSIONS** (Const.gs): Matriz de permisos por rol
5. **LIMITS** (Const.gs): Configuración de TTL de caché

## Pruebas

Se incluyen dos funciones de prueba en Services.gs:

### `testAuthService()`

Prueba completa de todos los métodos del AuthService.

**Ejecutar desde Apps Script:**
```javascript
testAuthService();
```

**Verifica:**
- Creación de instancia
- isUserAllowed con usuario existente y no existente
- getUserRoles
- hasPermission con diferentes permisos
- logAccess (exitoso y fallido)
- Creación de entradas de auditoría

### `testAuthServiceWithCache()`

Prueba el rendimiento del caché.

**Ejecutar desde Apps Script:**
```javascript
testAuthServiceWithCache();
```

**Verifica:**
- Primera llamada sin caché (más lenta)
- Segunda llamada con caché (más rápida)
- Mejora de rendimiento

## Flujo de Autenticación Típico

```javascript
// 1. Obtener email del usuario actual
const userEmail = Session.getActiveUser().getEmail();

// 2. Crear instancia del servicio
const authService = new AuthService();

// 3. Verificar si el usuario está permitido
if (!authService.isUserAllowed(userEmail)) {
  // Denegar acceso
  authService.logAccess(userEmail, false);
  return HtmlService.createHtmlOutput('Acceso denegado');
}

// 4. Registrar acceso exitoso
authService.logAccess(userEmail, true);

// 5. Verificar permisos para operaciones específicas
if (authService.hasPermission(userEmail, 'create_sale')) {
  // Permitir crear venta
} else {
  // Denegar operación
  return { success: false, error: 'Permisos insuficientes' };
}
```

## Notas de Implementación

1. **Seguridad**: En caso de error, los métodos retornan valores seguros (false, array vacío) para denegar acceso por defecto.

2. **Normalización**: Todos los emails se normalizan (lowercase, trim) para evitar problemas de case-sensitivity.

3. **Caché**: El caché mejora significativamente el rendimiento al evitar lecturas repetidas a Google Sheets.

4. **Auditoría**: Los errores en logAccess no interrumpen el flujo de autenticación, solo se registran en el log.

5. **Unión de permisos**: Cuando un usuario tiene múltiples roles, tiene la unión de todos los permisos de sus roles (Requisito 1.5).

## Próximos Pasos

El AuthService está listo para ser usado por:
- Router (Main.gs) para validar acceso en doGet/doPost
- Otros servicios para verificar permisos antes de operaciones críticas
- Vistas HTML para mostrar/ocultar elementos según permisos

## Requisitos Implementados

- ✅ **Requisito 1.1**: Validación contra allowlist
- ✅ **Requisito 1.2**: Denegación de acceso a usuarios no autorizados
- ✅ **Requisito 1.3**: Carga de roles y permisos
- ✅ **Requisito 1.4**: Registro de intentos de acceso en auditoría
- ✅ **Requisito 1.5**: Unión de permisos para múltiples roles
- ✅ **Requisito 2.4**: Verificación de permisos por rol
