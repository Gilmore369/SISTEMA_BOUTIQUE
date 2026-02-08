# Estructura de Base de Datos - Adiction Boutique Suite

## 📋 Resumen

Este documento describe la estructura completa de la base de datos del sistema Adiction Boutique Suite implementada en Google Sheets.

**Archivo de configuración:** `gas/DatabaseSetup.gs`

## 🗂️ Hojas de la Base de Datos

### 1. Configuración (CFG_*)

#### CFG_Users
**Propósito:** Gestión de usuarios del sistema

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del usuario |
| email | String | Email del usuario (login) |
| name | String | Nombre completo |
| roles | JSON Array | Roles asignados ["Admin", "Vendedor", etc.] |
| stores | JSON Array | Tiendas asignadas ["Mujeres", "Hombres"] |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** 5 usuarios de ejemplo

#### CFG_Params
**Propósito:** Parámetros configurables del sistema

| Columna | Tipo | Descripción |
|---------|------|-------------|
| key | String | Clave del parámetro |
| value | String | Valor del parámetro |
| description | String | Descripción del parámetro |
| type | String | Tipo de dato (NUMBER, STRING, etc.) |

**Seed Data:** 5 parámetros predefinidos

### 2. Catálogo - Maestros (CAT_*)

#### CAT_Lines
**Propósito:** Líneas de productos (Dama, Caballero, Niños, etc.)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único de la línea |
| code | String | Código corto |
| name | String | Nombre de la línea |
| description | String | Descripción |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** 5 líneas (Dama, Caballero, Niños, Accesorios, Calzado)

#### CAT_Categories
**Propósito:** Categorías de productos dentro de cada línea

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único de la categoría |
| code | String | Código corto |
| name | String | Nombre de la categoría |
| line_id | String | ID de la línea padre |
| description | String | Descripción |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** 13 categorías distribuidas en las líneas

#### CAT_Brands
**Propósito:** Marcas de productos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único de la marca |
| code | String | Código corto |
| name | String | Nombre de la marca |
| description | String | Descripción |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** 5 marcas (Adiction, Zara, H&M, Forever 21, Mango)

#### CAT_Sizes
**Propósito:** Tallas disponibles

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único de la talla |
| code | String | Código corto (XS, S, M, L, etc.) |
| name | String | Nombre completo |
| category_id | String | ID de categoría (opcional) |
| sort_order | Number | Orden de visualización |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** 7 tallas (XS a XXL + Única)

#### CAT_Suppliers
**Propósito:** Proveedores de productos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del proveedor |
| code | String | Código corto |
| name | String | Nombre del proveedor |
| contact_name | String | Nombre del contacto |
| phone | String | Teléfono |
| email | String | Email |
| address | String | Dirección |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** 3 proveedores de ejemplo

### 3. Catálogo - Productos (CAT_Products)

#### CAT_Products
**Propósito:** Catálogo completo de productos

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del producto |
| barcode | String | Código de barras |
| name | String | Nombre del producto |
| description | String | Descripción detallada |
| line_id | String | ID de línea |
| category_id | String | ID de categoría |
| brand_id | String | ID de marca |
| supplier_id | String | ID de proveedor |
| size | String | Talla |
| color | String | Color |
| presentation | String | Presentación |
| purchase_price | Number | Precio de compra |
| price | Number | Precio de venta |
| min_stock | Number | Stock mínimo |
| entry_date | Date | Fecha de ingreso |
| barcode_url | String | URL del código de barras generado |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |
| updated_at | Date | Fecha de última actualización |

**Seed Data:** Ninguno (se llena con ingreso de productos)

### 4. Inventario (INV_*)

#### INV_Stock
**Propósito:** Stock actual por almacén

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del registro |
| warehouse_id | String | ID del almacén/tienda |
| product_id | String | ID del producto |
| quantity | Number | Cantidad disponible |
| last_updated | Date | Última actualización |

**Seed Data:** Ninguno

