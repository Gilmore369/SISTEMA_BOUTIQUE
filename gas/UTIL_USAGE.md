# Util.gs - Guía de Uso

## Descripción

`Util.gs` contiene utilidades del sistema, incluyendo funciones de validación estrictas sin dependencias externas, siguiendo los requisitos 30.1 y 30.3.

## Validaciones Disponibles

### 1. Validator.isRequired(value, fieldName)

Valida que un valor sea requerido (no null, undefined o string vacío).

**Ejemplo:**
```javascript
Validator.isRequired(email, 'Email');
Validator.isRequired(nombre, 'Nombre del cliente');
```

**Lanza error si:**
- El valor es `null`
- El valor es `undefined`
- El valor es un string vacío `''`

---

### 2. Validator.isNumber(value, fieldName)

Valida que un valor sea un número válido.

**Ejemplo:**
```javascript
Validator.isNumber(cantidad, 'Cantidad');
Validator.isNumber(precio, 'Precio');
```

**Lanza error si:**
- El valor no es un número válido
- El valor es `null`, `undefined` o string vacío
- El valor es `NaN`

---

### 3. Validator.isPositive(value, fieldName)

Valida que un número sea positivo (mayor que cero).

**Ejemplo:**
```javascript
Validator.isPositive(monto, 'Monto de venta');
Validator.isPositive(stock, 'Stock disponible');
```

**Lanza error si:**
- El valor no es un número válido
- El valor es menor o igual a cero

---

### 4. Validator.isEmail(value, fieldName)

Valida que un string tenga formato de email válido.

**Ejemplo:**
```javascript
Validator.isEmail(clienteEmail, 'Email del cliente');
Validator.isEmail(destinatario, 'Destinatario');
```

**Lanza error si:**
- El valor no es un string
- El formato no coincide con el patrón de email (usuario@dominio.com)

---

### 5. Validator.isInRange(value, min, max, fieldName)

Valida que un número esté dentro de un rango específico (inclusivo).

**Ejemplo:**
```javascript
Validator.isInRange(cuotas, 1, 6, 'Número de cuotas');
Validator.isInRange(descuento, 0, 100, 'Porcentaje de descuento');
```

**Lanza error si:**
- El valor no es un número válido
- El valor es menor que `min`
- El valor es mayor que `max`

---

## Helpers de Utilidad

### Generación de IDs

```javascript
var id = generateId();           // Retorna: "ID_1234567890_1234"
var reqId = generateRequestId(); // Retorna: "REQ_1234567890_12345"
```

### Manejo de Dinero

```javascript
var formatted = formatMoney(123.456);  // Retorna: "123.46"
var parsed = parseMoney('99.99');      // Retorna: 99.99
```

### Manejo de Fechas

```javascript
var fecha = formatDate(new Date());         // Retorna: "2024-01-15"
var fechaHora = formatDateTime(new Date()); // Retorna: "2024-01-15 14:30:00"
```

### Sanitización de Strings

```javascript
var clean = sanitizeString('  texto con espacios  ', 100);
// Retorna: "texto con espacios" (sin espacios al inicio/fin, máx 100 chars)
```

### JSON Seguro

```javascript
var jsonStr = safeJsonStringify({key: 'value'}); // No lanza error si falla
var obj = safeJsonParse('{"key":"value"}');      // Retorna null si falla
```

---

## Ejemplo de Uso en Servicios

```javascript
function crearVenta(ventaData) {
  try {
    // Validar datos requeridos
    Validator.isRequired(ventaData.storeId, 'ID de tienda');
    Validator.isRequired(ventaData.clientId, 'ID de cliente');
    
    // Validar números
    Validator.isNumber(ventaData.total, 'Total de venta');
    Validator.isPositive(ventaData.total, 'Total de venta');
    
    // Validar rangos
    if (ventaData.cuotas) {
      Validator.isInRange(ventaData.cuotas, 1, 6, 'Número de cuotas');
    }
    
    // Validar email si se proporciona
    if (ventaData.email) {
      Validator.isEmail(ventaData.email, 'Email del cliente');
    }
    
    // Procesar venta...
    return {ok: true, data: venta, error: null};
    
  } catch (e) {
    Logger.log('Error en crearVenta: ' + e.message);
    return {
      ok: false, 
      data: null, 
      error: {
        code: 'VALIDATION_ERROR',
        message: e.message,
        details: null
      }
    };
  }
}
```

