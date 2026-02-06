/**
 * AddUser.gs - Función para agregar usuario específico
 * 
 * Función temporal para agregar el usuario gianpapex@gmail.com
 * a la lista de usuarios autorizados.
 */

/**
 * addGianUser - Agrega el usuario gianpapex@gmail.com a CFG_Users
 * 
 * Ejecutar esta función desde el editor de Apps Script para
 * agregar tu email a la lista de usuarios autorizados.
 */
function addGianUser() {
  try {
    Logger.log('=== AGREGANDO USUARIO GIANPAPEX@GMAIL.COM ===');
    
    // Obtener la hoja de cálculo activa
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      Logger.log('ERROR: Hoja CFG_Users no existe');
      Logger.log('Por favor, ejecuta primero setupCompleteSystem() para crear las hojas');
      return;
    }
    
    // Verificar si el usuario ya existe
    const data = sheet.getDataRange().getValues();
    let userExists = false;
    
    for (let i = 1; i < data.length; i++) { // Empezar desde 1 para saltar headers
      if (data[i][1] === 'gianpapex@gmail.com') {
        userExists = true;
        Logger.log('El usuario gianpapex@gmail.com ya existe en la fila ' + (i + 1));
        break;
      }
    }
    
    if (!userExists) {
      // Agregar el nuevo usuario
      const newUser = [
        'usr_005',
        'gianpapex@gmail.com',
        'Gian Papex',
        '["Admin", "Vendedor"]',
        '["Mujeres", "Hombres"]',
        true,
        new Date()
      ];
      
      // Encontrar la primera fila vacía
      const lastRow = sheet.getLastRow();
      const newRow = lastRow + 1;
      
      // Insertar el nuevo usuario
      sheet.getRange(newRow, 1, 1, newUser.length).setValues([newUser]);
      
      Logger.log('✅ Usuario agregado exitosamente en la fila ' + newRow);
      Logger.log('Email: gianpapex@gmail.com');
      Logger.log('Roles: Admin, Vendedor');
      Logger.log('Tiendas: Mujeres, Hombres');
    }
    
    // Verificar que el usuario puede acceder
    Logger.log('\n=== VERIFICANDO ACCESO ===');
    
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed('gianpapex@gmail.com');
    const roles = authService.getUserRoles('gianpapex@gmail.com');
    
    Logger.log('Usuario permitido: ' + isAllowed);
    Logger.log('Roles obtenidos: ' + JSON.stringify(roles));
    
    if (isAllowed) {
      Logger.log('\n🎉 ¡ÉXITO! El usuario gianpapex@gmail.com ahora puede acceder al sistema');
      Logger.log('Puedes acceder a la aplicación web con tu email');
    } else {
      Logger.log('\n❌ ERROR: El usuario no puede acceder. Verifica la configuración');
    }
    
    // Mostrar información de la aplicación web
    Logger.log('\n=== INFORMACIÓN DE ACCESO ===');
    Logger.log('Para acceder al sistema:');
    Logger.log('1. Ve a Implementar → Gestionar implementaciones');
    Logger.log('2. Copia la URL de la aplicación web');
    Logger.log('3. Abre la URL en tu navegador');
    Logger.log('4. Inicia sesión con tu cuenta de Google (gianpapex@gmail.com)');
    
    return {
      success: true,
      message: 'Usuario agregado exitosamente',
      email: 'gianpapex@gmail.com',
      canAccess: isAllowed
    };
    
  } catch (error) {
    Logger.log('ERROR al agregar usuario: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * testUserAccess - Prueba el acceso del usuario gianpapex@gmail.com
 * 
 * Ejecutar para verificar que el usuario puede acceder correctamente.
 */
function testUserAccess() {
  try {
    Logger.log('=== PROBANDO ACCESO DE GIANPAPEX@GMAIL.COM ===');
    
    const authService = new AuthService();
    const email = 'gianpapex@gmail.com';
    
    // Probar isUserAllowed
    const isAllowed = authService.isUserAllowed(email);
    Logger.log('1. isUserAllowed: ' + isAllowed);
    
    // Probar getUserRoles
    const roles = authService.getUserRoles(email);
    Logger.log('2. getUserRoles: ' + JSON.stringify(roles));
    
    // Probar permisos específicos
    const permissions = [
      'view_dashboard',
      'create_sale',
      'void_sale',
      'manage_users',
      'view_reports'
    ];
    
    Logger.log('3. Permisos:');
    permissions.forEach(function(permission) {
      const hasPermission = authService.hasPermission(email, permission);
      Logger.log('   - ' + permission + ': ' + hasPermission);
    });
    
    // Registrar acceso de prueba
    authService.logAccess(email, true);
    Logger.log('4. Acceso registrado en auditoría');
    
    if (isAllowed && roles.length > 0) {
      Logger.log('\n✅ ACCESO CORRECTO - El usuario puede usar el sistema');
    } else {
      Logger.log('\n❌ PROBLEMA DE ACCESO - Revisar configuración');
    }
    
  } catch (error) {
    Logger.log('ERROR en prueba de acceso: ' + error.message);
  }
}

/**
 * showCurrentUsers - Muestra todos los usuarios actuales en CFG_Users
 */
function showCurrentUsers() {
  try {
    Logger.log('=== USUARIOS ACTUALES EN CFG_USERS ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      Logger.log('ERROR: Hoja CFG_Users no existe');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    Logger.log('Headers: ' + headers.join(' | '));
    Logger.log('─'.repeat(80));
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1]) { // Si tiene email
        Logger.log((i) + '. ' + row[1] + ' | ' + row[2] + ' | ' + row[3] + ' | Activo: ' + row[5]);
      }
    }
    
    Logger.log('\nTotal de usuarios: ' + (data.length - 1));
    
  } catch (error) {
    Logger.log('ERROR al mostrar usuarios: ' + error.message);
  }
}