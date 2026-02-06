# BaseRepository - Implementación Completada

## 📋 Resumen

Se ha implementado exitosamente la clase `BaseRepository` en el archivo `gas/Repo.gs`, que proporciona operaciones CRUD genéricas para acceder a las hojas de Google Sheets como base de datos.

## ✅ Funcionalidades Implementadas

### Clase BaseRepository

#### Constructor
- ✅ Recibe nombre de hoja como parámetro
- ✅ Valida que la hoja existe
- ✅ Manejo robusto de errores
- ✅ Caché de headers para optimización

#### Operaciones CRUD

1. **findAll()**
   - Obtiene todos los registros de la hoja
   - Lectura por rangos (batch operation)
   - Convierte filas a objetos automáticamente
   - Retorna array vacío si no hay datos

2. **findById(id)**
   - Busca un registro por su ID
   - Retorna objeto o null si no se encuentra
   - Manejo de errores robusto

3. **create(obj)**
   - Crea un nuevo registro
   - Agrega fila al final de la hoja
   - Convierte objeto a fila automáticamente
   - Retorna el objeto creado

4. **update(id, obj)**
   - Actualiza un registro existente por ID
   - Busca la fila y actualiza sus valores
   - Escritura por rangos (batch operation)
   - Retorna objeto actualizado o null si no se encuentra

5. **delete(id)**
   - Elimina un registro por ID
   - Retorna true si se eliminó, false si no se encontró
   - Manejo seguro de errores

#### Métodos Auxiliares

1. **_rowToObject(row, headers)**
   - Convierte una fila (array) en un objeto
   - Mapea valores usando headers como propiedades
   - Convierte valores vacíos a null

2. **_objectToRow(obj)**
   - Convierte un objeto en una fila (array)
   - Extrae valores en el orden de los headers
   - Convierte null/undefined a string vacío

3. **_getHeaders()**
   - Obtiene los headers de la hoja
   - Implementa caché para evitar lecturas repetidas
   - Optimización de rendimiento

#### Métodos de Utilidad

1. **count()**
   - Cuenta el número de registros (sin headers)
   - Retorna 0 si hay error

2. **exists(id)**
   - Verifica si existe un registro con el ID especificado
   - Retorna boolean

3. **clear()**
   - Elimina todos los registros (mantiene headers)
   - Retorna número de registros eliminados
   - PRECAUCIÓN: Operación no reversible

## 🎯 Cumplimiento de Requisitos

### Requisito 4.1: Control de Inventario por Almacén
✅ **Validado**: La clase BaseRepository proporciona la base para mantener el stock actual de cada producto por almacén mediante operaciones CRUD eficientes.

### Reglas de REGLAS.MD

✅ **Código limpio**: Sin duplicación, funciones bien nombradas y documentadas

✅ **Batch operations**: Todas las lecturas/escrituras se hacen por rangos, nunca por celda

✅ **Manejo robusto de errores**: Try-catch en todas las operaciones con mensajes descriptivos

✅ **Sin dependencias externas**: Solo APIs nativas de Google Apps Script

✅ **Modular**: Clase base reutilizable para todos los repositorios específicos

## 🧪 Funciones de Prueba Incluidas

### testBaseRepository()
Prueba las operaciones básicas:
- Creación de instancia
- count()
- findAll()
- findById()
- exists()

### testBaseRepositoryCRUD()
Prueba el ciclo completo CRUD:
- create() - Crea registro de prueba
- findById() - Verifica creación
- update() - Actualiza registro
- findById() - Verifica actualización
- delete() - Elimina registro
- findById() - Verifica eliminación

**PRECAUCIÓN**: `testBaseRepositoryCRUD()` modifica datos reales. Solo ejecutar en ambiente de prueba.

## 📝 Cómo Usar

### Ejemplo Básico

```javascript
// Crear instancia del repositorio
const userRepo = new BaseRepository(SHEETS.CFG_USERS);

// Obtener todos los usuarios
const users = userRepo.findAll();

// Buscar usuario por ID
const user = userRepo.findById('user-123');

// Crear nuevo usuario
const newUser = {
  id: 'user-456',
  email: 'nuevo@example.com',
  name: 'Usuario Nuevo',
  roles: '["Vendedor"]',
  stores: '["Mujeres"]',
  active: true,
  created_at: new Date()
};
userRepo.create(newUser);

// Actualizar usuario
newUser.name = 'Usuario Actualizado';
userRepo.update('user-456', newUser);

// Eliminar usuario
userRepo.delete('user-456');
```

