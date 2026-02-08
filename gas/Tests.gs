/**
 * Tests.gs - Suite de Pruebas Unificada
 * Adiction Boutique Suite
 * 
 * ARCHIVO ÚNICO DE PRUEBAS DEL SISTEMA
 * =====================================
 * Este archivo consolida TODAS las pruebas del sistema en un solo lugar.
 * 
 * FUNCIONES PRINCIPALES:
 * =====================
 * - runAllTests() - Ejecuta todas las pruebas del sistema
 * - runQuickTests() - Ejecuta pruebas rápidas de verificación
 * - runDatabaseTests() - Pruebas de estructura de base de datos
 * - runServiceTests() - Pruebas de servicios de negocio
 * - runValidationTests() - Pruebas de validaciones
 * 
 * CATEGORÍAS DE PRUEBAS:
 * ======================
 * 1. Base de Datos y Estructura
 * 2. Servicios de Negocio (Auth, POS, Credit, etc.)
 * 3. Validaciones y Utilidades
 * 4. Normalización de Datos
 * 5. Optimizaciones y Caché
 * 6. Ingreso Masivo
 */

// ============================================================================
// FUNCIÓN PRINCIPAL - EJECUTAR TODAS LAS PRUEBAS
// ============================================================================

/**
 * runAllTests - Ejecuta todas las pruebas del sistema
 * 
 * Esta es la función principal que ejecuta todas las pruebas en secuencia.
 * Ejecutar desde el editor de Apps Script.
 */
function runAllTests() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  SUITE COMPLETA DE PRUEBAS - ADICTION BOUTIQUE            ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('Iniciando pruebas completas del sistema...');
  Logger.log('Fecha: ' + new Date());
  Logger.log('');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // 1. Pruebas de Base de Datos
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('1. PRUEBAS DE BASE DE DATOS Y ESTRUCTURA');
    Logger.log('═══════════════════════════════════════════════════════════');
    runTest(results, 'Estructura de Base de Datos', testDatabaseStructure);
    runTest(results, 'Datos de Configuración', testConfigurationData);
    Logger.log('');
    
    // 2. Pruebas de Servicios
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('2. PRUEBAS DE SERVICIOS DE NEGOCIO');
    Logger.log('═══════════════════════════════════════════════════════════');
    runTest(results, 'AuthService', testAuthService);
    runTest(results, 'POSService', testPOSService);
    runTest(results, 'CreditService', testCreditService);
    runTest(results, 'BulkProductService', testBulkProductService);
    Logger.log('');
    
    // 3. Pruebas de Validaciones
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('3. PRUEBAS DE VALIDACIONES Y UTILIDADES');
    Logger.log('═══════════════════════════════════════════════════════════');
    runTest(results, 'Validator', testValidator);
    runTest(results, 'LockManager', testLockManager);
    Logger.log('');
    
    // 4. Pruebas de Normalización
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('4. PRUEBAS DE NORMALIZACIÓN DE DATOS');
    Logger.log('═══════════════════════════════════════════════════════════');
    runTest(results, 'Normalización de Clientes', testClientDataNormalization);
    runTest(results, 'Normalización de Dashboard', testDashboardDataNormalization);
    Logger.log('');
    
    // 5. Pruebas de Optimizaciones
    Logger.log('═══════════════════════════════════════════════════════════');
    Logger.log('5. PRUEBAS DE OPTIMIZACIONES');
    Logger.log('═══════════════════════════════════════════════════════════');
    runTest(results, 'Caché de Productos', testProductCache);
    runTest(results, 'Manejo de Errores', testErrorHandling);
    Logger.log('');
    
    // Resumen final
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  RESUMEN DE PRUEBAS                                        ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Total de pruebas: ' + results.total);
    Logger.log('Pruebas exitosas: ' + results.passed + ' ✓');
    Logger.log('Pruebas fallidas: ' + results.failed + ' ✗');
    Logger.log('');
    
    if (results.failed > 0) {
      Logger.log('ERRORES ENCONTRADOS:');
      results.errors.forEach(function(error, index) {
        Logger.log((index + 1) + '. ' + error.test + ': ' + error.message);
      });
      Logger.log('');
      Logger.log('⚠️  ALGUNAS PRUEBAS FALLARON');
    } else {
      Logger.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    }
    
    Logger.log('');
    Logger.log('Finalizado: ' + new Date());
    
    return results;
    
  } catch (error) {
    Logger.log('');
    Logger.log('❌ ERROR CRÍTICO EN SUITE DE PRUEBAS');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * runQuickTests - Ejecuta pruebas rápidas de verificación
 * 
 * Útil para verificación rápida después de cambios
 */
function runQuickTests() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  PRUEBAS RÁPIDAS - VERIFICACIÓN BÁSICA                     ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  runTest(results, 'Estructura de Base de Datos', testDatabaseStructure);
  runTest(results, 'AuthService', testAuthService);
  runTest(results, 'Validator', testValidator);
  
  Logger.log('');
  Logger.log('Resultado: ' + results.passed + '/' + results.total + ' pruebas pasaron');
  
  return results;
}

