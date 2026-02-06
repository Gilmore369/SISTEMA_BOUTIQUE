# CreditService - Servicio de Gestión de Crédito

## Descripción

El `CreditService` es el servicio encargado de gestionar los planes de crédito, cuotas y el cupo de crédito de los clientes en el sistema Adiction Boutique Suite.

## Características Implementadas

### ✅ Task 36: Implementar CreditService para gestión de crédito

- **Archivo creado**: `gas/CreditService.gs`
- **Requisitos implementados**: 7.3, 7.4, 7.5

#### Funcionalidades

1. **createCreditPlan(saleId, installments)**
   - Crea un plan de crédito asociado a una venta
   - Genera las cuotas correspondientes
   - Calcula el monto de cada cuota (total / installments)
   - Calcula las fechas de vencimiento de las cuotas (cada 30 días)
   - Decrementa el cupo disponible del cliente
   - Registra la operación en auditoría

## Uso

### Crear un Plan de Crédito

```javascript
// Crear instancia del servicio
const creditService = new CreditService();

// Crear plan de crédito con 3 cuotas
const result = creditService.createCreditPlan('sale-123', 3);

// Resultado contiene:
// - result.plan: Plan de crédito creado
// - result.installments: Array de cuotas creadas
// - result.client: Información actualizada del cliente
```

### Parámetros

- **saleId** (string, requerido): ID de la venta a la que se asocia el plan
- **installments** (number, requerido): Número de cuotas (1-6)

### Validaciones

El servicio valida:
- ✅ Parámetros requeridos (saleId, installments)
- ✅ Número de cuotas en rango válido (1-6)
- ✅ Venta existe y es de tipo CREDITO
- ✅ Venta tiene cliente asociado
- ✅ Cliente existe y está activo
- ✅ Monto total de la venta es mayor a cero

### Cálculos

#### Monto de Cuotas

El monto de cada cuota se calcula dividiendo el total entre el número de cuotas:

```
monto_cuota = total / installments
```

Para la última cuota, se ajusta el monto para que la suma total sea exacta:

```
ultima_cuota = total - suma_cuotas_anteriores
```

Todos los montos se redondean a 2 decimales.

#### Fechas de Vencimiento

Las fechas de vencimiento se calculan sumando 30 días por cada cuota:

- Cuota 1: hoy + 30 días
- Cuota 2: hoy + 60 días
- Cuota 3: hoy + 90 días
- etc.

#### Actualización de Cupo

El cupo usado del cliente se incrementa por el monto total de la venta:

```
nuevo_cupo_usado = cupo_usado_actual + total_venta
```

## Estructura de Datos

### Plan de Crédito (CRD_Plans)

```javascript
{
  id: 'plan-1234567890-abc123',
  sale_id: 'sale-123',
  client_id: 'client-456',
  total_amount: 1000.00,
  installments_count: 3,
  installment_amount: 333.33,
  status: 'ACTIVE',
  created_at: Date
}
```

### Cuota (CRD_Installments)

```javascript
{
  id: 'inst-1234567890-1-abc123',
  plan_id: 'plan-1234567890-abc123',
  installment_number: 1,
  amount: 333.33,
  due_date: Date,
  paid_amount: 0,
  status: 'PENDING',
  paid_at: null
}
```

## Estados

### Estados de Plan de Crédito

- **ACTIVE**: Plan activo con cuotas pendientes
- **COMPLETED**: Todas las cuotas pagadas
- **CANCELLED**: Plan cancelado (por anulación de venta)

### Estados de Cuota

- **PENDING**: Cuota pendiente de pago
- **PARTIAL**: Cuota parcialmente pagada
- **PAID**: Cuota completamente pagada
- **OVERDUE**: Cuota vencida (calculado dinámicamente)

## Auditoría

Cada creación de plan de crédito se registra en el log de auditoría (AUD_Log) con:

- Operación: `CREATE_CREDIT_PLAN`
- Tipo de entidad: `CREDIT_PLAN`
- ID de entidad: ID del plan creado
- Valores nuevos: Datos del plan, cuotas y actualización de cupo
- Usuario: Usuario que realizó la venta

