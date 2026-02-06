# Testing Router Integration with AuthService

## Tarea 12: Integrar router con AuthService y layout

### Cambios Implementados

#### 1. Modificación de doGet() para validar autenticación
- ✅ Agregada validación con `AuthService.isUserAllowed()` antes de renderizar
- ✅ Registro de intentos de acceso (exitosos y fallidos) con `authService.logAccess()`
- ✅ Manejo de acción especial `?action=logout`

#### 2. Página de acceso denegado
- ✅ Implementada función `renderAccessDenied(userEmail)`
- ✅ Diseño Bootstrap 5 con mensaje claro en español (es-PE)
- ✅ Muestra el email del usuario que intentó acceder
- ✅ Instrucciones para contactar al administrador

#### 3. Pasar datos de usuario al layout
- ✅ Modificado `routeGet()` para obtener roles del usuario
- ✅ Creado objeto `userData` con email, name y roles
- ✅ Actualizado `renderDashboard()` para usar template HTML
- ✅ Template recibe: `userName`, `userEmail`, `userRoles`, `currentPage`
- ✅ Actualizado `index.html` para mostrar datos del usuario en topbar
- ✅ Agregado objeto JavaScript `USER_DATA` en el cliente

#### 4. Implementación de logout
- ✅ Implementada función `renderLogout(userEmail)`
- ✅ Diseño Bootstrap 5 con confirmación de cierre de sesión
- ✅ Botón para volver a iniciar sesión
- ✅ Manejo en `doGet()` del parámetro `?action=logout`

#### 5. Servir index.html desde gas/ui/index.html
- ✅ `renderDashboard()` ahora carga el template desde `ui/index.html`
- ✅ Template evaluado con datos del servidor
- ✅ Fallback a página simple si hay error

### Flujo de Autenticación

```
Usuario accede → doGet()
                   ↓
         ¿action=logout? → Sí → renderLogout()
                   ↓ No
         AuthService.isUserAllowed()
                   ↓
         ¿Permitido? → No → renderAccessDenied()
                   ↓ Sí
         authService.logAccess(true)
                   ↓
         routeGet() → Obtener roles
                   ↓
         renderDashboard(userData)
                   ↓
         Template con datos de usuario
```

### Requisitos Validados

- **Requisito 1.1**: ✅ Validación de usuario en allowlist
- **Requisito 1.2**: ✅ Denegación de acceso con mensaje de error
- **Requisito 1.3**: ✅ Carga de roles del usuario
- **Requisito 1.4**: ✅ Registro de intentos de acceso en auditoría

### Pruebas Necesarias

#### Prueba 1: Usuario Autorizado
1. Asegurarse de que existe un usuario en CFG_Users con `active=TRUE`
2. Acceder al WebApp con esa cuenta Google
3. **Resultado esperado**: 
   - Se muestra el dashboard
   - El nombre del usuario aparece en el topbar
   - Se registra un acceso exitoso en AUD_Log

#### Prueba 2: Usuario No Autorizado
1. Acceder al WebApp con una cuenta Google que NO está en CFG_Users
2. **Resultado esperado**:
   - Se muestra la página "Acceso Denegado"
   - Se muestra el email del usuario
   - Se registra un acceso fallido en AUD_Log

#### Prueba 3: Usuario Inactivo
1. Crear un usuario en CFG_Users con `active=FALSE`
2. Acceder al WebApp con esa cuenta
3. **Resultado esperado**:
   - Se muestra la página "Acceso Denegado"
   - Se registra un acceso fallido en AUD_Log

#### Prueba 4: Logout
1. Estando autenticado, hacer clic en "Cerrar Sesión"
2. **Resultado esperado**:
   - Se muestra la página "Sesión Cerrada"
   - Botón para volver a iniciar sesión funciona

#### Prueba 5: Datos de Usuario en Template
1. Acceder como usuario autorizado
2. Abrir la consola del navegador
3. **Resultado esperado**:
   - Se ve el objeto `USER_DATA` con email, name y roles
   - El nombre del usuario aparece en el dropdown del topbar
   - El email aparece en el header del dropdown

### Comandos de Prueba en Apps Script

```javascript
// Probar AuthService
testAuthService();

// Probar doGet con usuario autorizado
// (ejecutar desde el navegador accediendo al WebApp)

// Verificar entradas de auditoría
function checkAuditLog() {
  const auditRepo = new AuditRepository();
  const entries = auditRepo.findByFilters({
    entityType: 'AUTH'
  });
  Logger.log('Entradas de auditoría AUTH: ' + entries.length);
  entries.forEach(function(entry) {
    Logger.log(JSON.stringify(entry));
  });
}
```

### Notas de Implementación

1. **Caché de Usuarios**: AuthService usa caché de 10 minutos para mejorar rendimiento
2. **Fallback**: Si hay error cargando el template, se muestra página simple
3. **Nombre de Usuario**: Por ahora se usa la parte antes del @ del email
4. **Logout Real**: Google Apps Script no puede hacer logout real de la cuenta Google, solo muestra mensaje
5. **Mensajes en Español**: Todos los mensajes están en español (es-PE) según REGLAS.MD

### Archivos Modificados

- ✅ `gas/Code.gs`: doGet(), routeGet(), renderDashboard(), nuevas funciones
- ✅ `gas/ui/index.html`: Template con variables del servidor

### Próximos Pasos

Después de completar esta tarea:
1. Verificar que el WebApp se publica correctamente
2. Probar con usuarios autorizados y no autorizados
3. Verificar que los datos de usuario se pasan correctamente
4. Continuar con Checkpoint (Tarea 13)
