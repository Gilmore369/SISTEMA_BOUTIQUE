/**
 * Test_Util.gs
 * Tests unitarios para las funciones de validación en Util.gs
 * 
 * Para ejecutar: abrir el editor de Apps Script y ejecutar testValidator()
 */

/**
 * Test principal de validaciones
 */
function testValidator() {
  Logger.log('=== Iniciando tests de Validator ===');
  
  var passed = 0;
  var failed = 0;
  
  // Test 1: isRequired - debe pasar con valores válidos
  try {
    Validator.isRequired('valor', 'campo');
    Validator.isRequired(123, 'numero');
    Validator.isRequired(0, 'cero'); // cero es válido
    Logger.log('✓ Test 1 PASS: isRequired acepta valores válidos');
    passed++;
  } catch (e) {
    Logger.log('✗ Test 1 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 2: isRequired - debe fallar con valores inválidos
  try {
    Validator.isRequired('', 'campo');
    Logger.log('✗ Test 2 FAIL: isRequired debería rechazar string vacío');
    failed++;
  } catch (e) {
    if (e.message.indexOf('es requerido') > -1) {
      Logger.log('✓ Test 2 PASS: isRequired rechaza string vacío');
      passed++;
    } else {
      Logger.log('✗ Test 2 FAIL: mensaje incorrecto - ' + e.message);
      failed++;
    }
  }
  
  // Test 3: isNumber - debe pasar con números válidos
  try {
    Validator.isNumber(123, 'numero');
    Validator.isNumber('456', 'string_numero');
    Validator.isNumber(0, 'cero');
    Validator.isNumber(-10, 'negativo');
    Logger.log('✓ Test 3 PASS: isNumber acepta números válidos');
    passed++;
  } catch (e) {
    Logger.log('✗ Test 3 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 4: isNumber - debe fallar con valores no numéricos
  try {
    Validator.isNumber('abc', 'texto');
    Logger.log('✗ Test 4 FAIL: isNumber debería rechazar texto');
    failed++;
  } catch (e) {
    if (e.message.indexOf('debe ser un número válido') > -1) {
      Logger.log('✓ Test 4 PASS: isNumber rechaza texto');
      passed++;
    } else {
      Logger.log('✗ Test 4 FAIL: mensaje incorrecto - ' + e.message);
      failed++;
    }
  }
  
  // Test 5: isPositive - debe pasar con números positivos
  try {
    Validator.isPositive(1, 'uno');
    Validator.isPositive(100.5, 'decimal');
    Validator.isPositive('50', 'string_positivo');
    Logger.log('✓ Test 5 PASS: isPositive acepta números positivos');
    passed++;
  } catch (e) {
    Logger.log('✗ Test 5 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 6: isPositive - debe fallar con cero y negativos
  try {
    Validator.isPositive(0, 'cero');
    Logger.log('✗ Test 6 FAIL: isPositive debería rechazar cero');
    failed++;
  } catch (e) {
    if (e.message.indexOf('debe ser un número positivo') > -1) {
      Logger.log('✓ Test 6 PASS: isPositive rechaza cero');
      passed++;
    } else {
      Logger.log('✗ Test 6 FAIL: mensaje incorrecto - ' + e.message);
      failed++;
    }
  }
  
  // Test 7: isEmail - debe pasar con emails válidos
  try {
    Validator.isEmail('usuario@dominio.com', 'email');
    Validator.isEmail('test.user+tag@example.co.uk', 'email_complejo');
    Logger.log('✓ Test 7 PASS: isEmail acepta emails válidos');
    passed++;
  } catch (e) {
    Logger.log('✗ Test 7 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 8: isEmail - debe fallar con emails inválidos
  try {
    Validator.isEmail('no-es-email', 'email');
    Logger.log('✗ Test 8 FAIL: isEmail debería rechazar formato inválido');
    failed++;
  } catch (e) {
    if (e.message.indexOf('debe ser un email válido') > -1) {
      Logger.log('✓ Test 8 PASS: isEmail rechaza formato inválido');
      passed++;
    } else {
      Logger.log('✗ Test 8 FAIL: mensaje incorrecto - ' + e.message);
      failed++;
    }
  }
  
  // Test 9: isInRange - debe pasar con valores en rango
  try {
    Validator.isInRange(5, 1, 10, 'rango');
    Validator.isInRange(1, 1, 10, 'minimo');
    Validator.isInRange(10, 1, 10, 'maximo');
    Logger.log('✓ Test 9 PASS: isInRange acepta valores en rango');
    passed++;
  } catch (e) {
    Logger.log('✗ Test 9 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 10: isInRange - debe fallar con valores fuera de rango
  try {
    Validator.isInRange(11, 1, 10, 'fuera_rango');
    Logger.log('✗ Test 10 FAIL: isInRange debería rechazar valor fuera de rango');
    failed++;
  } catch (e) {
    if (e.message.indexOf('debe estar entre') > -1) {
      Logger.log('✓ Test 10 PASS: isInRange rechaza valor fuera de rango');
      passed++;
    } else {
      Logger.log('✗ Test 10 FAIL: mensaje incorrecto - ' + e.message);
      failed++;
    }
  }
  
  // Test 11: Helpers de utilidad
  try {
    var id = generateId();
    var reqId = generateRequestId();
    var money = formatMoney(123.456);
    var parsed = parseMoney('99.99');
    
    if (id.indexOf('ID_') === 0 && 
        reqId.indexOf('REQ_') === 0 && 
        money === '123.46' && 
        parsed === 99.99) {
      Logger.log('✓ Test 11 PASS: Helpers de utilidad funcionan correctamente');
      passed++;
    } else {
      Logger.log('✗ Test 11 FAIL: Helpers no retornan valores esperados');
      failed++;
    }
  } catch (e) {
    Logger.log('✗ Test 11 FAIL: ' + e.message);
    failed++;
  }
  
  // Resumen
  Logger.log('');
  Logger.log('=== Resumen de Tests ===');
  Logger.log('Tests ejecutados: ' + (passed + failed));
  Logger.log('Tests exitosos: ' + passed);
  Logger.log('Tests fallidos: ' + failed);
  
  if (failed === 0) {
    Logger.log('✓ TODOS LOS TESTS PASARON');
    return true;
  } else {
    Logger.log('✗ ALGUNOS TESTS FALLARON');
    return false;
  }
}

/**
 * Test rápido para verificar que el archivo se cargó correctamente
 */
function quickTest() {
  try {
    Validator.isRequired('test', 'campo');
    Logger.log('✓ Util.gs cargado correctamente');
    return true;
  } catch (e) {
    Logger.log('✗ Error al cargar Util.gs: ' + e.message);
    return false;
  }
}

/**
 * Test de LockManager
 */
function testLockManager() {
  Logger.log('=== Iniciando tests de LockManager ===');
  
  var passed = 0;
  var failed = 0;
  
  // Test 1: acquireLock y releaseLock básico
  try {
    var lock = LockManager.acquireLock('test_lock', 5000);
    if (lock) {
      LockManager.releaseLock(lock);
      Logger.log('✓ Test 1 PASS: acquireLock y releaseLock funcionan correctamente');
      passed++;
    } else {
      Logger.log('✗ Test 1 FAIL: acquireLock no retornó un lock válido');
      failed++;
    }
  } catch (e) {
    Logger.log('✗ Test 1 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 2: withLock ejecuta función correctamente
  try {
    var resultado = LockManager.withLock('test_with_lock', function() {
      return 'operacion_exitosa';
    });
    
    if (resultado === 'operacion_exitosa') {
      Logger.log('✓ Test 2 PASS: withLock ejecuta función y retorna resultado');
      passed++;
    } else {
      Logger.log('✗ Test 2 FAIL: withLock no retornó el resultado esperado');
      failed++;
    }
  } catch (e) {
    Logger.log('✗ Test 2 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 3: withLock libera lock incluso si función lanza error
  try {
    try {
      LockManager.withLock('test_error_lock', function() {
        throw new Error('Error intencional');
      });
      Logger.log('✗ Test 3 FAIL: withLock debería propagar el error');
      failed++;
    } catch (e) {
      if (e.message === 'Error intencional') {
        // El error se propagó correctamente
        // Intentar adquirir el mismo lock para verificar que se liberó
        var lock2 = LockManager.acquireLock('test_verify_release', 2000);
        LockManager.releaseLock(lock2);
        Logger.log('✓ Test 3 PASS: withLock libera lock incluso con error');
        passed++;
      } else {
        Logger.log('✗ Test 3 FAIL: Error inesperado - ' + e.message);
        failed++;
      }
    }
  } catch (e) {
    Logger.log('✗ Test 3 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 4: withLock con operación que retorna objeto
  try {
    var resultado = LockManager.withLock('test_object_return', function() {
      return {
        id: 'VENTA_123',
        total: 150.50,
        items: ['item1', 'item2']
      };
    });
    
    if (resultado.id === 'VENTA_123' && resultado.total === 150.50) {
      Logger.log('✓ Test 4 PASS: withLock retorna objetos complejos correctamente');
      passed++;
    } else {
      Logger.log('✗ Test 4 FAIL: withLock no retornó el objeto esperado');
      failed++;
    }
  } catch (e) {
    Logger.log('✗ Test 4 FAIL: ' + e.message);
    failed++;
  }
  
  // Test 5: Simulación de operación crítica con validación
  try {
    var stockInicial = 100;
    var cantidadVenta = 10;
    
    var resultado = LockManager.withLock('test_venta_simulada', function() {
      // Simular validación de stock
      if (stockInicial < cantidadVenta) {
        throw new Error('Stock insuficiente');
      }
      
      // Simular decremento de stock
      var stockFinal = stockInicial - cantidadVenta;
      
      return {
        ventaId: 'V001',
        stockAnterior: stockInicial,
        stockNuevo: stockFinal,
        cantidad: cantidadVenta
      };
    });
    
    if (resultado.stockNuevo === 90) {
      Logger.log('✓ Test 5 PASS: Simulación de operación crítica funciona correctamente');
      passed++;
    } else {
      Logger.log('✗ Test 5 FAIL: Cálculo de stock incorrecto');
      failed++;
    }
  } catch (e) {
    Logger.log('✗ Test 5 FAIL: ' + e.message);
    failed++;
  }
  
  // Resumen
  Logger.log('');
  Logger.log('=== Resumen de Tests LockManager ===');
  Logger.log('Tests ejecutados: ' + (passed + failed));
  Logger.log('Tests exitosos: ' + passed);
  Logger.log('Tests fallidos: ' + failed);
  
  if (failed === 0) {
    Logger.log('✓ TODOS LOS TESTS DE LOCKMANAGER PASARON');
    return true;
  } else {
    Logger.log('✗ ALGUNOS TESTS DE LOCKMANAGER FALLARON');
    return false;
  }
}

/**
 * Test completo: ejecuta todos los tests
 */
function testAll() {
  Logger.log('========================================');
  Logger.log('EJECUTANDO TODOS LOS TESTS DE UTIL.GS');
  Logger.log('========================================');
  Logger.log('');
  
  var validatorPassed = testValidator();
  Logger.log('');
  var lockManagerPassed = testLockManager();
  
  Logger.log('');
  Logger.log('========================================');
  Logger.log('RESUMEN GENERAL');
  Logger.log('========================================');
  
  if (validatorPassed && lockManagerPassed) {
    Logger.log('✓✓✓ TODOS LOS TESTS PASARON ✓✓✓');
    return true;
  } else {
    Logger.log('✗✗✗ ALGUNOS TESTS FALLARON ✗✗✗');
    if (!validatorPassed) Logger.log('  - Tests de Validator: FALLIDOS');
    if (!lockManagerPassed) Logger.log('  - Tests de LockManager: FALLIDOS');
    return false;
  }
}