// ============================================================================
// HELPER PARA EJECUTAR PRUEBAS
// ============================================================================

/**
 * runTest - Ejecuta una prueba individual y registra el resultado
 */
function runTest(results, testName, testFunction) {
  results.total++;
  
  try {
    Logger.log('Ejecutando: ' + testName + '...');
    testFunction();
    results.passed++;
    Logger.log('  ✓ ' + testName + ' - PASÓ');
  } catch (error) {
    results.failed++;
    results.errors.push({
      test: testName,
      message: error.message
    });
    Logger.log('  ✗ ' + testName + ' - FALLÓ');
    Logger.log('    Error: ' + error.message);
  }
}

// ============================================================================
// PRUEBAS DE BASE DE DATOS Y ESTRUCTURA
// ============================================================================

/**
 * testDatabaseStructure - Verifica que todas las hojas existan
 */
function testDatabaseStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const expectedSheets = [
    'CFG_Users', 'CFG_Params',
    'CAT_Lines', 'CAT_Categories', 'CAT_Brands', 'CAT_Sizes', 'CAT_Suppliers',
    'CAT_Products',
    'INV_Stock', 'INV_Movements',
    'CRM_Clients',
    'POS_Sales', 'POS_SaleItems',
    'CRD_Plans', 'CRD_Installments', 'CRD_Payments',
    'CASH_Shifts', 'CASH_Expenses',
    'AUD_Log'
  ];
  
  const missingSheets = [];
  
  expectedSheets.forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      missingSheets.push(sheetName);
    }
  });
  
  if (missingSheets.length > 0) {
    throw new Error('Hojas faltantes: ' + missingSheets.join(', '));
  }
}

/**
 * testConfigurationData - Verifica que los datos de configuración existan
 */
function testConfigurationData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Verificar usuarios
  const usersSheet = ss.getSheetByName('CFG_Users');
  if (!usersSheet || usersSheet.getLastRow() <= 1) {
    throw new Error('CFG_Users no tiene datos');
  }
  
  // Verificar parámetros
  const paramsSheet = ss.getSheetByName('CFG_Params');
  if (!paramsSheet || paramsSheet.getLastRow() <= 1) {
    throw new Error('CFG_Params no tiene datos');
  }
}

// ============================================================================
// PRUEBAS DE SERVICIOS
// ============================================================================

/**
 * testAuthService - Prueba el servicio de autenticación
 */
function testAuthService() {
  const authService = new AuthService();
  
  // Verificar que el servicio se inicializa
  if (!authService) {
    throw new Error('AuthService no se pudo inicializar');
  }
  
  // Probar con un usuario de prueba
  const testEmail = 'admin@adictionboutique.com';
  const isAllowed = authService.isUserAllowed(testEmail);
  
  if (!isAllowed) {
    throw new Error('Usuario de prueba no está permitido');
  }
  
  const roles = authService.getUserRoles(testEmail);
  if (!roles || roles.length === 0) {
    throw new Error('Usuario de prueba no tiene roles');
  }
}

/**
 * testPOSService - Prueba el servicio de punto de venta
 */
function testPOSService() {
  const posService = new POSService();
  
  if (!posService) {
    throw new Error('POSService no se pudo inicializar');
  }
  
  // Verificar que los métodos existen
  if (typeof posService.createSale !== 'function') {
    throw new Error('POSService.createSale no existe');
  }
}

/**
 * testCreditService - Prueba el servicio de crédito
 */
function testCreditService() {
  const creditService = new CreditService();
  
  if (!creditService) {
    throw new Error('CreditService no se pudo inicializar');
  }
  
  // Verificar que los métodos existen
  if (typeof creditService.createCreditPlan !== 'function') {
    throw new Error('CreditService.createCreditPlan no existe');
  }
}

