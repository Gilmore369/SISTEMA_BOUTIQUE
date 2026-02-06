# 📊 INSTRUCCIONES: Llenar Datos Ficticios

## ✅ CÓDIGO ACTUALIZADO Y SUBIDO (v3 - FINAL)

El código ha sido corregido y subido con `clasp push`.

**Correcciones aplicadas:**
- ✅ Uso correcto de `getActiveSpreadsheet()`
- ✅ Uso correcto de clases `ClientRepository` y `ProductRepository`
- ✅ Nombres de hojas corregidos: `POS_Sales`, `CRD_Plans`, `CRD_Installments`, `CRD_Payments`
- ✅ InventoryReport con `waitForGlobals` para evitar errores de variables globales

---

## 🎯 PASOS A SEGUIR (EN ORDEN)

### PASO 1: Crear las Hojas Faltantes

1. Ve al **Editor de Apps Script** (script.google.com)
2. En la barra superior, selecciona la función: **`createAllMissingSheets`**
3. Haz clic en **Ejecutar** (▶️)
4. Espera a que termine (verás "Ejecución completada")
5. Revisa el **Registro de ejecución** (debe decir cuántas hojas creó)

**Hojas que se crearán:**
- ✅ POS_Sales (ventas del punto de venta)
- ✅ POS_SaleItems (items de cada venta)
- ✅ CRD_Plans (planes de crédito)
- ✅ CRD_Installments (cuotas de crédito)
- ✅ CRD_Payments (pagos registrados)

---

### PASO 2: Llenar con Datos Ficticios

1. En la barra superior, selecciona la función: **`seedAllDataComplete`**
2. Haz clic en **Ejecutar** (▶️)
3. Espera a que termine (puede tardar 10-20 segundos)
4. Revisa el **Registro de ejecución**

**Datos que se crearán:**
- 📦 50 ventas (últimos 30 días)
- 💳 Planes de crédito para ventas a crédito
- 📅 Cuotas (vencidas, de hoy, de la semana)
- 💰 Pagos para cuotas pagadas
- 📊 100 movimientos de inventario
- ⚠️ Stock actualizado (30% con stock bajo)

---

### PASO 3: Crear Nueva Versión

1. En el Editor de Apps Script, ve a: **Implementar → Administrar implementaciones**
2. Haz clic en el ícono de **lápiz** (✏️) junto a la implementación activa
3. En "Nueva descripción", escribe: **"v1.4 - Datos ficticios agregados"**
4. Haz clic en **Implementar**
5. Espera a que diga "Implementación actualizada"

---

### PASO 4: Recargar la Aplicación

1. Ve a tu aplicación web (la URL que usas normalmente)
2. Presiona **Ctrl + F5** (recarga forzada)
3. Inicia sesión si es necesario

---

## 🎉 RESULTADO ESPERADO

Después de seguir estos pasos, deberías ver:

### Dashboard:
- ✅ Ventas del día/mes con números reales
- ✅ Stock bajo con productos reales
- ✅ Cuotas vencidas con números reales
- ✅ Gráficos con datos reales

### Módulo de Cobranzas:
- ✅ Cuotas vencidas (tabla llena)
- ✅ Cuotas de hoy (tabla llena)
- ✅ Cuotas de la semana (tabla llena)
- ✅ Resumen con contadores reales

### Reportes:
- ✅ Reporte de inventario con movimientos
- ✅ Reporte de ventas con datos
- ✅ Reporte de cuentas por cobrar con cuotas

---

## ⚠️ SI ALGO FALLA

### Error: "Cannot read properties of null"
- **Causa**: Las hojas no existen
- **Solución**: Ejecuta `createAllMissingSheets` primero

### Error: "SPREADSHEET_ID is not defined"
- **Causa**: Falta el archivo Const.gs
- **Solución**: Ya está corregido, solo ejecuta `clasp push` de nuevo

### Error: "getSpreadsheet is not defined"
- **Causa**: Falta el archivo Const.gs
- **Solución**: Ya está corregido en el código subido

### No veo los datos en la aplicación
- **Causa**: No creaste nueva versión
- **Solución**: Sigue el PASO 3 (crear nueva versión)

---

## 📝 NOTAS IMPORTANTES

1. **Los datos son ficticios** - Puedes borrarlos y volver a crearlos cuando quieras
2. **Para limpiar y volver a llenar**: Ejecuta `seedAllDataComplete` de nuevo (limpia automáticamente)
3. **Para ver qué hojas tienes**: Ejecuta `listAllSheets` en el editor
4. **Los datos se crean en tu Google Sheet** - Puedes verlos directamente en las hojas

---

## 🚀 DESPUÉS DE LLENAR LOS DATOS

Prueba todas las funcionalidades:

1. ✅ Dashboard - Ver métricas y gráficos
2. ✅ Cobranzas - Ver cuotas y registrar pagos
3. ✅ Clientes - Ver lista de clientes
4. ✅ Productos - Ver inventario
5. ✅ Reportes - Generar reportes con datos reales
6. ✅ POS - Crear nuevas ventas

---

**¿Listo? Ejecuta los pasos en orden y disfruta tu sistema con datos reales! 🎉**
