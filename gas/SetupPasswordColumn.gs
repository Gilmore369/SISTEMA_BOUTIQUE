/**
 * SetupPasswordColumn.gs - Script para agregar columna password a CFG_Users
 * 
 * INSTRUCCIONES:
 * 1. Ejecutar setupPasswordColumn() desde el editor de Apps Script
 * 2. Esto agregará la columna "password" a CFG_Users
 * 3. Agregará usuarios de ejemplo con contraseñas
 * 
 * USUARIOS DE EJEMPLO:
 * - gianpepex@gmail.com / gian123
 * - karianaghostimporter@gmail.com / kariana123
 * - admin@adictionboutique.com / admin123
 */

/**
 * setupPasswordColumn - Agrega columna password y usuarios de ejemplo
 */
function setupPasswordColumn() {
  try {
    Logger.log('=== Setup Password Column START ===');
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      throw new Error('Hoja CFG_Users no encontrada');
    }
    
    // 1. Verificar si ya existe la columna password
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Headers actuales: ' + JSON.stringify(headers));
    
    let passwordColIndex = headers.indexOf('password');
    
    if (passwordColIndex === -1) {
      // Agregar columna password después de created_at (columna 7)
      Logger.log('Agregando columna password...');
      sheet.insertColumnAfter(7);
      sheet.getRange(1, 8).setValue('password');
      passwordColIndex = 7; // índice 0-based
      Logger.log('✓ Columna password agregada en posición 8');
    } else {
      Logger.log('✓ Columna password ya existe en posición ' + (passwordColIndex + 1));
    }
    
    // 2. Obtener todos los usuarios actuales
    const data = sheet.getDataRange().getValues();
    Logger.log('Total de filas: ' + data.length);
    
    // 3. Definir usuarios de ejemplo con contraseñas
    const usersToSetup = [
      {
        email: 'gianpepex@gmail.com',
        name: 'Gian',
        password: 'gian123',
        roles: '["Admin", "Vendedor"]',
        stores: 'TIENDA_PRINCIPAL',
        active: true
      },
      {
        email: 'karianaghostimporter@gmail.com',
        name: 'Kariana',
        password: 'kariana123',
        roles: '["Admin", "Vendedor"]',
        stores: 'TIENDA_PRINCIPAL',
        active: true
      },
      {
        email: 'admin@adictionboutique.com',
        name: 'Administrador',
        password: 'admin123',
        roles: '["Admin"]',
        stores: 'TIENDA_PRINCIPAL',
        active: true
      },
      {
        email: 'vendedor@adictionboutique.com',
        name: 'Vendedor',
        password: 'vendedor123',
        roles: '["Vendedor"]',
        stores: 'TIENDA_PRINCIPAL',
        active: true
      }
    ];
    
    // 4. Actualizar o crear usuarios
    for (let i = 0; i < usersToSetup.length; i++) {
      const user = usersToSetup[i];
      let userFound = false;
      let rowIndex = -1;
      
      // Buscar si el usuario ya existe
      for (let j = 1; j < data.length; j++) {
        const row = data[j];
        const cellEmail = row[1];
        
        if (cellEmail && cellEmail.toLowerCase() === user.email.toLowerCase()) {
          userFound = true;
          rowIndex = j + 1; // +1 porque getRange usa índice 1-based
          break;
        }
      }
      
      if (userFound) {
        // Actualizar contraseña del usuario existente
        Logger.log('Actualizando contraseña para: ' + user.email);
        sheet.getRange(rowIndex, passwordColIndex + 1).setValue(user.password);
        Logger.log('✓ Contraseña actualizada para ' + user.email);
      } else {
        // Crear nuevo usuario
        Logger.log('Creando nuevo usuario: ' + user.email);
        const newRow = sheet.getLastRow() + 1;
        const userId = 'usr-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
        
        // Columnas: id, email, name, roles, stores, active, created_at, password
        sheet.getRange(newRow, 1).setValue(userId);
        sheet.getRange(newRow, 2).setValue(user.email);
        sheet.getRange(newRow, 3).setValue(user.name);
        sheet.getRange(newRow, 4).setValue(user.roles);
        sheet.getRange(newRow, 5).setValue(user.stores);
        sheet.getRange(newRow, 6).setValue(user.active);
        sheet.getRange(newRow, 7).setValue(new Date());
        sheet.getRange(newRow, 8).setValue(user.password);
        
        Logger.log('✓ Usuario creado: ' + user.email);
      }
    }
    
    Logger.log('=== Setup Password Column COMPLETE ===');
    Logger.log('');
    Logger.log('USUARIOS CONFIGURADOS:');
    Logger.log('----------------------');
    for (let i = 0; i < usersToSetup.length; i++) {
      Logger.log(usersToSetup[i].email + ' / ' + usersToSetup[i].password);
    }
    Logger.log('');
    Logger.log('✅ Setup completado exitosamente');
    Logger.log('Ahora puedes hacer login con cualquiera de estos usuarios');
    
  } catch (error) {
    Logger.log('ERROR en setupPasswordColumn: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * addUser - Función helper para agregar un nuevo usuario con contraseña
 * 
 * @param {string} email - Email del usuario
 * @param {string} name - Nombre del usuario
 * @param {string} password - Contraseña del usuario
 * @param {Array<string>} roles - Array de roles (ej: ['Admin', 'Vendedor'])
 * @param {string} stores - Tiendas asignadas
 */
function addUser(email, name, password, roles, stores) {
  try {
    Logger.log('=== addUser START ===');
    Logger.log('Email: ' + email);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      throw new Error('Hoja CFG_Users no encontrada');
    }
    
    // Verificar si el usuario ya existe
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const cellEmail = row[1];
      
      if (cellEmail && cellEmail.toLowerCase() === email.toLowerCase()) {
        throw new Error('El usuario ' + email + ' ya existe');
      }
    }
    
    // Crear nuevo usuario
    const newRow = sheet.getLastRow() + 1;
    const userId = 'usr-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
    const rolesJson = JSON.stringify(roles);
    
    // Columnas: id, email, name, roles, stores, active, created_at, password
    sheet.getRange(newRow, 1).setValue(userId);
    sheet.getRange(newRow, 2).setValue(email);
    sheet.getRange(newRow, 3).setValue(name);
    sheet.getRange(newRow, 4).setValue(rolesJson);
    sheet.getRange(newRow, 5).setValue(stores || 'TIENDA_PRINCIPAL');
    sheet.getRange(newRow, 6).setValue(true);
    sheet.getRange(newRow, 7).setValue(new Date());
    sheet.getRange(newRow, 8).setValue(password);
    
    Logger.log('✅ Usuario creado exitosamente: ' + email);
    Logger.log('Password: ' + password);
    Logger.log('Roles: ' + rolesJson);
    
  } catch (error) {
    Logger.log('ERROR en addUser: ' + error.message);
    throw error;
  }
}

/**
 * updateUserPassword - Actualiza la contraseña de un usuario existente
 * 
 * @param {string} email - Email del usuario
 * @param {string} newPassword - Nueva contraseña
 */
function updateUserPassword(email, newPassword) {
  try {
    Logger.log('=== updateUserPassword START ===');
    Logger.log('Email: ' + email);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('CFG_Users');
    
    if (!sheet) {
      throw new Error('Hoja CFG_Users no encontrada');
    }
    
    // Buscar usuario
    const data = sheet.getDataRange().getValues();
    let userFound = false;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const cellEmail = row[1];
      
      if (cellEmail && cellEmail.toLowerCase() === email.toLowerCase()) {
        userFound = true;
        const rowIndex = i + 1;
        
        // Actualizar contraseña (columna 8)
        sheet.getRange(rowIndex, 8).setValue(newPassword);
        
        Logger.log('✅ Contraseña actualizada para: ' + email);
        Logger.log('Nueva contraseña: ' + newPassword);
        break;
      }
    }
    
    if (!userFound) {
      throw new Error('Usuario no encontrado: ' + email);
    }
    
  } catch (error) {
    Logger.log('ERROR en updateUserPassword: ' + error.message);
    throw error;
  }
}