#### INV_Movements
**Propósito:** Movimientos de inventario

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del movimiento |
| warehouse_id | String | ID del almacén |
| product_id | String | ID del producto |
| type | String | Tipo (ENTRADA, SALIDA, AJUSTE, etc.) |
| quantity | Number | Cantidad (+ o -) |
| reference_id | String | ID de referencia (venta, compra, etc.) |
| user_id | String | ID del usuario que realizó el movimiento |
| reason | String | Motivo del movimiento |
| created_at | Date | Fecha del movimiento |

**Seed Data:** Ninguno

### 5. CRM (CRM_Clients)

#### CRM_Clients
**Propósito:** Gestión de clientes

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del cliente |
| dni | String | DNI del cliente |
| name | String | Nombre completo |
| phone | String | Teléfono |
| email | String | Email |
| address | String | Dirección |
| lat | Number | Latitud (geolocalización) |
| lng | Number | Longitud (geolocalización) |
| credit_limit | Number | Límite de crédito |
| credit_used | Number | Crédito utilizado |
| dni_photo_url | String | URL de foto del DNI |
| birthday | Date | Fecha de cumpleaños |
| active | Boolean | Estado activo/inactivo |
| created_at | Date | Fecha de creación |

**Seed Data:** Ninguno

### 6. Punto de Venta (POS_*)

#### POS_Sales
**Propósito:** Registro de ventas

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único de la venta |
| sale_number | String | Número de venta |
| store_id | String | ID de la tienda |
| client_id | String | ID del cliente |
| user_id | String | ID del vendedor |
| sale_type | String | Tipo (CONTADO, CREDITO) |
| subtotal | Number | Subtotal |
| discount | Number | Descuento aplicado |
| total | Number | Total de la venta |
| payment_status | String | Estado de pago |
| created_at | Date | Fecha de la venta |
| voided | Boolean | Venta anulada |
| void_reason | String | Motivo de anulación |
| void_user_id | String | Usuario que anuló |
| void_at | Date | Fecha de anulación |

**Seed Data:** Ninguno

#### POS_SaleItems
**Propósito:** Detalle de items de cada venta

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del item |
| sale_id | String | ID de la venta |
| product_id | String | ID del producto |
| quantity | Number | Cantidad vendida |
| unit_price | Number | Precio unitario |
| subtotal | Number | Subtotal del item |

**Seed Data:** Ninguno

### 7. Crédito y Cobranzas (CRD_*)

#### CRD_Plans
**Propósito:** Planes de crédito

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del plan |
| sale_id | String | ID de la venta |
| client_id | String | ID del cliente |
| total_amount | Number | Monto total |
| installments_count | Number | Número de cuotas |
| installment_amount | Number | Monto por cuota |
| status | String | Estado (ACTIVE, COMPLETED, CANCELLED) |
| created_at | Date | Fecha de creación |

**Seed Data:** Ninguno

#### CRD_Installments
**Propósito:** Cuotas de los planes de crédito

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único de la cuota |
| plan_id | String | ID del plan |
| installment_number | Number | Número de cuota |
| amount | Number | Monto de la cuota |
| due_date | Date | Fecha de vencimiento |
| paid_amount | Number | Monto pagado |
| status | String | Estado (PENDING, PARTIAL, PAID, OVERDUE) |
| paid_at | Date | Fecha de pago |

**Seed Data:** Ninguno

#### CRD_Payments
**Propósito:** Registro de pagos de clientes

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del pago |
| client_id | String | ID del cliente |
| amount | Number | Monto del pago |
| payment_date | Date | Fecha del pago |
| user_id | String | ID del cobrador |
| receipt_url | String | URL del recibo |
| created_at | Date | Fecha de registro |

**Seed Data:** Ninguno

### 8. Caja (CASH_*)

