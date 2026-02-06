# Adiction Boutique Suite - Google Apps Script

Sistema integral de gestión para tiendas de ropa construido 100% con Google Apps Script.

## 📋 Estructura del Proyecto

```
gas/
├── Code.gs          - Punto de entrada (doGet, doPost)
├── Const.gs         - Constantes del sistema
├── README.md        - Este archivo
└── (más archivos se agregarán en siguientes iteraciones)
```

## 🚀 Configuración Inicial

### Paso 1: Crear el Proyecto de Apps Script

1. Ve a [Google Apps Script](https://script.google.com/)
2. Crea un nuevo proyecto
3. Nombra el proyecto: "Adiction Boutique Suite"

### Paso 2: Copiar los Archivos

1. Copia el contenido de `Const.gs` a un nuevo archivo en Apps Script
2. Copia el contenido de `Code.gs` a un nuevo archivo en Apps Script
3. Guarda todos los archivos

### Paso 3: Crear el Google Spreadsheet

1. Crea un nuevo Google Spreadsheet
2. Nómbralo: "Adiction Boutique DB"
3. Copia el ID del spreadsheet desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```
4. Actualiza la constante `SPREADSHEET_ID` en `Const.gs`

### Paso 4: Configurar Permisos

El proyecto requiere los siguientes permisos de Google:

#### 1. Google Sheets API
- **Propósito**: Leer y escribir en hojas de cálculo (base de datos)
- **Scope**: `https://www.googleapis.com/auth/spreadsheets`

#### 2. Google Drive API
- **Propósito**: Crear y leer archivos (PDFs, imágenes de DNI, comprobantes)
- **Scope**: `https://www.googleapis.com/auth/drive.file`

#### 3. Gmail API
- **Propósito**: Enviar emails con adjuntos (facturas, recibos)
- **Scope**: `https://www.googleapis.com/auth/gmail.send`

#### 4. Script Service
- **Propósito**: Obtener información del usuario actual
- **Scope**: `https://www.googleapis.com/auth/script.external_request`

**Nota**: Los permisos se solicitarán automáticamente la primera vez que ejecutes el script.

### Paso 5: Publicar como Web App

1. En el editor de Apps Script, haz clic en **Implementar** > **Nueva implementación**
2. Selecciona tipo: **Aplicación web**
3. Configuración:
   - **Descripción**: "Adiction Boutique Suite v1.0"
   - **Ejecutar como**: "Yo (tu email)"
   - **Quién tiene acceso**: "Cualquier usuario con el vínculo"
4. Haz clic en **Implementar**
5. Copia la URL de la aplicación web

### Paso 6: Probar la Instalación

1. En el editor de Apps Script, selecciona la función `testDoGet`
2. Haz clic en **Ejecutar**
3. Autoriza los permisos cuando se soliciten
4. Revisa los logs para verificar que funciona correctamente
5. Repite con la función `testDoPost`

### Paso 7: Acceder a la Aplicación

1. Abre la URL de la aplicación web en tu navegador
2. Deberías ver la página de bienvenida
3. Verifica que tu email aparece correctamente

## 📝 Próximos Pasos

Esta es la configuración base del proyecto. En las siguientes iteraciones se implementarán:

- [ ] Router completo con manejo de rutas
- [ ] AuthService con allowlist y roles
- [ ] Plantilla de Google Sheets con todas las hojas
- [ ] Layout Bootstrap con sidebar/topbar
- [ ] Repositorios para acceso a datos
- [ ] Servicios de negocio (POS, Inventario, Crédito, etc.)
- [ ] Vistas de usuario con DataTables

## 🔧 Desarrollo

### Ejecutar Pruebas

Desde el editor de Apps Script:

```javascript
// Probar doGet
testDoGet()

// Probar doPost
testDoPost()
```

### Ver Logs

1. En el editor de Apps Script, haz clic en **Ejecuciones**
2. Selecciona una ejecución para ver los logs detallados

### Actualizar la Implementación

Después de hacer cambios:

1. Haz clic en **Implementar** > **Administrar implementaciones**
2. Haz clic en el ícono de editar (lápiz)
3. Cambia la versión a "Nueva versión"
4. Haz clic en **Implementar**

## 📚 Documentación

- [Requisitos del Sistema](../../.kiro/specs/adiction-boutique-suite/requirements.md)
- [Diseño del Sistema](../../.kiro/specs/adiction-boutique-suite/design.md)
- [Plan de Tareas](../../.kiro/specs/adiction-boutique-suite/tasks.md)
- [Reglas de Desarrollo](../../REGLAS.MD)

## 🆘 Solución de Problemas

### Error: "No se puede encontrar el spreadsheet"

- Verifica que el `SPREADSHEET_ID` en `Const.gs` sea correcto
- Asegúrate de que el spreadsheet existe y tienes acceso

### Error: "Permisos insuficientes"

- Ejecuta las funciones de prueba desde el editor
- Autoriza todos los permisos solicitados
- Vuelve a intentar

### Error: "Usuario no autorizado"

- La allowlist aún no está implementada
- Esto se configurará en la siguiente iteración

## 📄 Licencia

Proyecto privado - Adiction Boutique

## 👥 Contacto

Para soporte, contacta al administrador del sistema.
