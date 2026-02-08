# ⚠️ INSTRUCCIONES URGENTES - SUBIR ARCHIVOS

## PROBLEMA ACTUAL

El error "jQuery no está disponible para POS" significa que **NO subiste el archivo POS.html actualizado** a Apps Script.

El archivo que está en el servidor todavía tiene las líneas viejas que causan el conflicto.

---

## SOLUCIÓN: SUBIR ARCHIVOS CORRECTAMENTE

### Paso 1: Abrir Apps Script
1. Ve a https://script.google.com
2. Abre tu proyecto "Adiction Boutique Suite"

### Paso 2: Subir POS.html
1. En el panel izquierdo, busca el archivo **POS.html**
2. Haz click en **POS.html** para abrirlo
3. **SELECCIONA TODO EL CONTENIDO** (Ctrl+A o Cmd+A)
4. **BORRA TODO** (Delete)
5. Abre el archivo `gas/POS.html` de tu computadora (el que yo arreglé)
6. **COPIA TODO EL CONTENIDO** del archivo local
7. **PEGA** en el editor de Apps Script
8. **GUARDA** (Ctrl+S o el ícono de disquete)

### Paso 3: Subir ClientList.html
1. En el panel izquierdo, busca el archivo **ClientList.html**
2. Haz click en **ClientList.html** para abrirlo
3. **SELECCIONA TODO EL CONTENIDO** (Ctrl+A o Cmd+A)
4. **BORRA TODO** (Delete)
5. Abre el archivo `gas/ClientList.html` de tu computadora
6. **COPIA TODO EL CONTENIDO** del archivo local
7. **PEGA** en el editor de Apps Script
8. **GUARDA** (Ctrl+S o el ícono de disquete)

### Paso 4: Subir Util.gs
1. En el panel izquierdo, busca el archivo **Util.gs**
2. Haz click en **Util.gs** para abrirlo
3. **SELECCIONA TODO EL CONTENIDO** (Ctrl+A o Cmd+A)
4. **BORRA TODO** (Delete)
5. Abre el archivo `gas/Util.gs` de tu computadora
6. **COPIA TODO EL CONTENIDO** del archivo local
7. **PEGA** en el editor de Apps Script
8. **GUARDA** (Ctrl+S o el ícono de disquete)

### Paso 5: Verificar que se Guardó
1. Espera a que aparezca el mensaje "Guardado" o "Saved"
2. Cierra y vuelve a abrir cada archivo para verificar que los cambios están ahí

---

## VERIFICACIÓN

### Verificar POS.html
Abre `POS.html` en Apps Script y busca la línea que dice:

```html
<script>
  // Global variables
  let cart = [];
```

**DEBE ESTAR ASÍ** (sin las líneas de jQuery antes):
```html
</div>

<script>
  // Global variables
  let cart = [];
```

**NO DEBE ESTAR ASÍ** (con jQuery duplicado):
```html
</div>

<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<script>
  // Global variables
  let cart = [];
```

Si ves las líneas de jQuery, significa que NO subiste el archivo correcto.

---

## DESPUÉS DE SUBIR

1. **Recargar la página** del navegador (F5 o Ctrl+R)
2. **Limpiar caché** (Ctrl+Shift+R o Cmd+Shift+R)
3. **Probar de nuevo**:
   - Ir a Punto de Venta
   - Abrir consola (F12)
   - Verificar que NO aparece "jQuery no está disponible"
   - Crear una venta
   - Debe funcionar correctamente

---

## SI SIGUE SIN FUNCIONAR

Si después de subir los archivos correctamente sigue apareciendo el error:

1. **Crear NUEVO deployment**:
   - En Apps Script, click en "Implementar" → "Nueva implementación"
   - Tipo: "Aplicación web"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquier persona"
   - Click en "Implementar"
   - **COPIAR LA NUEVA URL** (debe terminar en `/exec`)
   - **USAR ESA URL** en lugar de la anterior

2. **Limpiar caché del navegador**:
   - Chrome: Configuración → Privacidad → Borrar datos de navegación
   - Seleccionar "Imágenes y archivos en caché"
   - Borrar

---

## RESUMEN

**LO MÁS IMPORTANTE**: 
- Debes **COPIAR Y PEGAR** el contenido completo de cada archivo
- NO solo guardar el archivo en tu computadora
- Debes **REEMPLAZAR** el contenido en Apps Script
- Debes **GUARDAR** en Apps Script
- Debes **RECARGAR** la página del navegador después

**Si no haces esto, los cambios NO se aplicarán.**