---

## Mensajes de Error (Español - es-PE)

Todos los mensajes de error están en español peruano:

- `"Email es requerido"`
- `"Cantidad debe ser un número válido"`
- `"Monto de venta debe ser un número positivo (mayor que cero)"`
- `"Email del cliente debe ser un email válido (formato: usuario@dominio.com)"`
- `"Número de cuotas debe estar entre 1 y 6"`

---

## Testing

Para ejecutar los tests unitarios:

1. Abrir el editor de Apps Script
2. Ejecutar la función `testValidator()`
3. Ver los resultados en el log (Ver > Registros)

```javascript
testValidator(); // Ejecuta todos los tests
quickTest();     // Test rápido de carga
```

---

## Notas Importantes

1. **Sin librerías externas**: Todas las validaciones usan solo JavaScript nativo
2. **Mensajes descriptivos**: Cada error incluye el nombre del campo y el problema específico
3. **Envelope estándar**: Usar con el formato `{ok, data, error}` en todas las respuestas
4. **Sanitización**: Siempre sanitizar inputs antes de guardar en Sheets
5. **Logging**: Los errores se registran automáticamente en el Logger

---

## LockManager - Manejo de Concurrencia

El `LockManager` proporciona funciones para manejar operaciones concurrentes usando `LockService` de Apps Script, previniendo condiciones de carrera en operaciones críticas.

### 1. LockManager.acquireLock(lockKey, timeoutMs)

Adquiere un lock para operaciones críticas.

**Parámetros:**
- `lockKey` (string): Identificador del lock para logging
- `timeoutMs` (number, opcional): Timeout en milisegundos (default: 30000)

**Retorna:** Objeto Lock de Apps Script

**Ejemplo:**
```javascript
var lock = LockManager.acquireLock('crear_venta', 30000);
try {
  // Operación crítica aquí
} finally {
  LockManager.releaseLock(lock);
}
```

**Lanza error si:**
- No se puede adquirir el lock después del timeout
- El sistema está ocupado con otra operación

---

### 2. LockManager.releaseLock(lock)

Libera un lock previamente adquirido.

**Parámetros:**
- `lock` (Lock): Objeto lock a liberar

**Ejemplo:**
```javascript
var lock = LockManager.acquireLock('operacion');
try {
  // Tu código aquí
} finally {
  LockManager.releaseLock(lock); // Siempre liberar en finally
}
```

---

### 3. LockManager.withLock(lockKey, fn)

Ejecuta una función con lock automático (patrón recomendado).

Garantiza que el lock se libere automáticamente incluso si la función lanza error.

**Parámetros:**
- `lockKey` (string): Identificador del lock
- `fn` (Function): Función a ejecutar con lock

**Retorna:** Resultado de la función ejecutada

**Ejemplo:**
```javascript
var resultado = LockManager.withLock('crear_venta', function() {
  // Validar stock
  var stock = checkStock(productId);
  if (stock < cantidad) {
    throw new Error('Stock insuficiente');
  }
  
  // Decrementar stock
  updateStock(productId, -cantidad);
  
  // Crear venta
  var venta = createSale(ventaData);
  
  return venta;
});
```

---

## Cuándo Usar Locks

Debes usar locks en operaciones críticas que modifican datos compartidos:

### ✅ Usar locks en:
- **Crear venta**: Validar y decrementar stock
- **Registrar pago**: Aplicar pago a cuotas
- **Transferir stock**: Mover entre almacenes
- **Abrir/cerrar turno de caja**: Validar unicidad
- **Ajustar inventario**: Modificar stock manualmente

### ❌ NO usar locks en:
- Consultas de solo lectura
- Operaciones que no modifican datos compartidos
- Operaciones que ya están protegidas por otro lock

---

## Ejemplo Completo: Crear Venta con Lock