#### CASH_Shifts
**Propósito:** Turnos de caja

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del turno |
| store_id | String | ID de la tienda |
| user_id | String | ID del cajero |
| opening_amount | Number | Monto de apertura |
| opening_at | Date | Fecha/hora de apertura |
| closing_amount | Number | Monto de cierre |
| expected_amount | Number | Monto esperado |
| difference | Number | Diferencia (faltante/sobrante) |
| closing_at | Date | Fecha/hora de cierre |
| supervisor_id | String | ID del supervisor |

**Seed Data:** Ninguno

#### CASH_Expenses
**Propósito:** Egresos de caja

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del egreso |
| shift_id | String | ID del turno |
| amount | Number | Monto del egreso |
| concept | String | Concepto |
| category | String | Categoría |
| receipt_url | String | URL del comprobante |
| user_id | String | ID del usuario |
| authorized_by | String | ID del autorizador |
| created_at | Date | Fecha del egreso |

**Seed Data:** Ninguno

### 9. Auditoría (AUD_Log)

#### AUD_Log
**Propósito:** Log de auditoría de todas las operaciones

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | String | ID único del log |
| timestamp | Date | Fecha/hora del evento |
| user_id | String | ID del usuario |
| operation | String | Operación realizada |
| entity_type | String | Tipo de entidad |
| entity_id | String | ID de la entidad |
| old_values | JSON | Valores anteriores |
| new_values | JSON | Valores nuevos |
| ip_address | String | Dirección IP |

**Seed Data:** Ninguno

## 🔧 Funciones de Gestión

### Funciones Principales

```javascript
// Configuración completa desde cero (⚠️ BORRA DATOS EXISTENTES)
setupCompleteDatabase()

// Actualización segura sin borrar datos (✓ RECOMENDADO)
safeUpdateDatabase()

// Verificar estructura actual (solo lectura)
verifyDatabaseStructure()
```

### Funciones de Documentación

```javascript
// Obtener documentación completa de la estructura
getDatabaseDocumentation()

// Imprimir estructura en formato legible
printDatabaseStructure()

// Obtener estructura de una hoja específica
getSheetStructure('CFG_Users')

// Listar todas las hojas definidas
listAllSheets()

// Comparar base de datos actual con definición
compareDatabaseWithDefinition()
```

## 📊 Estadísticas

- **Total de hojas:** 19
- **Hojas con seed data:** 7
- **Hojas transaccionales:** 12
- **Total de columnas:** ~200

## 🚀 Uso Recomendado

### Primera Instalación
1. Ejecutar `setupCompleteDatabase()` para crear toda la estructura
2. Verificar con `verifyDatabaseStructure()`

### Actualización de Estructura Existente
1. Ejecutar `compareDatabaseWithDefinition()` para ver diferencias
2. Ejecutar `safeUpdateDatabase()` para aplicar cambios
3. Verificar con `verifyDatabaseStructure()`

### Consulta de Estructura
1. Ejecutar `printDatabaseStructure()` para ver toda la estructura
2. Ejecutar `getSheetStructure('NombreHoja')` para una hoja específica

## ⚠️ Notas Importantes

1. **Archivo único de configuración:** `gas/DatabaseSetup.gs` es la única fuente de verdad
2. **No modificar manualmente:** Siempre usar las funciones de setup para cambios estructurales
3. **Seed data:** Solo las hojas de configuración y catálogos maestros tienen datos de ejemplo
4. **Backup:** Siempre hacer backup antes de ejecutar `setupCompleteDatabase()`

## 📝 Mantenimiento

Para agregar una nueva hoja:
1. Editar `DATABASE_STRUCTURE` en `gas/DatabaseSetup.gs`
2. Agregar la definición con columnas, anchos y seed data
3. Ejecutar `safeUpdateDatabase()` para crear la hoja
4. Actualizar este documento

Para modificar una hoja existente:
1. Editar la definición en `DATABASE_STRUCTURE`
2. Ejecutar `safeUpdateDatabase()` para aplicar cambios
3. Actualizar este documento
