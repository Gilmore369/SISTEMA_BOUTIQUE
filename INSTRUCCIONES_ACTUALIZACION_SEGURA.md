rsión:** 2.0 - Sistema de Gestión de Atributos  
**Estado:** ✅ LISTO PARA EJECUTAR
de la tabla CAT_Categories)
- Ambos sistemas coexisten sin problemas

### Rollback:
- Si decides no usar las nuevas funcionalidades, simplemente no las uses
- Las hojas maestras nuevas no afectan el sistema existente
- Puedes eliminarlas manualmente si quieres

---

## 📞 SOPORTE

Si tienes dudas o problemas:
1. Revisa el log de ejecución (Ver → Registros)
2. Ejecuta `verifyCurrentStructure()` para ver el estado actual
3. El reporte te dirá exactamente qué se hizo y qué se omitió

---

**Fecha:** 2026-02-06  
**Ve

Después de ejecutar la actualización segura:

1. ✅ Verifica que todo esté correcto
2. ✅ Crea una nueva versión en Apps Script (v2.0)
3. ✅ Limpia caché del navegador
4. ✅ Prueba el sistema

---

## 💡 NOTAS IMPORTANTES

### Compatibilidad:
- El sistema antiguo seguirá funcionando
- Las nuevas funcionalidades se agregarán gradualmente
- No hay "breaking changes"

### Migración de Datos:
- Los productos existentes pueden seguir usando el campo `category` (texto)
- Los productos nuevos usarán `category_id` (ID eated_at` - Fecha de creación
- `updated_at` - Fecha de actualización

### Columnas Nuevas (se agregan al final):
- `line_id` - ID de línea (Hombres/Mujeres/Niños)
- `category_id` - ID de categoría (reemplaza "category" texto)
- `brand_id` - ID de marca
- `supplier_id` - ID de proveedor
- `size` - Talla (M, L, 38, 100ml, etc.)
- `color` - Color
- `presentation` - Presentación (Unidad, Pack, etc.)
- `purchase_price` - Precio de compra
- `barcode_url` - URL del código de barras generado

---

## 🎯 PRÓXIMOS PASOSno quieres, simplemente elimínalas manualmente
3. Si se agregaron columnas que no quieres, déjalas vacías (no afectan el sistema)

---

## 📊 NUEVAS COLUMNAS EN CAT_PRODUCTS

Después de la actualización, `CAT_Products` tendrá:

### Columnas Existentes (se mantienen):
- `id` - ID del producto
- `barcode` - Código de barras
- `name` - Nombre
- `description` - Descripción
- `price` - Precio de venta
- `category` - Categoría (texto) ← Se mantiene por compatibilidad
- `min_stock` - Stock mínimo
- `active` - Activo
- `cr productos existentes deben seguir ahí
- ✅ Los datos existentes NO deben cambiar

### 3. Otras Hojas
- ✅ Todas tus hojas existentes deben estar intactas
- ✅ Todos los datos deben estar como estaban

---

## 🆘 SI ALGO SALE MAL

### Antes de ejecutar (Recomendado):
1. Haz una copia de tu hoja de cálculo:
   - **Archivo** → **Hacer una copia**
   - Nómbrala: "BOUTIQUE - BACKUP [FECHA]"

### Si necesitas revertir:
1. Las funciones NO borran datos, así que no hay nada que revertir
2. Si se crearon hojas nuevas que Advertencias: 0

✅ Sistema actualizado exitosamente
```

---

## 🔍 VERIFICACIÓN POST-ACTUALIZACIÓN

Después de ejecutar `safeSetupNewFeatures()`, verifica:

### 1. Hojas Maestras Nuevas
- ✅ `CAT_Lines` debe tener 4 registros (Mujeres, Hombres, Niños, Unisex)
- ✅ `CAT_Categories` debe tener 16 registros
- ✅ `CAT_Brands` debe tener 11 registros
- ✅ `CAT_Sizes` debe tener 43 registros
- ✅ `CAT_Suppliers` debe tener 4 registros

### 2. CAT_Products Actualizada
- ✅ Debe tener las nuevas columnas al final
- ✅ TusCAT_Sizes
  ✓ CAT_Suppliers

⏭️ HOJAS OMITIDAS (9):
  • CAT_Products (tiene 15 registros)
  • CRM_Clients (tiene 8 registros)
  • INV_Stock (tiene 17 registros)
  ...

➕ COLUMNAS AGREGADAS (9):
  ✓ CAT_Products.line_id
  ✓ CAT_Products.category_id
  ✓ CAT_Products.brand_id
  ✓ CAT_Products.supplier_id
  ✓ CAT_Products.size
  ✓ CAT_Products.color
  ✓ CAT_Products.presentation
  ✓ CAT_Products.purchase_price
  ✓ CAT_Products.barcode_url

RESUMEN:
• Hojas creadas: 5
• Hojas omitidas: 9
• Columnas agregadas: 9
• CAT_Categories` - Categorías
  - `CAT_Brands` - Marcas
  - `CAT_Sizes` - Tallas
  - `CAT_Suppliers` - Proveedores
- Agrega columnas faltantes a `CAT_Products` (sin borrar datos)
- Pobla las hojas nuevas con datos iniciales

#### ❌ LO QUE NO HACE:
- ❌ NO borra hojas existentes
- ❌ NO sobrescribe datos existentes
- ❌ NO modifica hojas que ya tienen datos
- ❌ NO elimina columnas existentes

### Reporte que verás:
```
✅ CONFIGURACIÓN COMPLETADA

📝 HOJAS CREADAS (5):
  ✓ CAT_Lines
  ✓ CAT_Categories
  ✓ CAT_Brands
  ✓ ic en el botón ▶️ Ejecutar
3. Revisa el log (Ver → Registros)
```

---

## 📋 PASO 2: ACTUALIZAR CON SEGURIDAD (Requiere confirmación)

### Solo después de revisar el PASO 1, ejecuta:

1. En el mismo editor de Apps Script
2. Selecciona la función: **`safeSetupNewFeatures`**
3. Haz clic en ▶️ Ejecutar
4. **Te pedirá confirmación** antes de hacer cualquier cambio

### ¿Qué hace esta función?

#### ✅ LO QUE SÍ HACE:
- Crea 5 hojas maestras NUEVAS (solo si no existen):
  - `CAT_Lines` - Líneas de productos
  - `Sheets
2. Ve a **Extensiones** → **Apps Script**
3. En el editor, busca el archivo **`SafeSetup.gs`**
4. Ejecuta la función: **`verifyCurrentStructure`**

### ¿Qué hace esta función?
- ✅ Solo **LEE** tu base de datos
- ✅ **NO modifica NADA**
- ✅ Te muestra un reporte completo:
  - Todas las hojas que tienes
  - Cuántos registros hay en cada hoja
  - Qué columnas tiene cada hoja
  - Qué hojas maestras faltan

### Cómo ejecutar:
```
1. Selecciona la función "verifyCurrentStructure" en el menú desplegable
2. Haz clACIÓN SEGURA

## ⚠️ IMPORTANTE: TUS DATOS ESTÁN PROTEGIDOS

El nuevo sistema de actualización **NUNCA borrará tus datos existentes**.

---

## 📋 PASO 1: VERIFICAR TU BASE DE DATOS ACTUAL (100% Seguro)

### En el Editor de Apps Script:

1. Abre tu hoja de cálculo de Google # 🛡️ INSTRUCCIONES DE ACTUALIZ