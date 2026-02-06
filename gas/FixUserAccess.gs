/**
 * FixUserAccess.gs - Función para limpiar caché y forzar acceso
 * 
 * Ejecutar esta función para limpiar el caché y permitir acceso
 * al usuario gianpapex@gmail.com
 */

/**
 * fixGianAccess - Limpia caché y fuerza reconocimiento del usuario
 * 
 * EJECUTAR ESTA FUNCIÓN para resolver el problema de acceso
 */
function fixGianAccess() {
  try {
    Logger.log('=== LIMPIANDO CACHÉ Y FORZANDO ACCESO ===');
    
    const email = 'gianpapex@gmail.com';
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Limpiar caché completamente
    Logger.log('1. Limpiando caché...');
    const cache = CacheService.getScriptCache();
    
    // Limpiar caché específico del usuario
    cache.remove('user_allowed_' + normalizedEmail);
    cache.remove('user_roles_' + normalizedEmail);
    
    // Limpiar todo el caché por si acaso
    cache.removeAll(['user_allowed_', 'user_roles_']);
    
    Logger.log('✓ Caché limpiado');
    
    // 2. Verificar que el usuario existe en la base de datos
    Logger.log('2. Verificando usuario en base de datos...');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      throw new Error('Hoja CFG_Users no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    let userFound = false;
    let userRow = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toLowerCase().trim() === normalizedEmail) {
        userFound = true;
        userRow = i + 1;
        Logger.log('✓ Usuario encontrado en fila ' + userRow);
        Logger.log('  Email: ' + data[i][1]);
        Logger.log('  Nombre: ' + data[i][2]);
        Logger.log('  Roles: ' + data[i][3]);
        Logger.log('  Activo: ' + data[i][5]);
        break;
      }
    }
    
    if (!userFound) {
      throw new Error('Usuario no encontrado en CFG_Users');
    }
    
    // 3. Probar AuthService directamente
    Logger.log('3. Probando AuthService...');
    
    const authService = new AuthService();
    
    // Forzar verificación sin caché
    const isAllowed = authService.isUserAllowed(normalizedEmail);
    Logger.log('✓ isUserAllowed: ' + isAllowed);
    
    const roles = authService.getUserRoles(normalizedEmail);
    Logger.log('✓ getUserRoles: ' + JSON.stringify(roles));
    
    // 4. Verificar permisos básicos
    const hasViewDashboard = authService.hasPermission(normalizedEmail, 'view_dashboard');
    Logger.log('✓ hasPermission(view_dashboard): ' + hasViewDashboard);
    
    // 5. Registrar acceso exitoso
    authService.logAccess(normalizedEmail, true);
    Logger.log('✓ Acceso registrado en auditoría');
    
    if (isAllowed && roles.length > 0) {
      Logger.log('\n🎉 ¡ÉXITO! El usuario puede acceder al sistema');
      Logger.log('📱 Refresca la página de la aplicación web');
      Logger.log('🔄 Si sigue sin funcionar, espera 1-2 minutos y vuelve a intentar');
    } else {
      Logger.log('\n❌ PROBLEMA: El usuario aún no puede acceder');
      Logger.log('Verifica que:');
      Logger.log('- El email esté exactamente como: gianpapex@gmail.com');
      Logger.log('- La columna "active" esté marcada como TRUE');
      Logger.log('- Los roles estén en formato JSON: ["Admin", "Vendedor"]');
    }
    
    return {
      success: isAllowed,
      email: normalizedEmail,
      roles: roles,
      canAccess: isAllowed && roles.length > 0
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * forceRefreshUserCache - Fuerza actualización completa del caché
 */
function forceRefreshUserCache() {
  try {
    Logger.log('=== FORZANDO ACTUALIZACIÓN COMPLETA DEL CACHÉ ===');
    
    // Limpiar TODO el caché
    const cache = CacheService.getScriptCache();
    cache.removeAll();
    
    Logger.log('✓ Todo el caché ha sido limpiado');
    
    // Esperar un momento
    Utilities.sleep(1000);
    
    // Recargar usuarios
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    Logger.log('✓ Usuarios recargados: ' + users.length);
    
    // Verificar específicamente gianpapex
    const gianUser = userRepo.findByEmail('gianpapex@gmail.com');
    
    if (gianUser) {
      Logger.log('✓ Usuario gianpapex encontrado:');
      Logger.log('  ID: ' + gianUser.id);
      Logger.log('  Email: ' + gianUser.email);
      Logger.log('  Nombre: ' + gianUser.name);
      Logger.log('  Activo: ' + gianUser.active);
      Logger.log('  Roles: ' + gianUser.roles);
    } else {
      Logger.log('❌ Usuario gianpapex NO encontrado');
    }
    
    Logger.log('\n🔄 Caché completamente actualizado');
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}

/**
 * testDirectAccess - Prueba acceso directo sin caché
 */
function testDirectAccess() {
  try {
    Logger.log('=== PRUEBA DE ACCESO DIRECTO ===');
    
    const email = 'gianpapex@gmail.com';
    
    // Acceso directo a la hoja sin repositorios
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    const data = sheet.getDataRange().getValues();
    
    Logger.log('Buscando usuario directamente en la hoja...');
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] && row[1].toLowerCase().trim() === email.toLowerCase().trim()) {
        Logger.log('✓ Usuario encontrado en fila ' + (i + 1) + ':');
        Logger.log('  ID: ' + row[0]);
        Logger.log('  Email: ' + row[1]);
        Logger.log('  Nombre: ' + row[2]);
        Logger.log('  Roles: ' + row[3]);
        Logger.log('  Tiendas: ' + row[4]);
        Logger.log('  Activo: ' + row[5]);
        Logger.log('  Fecha: ' + row[6]);
        
        if (row[5] === true || row[5] === 'TRUE') {
          Logger.log('🎉 El usuario ESTÁ ACTIVO y debería poder acceder');
        } else {
          Logger.log('❌ El usuario NO está activo');
        }
        
        return;
      }
    }
    
    Logger.log('❌ Usuario NO encontrado en la hoja');
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
  }
}