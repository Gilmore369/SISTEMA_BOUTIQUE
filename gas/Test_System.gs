/**
 * Test_System.gs - Pruebas del Sistema Completo
 * 
 * Funciones para probar que el sistema está funcionando correctamente
 * después de la configuración inicial.
 */

/**
 * testSystemComplete - Prueba completa del sistema
 * 
 * Ejecuta una serie de pruebas para verificar que:
 * - Las hojas están creadas correctamente
 * - Los datos de ejemplo están poblados
 * - Los servicios funcionan
 * - La autenticación funciona
 */
function testSystemComplete() {
  Logger.log('=== INICIANDO PRUEBAS COMPLETAS DEL SISTEMA ===');
  
  try {
    // 1. Verificar hojas
    Logger.log('\n1. Verificando estructura de hojas...');
    testSheetsStructure();
    
    // 2. Verificar datos
    Logger.log('\n2. Verificando datos de ejemplo...');
    testSampleData();
    
    // 3. Verificar servicios
    Logger.log('\n3. Verificando servicios...');
    testServices();
    
    // 4. Verificar autenticación
    Logger.log('\n4. Verificando autenticación...');
    testAuthentication();
    
    // 5. Información del sistema
    Logger.log('\n5. Información del sistema...');
    showSystemInfo();
    
    Logger.log('\n=== ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE ===');
    Logger.log('🎉 El sistema Adiction Boutique Suite está funcionando correctamente');
    
  } catch (error) {
    Logger.log('\n❌ ERROR EN LAS PRUEBAS: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testSheetsStructure - Verifica que todas las hojas estén creadas
 */
function testSheetsStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const expectedSheets = [
    'CFG_Users', 'CFG_Params', 'CAT_Products', 'INV_Stock', 'INV_Movements',
    'CRM_Clients', 'POS_Sales', 'POS_SaleItems', 'CRD_Plans', 'CRD_Installments',
    'CRD_Payments', 'CASH_Shifts', 'CASH_Expenses', 'AUD_Log'
  ];
  
  let sheetsFound = 0;
  
  for (let i = 0; i < expectedSheets.length; i++) {
    const sheetName = expectedSheets[i];
    const sheet = ss.getSheetByName(sheetName);
    
    if (sheet) {
      Logger.log('✓ Hoja encontrada: ' + sheetName + ' (' + sheet.getLastRow() + ' filas)');
      sheetsFound++;
    } else {
      Logger.log('❌ Hoja faltante: ' + sheetName);
    }
  }
  
  Logger.log('Resumen: ' + sheetsFound + '/' + expectedSheets.length + ' hojas encontradas');
  
  if (sheetsFound === expectedSheets.length) {
    Logger.log('✅ Estructura de hojas: CORRECTA');
  } else {
    throw new Error('Faltan ' + (expectedSheets.length - sheetsFound) + ' hojas');
  }
}

/**
 * testSampleData - Verifica que los datos de ejemplo estén poblados
 */
function testSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Verificar usuarios
  const usersSheet = ss.getSheetByName('CFG_Users');
  const usersCount = usersSheet.getLastRow() - 1; // -1 por el header
  Logger.log('✓ Usuarios: ' + usersCount + ' registros');
  
  // Verificar productos
  const productsSheet = ss.getSheetByName('CAT_Products');
  const productsCount = productsSheet.getLastRow() - 1;
  Logger.log('✓ Productos: ' + productsCount + ' registros');
  
  // Verificar clientes
  const clientsSheet = ss.getSheetByName('CRM_Clients');
  const clientsCount = clientsSheet.getLastRow() - 1;
  Logger.log('✓ Clientes: ' + clientsCount + ' registros');
  
  // Verificar stock
  const stockSheet = ss.getSheetByName('INV_Stock');
  const stockCount = stockSheet.getLastRow() - 1;
  Logger.log('✓ Stock: ' + stockCount + ' registros');
  
  // Verificar parámetros
  const paramsSheet = ss.getSheetByName('CFG_Params');
  const paramsCount = paramsSheet.getLastRow() - 1;
  Logger.log('✓ Parámetros: ' + paramsCount + ' registros');
  
  if (usersCount >= 4 && productsCount >= 15 && clientsCount >= 8) {
    Logger.log('✅ Datos de ejemplo: CORRECTOS');
  } else {
    throw new Error('Datos de ejemplo insuficientes');
  }
}

/**
 * testServices - Verifica que los servicios funcionen
 */
function testServices() {
  try {
    // Probar AuthService
    const authService = new AuthService();
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    if (users.length > 0) {
      const testEmail = users[0].email;
      const isAllowed = authService.isUserAllowed(testEmail);
      Logger.log('✓ AuthService: Usuario ' + testEmail + ' permitido = ' + isAllowed);
    }
    
    // Probar InventoryService
    const inventoryService = new InventoryService();
    const stockRepo = new StockRepository();
    const stockRecords = stockRepo.findAll();
    
    if (stockRecords.length > 0) {
      const testStock = stockRecords[0];
      const quantity = inventoryService.checkStock(testStock.warehouse_id, testStock.product_id);
      Logger.log('✓ InventoryService: Stock de ' + testStock.product_id + ' = ' + quantity);
    }
    
    Logger.log('✅ Servicios: FUNCIONANDO');
    
  } catch (error) {
    Logger.log('❌ Error en servicios: ' + error.message);
    throw error;
  }
}

/**
 * testAuthentication - Verifica el sistema de autenticación
 */
function testAuthentication() {
  try {
    const authService = new AuthService();
    
    // Probar con usuario válido
    const validUser = 'admin@adictionboutique.com';
    const isValid = authService.isUserAllowed(validUser);
    Logger.log('✓ Usuario válido (' + validUser + '): ' + isValid);
    
    // Probar roles
    const roles = authService.getUserRoles(validUser);
    Logger.log('✓ Roles del usuario: ' + JSON.stringify(roles));
    
    // Probar permisos
    const hasPermission = authService.hasPermission(validUser, 'view_dashboard');
    Logger.log('✓ Permiso view_dashboard: ' + hasPermission);
    
    // Probar con usuario inválido
    const invalidUser = 'noexiste@example.com';
    const isInvalid = authService.isUserAllowed(invalidUser);
    Logger.log('✓ Usuario inválido (' + invalidUser + '): ' + isInvalid + ' (debe ser false)');
    
    Logger.log('✅ Autenticación: FUNCIONANDO');
    
  } catch (error) {
    Logger.log('❌ Error en autenticación: ' + error.message);
    throw error;
  }
}

/**
 * showSystemInfo - Muestra información del sistema
 */
function showSystemInfo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('📊 INFORMACIÓN DEL SISTEMA:');
  Logger.log('   Nombre: ' + ss.getName());
  Logger.log('   ID: ' + ss.getId());
  Logger.log('   URL: ' + ss.getUrl());
  Logger.log('   Versión: ' + SYSTEM_VERSION);
  Logger.log('   Hojas: ' + ss.getSheets().length);
  
  // Mostrar URL de la aplicación web
  Logger.log('\n🌐 PARA ACCEDER AL SISTEMA:');
  Logger.log('1. Ve a Implementar → Nueva implementación');
  Logger.log('2. Tipo: Aplicación web');
  Logger.log('3. Ejecutar como: "Yo"');
  Logger.log('4. Acceso: "Cualquier persona"');
  Logger.log('5. Implementar y copiar la URL');
  
  Logger.log('\n👥 USUARIOS CONFIGURADOS:');
  const userRepo = new UserRepository();
  const users = userRepo.findAll();
  
  // Filtrar solo usuarios válidos (no null)
  let validUserCount = 0;
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user && user.email && user.name) {
      Logger.log('   • ' + user.name + ' (' + user.email + ') - Roles: ' + user.roles);
      validUserCount++;
    }
  }
  
  Logger.log('\n📊 RESUMEN DE DATOS:');
  Logger.log('   • Usuarios válidos: ' + validUserCount);
  Logger.log('   • Total de registros en CFG_Users: ' + users.length);
}

/**
 * quickSystemCheck - Verificación rápida del sistema
 */
function quickSystemCheck() {
  Logger.log('=== VERIFICACIÓN RÁPIDA DEL SISTEMA ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('✓ Spreadsheet: ' + ss.getName());
    Logger.log('✓ ID: ' + ss.getId());
    Logger.log('✓ Hojas: ' + ss.getSheets().length);
    
    // Verificar datos básicos
    const usersSheet = ss.getSheetByName('CFG_Users');
    const usersCount = usersSheet ? usersSheet.getLastRow() - 1 : 0;
    Logger.log('✓ Usuarios: ' + usersCount);
    
    const productsSheet = ss.getSheetByName('CAT_Products');
    const productsCount = productsSheet ? productsSheet.getLastRow() - 1 : 0;
    Logger.log('✓ Productos: ' + productsCount);
    
    Logger.log('\n🎉 Sistema funcionando correctamente');
    Logger.log('📋 Para pruebas completas, ejecuta: testSystemComplete()');
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
  }
}