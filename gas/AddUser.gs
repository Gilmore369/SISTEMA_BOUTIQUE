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

/**
 * addNewUsers - Agrega los usuarios gianpepex@gmail.com y karianaghostimporter@gmail.com
 * 
 * Ejecutar esta función para agregar ambos usuarios a la lista de autorizados.
 */
function addNewUsers() {
  try {
    Logger.log('=== AGREGANDO NUEVOS USUARIOS ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      Logger.log('ERROR: Hoja CFG_Users no existe');
      Logger.log('Por favor, ejecuta primero setupCompleteSystem() para crear las hojas');
      return;
    }
    
    // Usuarios a agregar
    const newUsers = [
      {
        email: 'gianpepex@gmail.com',
        name: 'Gian Pepex',
        roles: '["Admin", "Vendedor"]',
        stores: '["Mujeres", "Hombres"]'
      },
      {
        email: 'karianaghostimporter@gmail.com',
        name: 'Kariana Ghost Importer',
        roles: '["Admin", "Vendedor"]',
        stores: '["Mujeres", "Hombres"]'
      }
    ];
    
    // Obtener datos actuales
    const data = sheet.getDataRange().getValues();
    let lastRow = sheet.getLastRow();
    let addedCount = 0;
    
    // Procesar cada usuario
    for (let i = 0; i < newUsers.length; i++) {
      const user = newUsers[i];
      
      // Verificar si el usuario ya existe
      let userExists = false;
      for (let j = 1; j < data.length; j++) {
        const existingEmail = data[j][1];
        if (existingEmail && existingEmail.toLowerCase().trim() === user.email.toLowerCase().trim()) {
          userExists = true;
          Logger.log('⚠️  Usuario ' + user.email + ' ya existe en la fila ' + (j + 1));
          
          // Verificar si está activo
          const isActive = data[j][5];
          if (!isActive) {
            Logger.log('   → Usuario está INACTIVO, activando...');
            sheet.getRange(j + 1, 6).setValue(true);
            Logger.log('   ✅ Usuario activado');
          }
          break;
        }
      }
      
      if (!userExists) {
        // Generar ID único
        const userId = 'usr_' + String(lastRow).padStart(3, '0');
        
        // Crear nuevo usuario
        const newUserRow = [
          userId,
          user.email,
          user.name,
          user.roles,
          user.stores,
          true,
          new Date()
        ];
        
        // Insertar en la siguiente fila
        lastRow++;
        sheet.getRange(lastRow, 1, 1, newUserRow.length).setValues([newUserRow]);
        
        Logger.log('✅ Usuario agregado: ' + user.email + ' (fila ' + lastRow + ')');
        addedCount++;
      }
    }
    
    // Forzar flush para asegurar que los cambios se guarden
    SpreadsheetApp.flush();
    
    Logger.log('\n=== RESUMEN ===');
    Logger.log('Usuarios agregados: ' + addedCount);
    Logger.log('Usuarios ya existentes: ' + (newUsers.length - addedCount));
    
    // Verificar acceso de cada usuario
    Logger.log('\n=== VERIFICANDO ACCESO ===');
    const authService = new AuthService();
    
    for (let i = 0; i < newUsers.length; i++) {
      const email = newUsers[i].email;
      
      // Forzar verificación sin caché
      const isAllowed = authService.isUserAllowed(email, true);
      const roles = authService.getUserRoles(email);
      
      Logger.log('\n' + email + ':');
      Logger.log('  - Permitido: ' + isAllowed);
      Logger.log('  - Roles: ' + JSON.stringify(roles));
      
      if (isAllowed) {
        Logger.log('  ✅ Puede acceder al sistema');
      } else {
        Logger.log('  ❌ NO puede acceder - revisar configuración');
      }
    }
    
    Logger.log('\n🎉 ¡PROCESO COMPLETADO!');
    Logger.log('Los usuarios ahora pueden acceder al sistema en modo incógnito');
    Logger.log('usando el formulario de login manual.');
    
    return {
      success: true,
      added: addedCount,
      total: newUsers.length
    };
    
  } catch (error) {
    Logger.log('ERROR al agregar usuarios: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * diagnoseLoginIssue - Diagnostica problemas de login para un email específico
 * 
 * Ejecutar esta función para diagnosticar por qué un email no puede acceder.
 */
function diagnoseLoginIssue() {
  const emailToTest = 'gianpepex@gmail.com'; // Cambiar por el email a probar
  
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  DIAGNÓSTICO DE LOGIN                                     ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('Email a probar: ' + emailToTest);
  Logger.log('');
  
  try {
    // 1. Verificar que la hoja CFG_Users existe
    Logger.log('1. Verificando hoja CFG_Users...');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      Logger.log('   ❌ ERROR: Hoja CFG_Users no existe');
      return;
    }
    Logger.log('   ✅ Hoja CFG_Users encontrada');
    
    // 2. Leer datos de la hoja
    Logger.log('\n2. Leyendo datos de CFG_Users...');
    const data = sheet.getDataRange().getValues();
    Logger.log('   ✅ Total de filas: ' + data.length);
    Logger.log('   ✅ Headers: ' + data[0].join(' | '));
    
    // 3. Buscar el email específico
    Logger.log('\n3. Buscando email: ' + emailToTest);
    const normalizedEmail = emailToTest.toLowerCase().trim();
    let found = false;
    let rowData = null;
    let rowNumber = -1;
    
    for (let i = 1; i < data.length; i++) {
      const cellEmail = data[i][1];
      if (cellEmail && cellEmail.toLowerCase().trim() === normalizedEmail) {
        found = true;
        rowData = data[i];
        rowNumber = i + 1;
        break;
      }
    }
    
    if (!found) {
      Logger.log('   ❌ Email NO encontrado en CFG_Users');
      Logger.log('   → Solución: Ejecutar addNewUsers() para agregar el usuario');
      return;
    }
    
    Logger.log('   ✅ Email encontrado en fila ' + rowNumber);
    Logger.log('   → ID: ' + rowData[0]);
    Logger.log('   → Email: ' + rowData[1]);
    Logger.log('   → Nombre: ' + rowData[2]);
    Logger.log('   → Roles: ' + rowData[3]);
    Logger.log('   → Tiendas: ' + rowData[4]);
    Logger.log('   → Activo: ' + rowData[5] + ' (tipo: ' + typeof rowData[5] + ')');
    
    // 4. Verificar estado activo
    Logger.log('\n4. Verificando estado activo...');
    const isActive = rowData[5] === true || rowData[5] === 'TRUE' || rowData[5] === 'true' || rowData[5] === 1;
    
    if (!isActive) {
      Logger.log('   ❌ Usuario NO está activo');
      Logger.log('   → Valor actual: ' + rowData[5]);
      Logger.log('   → Solución: Cambiar la columna F (active) a TRUE');
      return;
    }
    Logger.log('   ✅ Usuario está activo');
    
    // 5. Probar AuthService
    Logger.log('\n5. Probando AuthService.isUserAllowed()...');
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed(emailToTest, true);
    
    if (!isAllowed) {
      Logger.log('   ❌ AuthService retorna FALSE');
      Logger.log('   → Revisar logs de AuthService arriba para más detalles');
      return;
    }
    Logger.log('   ✅ AuthService retorna TRUE');
    
    // 6. Probar roles
    Logger.log('\n6. Probando AuthService.getUserRoles()...');
    const roles = authService.getUserRoles(emailToTest);
    Logger.log('   ✅ Roles obtenidos: ' + JSON.stringify(roles));
    
    if (roles.length === 0) {
      Logger.log('   ⚠️  ADVERTENCIA: Usuario no tiene roles asignados');
    }
    
    // 7. Probar permisos
    Logger.log('\n7. Probando permisos...');
    const testPermissions = ['view_dashboard', 'create_sale', 'manage_products'];
    
    for (let i = 0; i < testPermissions.length; i++) {
      const permission = testPermissions[i];
      const hasPermission = authService.hasPermission(emailToTest, permission);
      Logger.log('   ' + (hasPermission ? '✅' : '❌') + ' ' + permission + ': ' + hasPermission);
    }
    
    // 8. Resultado final
    Logger.log('\n╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  RESULTADO DEL DIAGNÓSTICO                                ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    
    if (isAllowed && roles.length > 0) {
      Logger.log('');
      Logger.log('✅ ¡TODO CORRECTO!');
      Logger.log('');
      Logger.log('El usuario ' + emailToTest + ' PUEDE acceder al sistema.');
      Logger.log('');
      Logger.log('Si aún no puedes acceder en modo incógnito:');
      Logger.log('1. Redesplega la aplicación web (Implementar → Gestionar implementaciones)');
      Logger.log('2. Usa la nueva URL en modo incógnito');
      Logger.log('3. Ingresa el email: ' + emailToTest);
      Logger.log('4. Haz clic en "Iniciar Sesión"');
    } else {
      Logger.log('');
      Logger.log('❌ HAY PROBLEMAS');
      Logger.log('');
      Logger.log('Revisa los errores arriba y sigue las soluciones sugeridas.');
    }
    
  } catch (error) {
    Logger.log('\n❌ ERROR CRÍTICO:');
    Logger.log('   Mensaje: ' + error.message);
    Logger.log('   Stack: ' + error.stack);
  }
}