### Crear Repositorio Específico

```javascript
// Heredar de BaseRepository
class UserRepository extends BaseRepository {
  constructor() {
    super(SHEETS.CFG_USERS);
  }
  
  // Método específico
  findByEmail(email) {
    const users = this.findAll();
    return users.find(u => u.email === email);
  }
}

// Usar el repositorio específico
const userRepo = new UserRepository();
const user = userRepo.findByEmail('admin@example.com');
```

## 🔄 Próximos Pasos

La tarea 6 implementará repositorios específicos que heredan de BaseRepository:

- [x] 6.1 UserRepository para CFG_Users
  - Método findByEmail(email)
  
- [x] 6.2 ProductRepository para CAT_Products
  - Método findByBarcode(barcode)
  - Método search(query)
  
- [x] 6.3 StockRepository para INV_Stock
  - Método findByWarehouseAndProduct(warehouseId, productId)
  - Método updateQuantity(warehouseId, productId, delta)

### Repositorios Adicionales Implementados

- [x] MovementRepository para INV_Movements
  - Método findByWarehouse(warehouseId, filters)
  - Método findByProduct(productId)

- [x] ClientRepository para CRM_Clients
  - Método findByDNI(dni)
  - Método search(query)

- [x] AuditRepository para AUD_Log
  - Método log(operation, entityType, entityId, oldValues, newValues, userId)
  - Método findByFilters(filters)
  - Inmutabilidad: update() y delete() deshabilitados

- [x] SaleRepository para POS_Sales
  - Método findByStore(storeId, filters)
  - Método findByDateRange(startDate, endDate)

- [x] SaleItemRepository para POS_SaleItems
  - Método findBySale(saleId)

- [x] **CreditPlanRepository para CRD_Plans** ✨ NUEVO
  - Método findByClient(clientId)
  - Método findBySale(saleId)

## 📊 Métricas

- **Líneas de código**: ~450 líneas
- **Métodos públicos**: 8 (CRUD + utilidades)
- **Métodos privados**: 3 (auxiliares)
- **Funciones de prueba**: 2
- **Cobertura de requisitos**: Requisito 4.1 ✅

## 🎉 Estado

**✅ TAREA 5 COMPLETADA**

La clase BaseRepository está lista para ser usada por todos los repositorios específicos del sistema. Proporciona una base sólida, eficiente y mantenible para el acceso a datos.


---

## 📦 CreditPlanRepository - Implementación Detallada

### Descripción

El `CreditPlanRepository` gestiona el acceso a la hoja `CRD_Plans` que almacena los planes de crédito asociados a ventas a crédito. Cada plan de crédito representa un esquema de pago en cuotas para una venta específica.

### Estructura de Datos (CRD_Plans)

```
| id | sale_id | client_id | total_amount | installments_count | installment_amount | status | created_at |
```

- **id**: Identificador único del plan de crédito
- **sale_id**: ID de la venta asociada (relación 1:1)
- **client_id**: ID del cliente que tiene el crédito
- **total_amount**: Monto total del crédito
- **installments_count**: Número de cuotas (1-6)
- **installment_amount**: Monto de cada cuota
- **status**: Estado del plan (ACTIVE, COMPLETED, CANCELLED)
- **created_at**: Fecha de creación del plan

### Métodos Implementados

#### 1. findByClient(clientId)

Busca todos los planes de crédito de un cliente específico.

**Características:**
- Filtra por `client_id`
- Ordena por fecha de creación (más recientes primero)
- Retorna array vacío si no hay planes o si clientId es null/undefined
- Útil para ver el historial crediticio del cliente

**Ejemplo de uso:**
```javascript
const creditPlanRepo = new CreditPlanRepository();
const clientPlans = creditPlanRepo.findByClient('client-123');

console.log('Cliente tiene ' + clientPlans.length + ' planes de crédito');
clientPlans.forEach(plan => {
  console.log('Plan: ' + plan.id + ', Estado: ' + plan.status);
});
```

**Casos de uso:**
- Mostrar historial de créditos en la vista de detalle del cliente
- Calcular el cupo usado del cliente (suma de planes ACTIVE)
- Analizar comportamiento crediticio del cliente

#### 2. findBySale(saleId)

Busca el plan de crédito asociado a una venta específica.

**Características:**
- Busca por `sale_id`
- Retorna un único objeto (relación 1:1 entre venta y plan)
- Retorna null si no existe plan o si saleId es null/undefined
- Útil para obtener detalles del crédito de una venta

