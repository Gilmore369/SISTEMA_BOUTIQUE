# Solución: Errores 500, DataTables y Estabilización General

## Fecha: 2026-02-06

## Problemas Identificados y Solucionados

### 1. ✅ Dashboard - Cards como Botones de Navegación

**Problema**: Las cards del dashboard eran estáticas, no permitían navegación rápida.

**Solución Implementada**:
- Agregado `cursor: pointer` y `onclick` a cada card
- **Ventas Hoy**: Navega a `reports` (página de reportes)
- **Cobros Hoy**: Navega a `collections` (cobranzas)
- **Stock Bajo**: Navega a `inventory` con parámetro `filter=low_stock`
- **Cuotas Vencidas**: Navega a `collections` con parámetro `tab=overdue`
- Agregado efecto hover con `transform: scale(1.05)` para feedback visual

**Código**:
```html
<div class="card dashboard-card" style="cursor: pointer;" onclick="navigateTo('reports')">
  <div class="card-body">
    <h5 class="card-title"><i class="bi bi-cart-check"></i> Ventas Hoy</h5>
    <p class="card-text display-6" id="salesTodayAmount">S/ 0.00</p>
    <small class="text-white-50">Click para ver detalle</small>
  </div>
</div>
```

### 2. ✅ Dashboard - Carga Dinámica de Datos

**Problema**: Las cards mostraban valores estáticos (S/ 0.00, 0).

**Solución Implementada**:
- Creada función `getDashboardData()` en `Code.gs` que obtiene:
  - Ventas de hoy (suma de ventas del día actual)
  - Cobros de hoy (suma de pagos del día actual)
  - Productos con stock bajo (usando `InventoryService.checkLowStock()`)
  - Cuotas vencidas (conteo de installments con fecha vencida)
  - Últimas 10 ventas para la tabla
- Agregada función `loadDashboardData()` en `index.html` que usa `google.script.run`
- Los datos se cargan automáticamente al abrir el dashboard
- Manejo robusto de errores con try-catch en cada sección

**Características**:
- Si falla una sección, las demás continúan cargando
- Valores por defecto (0) si no hay datos
- Normalización de fechas para comparación correcta
- Logs detallados para debugging

### 3. ✅ Variable SCRIPT_URL Global

**Problema**: Los módulos incluidos (ClientList.html, etc.) no tenían acceso a `SCRIPT_URL`.

**Solución Implementada**:
- `SCRIPT_URL` ahora es global: `window.SCRIPT_URL = '<?= scriptUrl ?>'`
- Los módulos incluidos acceden con: `const SCRIPT_URL = window.SCRIPT_URL || window.parent.SCRIPT_URL`
- Validación de existencia con mensaje de error si no está definido
- Todas las llamadas AJAX usan `SCRIPT_URL` en lugar de URLs relativas

**Beneficios**:
- Funciona en desarrollo (googleusercontent.com) y producción
- No hay problemas de CORS o URLs incorrectas
- Fácil debugging con logs de la URL usada

### 4. ✅ DataTables - Manejo Robusto de Errores AJAX

**Problema**: DataTables mostraba "Ajax error /tn/7" cuando la respuesta no era válida.

**Solución Implementada en ClientList.html**:

```javascript
ajax: {
  url: SCRIPT_URL,
  type: 'POST',
  data: function(d) {
    return {
      action: 'getClients',
      search: $('#filterSearch').val(),
      status: $('#filterStatus').val()
    };
  },
  dataSrc: function(json) {
    console.log('Respuesta del servidor:', json);
    
    // Manejar diferentes formatos de respuesta
    if (!json) {
      console.error('Respuesta vacía del servidor');
      return [];
    }
    
    // Formato {ok: true, data: [...]}
    if (json.ok === true && json.data) {
      return Array.isArray(json.data) ? json.data : [];
    }
    
    // Formato {success: true, data: [...]}
    if (json.success === true && json.data) {
      return Array.isArray(json.data) ? json.data : [];
    }
    
    // Respuesta directa como array
    if (Array.isArray(json)) {
      return json;
    }
    
    // Si hay error
    if (json.error || json.ok === false || json.success === false) {
      console.error('Error en respuesta:', json.error || 'Error desconocido');
      return [];
    }
    
    console.error('Formato de respuesta no reconocido:', json);
    return [];
  },
  error: function(xhr, error, thrown) {
    console.error('Error AJAX:', error, thrown);
    console.error('XHR:', xhr);
    alert('Error al cargar clientes. Por favor, recargue la página.');
  }
}
```

