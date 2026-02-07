# 🎯 INSTRUCCIONES: Activar Ingreso Masivo de Mercadería

## 📋 Resumen del Problema

El sistema de **Ingreso Masivo** está implementado pero las **hojas maestras están vacías**. Necesitas poblarlas con datos iniciales para que el formulario funcione.

---

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### **Paso 1: Ejecutar Script de Corrección**

**IMPORTANTE:** Tus hojas maestras tienen 999 filas vacías. Necesitas limpiarlas y poblarlas con datos reales.

1. Abre tu hoja de cálculo: https://docs.google.com/spreadsheets/d/18G-yq7qd_FM0X-w96GWq_JNvc7z2SqrUpg1w0jl5A_w/edit
2. Ve a **Extensiones → Apps Script**
3. En el editor, busca el archivo **`FixMasterData.gs`** en la lista de archivos
4. Abre la función **`quickFix`**
5. Haz clic en **▶️ Ejecutar**
6. Autoriza los permisos si te lo pide
7. Espera 10-15 segundos
8. Ve a **Ver → Registros** para ver el resultado

**Resultado esperado:**
```
✅ DATOS MAESTROS CORREGIDOS EXITOSAMENTE
🎉 Ahora puedes probar el Ingreso Masivo
```

**¿Qué hace este script?**
- 🧹 Limpia las 999 filas vacías de las hojas maestras
- ✅ Agrega 4 líneas (Mujeres, Hombres, Niños, Unisex)
- ✅ Agrega 16 categorías
- ✅ Agrega 11 marcas
- ✅ Agrega 43 tallas
- ✅ Agrega 4 proveedores
- ✅ Verifica que todo se agregó correctamente

---

### **Paso 2: Crear Nueva Versión**

1. En el editor de Apps Script, haz clic en **Implementar → Nueva implementación**
2. Selecciona **Aplicación web**
3. En "Nueva descripción", escribe: `v2.1 - Ingreso Masivo Activado`
4. Haz clic en **Implementar**
5. Copia la URL de la aplicación web

---

### **Paso 3: Limpiar Caché y Probar**

1. Cierra todas las pestañas de tu aplicación
2. Presiona **Ctrl + Shift + Delete** (Windows) o **Cmd + Shift + Delete** (Mac)
3. Selecciona:
   - ✅ Cookies y otros datos de sitios
   - ✅ Imágenes y archivos en caché
   - Intervalo: **Última hora**
4. Haz clic en **Borrar datos**
5. Abre una **ventana de incógnito** (Ctrl + Shift + N)
6. Pega la URL de tu aplicación
7. Inicia sesión con `gianpapex@gmail.com`
8. Haz clic en **"Ingreso Masivo"** en el menú lateral

---

## 🔍 Verificación Manual (Opcional)

Si quieres verificar que las hojas maestras se crearon correctamente:

1. Abre tu hoja de cálculo
2. Verifica que existan estas hojas con datos:
   - **CAT_Lines**: 4 líneas (Mujeres, Hombres, Niños, Unisex)
   - **CAT_Categories**: 16 categorías
   - **CAT_Brands**: 11 marcas (Adidas, Nike, Zara, etc.)
   - **CAT_Sizes**: 43 tallas
   - **CAT_Suppliers**: 4 proveedores

---

## 🎨 Cómo Usar el Ingreso Masivo

Una vez activado, el formulario te permite:

### 1️⃣ **Datos Básicos**
- Nombre del producto
- Línea (Mujeres/Hombres/Niños/Unisex)
- Categoría (se filtra por línea)
- Marca
- Proveedor (se filtra por marca)
- Color y presentación

### 2️⃣ **Precios**
- Precio de compra
- Margen de ganancia (%)
- Precio de venta (calculado automáticamente)

### 3️⃣ **Distribución de Tallas**
- Selecciona la categoría
- Aparece un grid con todas las tallas disponibles
- Ingresa la cantidad por cada talla
- Ejemplo: M=3, L=5, XL=2

### 4️⃣ **Resumen Automático**
- Total de unidades
- Inversión total
- Venta potencial
- Ganancia estimada

### 5️⃣ **Registro**
- Haz clic en "Registrar Ingreso de Mercadería"
- El sistema crea:
  - ✅ Un producto por cada talla con SKU único
  - ✅ Código QR para cada producto
  - ✅ Registro de stock en INV_Stock
  - ✅ Movimiento de entrada en INV_Movements
  - ✅ Auditoría completa