**Ejemplo de uso:**
```javascript
const creditPlanRepo = new CreditPlanRepository();
const plan = creditPlanRepo.findBySale('sale-456');

if (plan) {
  console.log('Venta tiene plan de crédito:');
  console.log('- Cuotas: ' + plan.installments_count);
  console.log('- Monto por cuota: ' + plan.installment_amount);
  console.log('- Estado: ' + plan.status);
} else {
  console.log('Venta no tiene plan de crédito (venta al contado)');
}
```

**Casos de uso:**
- Verificar si una venta es a crédito
- Obtener detalles del plan al anular una venta a crédito
- Mostrar información de cuotas en el detalle de venta

### Validaciones y Manejo de Errores

**Validaciones de entrada:**
- `findByClient(null)` → retorna `[]` (array vacío)
- `findByClient('')` → retorna `[]` (array vacío)
- `findBySale(null)` → retorna `null`
- `findBySale('')` → retorna `null`

**Manejo de errores:**
- Todos los errores se registran en Logger
- Se lanzan excepciones con mensajes descriptivos
- Los errores incluyen el contexto (método y repositorio)

### Función de Prueba

#### testCreditPlanRepository()

Prueba exhaustiva del repositorio que valida:

1. **findAll()** - Obtiene todos los planes
2. **findByClient()** - Busca planes por cliente
   - Verifica que retorna array
   - Verifica ordenamiento (más recientes primero)
3. **findBySale()** - Busca plan por venta
   - Verifica que retorna objeto o null
4. **Valores nulos/vacíos** - Valida comportamiento con null
5. **IDs inexistentes** - Valida comportamiento con IDs que no existen

**Ejecutar prueba:**
```javascript
testCreditPlanRepository();
```

### Integración con Otros Componentes

**CreditService:**
```javascript
// Crear plan de crédito para una venta
const creditService = new CreditService();
const plan = creditService.createCreditPlan(saleId, 6); // 6 cuotas

// Obtener plan para aplicar pagos
const creditPlanRepo = new CreditPlanRepository();
const existingPlan = creditPlanRepo.findBySale(saleId);
```

**ClientService:**
```javascript
// Calcular cupo usado del cliente
const creditPlanRepo = new CreditPlanRepository();
const clientPlans = creditPlanRepo.findByClient(clientId);

let creditUsed = 0;
clientPlans.forEach(plan => {
  if (plan.status === 'ACTIVE') {
    creditUsed += Number(plan.total_amount);
  }
});
```

**POSService (anulación de ventas a crédito):**
```javascript
// Al anular venta, cancelar plan de crédito
const creditPlanRepo = new CreditPlanRepository();
const plan = creditPlanRepo.findBySale(saleId);

if (plan) {
  plan.status = 'CANCELLED';
  creditPlanRepo.update(plan.id, plan);
  // Restaurar cupo del cliente...
}
```

### Requisitos Validados

✅ **Requisito 7.3**: Creación de venta a crédito con plan y cuotas
- El repositorio permite almacenar y consultar planes de crédito

✅ **Requisito 7.4**: Invariante de suma de cuotas
- El repositorio almacena `installment_amount` para validación

✅ **Requisito 7.5**: Invariante de cupo de cliente
- `findByClient()` permite calcular cupo usado

✅ **Requisito 8.5**: Historial completo de cliente
- `findByClient()` proporciona historial de créditos

### Propiedades de Correctitud Relacionadas

**Propiedad 18: Invariante de Suma de Cuotas**
- El repositorio almacena los datos necesarios para validar que la suma de cuotas = total

**Propiedad 19: Invariante de Cupo de Cliente**
- `findByClient()` permite calcular el cupo usado sumando planes ACTIVE

**Propiedad 40: Reversión de Cupo en Anulaciones**
- `findBySale()` permite obtener el plan para cancelarlo al anular venta

### Rendimiento

**Optimizaciones:**
- Lectura batch de todos los planes (una sola llamada a Sheets)
- Filtrado en memoria (eficiente para volúmenes moderados)
- Ordenamiento en memoria (más rápido que ORDER BY en Sheets)

**Consideraciones:**
- Para volúmenes muy grandes (>10,000 planes), considerar caché
- El ordenamiento por fecha es O(n log n) pero n suele ser pequeño por cliente

### Estado

**✅ TAREA 35.1 COMPLETADA**

El `CreditPlanRepository` está implementado, probado y documentado. Proporciona acceso eficiente a los planes de crédito con métodos específicos para consultas por cliente y por venta.
