# 🚨 GUÍA DE REDESPLIEGUE URGENTE
## Solución Error Crítico: Redeclaración de SCRIPT_URL

**Fecha**: 2026-02-06  
**Prioridad**: 🔴 CRÍTICA  
**Estado**: ✅ Código Corregido - ⏳ Pendiente Redespliegue

---

## ⚠️ IMPORTANTE: DEBES REDESPLEGAR DESDE EL EDITOR

Los cambios ya están aplicados en los archivos locales, pero **Google Apps Script NO actualiza automáticamente**. Debes crear una nueva versión desde el editor web.

---

## 📋 CHECKLIST PRE-REDESPLIEGUE

### ✅ Archivos Corregidos (Ya Aplicados)

- [x] **gas/index.html**
  - `window.SCRIPT_URL` declarado globalmente
  - `window.navigateTo` declarado globalmente
  - Aliases locales para compatibilidad

- [x] **gas/ClientList.html**
  - Verificación de existencia antes de declarar
  - Uso de `var` en lugar de `const`
  - Log condicional

- [x] **gas/Collections.html**
  - Verificación de existencia antes de declarar
  - Uso de `var` en lugar de `const`
  - Log condicional

- [x] **gas/InventoryReport.html**
  - Verificación de existencia antes de declarar
  - Uso de `var` en lugar de `const`
  - Log condicional

- [x] **gas/Code.gs**
  - Función `getInventoryReport()` existe
  - Handler `handleInventoryAction()` configurado
  - Router delega correctamente

---

## 🚀 PASOS PARA REDESPLEGAR

### Paso 1: Subir Código a Apps Script
```bash
npx @google/clasp push
```

**Verificar que muestre**:
```
✔ Pushed 50+ files.
```

### Paso 2: Abrir Editor de Apps Script
1. Ir a: https://script.google.com
2. Buscar proyecto: **"Adiction Boutique Suite"**
3. Click para abrir

### Paso 3: Crear Nueva Implementación
1. Click en **"Implementar"** (arriba derecha)
2. Click en **"Administrar implementaciones"**
3. En la implementación activa, click en el ícono de **lápiz** (editar)
4. Click en **"Nueva versión"**
5. En "Descripción de la versión", escribir:
   ```
   v1.3 - Fix crítico: Redeclaración SCRIPT_URL y navigateTo global
   ```
6. Click en **"Implementar"**
7. **COPIAR LA URL** que aparece (la necesitarás para probar)

### Paso 4: Esperar Propagación
⏱️ **Esperar 30-60 segundos** para que Google propague los cambios

---

## 🧪 VERIFICACIÓN POST-REDESPLIEGUE

### Test 1: Abrir la Aplicación
1. Abrir la URL de la Web App (la que copiaste)
2. Hacer login con tu email
3. Verificar que carga el Dashboard

**✅ Debe mostrar**:
- Dashboard con 4 cards (Ventas, Cobros, Stock Bajo, Cuotas Vencidas)
- Sidebar con menú de navegación
- Sin errores en consola

**❌ NO debe mostrar**:
- Página en blanco
- Error 500
- "Configuración Pendiente"

### Test 2: Verificar Consola del Navegador
1. Presionar **F12** para abrir DevTools
2. Ir a pestaña **"Console"**
3. Buscar mensajes

**✅ Debe mostrar**:
```
Script URL (desde servidor): https://script.google.com/macros/s/...
Window location: https://n-...googleusercontent.com/...
User data: {name: "...", email: "...", roles: [...]}
Sistema cargado. Página actual: dashboard
Usuario: {name: "...", email: "...", roles: [...]}
```

**❌ NO debe mostrar**:
```
❌ Uncaught SyntaxError: Identifier 'SCRIPT_URL' has already been declared
❌ SCRIPT_URL no está definido
❌ navigateTo is not defined
❌ jQuery no está disponible
```

### Test 3: Módulo de Clientes
1. Click en **"Clientes"** en el sidebar
2. Esperar a que cargue la tabla

**✅ Debe mostrar**:
```
SCRIPT_URL disponible para ClientList: https://script.google.com/...
Respuesta del servidor: {ok: true, data: [...]}
```
- Tabla con listado de clientes
- Sin errores de AJAX

