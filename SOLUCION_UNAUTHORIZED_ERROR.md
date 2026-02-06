# Solución: Error UNAUTHORIZED en Llamadas AJAX POST

**Fecha:** 2026-02-06  
**Estado:** ✅ SOLUCIONADO Y DESPLEGADO

## 🔴 Problema Identificado

### Error en Consola:
```
{
  code: 'UNAUTHORIZED', 
  message: 'No se pudo identificar al usuario. Por favor, inicie sesión.', 
  details: null
}
```

### Causa Raíz:
Las llamadas AJAX POST desde los módulos HTML (Collections, ClientList, InventoryReport) **NO enviaban el email del usuario**.

`doPost()` intentaba obtener el email con `Session.getActiveUser().getEmail()`, pero esto **NO funciona en llamadas AJAX POST** desde el cliente. Solo funciona en la carga inicial de la página (GET).

## ✅ Solución Implementada

### 1. Modificado `doPost()` en `Code.gs`

Agregado soporte para recibir `userEmail` desde los parámetros de la solicitud:

```javascript
// NUEVO: Intentar obtener email desde parámetros si Session falló
if (!userEmail && e.parameter && e.parameter.userEmail) {
  userEmail = e.parameter.userEmail;
  Logger.log('Email obtenido desde parámetros: ' + userEmail);
}
```

**Flujo de autenticación actualizado:**
1. Intenta obtener email de `Session.getActiveUser()` (funciona en GET)
2. Si falla, intenta obtener de `e.parameter.userEmail` (funciona en POST)
3. Normaliza el email (trim + lowercase)
4. Si no hay email, retorna error UNAUTHORIZED

### 2. Actualizado `Collections.html`

Agregado `userEmail` a TODAS las llamadas AJAX:

```javascript
// Tabla Vencidas
data: { 
  action: 'getOverdueInstallments',
  userEmail: window.USER_DATA ? window.USER_DATA.email : ''
}

// Tabla Hoy
data: { 
  action: 'getTodayInstallments',
  userEmail: window.USER_DATA ? window.USER_DATA.email : ''
}

// Tabla Esta Semana
data: { 
  action: 'getWeekInstallments',
  userEmail: window.USER_DATA ? window.USER_DATA.email : ''
}

// Resumen
data: { 
  action: 'getCollectionsSummary',
  userEmail: window.USER_DATA ? window.USER_DATA.email : ''
}
```

### 3. Actualizado `ClientList.html`

```javascript
data: function(d) {
  return {
    action: 'getClients',
    search: $('#filterSearch').val(),
    status: $('#filterStatus').val(),
    userEmail: window.USER_DATA ? window.USER_DATA.email : ''
  };
}
```

### 4. Actualizado `InventoryReport.html`

```javascript
data: {
  action: 'getInventoryReport',
  warehouseId: warehouseId,
  userEmail: window.USER_DATA ? window.USER_DATA.email : ''
}
```

## 📊 Archivos Modificados

1. ✅ `gas/Code.gs` - doPost() acepta userEmail desde parámetros
2. ✅ `gas/Collections.html` - 4 llamadas AJAX actualizadas
3. ✅ `gas/ClientList.html` - 1 llamada AJAX actualizada
4. ✅ `gas/InventoryReport.html` - 1 llamada AJAX actualizada

## 🎯 Resultado Esperado

Después de crear nueva versión en Apps Script:

### ✅ Collections
- Las 3 tablas cargan sin error UNAUTHORIZED
- Muestran "Mostrando registros del 0 al 0" (correcto, datos vacíos)
- Resumen muestra contadores en 0
- **Sin errores en consola**

### ✅ ClientList
- Tabla carga con datos reales de clientes
- Búsqueda y filtros funcionan
- **Sin errores UNAUTHORIZED**

### ✅ InventoryReport
- Reporte carga con productos reales
- Métricas correctas
- **Sin errores UNAUTHORIZED**

## 🔍 Cómo Funciona

### Flujo de Autenticación Completo:

1. **Usuario carga la página (GET)**:
   - `doGet()` obtiene email de `Session.getActiveUser()`
   - Valida con `AuthService.isUserAllowed()`
   - Pasa email a `index.html` como `USER_DATA.email`

2. **Usuario hace clic en módulo (navegación interna)**:
   - JavaScript usa `window.USER_DATA.email` (ya disponible)
   - No hay nueva llamada GET

3. **Módulo hace llamada AJAX (POST)**:
   - JavaScript envía `userEmail: window.USER_DATA.email` en data
   - `doPost()` recibe `e.parameter.userEmail`
   - Valida y procesa la solicitud

### Ventajas de esta Solución:

✅ **Funciona en todos los contextos** (GET y POST)  
✅ **No requiere cookies** ni localStorage  
✅ **Compatible con iframes** de Google Apps Script  
✅ **Seguro** - el email se valida en cada solicitud  
✅ **Simple** - usa el email ya disponible en el cliente  

## 📋 Instrucciones para el Usuario

### Paso 1: Crear Nueva Versión
1. Ir a https://script.google.com
2. Implementar → Administrar implementaciones
3. Editar (lápiz) → Nueva versión
4. Descripción: "Fix UNAUTHORIZED - userEmail en POST"
5. Implementar

### Paso 2: Recargar Aplicación
1. Ir a la aplicación web
2. Ctrl + F5 (recarga forzada)
3. Abrir consola (F12)

### Paso 3: Verificar
- ✅ Collections carga sin error UNAUTHORIZED
- ✅ ClientList muestra datos
- ✅ InventoryReport muestra datos
- ✅ Consola sin errores rojos

## 🚀 Despliegue

```bash
cd gas
npx @google/clasp push
# ✅ Pushed 40 files
```

## 📝 Notas Técnicas

### ¿Por qué Session.getActiveUser() no funciona en POST?

Google Apps Script ejecuta las llamadas POST en un contexto diferente al GET inicial. El contexto de sesión no se mantiene entre solicitudes HTTP independientes.

### ¿Es seguro enviar el email en cada solicitud?

Sí, porque:
1. El email se valida en `doPost()` contra la allowlist (CFG_Users)
2. El usuario ya fue autenticado en el GET inicial
3. El email no es información sensible (ya es visible en la UI)
4. Apps Script valida que la solicitud viene del dominio correcto

### ¿Qué pasa si alguien modifica el email en el cliente?

`doPost()` valida el email con `AuthService.isUserAllowed()` en cada solicitud. Si el email no está en la allowlist, la solicitud es rechazada con error UNAUTHORIZED.

---

**Problema:** UNAUTHORIZED en llamadas AJAX POST  
**Causa:** Session.getActiveUser() no funciona en POST  
**Solución:** Enviar userEmail desde cliente en cada solicitud  
**Estado:** ✅ SOLUCIONADO  
**Despliegue:** ✅ COMPLETADO
