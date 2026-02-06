# 🚨 INSTRUCCIONES URGENTES - HACER AHORA

## ⚠️ PROBLEMA ACTUAL

El sistema muestra error UNAUTHORIZED porque **NO HAS CREADO LA NUEVA VERSIÓN** en Apps Script.

Los cambios están desplegados pero la aplicación web sigue usando la versión ANTIGUA.

---

## ✅ SOLUCIÓN (3 PASOS - 2 MINUTOS)

### PASO 1: Crear Nueva Versión en Apps Script

1. Ir a: **https://script.google.com**
2. Abrir tu proyecto "Adiction Boutique Suite"
3. Clic en **"Implementar"** (arriba a la derecha)
4. Clic en **"Administrar implementaciones"**
5. Clic en el **ícono de LÁPIZ** ✏️ (editar la implementación activa)
6. Seleccionar **"Nueva versión"**
7. En descripción poner: `Fix Collections + userEmail`
8. Clic en **"Implementar"**

### PASO 2: Ejecutar Script de Datos Ficticios

1. En el mismo editor de Apps Script
2. En la barra superior, seleccionar la función: **`seedAllDataComplete`**
3. Clic en **"Ejecutar"** (botón play ▶️)
4. Esperar 30-60 segundos
5. Ver el log: debe decir "✅ Datos creados exitosamente"

### PASO 3: Recargar la Aplicación

1. Ir a tu aplicación web
2. Presionar **Ctrl + Shift + Delete**
3. Seleccionar "Borrar caché e imágenes"
4. Cerrar TODAS las pestañas de la aplicación
5. Abrir de nuevo la aplicación
6. Presionar **Ctrl + F5**

---

## 🎯 RESULTADO ESPERADO

Después de estos 3 pasos:

### ✅ Dashboard
- Ventas Hoy: S/ XXX.XX (con datos)
- Cobros Hoy: S/ XXX.XX (con datos)
- Stock Bajo: X productos
- Cuotas Vencidas: X cuotas
- Tabla "Últimas Ventas" con 10 ventas

### ✅ Collections (Cobranzas)
- Cuotas Vencidas: tabla con datos
- Vencen Hoy: tabla con datos
- Vencen Esta Semana: tabla con datos
- Métricas con números reales
- **SIN ERROR UNAUTHORIZED**

### ✅ Clientes
- Tabla con 6 clientes
- Búsqueda funciona
- Filtros funcionan

### ✅ Inventario
- 15 productos
- Algunos con stock bajo (en amarillo)
- Métricas correctas

---

## 🔴 SI SIGUES VIENDO ERRORES

### Error: "UNAUTHORIZED"
❌ **No creaste la nueva versión**  
✅ Repite el PASO 1

### Error: "window.SCRIPT_URL no está definido"
❌ **Caché del navegador**  
✅ Repite el PASO 3 (borrar caché)

### Dashboard muestra todo en 0
❌ **No ejecutaste el script de datos**  
✅ Repite el PASO 2

---

## 📝 LO QUE HICE

1. ✅ Arreglé el error UNAUTHORIZED (doPost acepta userEmail)
2. ✅ Arreglé Collections para esperar variables globales
3. ✅ Creé script `SeedDataCompleto.gs` con 50 ventas, cuotas, pagos, etc.
4. ✅ Desplegué 41 archivos con `npx @google/clasp push`

---

## ⏰ TIEMPO TOTAL: 2 MINUTOS

- Paso 1: 30 segundos
- Paso 2: 60 segundos
- Paso 3: 30 segundos

---

## 🆘 SI NADA FUNCIONA

1. Cierra TODAS las pestañas del navegador
2. Abre Chrome en modo incógnito
3. Ve a la URL de tu aplicación
4. Debería funcionar

---

**IMPORTANTE:** Debes hacer el PASO 1 (crear nueva versión) SIEMPRE que yo despliegue cambios con `clasp push`. El push sube el código pero no actualiza la versión web.