**Características**:
- Maneja múltiples formatos de respuesta del servidor
- Siempre retorna un array (nunca null o undefined)
- Logs detallados para debugging
- Alerta amigable al usuario en caso de error crítico
- No rompe la interfaz si falla la carga

### 5. ✅ Normalización de Fechas en Respuestas

**Problema**: Los objetos Date de Google Sheets no se serializan correctamente a JSON.

**Solución Ya Implementada** (de la corrección anterior):
- `handleClientAction()` normaliza Date objects a ISO strings
- `getClients()` normaliza Date objects a ISO strings
- `getDashboardData()` normaliza todas las fechas antes de retornar

**Código de normalización**:
```javascript
const normalizedClients = filteredClients.map(function(client) {
  const normalized = {};
  for (const key in client) {
    if (client.hasOwnProperty(key)) {
      const value = client[key];
      if (value instanceof Date) {
        normalized[key] = value.toISOString();
      } else {
        normalized[key] = value;
      }
    }
  }
  return normalized;
});
```

### 6. ✅ Función navigateTo() Mejorada

**Problema**: No se podían pasar parámetros adicionales en la navegación.

**Solución Implementada**:
```javascript
function navigateTo(page, params) {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionEmail = urlParams.get('sessionEmail');
  
  let newUrl = SCRIPT_URL + '?page=' + page;
  
  // Preservar sessionEmail
  if (sessionEmail) {
    newUrl += '&sessionEmail=' + encodeURIComponent(sessionEmail);
  }
  
  // Agregar parámetros adicionales
  if (params) {
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        newUrl += '&' + key + '=' + encodeURIComponent(params[key]);
      }
    }
  }
  
  window.top.location.href = newUrl;
}

// Funciones específicas
function navigateToLowStock() {
  navigateTo('inventory', { filter: 'low_stock' });
}

function navigateToOverdue() {
  navigateTo('collections', { tab: 'overdue' });
}
```

### 7. ✅ Try-Catch en getDashboardData()

**Problema**: Errores 500 cuando falla alguna consulta al cargar el dashboard.

**Solución Implementada**:
- Try-catch global en `getDashboardData()`
- Try-catch individual para cada sección (ventas, cobros, stock, cuotas)
- Si falla una sección, las demás continúan
- Retorna valores por defecto en caso de error
- Logs detallados de cada error

**Estructura**:
```javascript
function getDashboardData() {
  try {
    const dashboardData = {
      salesToday: 0,
      collectionsToday: 0,
      lowStockCount: 0,
      overdueCount: 0,
      recentSales: []
    };
    
    // 1. Ventas de hoy
    try {
      // ... código ...
    } catch (e) {
      Logger.log('Error al obtener ventas: ' + e.message);
      // Continuar con valor por defecto
    }
    
    // 2. Cobros de hoy
    try {
      // ... código ...
    } catch (e) {
      Logger.log('Error al obtener cobros: ' + e.message);
      // Continuar con valor por defecto
    }
    
    // ... más secciones ...
    
    return {
      success: true,
      data: dashboardData
    };
    
  } catch (error) {
    Logger.log('ERROR CRÍTICO: ' + error.message);
    return {
      success: false,
      error: error.message,
      data: { /* valores por defecto */ }
    };
  }
}
```

