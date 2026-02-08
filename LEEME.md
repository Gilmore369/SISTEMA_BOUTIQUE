# 🚀 DESPLIEGUE - ADICTION BOUTIQUE SUITE

## ✅ ESTADO: LISTO PARA DESPLEGAR

El código está corregido con las siguientes mejoras:
- ✅ Redirección robusta con `window.top.location.href` (funciona en incógnito)
- ✅ Navegación refactorizada con manejo de errores
- ✅ Dashboard usa AJAX POST en lugar de `google.script.run` (evita null)
- ✅ Variables globales `USER_DATA` y `SCRIPT_URL` definidas correctamente

## 📋 PASOS PARA DESPLEGAR

### 1. Abre Google Apps Script
Ve a https://script.google.com y abre tu proyecto

### 2. Crea Nueva Implementación
1. Click en **"Implementar"** (botón azul)
2. Selecciona **"Nueva implementación"**
3. Click en el engranaje ⚙️ → **"Aplicación web"**
4. Configura:
   - Descripción: `Login v4 - Incógnito Fix`
   - Ejecutar como: `Yo`
   - Quién tiene acceso: `Cualquier persona`
5. Click en **"Implementar"**
6. **COPIA LA URL QUE TERMINA EN `/exec`**

### 3. Prueba el Login
1. Abre la URL en **modo incógnito**
2. Ingresa:
   ```
   Usuario: admin
   Contraseña: admin123
   ```
3. Click en "Iniciar Sesión"
4. Deberías ver "Redirigiendo..." y luego el dashboard
5. Si no redirige automáticamente, click en "Haz clic aquí"

## 👥 USUARIOS DISPONIBLES

```
admin / admin123
gian / gian123
vendedor / vendedor123
```

## 🔧 CAMBIOS TÉCNICOS APLICADOS

### 1. Redirección Robusta (Code.gs - doPost)
- Usa `window.top.location.href` para salir del iframe
- Incluye enlace de respaldo con `target="_top"`
- Manejo de errores con try-catch

### 2. Navegación Refactorizada (index.html)
- `window.navigateTo` más robusta con try-catch
- Captura de URLSearchParams con manejo de errores
- Preservación correcta de parámetros de sesión
- Redirección con `window.top.location.href`

### 3. Dashboard con AJAX (index.html)
- Cambio de `google.script.run` a `$.ajax POST`
- Envía `userEmail` explícitamente en el body
- Evita el problema de respuesta `null`
- Mejor manejo de errores

### 4. Variables Globales (index.html)
- `window.USER_DATA` definida al inicio
- `window.SCRIPT_URL` definida al inicio
- Disponibles para todos los módulos incluidos

## 🆘 SI NO FUNCIONA

### Error: "Redirigiendo..." se queda cargando
**Solución:** Click en el enlace "Haz clic aquí" que aparece debajo

### Error: Dashboard no carga datos
**Solución:** Abre F12 → Console y verifica errores. El dashboard ahora usa AJAX POST.

### Otros errores
Envíame:
1. La URL de tu aplicación
2. Screenshot del error
3. Logs de Google Apps Script (Ejecuciones)
4. Errores de la consola del navegador (F12)

---

**Última actualización:** Ahora
**Versión:** 4.0 - Incógnito Fix
**Cambios:** Redirección robusta + AJAX POST + Navegación refactorizada