**❌ NO debe mostrar**:
```
❌ Error AJAX: parsererror
❌ Unexpected token '<'
❌ Identifier 'SCRIPT_URL' has already been declared
```

### Test 4: Módulo de Cobranzas
1. Click en **"Cobranzas"** en el sidebar
2. Esperar a que carguen las 3 tablas (Vencidas, Hoy, Esta Semana)

**✅ Debe mostrar**:
```
SCRIPT_URL disponible para Collections: https://script.google.com/...
Respuesta overdue: {success: true, data: [...]}
Respuesta today: {success: true, data: [...]}
Respuesta week: {success: true, data: [...]}
```
- 3 pestañas con tablas
- Cards de resumen con números
- Sin errores de AJAX

**❌ NO debe mostrar**:
```
❌ jQuery no está disponible para Collections
❌ Error AJAX: parsererror
```

### Test 5: Módulo de Inventario
1. Click en **"Inventario"** en el sidebar
2. Click en botón **"Generar"**

**✅ Debe mostrar**:
```
SCRIPT_URL disponible para Inventory: https://script.google.com/...
Generando reporte para almacén: null
Respuesta del servidor: {success: true, data: {...}}
Mostrando reporte: {...}
```
- 3 cards de métricas (Total Productos, Valor Total, Stock Bajo)
- Tabla con detalle de inventario
- Sin errores

**❌ NO debe mostrar**:
```
❌ google.script.run.withSuccessHandler(...).getInventoryReport is not a function
❌ Error AJAX: parsererror
```

### Test 6: Navegación
1. Click en diferentes opciones del sidebar
2. Verificar que cada página carga correctamente

**✅ Debe funcionar**:
- Dashboard → Clientes → Collections → Inventario
- Click en logo "Adiction Boutique" vuelve al Dashboard
- URLs cambian correctamente
- Sin errores de "navigateTo is not defined"

---

## 🔍 DIAGNÓSTICO DE PROBLEMAS

### Si ves: "Identifier 'SCRIPT_URL' has already been declared"
**Causa**: El código viejo aún está desplegado  
**Solución**: 
1. Verificar que hiciste `npx @google/clasp push`
2. Verificar que creaste una **"Nueva versión"** (no solo guardar)
3. Esperar 60 segundos y refrescar con **Ctrl+Shift+R** (hard refresh)

### Si ves: "navigateTo is not defined"
**Causa**: El código viejo aún está desplegado  
**Solución**: Igual que arriba

### Si ves: "jQuery no está disponible"
**Causa**: Script se ejecuta antes de que jQuery cargue (por el error de redeclaración)  
**Solución**: Corregir el error de redeclaración (ya está corregido, solo redesplegar)

### Si ves: "Error AJAX: parsererror"
**Causa**: El servidor devuelve HTML en lugar de JSON (por error en el código)  
**Solución**: Verificar que el router en Code.gs está correcto (ya está correcto)

### Si ves: "getInventoryReport is not a function"
**Causa**: La función no existe en el código desplegado  
**Solución**: Verificar que hiciste push y redespliegue

---

## 📊 COMPARACIÓN ANTES/DESPUÉS

### ANTES (Con Errores) ❌
```javascript
// En index.html:
const SCRIPT_URL = '<?= scriptUrl ?>';  // ❌ Solo local

// En ClientList.html:
const SCRIPT_URL = window.SCRIPT_URL;   // ❌ Redeclaración

// Resultado:
❌ Uncaught SyntaxError: Identifier 'SCRIPT_URL' has already been declared
❌ navigateTo is not defined
❌ Tablas no cargan
```

### DESPUÉS (Corregido) ✅
```javascript
// En index.html:
window.SCRIPT_URL = '<?= scriptUrl ?>';  // ✅ Global
const SCRIPT_URL = window.SCRIPT_URL;    // ✅ Alias local

window.navigateTo = function(page, params) { ... };  // ✅ Global
const navigateTo = window.navigateTo;    // ✅ Alias local

// En ClientList.html:
if (typeof SCRIPT_URL === 'undefined') {
  var SCRIPT_URL = window.SCRIPT_URL || '';  // ✅ Solo si no existe
}

// Resultado:
✅ Sin errores de redeclaración
✅ Variables globales accesibles
✅ Navegación funcional
✅ Tablas cargan correctamente
```

