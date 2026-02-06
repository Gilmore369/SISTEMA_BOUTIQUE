/**
 * DiagnosticAccess.gs - Diagnóstico completo de acceso
 * 
 * Funciones para diagnosticar exactamente qué está pasando
 * con el acceso del usuario.
 */

/**
 * diagnosticCurrentUser - Diagnóstico completo del usuario actual
 * 
 * EJECUTAR ESTA FUNCIÓN para ver exactamente qué está detectando el sistema
 */
function diagnosticCurrentUser() {
  try {
    Logger.log('=== DIAGNÓSTICO COMPLETO DEL USUARIO ACTUAL ===');
    
    // 1. Detectar email actual
    Logger.log('1. DETECCIÓN DE EMAIL:');
    let detectedEmail = '';
    
    try {
      detectedEmail = Session.getActiveUser().getEmail();
      Logger.log('✓ Email detectado por Session.getActiveUser(): ' + detectedEmail);
    } catch (e) {
      Logger.log('❌ Error al detectar email: ' + e.message);
    }
    
    // 2. Verificar en base de datos
    Logger.log('\n2. VERIFICACIÓN EN BASE DE DATOS:');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('✓ Spreadsheet ID: ' + ss.getId());
    Logger.log('✓ Spreadsheet Name: ' + ss.getName());
    
    const sheet = ss.getSheetByName('CFG_Users');
    if (!sheet) {
      Logger.log('❌ Hoja CFG_Users no encontrada');
      return;
    }
    
    Logger.log('✓ Hoja CFG_Users encontrada');
    
    const data = sheet.getDataRange().getValues();
    Logger.log('✓ Total de filas en CFG_Users: ' + data.length);
    
    // 3. Buscar usuario específico
    Logger.log('\n3. BÚSQUEDA DE USUARIO:');
    
    const searchEmail = detectedEmail.toLowerCase().trim();
    let userFound = false;
    let userRow = -1;
    let userData = null;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] && row[1].toLowerCase().trim() === searchEmail) {
        userFound = true;
        userRow = i + 1;
        userData = {
          id: row[0],
          email: row[1],
          name: row[2],
          roles: row[3],
          stores: row[4],
          active: row[5],
          created_at: row[6]
        };
        break;
      }
    }
    
    if (userFound) {
      Logger.log('✅ USUARIO ENCONTRADO en fila ' + userRow + ':');
      Logger.log('   ID: ' + userData.id);
      Logger.log('   Email: ' + userData.email);
      Logger.log('   Nombre: ' + userData.name);
      Logger.log('   Roles: ' + userData.roles);
      Logger.log('   Tiendas: ' + userData.stores);
      Logger.log('   Activo: ' + userData.active + ' (tipo: ' + typeof userData.active + ')');
      Logger.log('   Creado: ' + userData.created_at);
      
      // Verificar si está activo
      const isActive = userData.active === true || userData.active === 'TRUE' || userData.active === 'true';
      Logger.log('   ¿Está activo? ' + isActive);
      
    } else {
      Logger.log('❌ USUARIO NO ENCONTRADO');
      Logger.log('Buscando: "' + searchEmail + '"');
      Logger.log('Usuarios disponibles:');
      for (let i = 1; i < data.length; i++) {
        if (data[i][1]) {
          Logger.log('   - "' + data[i][1] + '"');
        }
      }
    }
    
    // 4. Probar AuthService
    Logger.log('\n4. PRUEBA DE AUTHSERVICE:');
    
    const authService = new AuthService();
    
    // Sin caché
    const isAllowedNoCache = authService.isUserAllowed(detectedEmail, true);
    Logger.log('✓ isUserAllowed (sin caché): ' + isAllowedNoCache);
    
    // Con caché
    const isAllowedWithCache = authService.isUserAllowed(detectedEmail, false);
    Logger.log('✓ isUserAllowed (con caché): ' + isAllowedWithCache);
    
    // Roles
    const roles = authService.getUserRoles(detectedEmail);
    Logger.log('✓ getUserRoles: ' + JSON.stringify(roles));
    
    // 5. Probar permisos
    Logger.log('\n5. PRUEBA DE PERMISOS:');
    
    const permissions = ['view_dashboard', 'create_sale', 'manage_users'];
    permissions.forEach(function(permission) {
      const hasPermission = authService.hasPermission(detectedEmail, permission);
      Logger.log('✓ hasPermission(' + permission + '): ' + hasPermission);
    });
    
    // 6. Resumen final
    Logger.log('\n6. RESUMEN FINAL:');
    Logger.log('Email detectado: ' + detectedEmail);
    Logger.log('Usuario en BD: ' + (userFound ? 'SÍ' : 'NO'));
    Logger.log('Usuario activo: ' + (userFound && userData.active ? 'SÍ' : 'NO'));
    Logger.log('Puede acceder: ' + (isAllowedNoCache ? 'SÍ' : 'NO'));
    
    if (userFound && userData.active && isAllowedNoCache) {
      Logger.log('\n🎉 EL USUARIO DEBERÍA PODER ACCEDER AL SISTEMA');
    } else {
      Logger.log('\n❌ HAY UN PROBLEMA QUE IMPIDE EL ACCESO');
      
      if (!userFound) {
        Logger.log('PROBLEMA: Usuario no encontrado en CFG_Users');
      } else if (!userData.active) {
        Logger.log('PROBLEMA: Usuario no está activo');
      } else if (!isAllowedNoCache) {
        Logger.log('PROBLEMA: AuthService no permite el acceso');
      }
    }
    
    return {
      detectedEmail: detectedEmail,
      userFound: userFound,
      userData: userData,
      canAccess: isAllowedNoCache
    };
    
  } catch (error) {
    Logger.log('❌ ERROR EN DIAGNÓSTICO: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * forceUserAccess - Fuerza el acceso del usuario actual
 * 
 * EJECUTAR DESPUÉS del diagnóstico para forzar el acceso
 */
function forceUserAccess() {
  try {
    Logger.log('=== FORZANDO ACCESO DEL USUARIO ACTUAL ===');
    
    // Detectar email
    const detectedEmail = Session.getActiveUser().getEmail();
    Logger.log('Email detectado: ' + detectedEmail);
    
    // Limpiar TODO el caché
    Logger.log('1. Limpiando caché completo...');
    const cache = CacheService.getScriptCache();
    
    // Limpiar claves específicas
    const normalizedEmail = detectedEmail.toLowerCase().trim();
    cache.remove('user_allowed_' + normalizedEmail);
    cache.remove('user_roles_' + normalizedEmail);
    
    Logger.log('✓ Caché limpiado');
    
    // Forzar verificación
    Logger.log('2. Forzando verificación...');
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed(detectedEmail, true);
    
    Logger.log('✓ Verificación forzada: ' + isAllowed);
    
    if (isAllowed) {
      Logger.log('🎉 ¡ACCESO FORZADO EXITOSAMENTE!');
      Logger.log('📱 Refresca la página de la aplicación web AHORA');
    } else {
      Logger.log('❌ No se pudo forzar el acceso');
      Logger.log('Ejecuta diagnosticCurrentUser() para ver el problema');
    }
    
    return isAllowed;
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    throw error;
  }
}

/**
 * testWebAppAccess - Simula el acceso desde la aplicación web
 */
function testWebAppAccess() {
  try {
    Logger.log('=== SIMULANDO ACCESO DESDE WEB APP ===');
    
    // Simular doGet
    const e = { parameter: {} };
    
    // Detectar email como lo haría doGet
    const userEmail = Session.getActiveUser().getEmail();
    Logger.log('Email que detectaría doGet: ' + userEmail);
    
    // Probar AuthService como lo haría doGet
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed(userEmail, true); // Forzar sin caché
    
    Logger.log('¿Permitiría acceso doGet? ' + isAllowed);
    
    if (isAllowed) {
      Logger.log('✅ LA WEB APP DEBERÍA FUNCIONAR');
    } else {
      Logger.log('❌ LA WEB APP SEGUIRÁ MOSTRANDO ACCESO DENEGADO');
    }
    
    return isAllowed;
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    throw error;
  }
}