## Archivos Modificados

### 1. gas/index.html
- ✅ Cards del dashboard con onclick y cursor pointer
- ✅ IDs agregados a los elementos de las cards para actualización dinámica
- ✅ SCRIPT_URL como variable global (window.SCRIPT_URL)
- ✅ Función `navigateTo()` mejorada con soporte para parámetros
- ✅ Funciones `navigateToLowStock()` y `navigateToOverdue()`
- ✅ Función `loadDashboardData()` para cargar datos del servidor
- ✅ Función `updateRecentSalesTable()` para actualizar tabla de ventas
- ✅ Efecto hover en las cards del dashboard
- ✅ Carga automática de datos al abrir dashboard

### 2. gas/Code.gs
- ✅ Función `getDashboardData()` agregada con try-catch robusto
- ✅ Normalización de fechas ya implementada en `handleClientAction()`
- ✅ Normalización de fechas ya implementada en `getClients()`

### 3. gas/ClientList.html
- ✅ SCRIPT_URL obtenido del contexto global
- ✅ Validación de existencia de SCRIPT_URL
- ✅ Manejo robusto de respuestas AJAX en DataTables
- ✅ Soporte para múltiples formatos de respuesta
- ✅ Error handler con alerta amigable
- ✅ Logs detallados para debugging
- ✅ Uso de SCRIPT_URL en funciones de navegación

## Pendientes para Otros Módulos

### Collections.html
- [ ] Agregar `const SCRIPT_URL = window.SCRIPT_URL || window.parent.SCRIPT_URL`
- [ ] Actualizar llamadas AJAX para usar SCRIPT_URL
- [ ] Implementar manejo robusto de errores en DataTables
- [ ] Agregar soporte para parámetro `tab=overdue`

### InventoryReport.html
- [ ] Agregar `const SCRIPT_URL = window.SCRIPT_URL || window.parent.SCRIPT_URL`
- [ ] Actualizar llamadas AJAX para usar SCRIPT_URL
- [ ] Implementar manejo robusto de errores en DataTables
- [ ] Agregar soporte para parámetro `filter=low_stock`

### POS.html
- [ ] Agregar `const SCRIPT_URL = window.SCRIPT_URL || window.parent.SCRIPT_URL`
- [ ] Actualizar llamadas google.script.run
- [ ] Eliminar atributo `autofocus` de inputs (bloqueado por Google)
- [ ] Asegurar que `userName` se muestre correctamente

## Pasos para Desplegar

### 1. Verificar Cambios Locales
```bash
# En la carpeta gas/
# Verificar que los archivos modificados estén guardados:
# - index.html
# - Code.gs
# - ClientList.html
```

### 2. Desplegar a Apps Script
1. Abrir https://script.google.com
2. Abrir proyecto "Adiction Boutique Suite"
3. Verificar que los cambios estén sincronizados
4. Ir a **Implementar** > **Administrar implementaciones**
5. Click en el ícono de lápiz (editar)
6. Seleccionar **Nueva versión**
7. Descripción: "Fix: Error 500, DataTables, Dashboard dinámico"
8. Click en **Implementar**

### 3. Probar Funcionalidades

#### Dashboard:
- [ ] Las cards muestran datos reales (no S/ 0.00)
- [ ] Click en "Ventas Hoy" navega a reportes
- [ ] Click en "Cobros Hoy" navega a cobranzas
- [ ] Click en "Stock Bajo" navega a inventario con filtro
- [ ] Click en "Cuotas Vencidas" navega a cobranzas con tab
- [ ] La tabla de "Últimas Ventas" muestra datos reales
- [ ] Efecto hover funciona en las cards

#### Clientes:
- [ ] La tabla carga sin errores de DataTables
- [ ] Los datos se muestran correctamente
- [ ] Los filtros funcionan
- [ ] Los botones de "Ver" y "Editar" funcionan
- [ ] No hay errores en la consola

