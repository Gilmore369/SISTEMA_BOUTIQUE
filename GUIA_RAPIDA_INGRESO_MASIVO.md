# GUÍA RÁPIDA: INGRESO MASIVO DE MERCADERÍA

## 🚀 ACCESO RÁPIDO

**URL**: Tu URL de Apps Script + `?page=bulk-entry`  
**Navegación**: Sidebar → "Ingreso Masivo" (icono de caja)

---

## 📋 PASOS PARA INGRESAR MERCADERÍA

### 1️⃣ DATOS BÁSICOS
- **Nombre del Producto**: Ej: "Blusa Casual"
- **Descripción**: (Opcional) Ej: "Blusa de algodón"
- **Línea**: Seleccionar (Mujeres, Hombres, Niños)
- **Categoría**: Se carga automáticamente según la línea
- **Marca**: Seleccionar (Adidas, Nike, Zara, etc.)
- **Proveedor**: Se filtra automáticamente según la marca
- **Color**: Ej: "Azul", "Rojo"
- **Presentación**: (Opcional) Ej: "Caja", "Bolsa"
- **Almacén**: Seleccionar almacén de destino

### 2️⃣ PRECIOS
- **Precio de Compra**: Ej: S/ 50.00
- **Margen de Ganancia**: Ej: 50% (se calcula automáticamente)
- **Precio de Venta**: Se calcula solo, pero puedes editarlo

### 3️⃣ DISTRIBUCIÓN DE TALLAS
- Aparecen las tallas disponibles para la categoría seleccionada
- Ingresar cantidad para cada talla
- Ejemplo:
  - S: 3 unidades
  - M: 5 unidades
  - L: 4 unidades

### 4️⃣ REVISAR RESUMEN
El sistema muestra automáticamente:
- ✅ Total de Unidades
- ✅ Inversión Total
- ✅ Venta Potencial
- ✅ Ganancia Estimada

### 5️⃣ CONFIRMAR
- Clic en "Registrar Ingreso de Mercadería"
- Confirmar en el diálogo
- ¡Listo! Los productos se crean automáticamente

---

## ✨ QUÉ HACE EL SISTEMA AUTOMÁTICAMENTE

Para cada talla con cantidad, el sistema:

1. ✅ Genera un **SKU único** (código interno)
2. ✅ Genera un **código de barras QR** (para escanear)
3. ✅ Crea el **producto** en el catálogo
4. ✅ Registra el **stock inicial** en el almacén
5. ✅ Crea el **movimiento de entrada** en inventario
6. ✅ Guarda la **auditoría** de la operación

---

## 📊 EJEMPLO PRÁCTICO

### Ingreso de 12 Blusas Zara

**Datos**:
- Nombre: "Blusa Casual Zara"
- Línea: Mujeres
- Categoría: Blusas
- Marca: Zara
- Proveedor: Distribuidora ABC
- Color: Azul
- Precio Compra: S/ 50.00
- Margen: 50%
- Precio Venta: S/ 75.00

**Tallas**:
- S: 3 unidades
- M: 5 unidades
- L: 4 unidades

**Resultado**:
- 3 productos creados (uno por talla)
- 12 unidades en stock
- Inversión: S/ 600.00
- Venta potencial: S/ 900.00
- Ganancia: S/ 300.00

---

## ⚠️ VALIDACIONES

El sistema NO permite:
- ❌ Enviar sin al menos una talla con cantidad
- ❌ Precio de venta menor al precio de compra
- ❌ Campos requeridos vacíos
- ❌ Cantidades negativas o cero

---

## 🔍 VERIFICAR PRODUCTOS CREADOS

Después del ingreso, puedes verificar:

1. **Productos**: Ir a "Productos" → Buscar por nombre o color
2. **Inventario**: Ir a "Inventario" → Ver stock por almacén
3. **Movimientos**: Ver movimientos de tipo "ENTRADA"

---

## 💡 CONSEJOS

1. **Organiza por proveedor**: Ingresa toda la mercadería de un proveedor a la vez
2. **Verifica precios**: Asegúrate que el margen sea correcto antes de confirmar
3. **Usa descripciones**: Ayuda a identificar productos similares
4. **Revisa el resumen**: Verifica la inversión total antes de confirmar

---

## 🆘 PROBLEMAS COMUNES

### "No hay tallas disponibles"
- **Solución**: Asegúrate de haber seleccionado una categoría

### "Seleccione marca primero"
- **Solución**: Debes seleccionar una marca antes de ver proveedores

### "Error al cargar datos maestros"
- **Solución**: Verifica que existan líneas, categorías, marcas y proveedores en el sistema

---

## 📞 SOPORTE

Si tienes problemas:
1. Limpia el caché del navegador (Ctrl+Shift+Delete)
2. Prueba en modo incógnito
3. Verifica que tengas permisos de "Vendedor" o "Admin"
4. Contacta al administrador del sistema

---

**¡Listo para usar!** 🎉
