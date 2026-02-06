/**
 * FixEmailMismatch.gs - Corrige el problema del email detectado
 * 
 * El sistema detecta "gianpepex@gmail.com" pero en la BD está "gianpapex@gmail.com"
 */

/**
 * addCorrectDetectedEmail - Agrega el email que realmente detecta el sistema
 * 
 * EJECUTAR ESTA FUNCIÓN para agregar gianpepex@gmail.com (el que detecta el sistema)
 */
function addCorrectDetectedEmail() {
  try {
    Logger.log('=== AGREGANDO EMAIL DETECTADO CORRECTAMENTE ===');
    
    // Email que detecta el sistema
    const detectedEmail = 'gianpepex@gmail.com';
    
    Logger.log('Email detectado por el sistema: ' + detectedEmail);
    
    // Obtener la hoja
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      throw new Error('Hoja CFG_Users no encontrada');
    }
    
    // Verificar si ya existe
    const data = sheet.getDataRange().getValues();
    let userExists = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toLowerCase().trim() === detectedEmail.toLowerCase().trim()) {
        userExists = true;
        Logger.log('El usuario ' + detectedEmail + ' ya existe en la fila ' + (i + 1));
        break;
      }
    }
    
    if (!userExists) {
      // Agregar el nuevo usuario con el email correcto
      const newUser = [
        'usr_006',
        detectedEmail,
        'Gian Papex (Detectado)',
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
      Logger.log('Email: ' + detectedEmail);
      Logger.log('Roles: Admin, Vendedor');
    }
    
    // Verificar acceso inmediatamente
    Logger.log('\n=== VERIFICANDO ACCESO INMEDIATO ===');
    
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed(detectedEmail, true); // Forzar sin caché
    
    Logger.log('¿Puede acceder ahora? ' + isAllowed);
    
    if (isAllowed) {
      Logger.log('\n🎉 ¡ÉXITO! El usuario puede acceder al sistema');
      Logger.log('📱 Refresca la página de la aplicación web AHORA');
    } else {
      Logger.log('\n❌ Aún hay un problema');
    }
    
    return {
      success: isAllowed,
      email: detectedEmail,
      added: !userExists
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * fixBothEmails - Agrega ambos emails para estar seguro
 */
function fixBothEmails() {
  try {
    Logger.log('=== AGREGANDO AMBOS EMAILS PARA ESTAR SEGURO ===');
    
    const emails = [
      'gianpepex@gmail.com',  // El que detecta el sistema
      'gianpapex@gmail.com'   // El que está en la BD
    ];
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      throw new Error('Hoja CFG_Users no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    let addedCount = 0;
    
    emails.forEach(function(email, index) {
      Logger.log('\nProcesando email: ' + email);
      
      // Verificar si ya existe
      let exists = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] && data[i][1].toLowerCase().trim() === email.toLowerCase().trim()) {
          exists = true;
          Logger.log('✓ Ya existe en fila ' + (i + 1));
          break;
        }
      }
      
      if (!exists) {
        const newUser = [
          'usr_00' + (6 + index),
          email,
          'Gian Papex (' + (index === 0 ? 'Detectado' : 'Manual') + ')',
          '["Admin", "Vendedor"]',
          '["Mujeres", "Hombres"]',
          true,
          new Date()
        ];
        
        const lastRow = sheet.getLastRow();
        const newRow = lastRow + 1;
        
        sheet.getRange(newRow, 1, 1, newUser.length).setValues([newUser]);
        
        Logger.log('✅ Agregado en fila ' + newRow);
        addedCount++;
        
        // Actualizar data para la siguiente iteración
        data.push(newUser);
      }
    });
    
    Logger.log('\n=== RESUMEN ===');
    Logger.log('Emails agregados: ' + addedCount);
    
    // Probar acceso con el email detectado
    const detectedEmail = 'gianpepex@gmail.com';
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed(detectedEmail, true);
    
    Logger.log('¿Puede acceder ' + detectedEmail + '? ' + isAllowed);
    
    if (isAllowed) {
      Logger.log('\n🎉 ¡PROBLEMA RESUELTO!');
      Logger.log('📱 Refresca la página de la aplicación web');
    }
    
    return {
      success: isAllowed,
      addedCount: addedCount
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    throw error;
  }
}

/**
 * testFinalAccess - Prueba final de acceso
 */
function testFinalAccess() {
  try {
    Logger.log('=== PRUEBA FINAL DE ACCESO ===');
    
    const detectedEmail = 'gianpepex@gmail.com';
    
    // Limpiar caché
    const cache = CacheService.getScriptCache();
    cache.remove('user_allowed_' + detectedEmail.toLowerCase());
    cache.remove('user_roles_' + detectedEmail.toLowerCase());
    
    // Probar acceso
    const authService = new AuthService();
    const isAllowed = authService.isUserAllowed(detectedEmail, true);
    const roles = authService.getUserRoles(detectedEmail);
    
    Logger.log('Email: ' + detectedEmail);
    Logger.log('Permitido: ' + isAllowed);
    Logger.log('Roles: ' + JSON.stringify(roles));
    
    if (isAllowed && roles.length > 0) {
      Logger.log('\n✅ ¡ACCESO CONFIRMADO!');
      Logger.log('🚀 La aplicación web debería funcionar ahora');
    } else {
      Logger.log('\n❌ Aún hay problemas');
    }
    
    return isAllowed;
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error.message);
    throw error;
  }
}