---

## 🐛 Solución de Problemas

### ❌ Error: "Acción no reconocida: undefined"
**Causa:** Las hojas maestras están vacías o tienen datos basura  
**Solución:** Ejecuta `quickFix()` desde `FixMasterData.gs`

### ❌ Error: "No hay tallas disponibles"
**Causa:** La hoja CAT_Sizes está vacía o tiene filas basura  
**Solución:** Ejecuta `quickFix()` desde `FixMasterData.gs`

### ❌ Los selects aparecen vacíos (sin opciones)
**Causa:** Las hojas maestras tienen 999 filas vacías (solo validaciones)  
**Solución:** Ejecuta `quickFix()` desde `FixMasterData.gs`

### ❌ La página se ve en blanco
**Causa:** Caché del navegador  
**Solución:** Limpia caché (Ctrl+Shift+Delete) y prueba en incógnito

### ❌ Los selects no se llenan
**Causa:** Error en el backend o permisos  
**Solución:** 
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Comparte el error para ayudarte

---

## 📊 Datos Iniciales Incluidos

El script `testAll_RunAllSteps()` crea:

### **Líneas (4)**
- Mujeres
- Hombres
- Niños
- Unisex

### **Categorías (16)**
- **Mujeres:** Blusas, Pantalones, Vestidos, Faldas, Zapatos, Carteras
- **Hombres:** Camisas, Pantalones, Polos, Zapatos, Shorts
- **Niños:** Polos, Pantalones, Vestidos
- **Unisex:** Perfumes, Accesorios

### **Marcas (11)**
- Adidas, Nike, Puma, Reebok
- Zara, H&M, Forever 21
- Levi's, Tommy Hilfiger, Calvin Klein
- Genérica

### **Tallas (43)**
- Ropa: XS, S, M, L, XL, XXL
- Pantalones: 26, 28, 30, 32, 34, 36, 38, 40
- Zapatos Mujeres: 35-40
- Zapatos Hombres: 39-44
- Perfumes: 50ml, 100ml, 150ml

### **Proveedores (4)**
- Distribuidora Deportiva SAC (Adidas, Nike, Puma, Reebok)
- Importaciones Fashion Peru (Zara, H&M, Forever 21)
- Textiles Premium EIRL (Levi's, Tommy Hilfiger, Calvin Klein)
- Mayorista Ropa Nacional (Genérica)

---

## 🎯 Ejemplo de Uso Real

**Escenario:** Ingreso de 12 polos Nike talla M, L, XL

1. **Datos Básicos:**
   - Nombre: "Polo Deportivo Nike Dri-FIT"
   - Línea: Hombres
   - Categoría: Polos
   - Marca: Nike
   - Proveedor: Distribuidora Deportiva SAC
   - Color: Negro
   - Presentación: Unidad

2. **Precios:**
   - Precio de compra: S/ 45.00
   - Margen: 50%
   - Precio de venta: S/ 67.50 (calculado)

3. **Tallas:**
   - M: 4 unidades
   - L: 5 unidades
   - XL: 3 unidades

4. **Resultado:**
   - Se crean 3 productos (uno por talla)
   - Cada uno con su SKU único: `POLO-NIKE-M-NEGRO-1234567890`
   - Cada uno con su código QR
   - Stock total: 12 unidades
   - Inversión: S/ 540.00
   - Venta potencial: S/ 810.00
   - Ganancia estimada: S/ 270.00

---

## 📞 Soporte

Si tienes problemas:

1. Ejecuta `testStep1_VerifyStructure()` para ver el estado actual
2. Revisa el log de ejecución (Ver → Registros)
3. Comparte el error exacto que ves

---

## ✅ Checklist Final

- [ ] Ejecuté `testAll_RunAllSteps()` exitosamente
- [ ] Verifiqué que las 5 hojas maestras tienen datos
- [ ] Creé nueva versión en Apps Script
- [ ] Limpié caché del navegador
- [ ] Probé en modo incógnito
- [ ] El formulario "Ingreso Masivo" carga correctamente
- [ ] Los selects se llenan con datos
- [ ] Puedo ver las tallas al seleccionar categoría

---

**🎉 ¡Listo! Tu sistema de Ingreso Masivo está funcionando.**
