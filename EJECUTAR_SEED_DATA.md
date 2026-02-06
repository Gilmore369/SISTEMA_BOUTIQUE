# 🌱 CÓMO LLENAR LA BASE DE DATOS CON DATOS DE PRUEBA

**Propósito**: Llenar todas las tablas con datos ficticios para probar el sistema

---

## 📋 QUÉ HACE EL SEED

El script `seedAllDataComplete()` crea:

- ✅ 50 ventas (últimos 30 días)
- ✅ 158 items de venta
- ✅ 13 planes de crédito
- ✅ 90 cuotas (5 vencidas, 2 de hoy, 1 de la semana)
- ✅ 7 pagos
- ✅ 100 movimientos de inventario
- ✅ 5 productos con stock bajo

---

## 🚀 CÓMO EJECUTAR (3 PASOS)

### PASO 1: Abrir Apps Script Editor

1. Ve a: https://script.google.com/home
2. Busca tu proyecto: **"Adiction Boutique Suite"**
3. Haz clic para abrirlo

---

### PASO 2: Abrir el Archivo de Seed

1. En el panel izquierdo, busca: **`SeedDataCompleto.gs`**
2. Haz clic para abrirlo
3. Verás el código del seed

---

### PASO 3: Ejecutar la Función

1. En la parte superior, busca el dropdown que dice **"Seleccionar función"**
2. Selecciona: **`seedAllDataComplete`**
3. Haz clic en el botón **▶️ Ejecutar**
4. Si es la primera vez, te pedirá permisos:
   - Haz clic en **"Revisar permisos"**
   - Selecciona tu cuenta de Google
   - Haz clic en **"Avanzado"**
   - Haz clic en **"Ir a Adiction Boutique Suite (no seguro)"**
   - Haz clic en **"Permitir"**
5. Espera 10-15 segundos mientras se ejecuta

---

## 📊 VERIFICAR QUE FUNCIONÓ

### Ver los Logs:

1. En Apps Script Editor, haz clic en **"Ver"** → **"Registros de ejecución"**
2. Debes ver algo como:

```
=== INICIANDO SEED COMPLETO DE DATOS ===
Limpiando datos existentes...
✓ Datos limpiados
Creando ventas ficticias...
✓ 50 ventas creadas
✓ 158 items de venta creados
Creando planes de crédito...
✓ 13 planes de crédito creados
Creando cuotas...
✓ 90 cuotas creadas
  - Vencidas: 5
  - Vencen hoy: 2
  - Vencen esta semana: 1
Creando pagos...
✓ 7 pagos creados
Creando movimientos de inventario...
✓ 100 movimientos creados
✓ Stock actualizado (5 productos con stock bajo)
=== SEED COMPLETO FINALIZADO ===
✅ Datos creados exitosamente
```

### Ver los Datos en la Aplicación:

1. Abre tu aplicación
2. Ve al **Dashboard**:
   - Debe mostrar ventas de hoy
   - Debe mostrar 5 productos con stock bajo
   - Debe mostrar 5 cuotas vencidas
3. Ve a **Cobranzas**:
   - Debe mostrar 5 cuotas vencidas
   - Debe mostrar 2 cuotas que vencen hoy
   - Debe mostrar 1 cuota que vence esta semana
4. Ve a **Inventario**:
   - Debe mostrar 5 productos con stock bajo

---

## ⚠️ SI HAY ERRORES

### Error: "No hay clientes o productos"

**Solución**:
1. Primero ejecuta: **`setupInitialData()`** (en archivo `Setup.gs`)
2. Luego ejecuta: **`seedAllDataComplete()`**

### Error: "Hoja no existe"

**Solución**:
1. Primero ejecuta: **`createMissingSheets()`** (en archivo `CreateMissingSheets.gs`)
2. Luego ejecuta: **`fixDatabaseStructure()`** (en archivo `FixDatabaseStructure.gs`)
3. Finalmente ejecuta: **`seedAllDataComplete()`**

### Error: "Repo is not defined"

**Causa**: Código viejo en caché

**Solución**:
1. En Apps Script Editor, presiona `Ctrl + S` para guardar
2. Cierra y abre el editor
3. Ejecuta de nuevo

---

## 🔄 LIMPIAR Y VOLVER A LLENAR

Si quieres borrar todo y empezar de nuevo:

1. El seed automáticamente limpia los datos antes de crear nuevos
2. Solo ejecuta `seedAllDataComplete()` de nuevo
3. Los datos viejos se borrarán y se crearán nuevos

**NOTA**: Esto NO borra:
- Configuración (CFG_Users, CFG_Params)
- Catálogos (CAT_Products, CRM_Clients)
- Solo borra transacciones (ventas, cuotas, pagos, movimientos)

---

## 📝 ORDEN RECOMENDADO DE EJECUCIÓN

Si es la primera vez que usas el sistema:

1. **`setupInitialData()`** (Setup.gs)
   - Crea usuarios, parámetros, productos, clientes

2. **`createMissingSheets()`** (CreateMissingSheets.gs)
   - Crea hojas faltantes si no existen

3. **`fixDatabaseStructure()`** (FixDatabaseStructure.gs)
   - Corrige estructura de hojas

4. **`seedAllDataComplete()`** (SeedDataCompleto.gs)
   - Llena con datos de prueba

---

## ✅ CHECKLIST

Marca cuando completes cada paso:

- [ ] Abrir Apps Script Editor
- [ ] Abrir archivo SeedDataCompleto.gs
- [ ] Seleccionar función seedAllDataComplete
- [ ] Ejecutar (▶️)
- [ ] Dar permisos si es necesario
- [ ] Verificar logs (Ver → Registros de ejecución)
- [ ] Ver mensaje "✅ Datos creados exitosamente"
- [ ] Abrir aplicación y verificar dashboard
- [ ] Verificar Collections muestra cuotas
- [ ] Verificar Inventario muestra stock bajo

---

## 🎉 RESULTADO ESPERADO

Después de ejecutar el seed:

✅ Dashboard muestra datos reales (no ceros)  
✅ Collections muestra cuotas vencidas, de hoy, de la semana  
✅ Inventario muestra productos con stock bajo  
✅ Reportes muestran ventas de los últimos 30 días  
✅ Sistema listo para probar todas las funcionalidades  

---

**¡Listo! Ahora tienes datos de prueba para trabajar. 🚀**
