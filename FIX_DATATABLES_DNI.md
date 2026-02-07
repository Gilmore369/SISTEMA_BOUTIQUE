# ✅ FIX: DataTables client_dni Error

**Problema**: `DataTables warning: Requested unknown parameter 'client_dni'`  
**Estado**: ✅ CORREGIDO Y DESPLEGADO

---

## 🐛 EL PROBLEMA

**Error en consola**:
```
DataTables warning: table id=weekTable - Requested unknown parameter 'client_dni' for row 0, column 1
```

**Causa**: Las tablas de Collections esperaban una columna `client_dni` pero los datos retornados por el servidor NO incluyen ese campo.

---

## ✅ LA SOLUCIÓN

Eliminé la columna `DNI` de las 3 tablas de Collections:

1. **Tabla de Cuotas Vencidas** (overdueTable)
2. **Tabla de Vencen Hoy** (todayTable)  
3. **Tabla de Vencen Esta Semana** (weekTable)

También actualicé el modal de pago para mostrar el Plan ID en lugar del DNI.

---

## 📦 DESPLEGADO

✅ Código corregido en `gas/Collections.html`  
✅ Desplegado con `npx @google/clasp push`  

---

## ⚠️ ACCIÓN REQUERIDA (2 MINUTOS)

### 1. Crear Nueva Versión v1.8.2

1. Ve a: https://script.google.com/home
2. Abre: "Adiction Boutique Suite"
3. **Implementar** → **Administrar implementaciones**
4. Clic en **lápiz** (editar)
5. Nueva descripción:
   ```
   v1.8.2 - Fix Collections DataTables client_dni error
   ```
6. **Implementar**

### 2. Limpiar Caché

1. `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Seleccionar **"Imágenes y archivos en caché"**
3. Rango: **"Última hora"**
4. **Borrar datos**
5. Cerrar TODAS las pestañas
6. Cerrar el navegador

### 3. Probar Collections

1. Abrir navegador en **modo incógnito**
2. Ir a la aplicación
3. Clic en **"Cobranzas"**
4. Verificar que las tablas cargan sin errores
5. Abrir consola (F12) y verificar que NO hay error de DataTables

---

## 🎯 RESULTADO ESPERADO

### Antes (ERROR):
```
DataTables warning: Requested unknown parameter 'client_dni' ❌
Tablas no cargan datos
```

### Después (CORRECTO):
```
✅ Sin errores de DataTables
✅ Tablas muestran: Cliente, Plan, Cuota, Monto, Pagado, Saldo, Vencimiento
✅ Modal de pago muestra: Cliente y Plan (sin DNI)
```

### Estructura de Tablas:

**Cuotas Vencidas**:
| Cliente | Plan | Cuota | Monto | Pagado | Saldo | Vencimiento | Días Vencido | Acciones |
|---------|------|-------|-------|--------|-------|-------------|--------------|----------|

**Vencen Hoy**:
| Cliente | Plan | Cuota | Monto | Pagado | Saldo | Vencimiento | Acciones |
|---------|------|-------|-------|--------|-------|-------------|----------|

**Vencen Esta Semana**:
| Cliente | Plan | Cuota | Monto | Pagado | Saldo | Vencimiento | Días Restantes | Acciones |
|---------|------|-------|-------|--------|-------|-------------|----------------|----------|

---

## 🧪 VERIFICACIÓN

### En Consola del Navegador (F12):

**NO debe aparecer**:
```
DataTables warning: Requested unknown parameter 'client_dni' ❌
```

**Debe aparecer**:
```javascript
✓ Variables globales disponibles para Collections
Respuesta overdue: {success: true, data: [...]}
Respuesta today: {success: true, data: [...]}
Respuesta week: {success: true, data: [...]}
Respuesta summary: {success: true, data: {overdue: {...}, today: {...}, week: {...}}}
```

---

## 📝 NOTA SOBRE DATOS

Si las tablas muestran "Ningún dato disponible", es porque **no hay cuotas en la base de datos**.

Para llenar con datos de prueba:

1. Abre Apps Script Editor
2. Ejecuta: `seedAllDataComplete()` (en archivo `SeedDataCompleto.gs`)
3. Espera 10-15 segundos
4. Recarga la aplicación

Esto creará:
- 90 cuotas (5 vencidas, 2 de hoy, 1 de la semana)
- 13 planes de crédito
- 50 ventas
- Y más datos de prueba

---

## ✅ CHECKLIST

- [ ] Nueva versión v1.8.2 creada
- [ ] Caché limpiado
- [ ] Navegador cerrado y reabierto
- [ ] Collections abierto en modo incógnito
- [ ] No hay error de DataTables en consola
- [ ] Tablas cargan correctamente (aunque estén vacías)
- [ ] (Opcional) Seed ejecutado para llenar datos

---

**¡Listo! Collections debe funcionar sin errores de DataTables. 🚀**

**IMPORTANTE**: No olvides crear la versión v1.8.2 y limpiar caché.