#### Navegación:
- [ ] Todas las páginas cargan correctamente
- [ ] No hay errores 500
- [ ] La URL se mantiene correcta (no googleusercontent.com)
- [ ] El sessionEmail se preserva en la navegación

## Verificación de Logs

### En la Consola del Navegador (F12):
```
Script URL (desde servidor): https://script.google.com/macros/s/...
Window location: https://script.google.com/macros/s/...
User data: {name: "...", email: "...", roles: [...]}
Sistema cargado. Página actual: dashboard
Cargando datos del dashboard...
Dashboard data recibida: {success: true, data: {...}}
```

### En Apps Script (Ver > Registros de ejecución):
```
=== getDashboardData START ===
Ventas hoy: S/ 1250.00
Cobros hoy: S/ 500.00
Productos con stock bajo: 3
Cuotas vencidas: 5
=== getDashboardData END ===
```

## Beneficios de las Correcciones

### 1. Estabilidad
- ✅ No más errores 500 por falta de try-catch
- ✅ Manejo robusto de errores en todas las llamadas AJAX
- ✅ Valores por defecto si falla alguna consulta

### 2. Usabilidad
- ✅ Dashboard interactivo con navegación rápida
- ✅ Datos en tiempo real en las cards
- ✅ Feedback visual con efectos hover
- ✅ Alertas amigables en caso de error

### 3. Mantenibilidad
- ✅ SCRIPT_URL centralizado y global
- ✅ Código reutilizable para otros módulos
- ✅ Logs detallados para debugging
- ✅ Estructura clara y documentada

### 4. Rendimiento
- ✅ Carga asíncrona de datos del dashboard
- ✅ No bloquea la interfaz mientras carga
- ✅ Manejo eficiente de errores sin recargar página

## Próximos Pasos

1. **Aplicar correcciones similares a otros módulos**:
   - Collections.html
   - InventoryReport.html
   - POS.html
   - Cash.html
   - SalesReport.html

2. **Implementar funcionalidades pendientes**:
   - Filtro de stock bajo en inventario
   - Tab de cuotas vencidas en cobranzas
   - Detalle de ventas desde el dashboard

3. **Optimizaciones**:
   - Caché de datos del dashboard (actualizar cada 5 minutos)
   - Lazy loading de tablas grandes
   - Paginación server-side para tablas con muchos datos

## Notas Técnicas

### Por qué SCRIPT_URL es Global
- Los módulos incluidos con `<?!= include('...') ?>` se ejecutan en el contexto del iframe
- No tienen acceso directo a las variables del template del servidor
- Al hacer `window.SCRIPT_URL`, se vuelve accesible desde cualquier script

### Por qué Normalizar Fechas
- Google Sheets retorna objetos Date nativos de JavaScript
- `JSON.stringify()` no puede serializar Date objects correctamente
- La conversión a ISO string es el estándar para APIs REST

### Por qué Try-Catch Individual
- Si falla una sección del dashboard, las demás deben continuar
- Mejor experiencia de usuario: datos parciales > error completo
- Facilita identificar qué sección específica está fallando

## Contacto y Soporte

Si encuentras problemas después de aplicar estas correcciones:

1. **Verificar consola del navegador** (F12 > Console)
   - Buscar errores en rojo
   - Verificar que SCRIPT_URL esté definido
   - Verificar respuestas de llamadas AJAX

2. **Verificar logs de Apps Script** (Ver > Registros de ejecución)
   - Buscar errores en getDashboardData
   - Verificar que los repositorios funcionen
   - Verificar normalización de fechas

3. **Verificar despliegue**
   - Asegurarse de haber creado una nueva versión
   - No solo guardar, sino desplegar
   - Limpiar caché del navegador (Ctrl+Shift+R)

---

**Autor**: Kiro AI Assistant  
**Fecha**: 2026-02-06  
**Versión**: 1.0