```javascript
function crearVenta(ventaData, requestId) {
  try {
    // Validaciones previas (sin lock)
    Validator.isRequired(ventaData.storeId, 'ID de tienda');
    Validator.isPositive(ventaData.total, 'Total');
    
    // Ejecutar operación crítica con lock
    var venta = LockManager.withLock('crear_venta_' + requestId, function() {
      
      // Validar stock disponible
      for (var i = 0; i < ventaData.items.length; i++) {
        var item = ventaData.items[i];
        var stock = stockRepo.getStock(ventaData.warehouseId, item.productId);
        
        if (stock < item.quantity) {
          throw new Error('Stock insuficiente para producto ' + item.productId);
        }
      }
      
      // Crear venta
      var venta = saleRepo.create(ventaData);
      
      // Decrementar stock
      for (var i = 0; i < ventaData.items.length; i++) {
        var item = ventaData.items[i];
        stockRepo.updateQuantity(
          ventaData.warehouseId, 
          item.productId, 
          -item.quantity
        );
      }
      
      // Registrar movimientos
      for (var i = 0; i < ventaData.items.length; i++) {
        var item = ventaData.items[i];
        movementRepo.create({
          warehouseId: ventaData.warehouseId,
          productId: item.productId,
          type: 'SALIDA',
          quantity: item.quantity,
          referenceId: venta.id,
          userId: ventaData.userId,
          reason: 'Venta #' + venta.saleNumber
        });
      }
      
      return venta;
    });
    
    return {ok: true, data: venta, error: null};
    
  } catch (e) {
    Logger.log('Error en crearVenta: ' + e.message);
    return {
      ok: false,
      data: null,
      error: {
        code: e.message.indexOf('lock') > -1 ? 'LOCK_TIMEOUT' : 'SALE_ERROR',
        message: e.message,
        details: null
      }
    };
  }
}
```

---

## Manejo de Errores de Lock

Si no se puede adquirir un lock, el sistema lanza un error descriptivo:

```
"No se pudo adquirir el lock. El sistema está ocupado, intente nuevamente en unos segundos."
```

**Recomendaciones:**
1. Mostrar mensaje amigable al usuario
2. Sugerir reintentar la operación
3. No reintentar automáticamente (evitar loops infinitos)
4. Registrar en auditoría los intentos fallidos

---

## Configuración de Timeouts

El timeout por defecto es 30 segundos (definido en `LIMITS.LOCK_TIMEOUT_MS` en Const.gs).

Puedes ajustar el timeout según la operación:

```javascript
// Operación rápida (10 segundos)
var lock = LockManager.acquireLock('operacion_rapida', 10000);

// Operación lenta (60 segundos)
var lock = LockManager.acquireLock('operacion_lenta', 60000);
```

**Nota:** Apps Script tiene un límite de 6 minutos por ejecución, así que timeouts muy largos no son recomendables.

---

## Próximos Pasos

En futuras iteraciones se agregarán a `Util.gs`:

- ~~Funciones de lock (LockManager)~~ ✅ **Completado**
- Funciones de idempotencia (IdempotencyManager)
- Funciones de caché (CacheManager)
- Más helpers según necesidad


---

## IdempotencyManager - Gestión de Idempotencia

El `IdempotencyManager` proporciona funciones para garantizar que operaciones críticas no se ejecuten múltiples veces por error, previniendo duplicación de ventas, pagos o movimientos de inventario.

### ¿Qué es Idempotencia?

La idempotencia garantiza que ejecutar la misma operación múltiples veces con el mismo `requestId` produce el mismo resultado que ejecutarla una sola vez. Esto es crítico para:

- **Ventas**: Evitar ventas duplicadas si el usuario hace clic múltiples veces
- **Pagos**: Prevenir pagos duplicados por problemas de red
- **Transferencias**: Garantizar que una transferencia no se ejecute dos veces
- **Movimientos de inventario**: Evitar decrementos duplicados de stock

### 1. IdempotencyManager.checkAndStore(requestId, operation)

Verifica si un requestId ya fue procesado y ejecuta la operación solo si no existe.

**Parámetros:**
- `requestId` (string): Identificador único de la operación
- `operation` (Function): Función a ejecutar si el requestId no existe

**Retorna:** Objeto con:
- `processed` (boolean): true si el requestId ya existía, false si se ejecutó la operación
- `result` (*): resultado de la operación (nuevo o almacenado)

**Ejemplo básico:**
```javascript
var requestId = generateRequestId(); // 'REQ_1234567890_12345'

var resultado = IdempotencyManager.checkAndStore(requestId, function() {
  // Esta operación solo se ejecutará una vez
  var venta = crearVenta(ventaData);
  return venta;
});

if (resultado.processed) {
  Logger.log('Operación ya fue procesada anteriormente');
  Logger.log('Resultado anterior: ' + JSON.stringify(resultado.result));
} else {
  Logger.log('Operación ejecutada exitosamente');
  Logger.log('Nuevo resultado: ' + JSON.stringify(resultado.result));
}
```