/**
 * testBulkProductService - Prueba el servicio de ingreso masivo
 */
function testBulkProductService() {
  const service = new BulkProductService();
  
  if (!service) {
    throw new Error('BulkProductService no se pudo inicializar');
  }
  
  // Probar getMasterData
  const lines = service.getMasterData('lines', {});
  if (!Array.isArray(lines)) {
    throw new Error('getMasterData no retorna un array');
  }
}

// ============================================================================
// PRUEBAS DE VALIDACIONES
// ============================================================================

/**
 * testValidator - Prueba las funciones de validación
 */
function testValidator() {
  // Validator es un objeto con métodos isRequired, isNumber, etc.
  
  // Test: isRequired con valor válido (no debe lanzar error)
  try {
    Validator.isRequired('test', 'Test');
    // Si llegamos aquí, la validación pasó correctamente
  } catch (e) {
    throw new Error('Validator.isRequired falló con valor válido');
  }
  
  // Test: isRequired con valor vacío (debe lanzar error)
  try {
    Validator.isRequired('', 'Test');
    throw new Error('Validator.isRequired no lanzó error con valor vacío');
  } catch (e) {
    if (e.message.indexOf('es requerido') === -1) {
      throw new Error('Validator.isRequired lanzó error incorrecto: ' + e.message);
    }
  }
  
  // Test: isEmail con email válido
  try {
    Validator.isEmail('test@example.com', 'Email');
    // Si llegamos aquí, la validación pasó correctamente
  } catch (e) {
    throw new Error('Validator.isEmail falló con email válido');
  }
  
  // Test: isEmail con email inválido
  try {
    Validator.isEmail('invalid-email', 'Email');
    throw new Error('Validator.isEmail no lanzó error con email inválido');
  } catch (e) {
    if (e.message.indexOf('email válido') === -1) {
      throw new Error('Validator.isEmail lanzó error incorrecto: ' + e.message);
    }
  }
  
  // Test: isNumber con número válido
  try {
    Validator.isNumber(123, 'Number');
    // Si llegamos aquí, la validación pasó correctamente
  } catch (e) {
    throw new Error('Validator.isNumber falló con número válido');
  }
  
  // Test: isPositive con número positivo
  try {
    Validator.isPositive(10, 'Value');
    // Si llegamos aquí, la validación pasó correctamente
  } catch (e) {
    throw new Error('Validator.isPositive falló con valor válido');
  }
}

/**
 * testLockManager - Prueba el gestor de locks
 */
function testLockManager() {
  // LockManager es un objeto, no una clase
  
  if (!LockManager) {
    throw new Error('LockManager no está definido');
  }
  
  // Verificar que los métodos existen
  if (typeof LockManager.acquireLock !== 'function') {
    throw new Error('LockManager.acquireLock no existe');
  }
  
  if (typeof LockManager.releaseLock !== 'function') {
    throw new Error('LockManager.releaseLock no existe');
  }
}

// ============================================================================
// PRUEBAS DE NORMALIZACIÓN
// ============================================================================

/**
 * testClientDataNormalization - Prueba normalización de datos de clientes
 */
function testClientDataNormalization() {
  // Crear datos de prueba con fechas
  const testData = {
    id: 'test-001',
    name: 'Test Client',
    created_at: new Date(),
    birthday: new Date('1990-01-01')
  };
  
  // Normalizar
  const normalized = normalizeClientData(testData);
  
  // Verificar que las fechas se convirtieron a strings
  if (typeof normalized.created_at !== 'string') {
    throw new Error('created_at no se normalizó a string');
  }
  
  if (typeof normalized.birthday !== 'string') {
    throw new Error('birthday no se normalizó a string');
  }
}

/**
 * testDashboardDataNormalization - Prueba normalización de datos del dashboard
 */
function testDashboardDataNormalization() {
  // Crear datos de prueba
  const testData = {
    timestamp: new Date(),
    value: 100
  };
  
  // Normalizar
  const normalized = normalizeDashboardData(testData);
  
  // Verificar que el timestamp se convirtió a string
  if (typeof normalized.timestamp !== 'string') {
    throw new Error('timestamp no se normalizó a string');
  }
}

// ============================================================================
// PRUEBAS DE OPTIMIZACIONES
// ============================================================================

/**
 * testProductCache - Prueba el caché de productos
 */
