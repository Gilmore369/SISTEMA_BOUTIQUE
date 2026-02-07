# ACTUALIZACIÓN SEGURA v2.0 - Sistema de Atributos

## TUS DATOS ESTÁN PROTEGIDOS

El código ya está desplegado con funciones 100% seguras.

## PASO 1: VERIFICAR (Solo lectura)

En Apps Script, ejecuta:
```
verifyCurrentStructure()
```

Esto te mostrará qué tienes actualmente SIN modificar nada.

## PASO 2: ACTUALIZAR (Con confirmación)

En Apps Script, ejecuta:
```
safeSetupNewFeatures()
```

### Lo que hará:
✅ Crear 5 hojas maestras NUEVAS (solo si no existen)
✅ Agregar columnas a CAT_Products (sin borrar datos)
✅ Poblar hojas nuevas con datos iniciales

### Lo que NO hará:
❌ NO borrará hojas existentes
❌ NO sobrescribirá datos
❌ NO modificará hojas con datos

## HOJAS NUEVAS:
- CAT_Lines (4 registros)
- CAT_Categories (16 registros)
- CAT_Brands (11 registros)
- CAT_Sizes (43 registros)
- CAT_Suppliers (4 registros)

## COLUMNAS NUEVAS EN CAT_PRODUCTS:
- line_id
- category_id
- brand_id
- supplier_id
- size
- color
- presentation
- purchase_price
- barcode_url

## BACKUP RECOMENDADO:
Antes de ejecutar, haz copia de tu hoja:
Archivo → Hacer una copia

---
Código desplegado: ✅
Archivo: SafeSetup.gs
Funciones: verifyCurrentStructure(), safeSetupNewFeatures()