**Lanza error si:**
- El requestId es null, undefined o string vacío
- La operation no es una función válida
- La operación interna lanza un error

---

### 2. IdempotencyManager.invalidate(requestId)

Invalida un requestId del caché (útil para testing o rollback).

**Parámetros:**
- `requestId` (string): Identificador único a invalidar

**Ejemplo:**
```javascript
// Invalidar un requestId específico
IdempotencyManager.invalidate('REQ_1234567890_12345');

// Ahora la operación se puede ejecutar nuevamente
var resultado = IdempotencyManager.checkAndStore('REQ_1234567890_12345', function() {
  return crearVenta(ventaData);
});
```

**Nota:** Esta función es principalmente para testing. En producción, los requestIds se invalidan automáticamente después de 24 horas.

---

### 3. IdempotencyManager.exists(requestId)

Verifica si un requestId ya fue procesado (sin ejecutar operación).

**Parámetros:**
- `requestId` (string): Identificador único a verificar

**Retorna:** boolean - true si el requestId ya existe en caché

**Ejemplo:**
```javascript
var requestId = 'REQ_1234567890_12345';

if (IdempotencyManager.exists(requestId)) {
  Logger.log('Esta operación ya fue procesada');
} else {
  Logger.log('Esta operación es nueva');
}
```

---

## Cuándo Usar Idempotencia

Debes usar idempotencia en operaciones críticas que modifican datos y no deben ejecutarse múltiples veces:

### ✅ Usar idempotencia en:
- **Crear venta**: Prevenir ventas duplicadas
- **Registrar pago**: Evitar pagos duplicados
- **Transferir stock**: Garantizar transferencias únicas
- **Ajustar inventario**: Prevenir ajustes duplicados
- **Crear plan de crédito**: Evitar planes duplicados

### ❌ NO usar idempotencia en:
- Consultas de solo lectura
- Operaciones que naturalmente son idempotentes (ej: actualizar estado)
- Operaciones que deben ejecutarse múltiples veces

---

## Ejemplo Completo: Crear Venta con Idempotencia

```javascript
function crearVenta(ventaData, requestId) {
  try {
    // Validaciones previas (sin idempotencia)
    Validator.isRequired(ventaData.storeId, 'ID de tienda');
    Validator.isRequired(requestId, 'RequestId');
    Validator.isPositive(ventaData.total, 'Total');
    
    // Ejecutar operación con idempotencia
    var resultado = IdempotencyManager.checkAndStore(requestId, function() {
      
      // Ejecutar operación crítica con lock
      return LockManager.withLock('crear_venta_' + requestId, function() {
        
        // Validar stock disponible
        for (var i = 0; i < ventaData.items.length; i++) {
          var item = ventaData.items[i];
          var stock = stockRepo.getStock(ventaData.warehouseId, item.productId);
          
          if (stock < item.quantity) {
            throw new Error('Stock insuficiente para producto ' + item.productId);
          }
        }
        
        // Crear venta
        var venta = saleRepo.create(ventaData);
        
        // Decrementar stock
        for (var i = 0; i < ventaData.items.length; i++) {
          var item = ventaData.items[i];
          stockRepo.updateQuantity(
            ventaData.warehouseId, 
            item.productId, 
            -item.quantity
          );
        }
        
        // Registrar movimientos
        for (var i = 0; i < ventaData.items.length; i++) {
          var item = ventaData.items[i];
          movementRepo.create({
            warehouseId: ventaData.warehouseId,
            productId: item.productId,
            type: 'SALIDA',
            quantity: item.quantity,
            referenceId: venta.id,
            userId: ventaData.userId,
            reason: 'Venta #' + venta.saleNumber
          });
        }
        
        return venta;
      });
    });
    
    // Retornar resultado (nuevo o cacheado)
    return {
      ok: true, 
      data: resultado.result, 
      error: null,
      wasProcessed: resultado.processed
    };
    
  } catch (e) {
    Logger.log('Error en crearVenta: ' + e.message);
    return {
      ok: false,
      data: null,
      error: {
        code: e.message.indexOf('Stock insuficiente') > -1 ? 'INSUFFICIENT_STOCK' : 'SALE_ERROR',
        message: e.message,
        details: null
      }
    };
  }
}
```