function testProductCache() {
  const cache = CacheService.getScriptCache();
  
  // Limpiar caché
  cache.remove('products_all');
  
  // Primera llamada (sin caché)
  const productRepo = new ProductRepository();
  const products1 = productRepo.findAll();
  
  // Segunda llamada (con caché)
  const products2 = productRepo.findAll();
  
  // Verificar que ambas retornan datos
  if (!Array.isArray(products1) || !Array.isArray(products2)) {
    throw new Error('ProductRepository.findAll no retorna array');
  }
}

/**
 * testErrorHandling - Prueba el manejo de errores
 */
function testErrorHandling() {
  try {
    // Intentar crear un error de validación usando Validator
    Validator.isRequired('', 'TestField');
    
    throw new Error('No se lanzó error de validación');
  } catch (error) {
    // Verificar que el error tiene mensaje
    if (!error.message) {
      throw new Error('Error no tiene mensaje');
    }
    
    // Verificar que el mensaje contiene información relevante
    if (error.message.indexOf('requerido') === -1) {
      throw new Error('Error no tiene el mensaje esperado');
    }
  }
}

// ============================================================================
// FUNCIONES AUXILIARES DE NORMALIZACIÓN
// ============================================================================

/**
 * normalizeClientData - Normaliza datos de cliente para pruebas
 */
function normalizeClientData(data) {
  const normalized = Object.assign({}, data);
  
  if (normalized.created_at instanceof Date) {
    normalized.created_at = normalized.created_at.toISOString();
  }
  
  if (normalized.birthday instanceof Date) {
    normalized.birthday = normalized.birthday.toISOString();
  }
  
  return normalized;
}

/**
 * normalizeDashboardData - Normaliza datos de dashboard para pruebas
 */
function normalizeDashboardData(data) {
  const normalized = Object.assign({}, data);
  
  if (normalized.timestamp instanceof Date) {
    normalized.timestamp = normalized.timestamp.toISOString();
  }
  
  return normalized;
}

// ============================================================================
// PRUEBAS ESPECÍFICAS DE INGRESO MASIVO
// ============================================================================

/**
 * testBulkEntryComplete - Prueba completa del sistema de ingreso masivo
 */
function testBulkEntryComplete() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  PRUEBA COMPLETA DE INGRESO MASIVO                         ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  // 1. Verificar estructura
  runTest(results, 'Estructura de hojas maestras', testMasterSheetsStructure);
  
  // 2. Verificar datos maestros
  runTest(results, 'Datos maestros poblados', testMasterDataPopulated);
  
  // 3. Probar servicio
  runTest(results, 'BulkProductService', testBulkProductService);
  
  Logger.log('');
  Logger.log('Resultado: ' + results.passed + '/' + results.total + ' pruebas pasaron');
  
  if (results.failed === 0) {
    Logger.log('✅ Sistema de ingreso masivo listo para usar');
  } else {
    Logger.log('⚠️  Hay problemas con el sistema de ingreso masivo');
  }
  
  return results;
}

/**
 * testMasterSheetsStructure - Verifica estructura de hojas maestras
 */
function testMasterSheetsStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheets = ['CAT_Lines', 'CAT_Categories', 'CAT_Brands', 'CAT_Sizes', 'CAT_Suppliers'];
  
  const missingSheets = [];
  
  masterSheets.forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      missingSheets.push(sheetName);
    }
  });
  
  if (missingSheets.length > 0) {
    throw new Error('Hojas maestras faltantes: ' + missingSheets.join(', '));
  }
}

/**
 * testMasterDataPopulated - Verifica que las hojas maestras tengan datos
 */
function testMasterDataPopulated() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const emptySheets = [];
  
  const masterSheets = {
    'CAT_Lines': 3,
    'CAT_Categories': 10,
    'CAT_Brands': 3,
    'CAT_Sizes': 5,
    'CAT_Suppliers': 2
  };
  
  for (const sheetName in masterSheets) {
    const sheet = ss.getSheetByName(sheetName);
    const minRows = masterSheets[sheetName];
    
    if (!sheet || sheet.getLastRow() <= minRows) {
      emptySheets.push(sheetName + ' (esperado: >' + minRows + ' filas)');
    }
  }
  
  if (emptySheets.length > 0) {
    throw new Error('Hojas maestras sin datos suficientes: ' + emptySheets.join(', '));
  }
}
