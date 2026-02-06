# 🚨 GUÍA DE REDESPLIEGUE URGENTE

## 🔴 PROBLEMA ACTUAL

- Dashboard muestra `null`
- Collections tiene timeout de `USER_DATA`
- Error: `Cannot read properties of null (reading 'error')`

---

## ✅ CAMBIOS APLICADOS

1. ✅ Mejor manejo de `null` en `loadDashboardData()`
2. ✅ `window.USER_DATA` definido como global
3. ✅ Funciones de Collections implementadas
4. ✅ Datos ficticios creados (50 ventas, 90 cuotas, etc.)

**Código subido con `clasp push`** ✅

---

## 🎯 PASOS PARA REDESPLEGAR

### 1. Crear Nueva Versión

1. Apps Script → **Implementar → Administrar implementaciones**
2. Click en **lápiz** (✏️) junto a la implementación activa
3. Nueva descripción: **`v1.6 - Fix null handling + USER_DATA global`**
4. Click **Implementar**
5. Esperar "Implementación actualizada"

### 2. Limpiar Caché del Navegador

**IMPORTANTE**: No solo recargar, sino limpiar caché:

1. Presiona **Ctrl + Shift + Delete**
2. Selecciona:
   - ✅ Imágenes y archivos en caché
   - ✅ Cookies y otros datos de sitios
3. Rango de tiempo: **Última hora**
4. Click **Borrar datos**

### 3. Recargar Aplicación

1. Cierra todas las pestañas de la aplicación
2. Abre nueva pestaña
3. Ve a la URL de tu aplicación
4. Presiona **Ctrl + F5** (recarga forzada)

---

## 🔍 VERIFICAR QUE FUNCIONE

Después de redesplegar, verifica:

### Dashboard:
- [ ] No muestra `null`
- [ ] Cards muestran S/ 0.00 (o valores reales si hay ventas de hoy)
- [ ] Stock Bajo muestra: 5
- [ ] Cuotas Vencidas muestra: 5
- [ ] Tabla "Últimas Ventas" muestra datos o "No hay datos disponibles"

### Collections:
- [ ] No muestra timeout de `USER_DATA`
- [ ] Tablas cargan (aunque sea vacías)
- [ ] Resumen muestra contadores

### Console (F12):
- [ ] No hay errores de `null`
- [ ] `window.USER_DATA` está definido
- [ ] `window.SCRIPT_URL` está definido

---

## 🐛 SI AÚN FALLA

### Opción 1: Ejecutar Test en Apps Script

```javascript
// En Apps Script, ejecutar:
Test_Dashboard()
```

Esto te dirá si `getDashboardData()` funciona correctamente.

### Opción 2: Ver Logs

1. Apps Script → **Ejecuciones**
2. Buscar ejecuciones de `getDashboardData`
3. Ver si hay errores en los logs

### Opción 3: Verificar Hojas

```javascript
// En Apps Script, ejecutar:
listAllSheetsWithData()
```

Verifica que las hojas tengan datos.

---

## 📊 DATOS ESPERADOS

Después del seed, deberías tener:

- **POS_Sales**: 50 filas
- **POS_SaleItems**: ~158 filas
- **CRD_Plans**: ~13 filas
- **CRD_Installments**: ~90 filas
- **CRD_Payments**: ~7 filas
- **INV_Movements**: 100 filas
- **INV_Stock**: 15 filas (con 5 productos con stock bajo)

---

## 🆘 ÚLTIMO RECURSO

Si nada funciona, ejecuta setup completo:

```javascript
// En Apps Script:
setupCompleteSystem()
```

Esto recrea todo desde cero con datos de ejemplo.

---

**¡Sigue los pasos en orden y debería funcionar!** 🚀