---

## Combinando Lock + Idempotencia

Para operaciones críticas, se recomienda usar **ambos** patrones:

1. **Idempotencia externa**: Previene ejecución duplicada por reintentos del cliente
2. **Lock interno**: Previene condiciones de carrera entre operaciones concurrentes

**Patrón recomendado:**
```javascript
function operacionCritica(data, requestId) {
  // 1. Validaciones previas
  Validator.isRequired(requestId, 'RequestId');
  
  // 2. Idempotencia (capa externa)
  var resultado = IdempotencyManager.checkAndStore(requestId, function() {
    
    // 3. Lock (capa interna)
    return LockManager.withLock('operacion_' + requestId, function() {
      
      // 4. Lógica de negocio
      // ...
      
      return resultado;
    });
  });
  
  return resultado;
}
```

---

## Almacenamiento y TTL

- **Almacenamiento**: CacheService de Apps Script (en memoria, compartido entre ejecuciones)
- **TTL (Time To Live)**: 24 horas (86400 segundos)
- **Límite de tamaño**: 100 KB por entrada (suficiente para la mayoría de operaciones)
- **Límite total**: 100 MB de caché compartido

**Nota:** Después de 24 horas, el requestId se invalida automáticamente y la operación se puede ejecutar nuevamente.

---

## Generación de RequestIds

Usa la función helper `generateRequestId()` para crear requestIds únicos:

```javascript
var requestId = generateRequestId();
// Retorna: 'REQ_1234567890_12345'
```

**Formato:** `REQ_` + timestamp + `_` + random (5 dígitos)

**Características:**
- Único por timestamp + random
- Fácil de identificar en logs
- Compatible con CacheService

---

## Manejo de Errores de Idempotencia

Si la operación interna lanza un error, el error se propaga y **no se almacena en caché**:

```javascript
var resultado = IdempotencyManager.checkAndStore(requestId, function() {
  throw new Error('Stock insuficiente');
});
// El error se propaga, no se almacena en caché
```

Esto garantiza que:
- Solo se almacenan resultados exitosos
- Los errores se pueden reintentar con el mismo requestId
- No se bloquean operaciones por errores transitorios

---

## Testing de Idempotencia

```javascript
function testIdempotency() {
  var requestId = 'TEST_REQ_' + new Date().getTime();
  var contador = 0;
  
  // Primera ejecución
  var resultado1 = IdempotencyManager.checkAndStore(requestId, function() {
    contador++;
    return {id: 'VENTA_001', total: 100};
  });
  
  Logger.log('Primera ejecución - processed: ' + resultado1.processed); // false
  Logger.log('Contador: ' + contador); // 1
  
  // Segunda ejecución (duplicada)
  var resultado2 = IdempotencyManager.checkAndStore(requestId, function() {
    contador++;
    return {id: 'VENTA_002', total: 200};
  });
  
  Logger.log('Segunda ejecución - processed: ' + resultado2.processed); // true
  Logger.log('Contador: ' + contador); // 1 (no se ejecutó)
  Logger.log('Resultado igual: ' + (resultado1.result.id === resultado2.result.id)); // true
  
  // Limpiar
  IdempotencyManager.invalidate(requestId);
}
```

---

## Configuración de TTL

El TTL por defecto es 24 horas, definido en `LIMITS.CACHE_TTL_IDEMPOTENCY` en Const.gs.

Si necesitas ajustar el TTL para casos específicos, puedes modificar la constante:

```javascript
// En Const.gs
const LIMITS = {
  // ...
  CACHE_TTL_IDEMPOTENCY: 86400 // 24 horas (en segundos)
};
```

**Recomendaciones:**
- **24 horas**: Suficiente para la mayoría de casos
- **Más corto**: Si el espacio de caché es limitado
- **Más largo**: No recomendado (límite de Apps Script)

---

## Actualización de "Próximos Pasos"

En futuras iteraciones se agregarán a `Util.gs`:

- ~~Funciones de lock (LockManager)~~ ✅ **Completado**
- ~~Funciones de idempotencia (IdempotencyManager)~~ ✅ **Completado**
- Funciones de caché (CacheManager)
- Más helpers según necesidad
