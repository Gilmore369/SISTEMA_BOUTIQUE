# 🔐 AUTENTICACIÓN CON BASE DE DATOS - CFG_Users

## 🎯 CAMBIO IMPLEMENTADO

El sistema ahora usa la tabla `CFG_Users` para autenticación en lugar de usuarios hardcoded.

**BENEFICIOS:**
- ✅ Puedes agregar/eliminar usuarios desde la base de datos
- ✅ Puedes cambiar contraseñas sin modificar código
- ✅ Login con email y contraseña
- ✅ Control total de accesos desde Google Sheets

---

## 📋 PASOS PARA CONFIGURAR

### 1. Subir Archivos a Google Apps Script

1. Abrir [script.google.com](https://script.google.com)
2. Abrir tu proyecto "Adiction Boutique Suite"
3. Actualizar archivos:

**Archivo 1: Code.gs**
- Abrir `Code.gs`
- Seleccionar TODO (Ctrl+A)
- Copiar contenido de `gas/Code.gs` de este proyecto
- Pegar (reemplazar todo)
- Guardar (Ctrl+S)

**Archivo 2: index.html**
- Abrir `index.html`
- Seleccionar TODO (Ctrl+A)
- Copiar contenido de `gas/index.html` de este proyecto
- Pegar (reemplazar todo)
- Guardar (Ctrl+S)

**Archivo 3: SetupPasswordColumn.gs (NUEVO)**
- Click en "+" → "Script"
- Nombrar: `SetupPasswordColumn`
- Copiar contenido de `gas/SetupPasswordColumn.gs`
- Pegar
- Guardar (Ctrl+S)

### 2. Ejecutar Setup de Base de Datos

1. En el editor de Apps Script
2. Seleccionar función: `setupPasswordColumn`
3. Click en "Ejecutar" (▶️)
4. Autorizar permisos si es necesario
5. Esperar a que termine (ver logs)

**Esto hará:**
- ✅ Agregar columna `password` a CFG_Users
- ✅ Crear/actualizar usuarios de ejemplo con contraseñas

### 3. Verificar en Google Sheets

1. Abrir tu Google Spreadsheet
2. Ir a hoja `CFG_Users`
3. Verificar que existe columna `password` (columna H)
4. Verificar que hay usuarios con contraseñas

**Usuarios creados automáticamente:**
```
Email: gianpepex@gmail.com
Password: gian123
Roles: Admin, Vendedor

Email: karianaghostimporter@gmail.com
Password: kariana123
Roles: Admin, Vendedor

Email: admin@adictionboutique.com
Password: admin123
Roles: Admin

Email: vendedor@adictionboutique.com
Password: vendedor123
Roles: Vendedor
```

### 4. Crear Nueva Implementación

1. Click "Implementar" → "Nueva implementación"
2. Configuración:
   - **Tipo:** Aplicación web
   - **Descripción:** `v4.2 - Auth con CFG_Users`
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier persona
3. Click "Implementar"
4. Copiar URL (termina en `/exec`)

### 5. Probar Login

1. Abrir URL en incógnito
2. Debería ver formulario con "Email" y "Contraseña"
3. Probar con cualquier usuario de arriba
4. Ejemplo: `gianpepex@gmail.com` / `gian123`
5. Debería ver "Login exitoso" y botón "Ir al Dashboard"
6. Click en botón → Dashboard con datos

---

## 👥 AGREGAR NUEVOS USUARIOS

### Opción 1: Desde Google Sheets (Manual)

1. Abrir Google Spreadsheet
2. Ir a hoja `CFG_Users`
3. Agregar nueva fila con:
   - **id:** `usr-[timestamp]-[random]` (ej: `usr-1707408000-123`)
   - **email:** Email del usuario
   - **name:** Nombre del usuario
   - **roles:** `["Admin"]` o `["Vendedor"]` o `["Admin", "Vendedor"]`
   - **stores:** `TIENDA_PRINCIPAL`
   - **active:** `TRUE`
   - **created_at:** Fecha actual
   - **password:** Contraseña del usuario

### Opción 2: Desde Apps Script (Programático)

Ejecutar en el editor de Apps Script:

```javascript
// Agregar nuevo usuario
addUser(
  'nuevo@ejemplo.com',      // email
  'Nombre Usuario',         // name
  'mipassword123',          // password
  ['Vendedor'],             // roles
  'TIENDA_PRINCIPAL'        // stores
);
```

---

## 🔄 CAMBIAR CONTRASEÑA DE USUARIO

### Opción 1: Desde Google Sheets

1. Abrir Google Spreadsheet
2. Ir a hoja `CFG_Users`
3. Buscar fila del usuario
4. Editar columna `password` (columna H)
5. Guardar

### Opción 2: Desde Apps Script

Ejecutar en el editor:

```javascript
// Cambiar contraseña
updateUserPassword(
  'usuario@ejemplo.com',    // email
  'nuevapassword123'        // nueva contraseña
);
```

---

## 🚫 DESACTIVAR USUARIO

1. Abrir Google Spreadsheet
2. Ir a hoja `CFG_Users`
3. Buscar fila del usuario
4. Cambiar columna `active` a `FALSE`
5. El usuario ya no podrá hacer login

---

## ✅ VERIFICACIÓN

Después de configurar, verificar:

- [ ] Columna `password` existe en CFG_Users
- [ ] Usuarios de ejemplo tienen contraseñas
- [ ] Login muestra "Email" en lugar de "Usuario"
- [ ] Login con email correcto funciona
- [ ] Login con email incorrecto muestra error
- [ ] Login con contraseña incorrecta muestra error
- [ ] Dashboard carga datos correctamente
- [ ] Navegación funciona

---

## 🔒 SEGURIDAD

**IMPORTANTE:**
- Las contraseñas se almacenan en texto plano en Google Sheets
- Solo usuarios con acceso al Spreadsheet pueden ver contraseñas
- Configura permisos del Spreadsheet correctamente
- No compartas el link del Spreadsheet públicamente

**Recomendaciones:**
- Usa contraseñas únicas para cada usuario
- Cambia contraseñas periódicamente
- Desactiva usuarios que ya no necesitan acceso
- Revisa logs de acceso en hoja `AUD_Log`

---

## 📊 ESTRUCTURA DE CFG_Users

| Columna | Nombre | Tipo | Descripción |
|---------|--------|------|-------------|
| A | id | String | ID único del usuario |
| B | email | String | Email (usado para login) |
| C | name | String | Nombre del usuario |
| D | roles | JSON | Roles: `["Admin"]`, `["Vendedor"]`, etc. |
| E | stores | String | Tiendas asignadas |
| F | active | Boolean | TRUE = activo, FALSE = inactivo |
| G | created_at | Date | Fecha de creación |
| H | password | String | Contraseña (texto plano) |

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "Email o contraseña incorrectos"
- Verificar que el email existe en CFG_Users
- Verificar que la contraseña coincide exactamente
- Verificar que `active` = TRUE
- Verificar que la columna `password` tiene valor

### "Usuario no tiene contraseña configurada"
- Ejecutar `setupPasswordColumn()` nuevamente
- O agregar contraseña manualmente en Google Sheets

### "Hoja CFG_Users no encontrada"
- Verificar que existe la hoja `CFG_Users` en el Spreadsheet
- Verificar que `SPREADSHEET_ID` en `Const.gs` es correcto

---

**Versión:** 4.2 - Auth con CFG_Users
**Fecha:** 8 de Febrero 2026
**Cambio:** Autenticación desde base de datos en lugar de hardcoded
