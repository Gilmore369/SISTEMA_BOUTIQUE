# ⚡ Instrucciones Rápidas - Desplegar Correcciones

## 🎯 Lo que se arregló

✅ Error "SCRIPT_URL has already been declared"  
✅ Error "jQuery no está disponible"  
✅ Error 500 con fechas en JSON  
✅ Collections retornando HTML en lugar de JSON  

## 📋 Pasos para Aplicar (5 minutos)

### 1️⃣ Ir al Editor de Apps Script
```
https://script.google.com
```

### 2️⃣ Crear Nueva Versión
1. Clic en **"Implementar"** (arriba a la derecha)
2. Clic en **"Administrar implementaciones"**
3. Clic en el **ícono de lápiz** ✏️ (editar la implementación activa)
4. Seleccionar **"Nueva versión"**
5. En descripción poner: `Fix SCRIPT_URL + Collections + Fechas`
6. Clic en **"Implementar"**

### 3️⃣ Recargar la Aplicación
1. Ir a tu aplicación web
2. Presionar **Ctrl + F5** (recarga forzada)
3. Abrir consola (F12)

### 4️⃣ Verificar que Funciona

#### ✅ Dashboard
- Debe mostrar "Ventas Hoy: S/ X.XX"
- Debe mostrar "Cobros Hoy: S/ X.XX"
- Tarjetas deben ser clickeables

#### ✅ Clientes
- Debe mostrar tabla con datos
- Búsqueda debe funcionar
- Sin errores en consola

#### ✅ Inventario
- Debe mostrar reporte completo
- Métricas deben aparecer
- Tabla debe cargar productos

#### ✅ Collections (Cobranzas)
- Debe mostrar 3 tablas vacías
- Debe decir "Mostrando registros del 0 al 0"
- **SIN ERRORES** en consola (esto es lo importante)

## 🚨 Si Ves Errores

### Error: "SCRIPT_URL has already been declared"
❌ **No creaste nueva versión**  
✅ Repite el Paso 2

### Error: "Unexpected token '<'"
❌ **Caché del navegador**  
✅ Presiona Ctrl + Shift + Delete → Borrar caché → Recargar

### Error: "jQuery no está disponible"
❌ **Versión antigua cargada**  
✅ Cierra todas las pestañas de la app → Abre de nuevo

## 📞 Todo Funciona Si...

✅ Dashboard carga sin errores  
✅ Clientes muestra tabla con datos  
✅ Inventario muestra productos  
✅ Collections muestra tablas vacías (sin errores rojos)  
✅ Consola de desarrollador sin errores rojos  

## 🎉 ¡Listo!

El sistema está funcionando correctamente. Collections mostrará tablas vacías porque las funciones de crédito se implementarán en el siguiente milestone.

---

**Tiempo estimado:** 5 minutos  
**Dificultad:** Fácil  
**Resultado:** Sistema sin errores ✅