---

## 🎯 RESULTADO ESPERADO FINAL

### Consola del Navegador (F12)
```
✅ Script URL (desde servidor): https://script.google.com/macros/s/...
✅ SCRIPT_URL disponible para ClientList: https://...
✅ SCRIPT_URL disponible para Collections: https://...
✅ SCRIPT_URL disponible para Inventory: https://...
✅ Sistema cargado. Página actual: dashboard
✅ Usuario: {name: "...", email: "...", roles: [...]}
```

### Módulos Funcionales
```
✅ Dashboard - Cards clicables, datos cargan
✅ Clientes - Tabla carga con AJAX
✅ Cobranzas - 3 tablas cargan correctamente
✅ Inventario - Reporte se genera sin errores
✅ Navegación - Todos los links funcionan
```

### Sin Errores
```
✅ Sin errores de redeclaración
✅ Sin errores de AJAX
✅ Sin errores de jQuery
✅ Sin errores de navegación
```

---

## 📝 NOTAS IMPORTANTES

### 1. Hard Refresh Obligatorio
Después de redesplegar, **SIEMPRE** hacer hard refresh:
- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

Esto limpia la caché del navegador y carga la nueva versión.

### 2. Tiempo de Propagación
Google puede tardar hasta **60 segundos** en propagar los cambios. Si no funciona inmediatamente, espera un minuto y vuelve a intentar.

### 3. Múltiples Pestañas
Si tienes múltiples pestañas abiertas con la app, **ciérralas todas** y abre una nueva después del redespliegue.

### 4. Modo Incógnito
Para probar sin caché, abre en modo incógnito:
- **Windows**: `Ctrl + Shift + N`
- **Mac**: `Cmd + Shift + N`

---

## ✅ CHECKLIST FINAL

Después de redesplegar, verifica:

- [ ] `npx @google/clasp push` ejecutado exitosamente
- [ ] Nueva versión creada en Apps Script Editor
- [ ] Esperado 60 segundos
- [ ] Hard refresh con Ctrl+Shift+R
- [ ] Dashboard carga sin errores
- [ ] Consola sin errores de redeclaración
- [ ] Módulo Clientes funciona
- [ ] Módulo Cobranzas funciona
- [ ] Módulo Inventario funciona
- [ ] Navegación funciona en todos los módulos
- [ ] Sin errores de AJAX
- [ ] Sin errores de jQuery

---

## 🆘 SI NADA FUNCIONA

### Opción 1: Verificar Código Local
```bash
# Ver si los cambios están en los archivos
grep "window.SCRIPT_URL" gas/index.html
grep "typeof SCRIPT_URL" gas/ClientList.html
```

**Debe mostrar**:
```
window.SCRIPT_URL = '<?= scriptUrl ?>';
if (typeof SCRIPT_URL === 'undefined') {
```

### Opción 2: Push Forzado
```bash
# Forzar push de todos los archivos
npx @google/clasp push --force
```

### Opción 3: Verificar en Editor Web
1. Abrir https://script.google.com
2. Abrir el proyecto
3. Abrir `index.html`
4. Buscar `window.SCRIPT_URL`
5. Si NO aparece, el push no funcionó

---

## 📞 RESUMEN EJECUTIVO

**Problema**: Redeclaración de `SCRIPT_URL` causa error crítico  
**Solución**: Variables globales en `window` + verificación en módulos  
**Estado del Código**: ✅ CORREGIDO  
**Acción Requerida**: 🚨 **REDESPLEGAR DESDE APPS SCRIPT EDITOR**  

**Tiempo Estimado**: 5 minutos  
**Impacto**: Soluciona todos los errores de carga de módulos  

---

**Preparado por**: Kiro AI Assistant  
**Fecha**: 2026-02-06  
**Versión**: 1.3  
**Prioridad**: 🔴 CRÍTICA  
**Estado**: ⏳ PENDIENTE REDESPLIEGUE
