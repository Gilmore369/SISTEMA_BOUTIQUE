# Solución de Errores en Collections y Sistema Global

**Fecha:** 2026-02-06  
**Estado:** ✅ COMPLETADO Y DESPLEGADO

## Problemas Identificados

### 1. ❌ Error: `Identifier 'SCRIPT_URL' has already been declared`

**Causa:** 
- En `index.html` línea 353 se declaraba `const SCRIPT_URL = window.SCRIPT_URL;`
- Luego `Collections.html` intentaba declarar `var SCRIPT_URL` nuevamente
- JavaScript no permite redeclarar variables en el mismo scope

**Solución:**
- ✅ Eliminada la línea `const SCRIPT_URL = window.SCRIPT_URL;` de `index.html`
- ✅ Solo se mantiene `window.SCRIPT_URL = '<?= scriptUrl ?>';` (global)
- ✅ Todos los módulos ahora usan `window.SCRIPT_URL` directamente
- ✅ Actualizado `index.html` para usar `window.SCRIPT_URL` en `navigateTo()`

### 2. ❌ Error: `jQuery no está disponible para Collections`

**Causa:**
- El script de `Collections.html` se ejecutaba antes de que jQuery estuviera completamente cargado
- La verificación `typeof SCRIPT_URL` causaba error de referencia

**Solución:**
- ✅ Cambiada verificación a `typeof window.SCRIPT_URL` (no causa error)
- ✅ Agregado check de jQuery: `typeof jQuery === 'undefined'`
- ✅ Todo el código de inicialización está dentro de `$(document).ready()`

### 3. ❌ Error: `Unexpected token '<', "<!doctype "... is not valid JSON`

**Causa:**
- Las llamadas AJAX a `getOverdueInstallments`, `getTodayInstallments`, `getWeekInstallments` retornaban HTML en lugar de JSON
- Estas funciones NO EXISTÍAN en el servidor
- El servidor retornaba una página de error HTML

**Solución:**
- ✅ Implementadas funciones stub en `handleCreditAction()` en `Code.gs`:
  - `getOverdueInstallments` → retorna `[]`
  - `getTodayInstallments` → retorna `[]`
  - `getWeekInstallments` → retorna `[]`
  - `getCollectionsSummary` → retorna objeto con contadores en 0
  - `getClientPendingInstallments` → retorna `[]`
  - `registerPayment` → lanza error descriptivo (pendiente implementación)
  - `generateReceipt` → lanza error descriptivo (pendiente implementación)

- ✅ Actualizado `routePost()` para reconocer estas acciones:
```javascript
else if (action.startsWith('payment/') || action.startsWith('installment/') ||
         action === 'getOverdueInstallments' || action === 'getTodayInstallments' ||
         action === 'getWeekInstallments' || action === 'getCollectionsSummary' ||
         action === 'getClientPendingInstallments' || action === 'registerPayment' ||
         action === 'generateReceipt') {
  result = handleCreditAction(action, payload, userEmail, requestId);
}
```

## Archivos Modificados

### 1. `gas/index.html`
- ❌ Eliminado: `const SCRIPT_URL = window.SCRIPT_URL;`
- ✅ Cambiado: `let newUrl = SCRIPT_URL + '?page='` → `let newUrl = window.SCRIPT_URL + '?page='`

### 2. `gas/Collections.html`
- ✅ Cambiado: `typeof SCRIPT_URL` → `typeof window.SCRIPT_URL`
- ✅ Agregado: Check de jQuery disponible
- ✅ Cambiado: Todas las referencias `url: SCRIPT_URL` → `url: window.SCRIPT_URL`

### 3. `gas/ClientList.html`
- ✅ Cambiado: `typeof SCRIPT_URL` → `typeof window.SCRIPT_URL`
- ✅ Cambiado: `url: SCRIPT_URL` → `url: window.SCRIPT_URL`
- ✅ Cambiado: `window.location.href = SCRIPT_URL` → `window.location.href = window.SCRIPT_URL`

### 4. `gas/InventoryReport.html`
- ✅ Cambiado: `typeof SCRIPT_URL` → `typeof window.SCRIPT_URL`
- ✅ Cambiado: `url: SCRIPT_URL` → `url: window.SCRIPT_URL`

### 5. `gas/Code.gs`
- ✅ Agregado: Implementación completa de `handleCreditAction()` con stubs
- ✅ Actualizado: `routePost()` para reconocer acciones de Collections

## Resultado Esperado

Después de crear una nueva versión en Apps Script:

### ✅ Collections debe mostrar:
- 3 tablas vacías (Vencidas, Hoy, Esta Semana) con mensaje "Mostrando registros del 0 al 0"
- Métricas en 0 (Cuotas Vencidas: 0, Vencen Hoy: 0, Vencen Esta Semana: 0)
- Sin errores en consola de JavaScript
- Sin errores de AJAX

### ✅ ClientList debe mostrar:
- Tabla con clientes reales de la base de datos
- Filtros funcionando correctamente
- Sin errores de redeclaración de SCRIPT_URL

### ✅ InventoryReport debe mostrar:
- Reporte de inventario con productos reales
- Métricas correctas (Total Productos, Valor Total, Stock Bajo)
- Sin errores de AJAX

## Próximos Pasos (Milestone Futuro)

Las siguientes funcionalidades están pendientes de implementación:

1. **InstallmentRepository** - Para gestionar cuotas de crédito
2. **PaymentRepository** - Para registrar pagos
3. **CreditService.registerPayment()** - Lógica de negocio para pagos
4. **Generación de recibos** - PDF o HTML de recibos de pago
5. **Filtros de fecha** - Para cuotas vencidas, hoy, semana

Por ahora, Collections mostrará tablas vacías pero **sin errores**, lo cual es el comportamiento correcto para un módulo en desarrollo.

## Comandos Ejecutados

```bash
# Despliegue exitoso
cd gas
npx @google/clasp push
# ✅ Pushed 40 files
```

## Instrucciones para el Usuario

1. **Ir al Editor de Apps Script** (script.google.com)
2. **Crear nueva versión**:
   - Clic en "Implementar" → "Administrar implementaciones"
   - Clic en el ícono de lápiz (editar) en la implementación activa
   - Seleccionar "Nueva versión"
   - Descripción: "Fix SCRIPT_URL redeclaration y Collections stubs"
   - Guardar
3. **Recargar la aplicación** en el navegador
4. **Verificar**:
   - Dashboard carga sin errores ✅
   - Clientes carga con datos ✅
   - Inventario carga con datos ✅
   - Collections carga con tablas vacías (sin errores) ✅

---

**Nota:** Este fix es parte de TASK 8 (Re-engineering Communication and Navigation) y completa la eliminación de errores 500 y problemas de navegación global.