## Testing

### Ejecutar Tests

Para probar el servicio, ejecutar desde el editor de Apps Script:

```javascript
// Test completo
testCreditServiceComplete();

// Test rápido
quickTestCreditService();
```

### Tests Incluidos

1. **Test 1**: Crear plan de crédito con 3 cuotas
   - Verifica creación del plan
   - Verifica número de cuotas
   - Verifica suma de montos
   - Verifica actualización de cupo

2. **Test 2**: Validación de parámetros
   - saleId nulo
   - installments nulo
   - installments = 0
   - installments fuera de rango (7)
   - saleId inexistente

3. **Test 3**: Verificar persistencia en base de datos
   - Plan guardado correctamente
   - Cuotas guardadas correctamente

4. **Test 4**: Verificar actualización de cliente
   - Cupo usado actualizado en base de datos

## Dependencias

El servicio utiliza los siguientes repositorios:

- **CreditPlanRepository**: Gestión de planes de crédito
- **InstallmentRepository**: Gestión de cuotas
- **ClientRepository**: Gestión de clientes
- **SaleRepository**: Gestión de ventas
- **AuditRepository**: Registro de auditoría

## Propiedades de Correctitud Validadas

### Propiedad 18: Invariante de Suma de Cuotas

*Para cualquier* plan de crédito, la suma de los montos de todas las cuotas debe ser igual al monto total de la venta.

**Validación**: El servicio ajusta la última cuota para garantizar que la suma sea exacta.

### Propiedad 19: Invariante de Cupo de Cliente

*Para cualquier* venta a crédito confirmada, el cupo usado del cliente después de la venta debe ser igual al cupo usado antes de la venta más el monto total de la venta.

**Validación**: El servicio incrementa el cupo usado del cliente por el monto exacto de la venta.

## Requisitos Implementados

### Requisito 7.3: Creación de Plan de Crédito

✅ WHEN se confirma una venta a crédito, THE Sistema SHALL crear la venta, el plan de crédito y las cuotas correspondientes

### Requisito 7.4: Cálculo de Monto de Cuotas

✅ THE Sistema SHALL calcular el monto de cada cuota dividiendo el total entre el número de cuotas

### Requisito 7.5: Decremento de Cupo

✅ THE Sistema SHALL decrementar el cupo disponible del cliente por el monto total de la venta

## Notas de Implementación

### Precisión Decimal

Todos los cálculos monetarios se redondean a 2 decimales usando:

```javascript
Math.round(amount * 100) / 100
```

Esto evita problemas de precisión de punto flotante en JavaScript.

### Ajuste de Última Cuota

Para garantizar que la suma de cuotas sea exactamente igual al total, la última cuota se calcula como:

```javascript
ultima_cuota = total - suma_cuotas_anteriores
```

Esto compensa cualquier diferencia por redondeo.

### Fechas de Vencimiento

Las fechas se calculan usando el método `setDate()` de JavaScript, que maneja automáticamente los cambios de mes:

```javascript
const dueDate = new Date(today);
dueDate.setDate(dueDate.getDate() + (30 * i));
```

## Próximos Pasos

Las siguientes funcionalidades se implementarán en tareas posteriores:

- [ ] Task 37: Property tests para planes de crédito
- [ ] Task 38: Extender POSService para ventas a crédito
- [ ] Task 39: Implementar registro de pagos con aplicación a cuotas
- [ ] Task 40: Property tests para pagos
- [ ] Task 41: Implementar generación de recibos de pago

## Archivos Relacionados

- `gas/CreditService.gs`: Implementación del servicio
- `gas/Test_CreditService.gs`: Tests unitarios
- `gas/Repo.gs`: Repositorios (CreditPlanRepository, InstallmentRepository)
- `gas/Const.gs`: Constantes y estados
- `.kiro/specs/adiction-boutique-suite/requirements.md`: Requisitos
- `.kiro/specs/adiction-boutique-suite/design.md`: Diseño
- `.kiro/specs/adiction-boutique-suite/tasks.md`: Plan de tareas
