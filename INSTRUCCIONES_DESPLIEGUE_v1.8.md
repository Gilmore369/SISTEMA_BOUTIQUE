# 🚀 INSTRUCCIONES DE DESPLIEGUE - Versión 1.8

**URGENTE**: Sigue estos pasos EXACTAMENTE para aplicar las correcciones

---

## ✅ PROBLEMAS CORREGIDOS

1. ✅ Dashboard retornaba `null` → **RESUELTO**
2. ✅ Collections timeout en `window.USER_DATA` → **RESUELTO**
3. ✅ Estructura de respuestas mejorada

---

## 📋 PASOS PARA DESPLEGAR (5 MINUTOS)

### PASO 1: Código Ya Subido ✅

El código ya fue desplegado con:
```bash
npx @google/clasp push
```

**Archivos modificados**:
- `gas/Code.gs` - Routing de dashboard mejorado
- `gas/index.html` - AJAX en lugar de google.script.run

---

### PASO 2: Crear Nueva Versión en Apps Script ⚠️ CRÍTICO

**SIN ESTE PASO, LOS CAMBIOS NO SE APLICARÁN**

1. Abre: https://script.google.com/home

2. Busca tu proyecto: **"Adiction Boutique Suite"**

3. Haz clic en **"Implementar"** → **"Administrar implementaciones"**

4. Haz clic en el **ícono de lápiz** (editar) junto a la implementación activa

5. En **"Nueva descripción"**, escribe:
   ```
   v1.8 - Fix dashboard null y Collections timeout
   ```

6. Haz clic en **"Implementar"**

7. ✅ Verás un mensaje de confirmación

---

### PASO 3: Limpiar Caché del Navegador ⚠️ CRÍTICO

**SIN ESTE PASO, VERÁS LA VERSIÓN VIEJA**

#### Windows:
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona:
   - ✅ Imágenes y archivos en caché
   - ✅ Cookies y otros datos de sitios
3. Rango: **Última hora**
4. Clic en **"Borrar datos"**

#### Mac:
1. Presiona `Cmd + Shift + Delete`
2. Selecciona:
   - ✅ Imágenes y archivos en caché
   - ✅ Cookies y otros datos de sitios
3. Rango: **Última hora**
4. Clic en **"Borrar datos"**

---

### PASO 4: Cerrar TODAS las Pestañas

1. Cierra TODAS las pestañas de la aplicación
2. Cierra el navegador completamente
3. Abre el navegador de nuevo

---

### PASO 5: Probar la Aplicación

1. **Abrir en modo incógnito** (recomendado):
   - Windows: `Ctrl + Shift + N`
   - Mac: `Cmd + Shift + N`

2. **Ir a la aplicación**:
   ```
   https://script.google.com/macros/s/AKfycbxtEGbTk5QDYJN0sPm4PdAxIfoNT_TAvcr8HcZD_qdt5SSaxCC9QrtLfL_Kf5S36YfK/exec
   ```

3. **Abrir consola del navegador**:
   - Presiona `F12`
   - Ve a la pestaña **"Console"**

4. **Verificar que aparece**:
   ```javascript
   ✓ window.USER_DATA definido: {name: "gianpepex", email: "gianpepex@gmail.com", ...}
   Cargando datos del dashboard...
   Dashboard data recibida: {success: true, ok: true, data: {...}}
   ```

5. **Verificar Dashboard**:
   - ✅ Ventas Hoy: debe mostrar monto
   - ✅ Cobros Hoy: debe mostrar monto
   - ✅ Stock Bajo: debe mostrar número
   - ✅ Cuotas Vencidas: debe mostrar número

6. **Ir a Collections**:
   - Clic en **"Cobranzas"** en el menú
   - Verificar que carga sin errores
   - Verificar que muestra resumen con counts y amounts

---

## ❌ SI ALGO FALLA

### Dashboard Sigue Mostrando `null`:

1. **Verificar que creaste nueva versión**:
   - Ve a Apps Script → Implementar → Administrar implementaciones
   - Debe decir "v1.8" en la descripción

2. **Limpiar caché de nuevo**:
   - `Ctrl + Shift + Delete` (Windows)
   - `Cmd + Shift + Delete` (Mac)
   - Seleccionar **"Desde siempre"** esta vez

3. **Verificar en Apps Script Logs**:
   - Abre Apps Script Editor
   - Ve a **"Ver"** → **"Registros de ejecución"**
   - Busca errores en `getDashboardData`

---

### Collections Sigue con Timeout:

1. **Verificar en consola**:
   - Debe aparecer: `✓ window.USER_DATA definido: {...}`
   - Si no aparece, el problema es de caché

2. **Limpiar caché completamente**:
   - `Ctrl + Shift + Delete`
   - Seleccionar **"Desde siempre"**
   - Cerrar navegador completamente

3. **Probar en modo incógnito**:
   - `Ctrl + Shift + N` (Windows)
   - `Cmd + Shift + N` (Mac)

---

## 📞 CONTACTO SI NECESITAS AYUDA

Si después de seguir TODOS los pasos sigue fallando:

1. **Toma screenshot de**:
   - Consola del navegador (F12)
   - Apps Script Logs (Ver → Registros de ejecución)

2. **Envía**:
   - Screenshot de consola
   - Screenshot de logs
   - Descripción de qué paso falló

---

## ✅ CHECKLIST RÁPIDO

Marca cada paso cuando lo completes:

- [ ] Paso 1: Código subido (ya hecho ✅)
- [ ] Paso 2: Nueva versión creada en Apps Script
- [ ] Paso 3: Caché del navegador limpiado
- [ ] Paso 4: Todas las pestañas cerradas
- [ ] Paso 5: Aplicación probada en modo incógnito
- [ ] Dashboard muestra datos (no null)
- [ ] Collections carga sin timeout
- [ ] No hay errores en consola

---

## 🎉 CUANDO TODO FUNCIONE

Verás:

✅ Dashboard con datos reales (no S/ 0.00)  
✅ Collections con resumen correcto  
✅ No más errores en consola  
✅ Sistema fluido y rápido  

**¡Listo para usar! 🚀**
