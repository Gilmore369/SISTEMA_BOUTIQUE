# 🔧 GUÍA RÁPIDA: Limpiar y Corregir Base de Datos

## 🎯 PROBLEMA IDENTIFICADO

El CSV muestra que la hoja `CRD_Installments` tiene:
- ❌ Columnas vacías en posiciones 3 y 4
- ❌ Headers incorrectos
- ❌ Datos en posiciones incorrectas

**Headers actuales (incorrectos)**:
```
id, plan_id, installment_number, amount, due_date, paid_amount, status, paid_at, , , ,
```

**Headers correctos (según Const.gs)**:
```
id, plan_id, client_id, client_name, installment_number, amount, paid_amount, balance, due_date, status, paid_date, created_at
```

---

## ✅ SOLUCIÓN: Script de Corrección Automática

He creado `FixDatabaseStructure.gs` que:
1. ✅ Verifica la estructura de TODAS las hojas
2. ✅ Corrige headers incorrectos
3. ✅ Migra datos existentes a la nueva estructura
4. ✅ Crea hojas faltantes
5. ✅ Aplica formato correcto

---

## 🚀 EJECUTAR EN 3 PASOS

### PASO 1: Verificar Estructura Actual

```javascript
verifyDatabaseStructure()
```

Esto te mostrará qué hojas tienen problemas.

---

### PASO 2: Corregir Toda la Estructura

```javascript
fixAllDatabaseStructure()
```

Esto:
- Corrige headers de todas las hojas
- Migra datos existentes
- Crea hojas faltantes
- Aplica formato

---

### PASO 3: Llenar con Datos Ficticios

```javascript
seedAllDataComplete()
```

Esto llena las hojas con datos de prueba.

---

## 📊 QUÉ HACE EL SCRIPT

### Para cada hoja:

1. **Si no existe**: La crea con headers correctos
2. **Si existe pero headers incorrectos**: 
   - Lee datos existentes
   - Crea mapeo de columnas antiguas → nuevas
   - Migra datos a nueva estructura
   - Aplica formato
3. **Si existe con headers correctos**: Solo aplica formato

### Hojas que corrige:

- ✅ CFG_Users
- ✅ CFG_Params
- ✅ CAT_Products
- ✅ INV_Stock
- ✅ INV_Movements
- ✅ CRM_Clients
- ✅ POS_Sales
- ✅ POS_SaleItems
- ✅ CRD_Plans
- ✅ CRD_Installments ← **Esta tiene problemas**
- ✅ CRD_Payments
- ✅ CASH_Shifts
- ✅ CASH_Expenses
- ✅ AUD_Log

---

## 🔍 EJEMPLO: CRD_Installments

**Antes (incorrecto)**:
```
id | plan_id | installment_number | amount | due_date | paid_amount | status | paid_at | | | |
```

**Después (correcto)**:
```
id | plan_id | client_id | client_name | installment_number | amount | paid_amount | balance | due_date | status | paid_date | created_at
```

**Migración de datos**:
- `id` → `id` (columna 1 → 1)
- `plan_id` → `plan_id` (columna 2 → 2)
- `installment_number` → `installment_number` (columna 3 → 5)
- `amount` → `amount` (columna 4 → 6)
- `paid_amount` → `paid_amount` (columna 6 → 7)
- `due_date` → `due_date` (columna 5 → 9)
- `status` → `status` (columna 7 → 10)
- `paid_at` → `paid_date` (columna 8 → 11)

Columnas nuevas (`client_id`, `client_name`, `balance`, `created_at`) se llenan vacías.

---

## ⚠️ IMPORTANTE

1. **Backup**: El script migra datos automáticamente, pero es buena idea hacer backup del Google Sheet antes
2. **Datos perdidos**: Si una columna antigua no tiene equivalente en la nueva estructura, se perderá
3. **Columnas nuevas**: Se crean vacías, puedes llenarlas después con `seedAllDataComplete()`

---

## 📝 DESPUÉS DE CORREGIR

1. **Verificar**: Ejecuta `verifyDatabaseStructure()` de nuevo
2. **Llenar datos**: Ejecuta `seedAllDataComplete()`
3. **Nueva versión**: Implementar → Nueva versión
4. **Recargar**: Ctrl + F5 en la app

---

## 🆘 SI ALGO SALE MAL

### Opción 1: Restaurar desde backup
Si hiciste backup, restaura el Google Sheet

### Opción 2: Recrear desde cero
```javascript
// 1. Borrar todas las hojas manualmente
// 2. Ejecutar:
setupCompleteSystem()
```

Esto crea todo desde cero con la estructura correcta.

---

**Código ya subido con `clasp push`** ✅

**Ejecuta los 3 pasos en orden y tu base de datos estará correcta!** 🚀
