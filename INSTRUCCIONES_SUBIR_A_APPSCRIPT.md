# 📤 INSTRUCCIONES PARA SUBIR A GOOGLE APPS SCRIPT

## ✅ ARCHIVOS MODIFICADOS QUE DEBES ACTUALIZAR

### 1. **gas/Code.gs**
- ✅ Redirección robusta en `doPost` con `window.top.location.href`
- ✅ Enlace de respaldo con `target="_top"`

### 2. **gas/index.html**
- ✅ Navegación refactorizada con manejo de errores
- ✅ Dashboard usa AJAX POST en lugar de `google.script.run`
- ✅ Variables globales definidas correctamente

## 📋 PASOS PARA SUBIR MANUALMENTE

### Opción A: Copiar y Pegar (Recomendado)

1. **Abre Google Apps Script**
   - Ve a https://script.google.com
   - Abre tu proyecto "Adiction Boutique Suite"

2. **Actualiza Code.gs**
   - En el editor, busca el archivo `Code.gs`
   - Abre el archivo `gas/Code.gs` de tu computadora
   - Copia TODO el contenido
   - Pega en Google Apps Script (reemplaza todo)
   - Click en "Guardar" (Ctrl+S)

3. **Actualiza index.html**
   - En el editor, busca el archivo `index.html`
   - Abre el archivo `gas/index.html` de tu computadora
   - Copia TODO el contenido
   - Pega en Google Apps Script (reemplaza todo)
   - Click en "Guardar" (Ctrl+S)

4. **Verifica que no haya errores**
   - Google Apps Script te mostrará errores de sintaxis si los hay
   - Si todo está bien, no verás mensajes de error

### Opción B: Usar clasp (Avanzado)

Si quieres usar clasp en el futuro:

1. **Instala Node.js** (si no lo tienes)
   - Ve a https://nodejs.org
   - Descarga e instala la versión LTS

2. **Instala clasp**
   ```bash
   npm install -g @google/clasp
   ```

3. **Inicia sesión**
   ```bash
   clasp login
   ```

4. **Sube los cambios**
   ```bash
   cd gas
   clasp push
   ```

## 🚀 DESPUÉS DE SUBIR

### 1. Crea Nueva Implementación

**IMPORTANTE:** NO actualices la implementación existente, crea una NUEVA

1. Click en **"Implementar"** (botón azul arriba a la derecha)
2. Selecciona **"Nueva implementación"**
3. Click en el engranaje ⚙️
4. Selecciona **"Aplicación web"**
5. Configura:
   ```
   Descripción: Login v4 - Incógnito Fix
   Ejecutar como: Yo (tu email)
   Quién tiene acceso: Cualquier persona
   ```
6. Click en **"Implementar"**
7. **COPIA LA URL QUE TERMINA EN `/exec`**

### 2. Prueba en Modo Incógnito

1. Abre la URL en una ventana de incógnito
2. Deberías ver el formulario de login
3. Ingresa: `admin` / `admin123`
4. Click en "Iniciar Sesión"
5. Deberías ver "Redirigiendo..." con un spinner
6. Si no redirige automáticamente, click en "Haz clic aquí"
7. Deberías ver el dashboard

## ✅ VERIFICACIÓN

### Checklist antes de probar:

- [ ] Actualicé `Code.gs` en Google Apps Script
- [ ] Actualicé `index.html` en Google Apps Script
- [ ] Guardé ambos archivos (Ctrl+S)
- [ ] No hay errores de sintaxis en el editor
- [ ] Creé una NUEVA implementación (no actualicé la existente)
- [ ] Copié la URL que termina en `/exec`
- [ ] Voy a probar en modo incógnito

## 🔍 QUÉ CAMBIÓ (VERSIÓN FINAL)

### En Code.gs (función doPost):

**PROBLEMA:** `<meta refresh>` bloqueado en iframes en modo incógnito

**SOLUCIÓN:**
```javascript
// HTML simple con window.top.location.href
const html = '<html><body>' +
  '<p>Iniciando sesión, por favor espere...</p>' +
  '<script>window.top.location.href = "' + redirectUrl + '";</script>' +
  '<noscript><meta http-equiv="refresh" content="0;url=' + redirectUrl + '"></noscript>' +
  '<p>Si no es redirigido automáticamente, <a href="' + redirectUrl + '" target="_top">haga clic aquí</a>.</p>' +
  '</body></html>';
```

**POR QUÉ FUNCIONA:**
- `window.top.location.href` fuerza salida del iframe
- `target="_top"` en enlace de respaldo
- `<noscript>` como fallback

### En index.html (función navigateTo):

**ANTES:**
```javascript
window.navigateTo = function(page, params) {
  const urlParams = new URLSearchParams(window.location.search);
  // ...
  window.top.location.href = newUrl;
};
```

**AHORA:**
```javascript
window.navigateTo = function(page, params) {
  try {
    let urlParams;
    try {
      urlParams = new URLSearchParams(window.location.search);
    } catch(e) {
      urlParams = new URLSearchParams();
    }
    // ...
    try {
      if (window.top && window.top.location) {
        window.top.location.href = newUrl;
      } else {
        window.location.href = newUrl;
      }
    } catch(e) {
      window.location.href = newUrl;
    }
  } catch(error) {
    alert('Error al navegar. Por favor, recarga la página.');
  }
};
```

### En index.html (función loadDashboardData):

**ANTES:**
```javascript
google.script.run
  .withSuccessHandler(function(response) { ... })
  .getDashboardData();
```

**AHORA:**
```javascript
$.ajax({
  url: window.SCRIPT_URL,
  type: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({
    action: 'getDashboardData',
    payload: { userEmail: window.USER_DATA.email }
  }),
  success: function(response) { ... }
});
```

## 🆘 SI TIENES PROBLEMAS

### Error al pegar el código:
- Asegúrate de seleccionar TODO el contenido del archivo
- Usa Ctrl+A para seleccionar todo en Google Apps Script
- Luego pega con Ctrl+V

### Error de sintaxis:
- Verifica que copiaste TODO el archivo completo
- No debe faltar ninguna llave `}` o paréntesis `)`

### No encuentras el archivo:
- En Google Apps Script, los archivos están en el panel izquierdo
- Si no ves `index.html`, búscalo en la lista de archivos

---

**Última actualización:** Ahora
**Versión:** 4.0 - Incógnito Fix
