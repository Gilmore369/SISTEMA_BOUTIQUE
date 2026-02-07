# 🔍 DEBUG: Stock Bajo Muestra 0

**Problema**: Dashboard muestra 0 en "Stock Bajo" cuando debería mostrar 9  
**Estado**: 🔍 INVESTIGANDO

---

## 🐛 SÍNTOMAS

- Dashboard muestra: **Stock Bajo: 0**
- Inventario muestra: **9 productos con stock bajo** (en la tabla)
- Contradicción entre dashboard e inventario

---

## 🔧 CAMBIOS APLICADOS

### v1.8.3 - Logs Mejorados

Agregué logs detallados en `getDashboardData()` para diagnosticar:

```javascript
Logger.log('Obteniendo stock bajo...');
const inventoryService = new InventoryService();
const lowStockProducts = inventoryService.checkLowStock();

Logger.log('lowStockProducts recibidos: ' + lowStockProducts.length);
if (lowStockProducts.length > 0) {
  Logger.log('Primer producto con stock bajo: ' + JSON.stringify(lowStockProducts[0]));
}
```

---

## ⚠️ ACCIÓN REQUERIDA PARA DIAGNOSTICAR

### 1. Crear Nueva Versión v1.8.3

1. Ve a: https://script.google.com/home
2. Abre: "Adiction Boutique Suite"
3. **Implementar** → **Administrar implementaciones**
4. Clic en **lápiz** (editar)
5. Nueva descripción:
   ```
   v1.8.3 - Debug stock bajo con logs mejorados
   ```
6. **Implementar**

### 2. Limpiar Caché

1. `Ctrl + Shift + Delete`
2. Seleccionar **"Imágenes y archivos en caché"**
3. **Borrar datos**
4. Cerrar navegador

### 3. Ir al Dashboard

1. Abrir aplicación en modo incógnito
2. Ir al Dashboard
3. Esperar que cargue

### 4. Ver Logs en Apps Script

1. Abrir Apps Script Editor
2. **Ver** → **Registros de ejecución**
3. Buscar líneas que digan:
   ```
   Obteniendo stock bajo...
   lowStockProducts recibidos: X
   ```
4. **Enviarme el log completo**

---

## 🔍 POSIBLES CAUSAS

### Causa 1: Error Silencioso
- El try-catch está capturando un error
- El error no se muestra pero el count queda en 0

### Causa 2: min_stock en 0
- Los productos tienen `min_stock = 0`
- La comparación `currentStock < minStock` siempre es false

### Causa 3: Datos No Sincronizados
- El inventario muestra datos diferentes al dashboard
- Posible problema de caché o timing

---

## 🧪 PRUEBA MANUAL

### En Apps Script Editor, ejecutar:

```javascript
function testLowStock() {
  Logger.log('=== TEST LOW STOCK ===');
  
  const inventoryService = new InventoryService();
  const lowStockProducts = inventoryService.checkLowStock();
  
  Logger.log('Total productos con stock bajo: ' + lowStockProducts.length);
  
  if (lowStockProducts.length > 0) {
    Logger.log('Primeros 3 productos:');
    for (let i = 0; i < Math.min(3, lowStockProducts.length); i++) {
      Logger.log('  - ' + lowStockProducts[i].productName + 
                 ': stock=' + lowStockProducts[i].currentStock + 
                 ', min=' + lowStockProducts[i].minStock);
    }
  } else {
    Logger.log('No hay productos con stock bajo');
    
    // Verificar productos
    const productRepo = new ProductRepository();
    const products = productRepo.findAll();
    Logger.log('Total productos: ' + products.length);
    
    if (products.length > 0) {
      Logger.log('Primer producto min_stock: ' + products[0].min_stock);
    }
    
    // Verificar stock
    const stockRepo = new StockRepository();
    const stocks = stockRepo.findAll();
    Logger.log('Total registros de stock: ' + stocks.length);
    
    if (stocks.length > 0) {
      Logger.log('Primer stock quantity: ' + stocks[0].quantity);
    }
  }
}
```

---

## 📊 DATOS ESPERADOS

Según la imagen del inventario, deberías tener:

| Producto | Stock Actual | Stock Mín. | ¿Bajo? |
|----------|--------------|------------|--------|
| Pantalón Jean Skinny Mujer | 42 | 8 | ❌ No |
| Falda Plisada Midi | 39 | 7 | ❌ No |
| Blusa Floral Manga Corta | 4 | 5 | ✅ Sí |
| Polo Deportivo Hombre | 47 | 15 | ❌ No |
| Vestido Casual Verano | 19 | 6 | ❌ No |
| Camisa Formal Hombre Blanca | 21 | 10 | ❌ No |
| Blazer Formal Mujer Negro | 1 | 4 | ✅ Sí |
| Short Jean Mujer | 28 | 12 | ❌ No |

**Productos con stock bajo**: Al menos 2 (Blusa Floral y Blazer)

---

## ✅ CHECKLIST

- [ ] Nueva versión v1.8.3 creada
- [ ] Caché limpiado
- [ ] Dashboard abierto
- [ ] Logs revisados en Apps Script
- [ ] Test manual ejecutado (opcional)
- [ ] Logs enviados para análisis

---

**Necesito que me envíes los logs de Apps Script para diagnosticar el problema. 🔍**
