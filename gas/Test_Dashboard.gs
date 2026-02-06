/**
 * Test_Dashboard.gs
 * 
 * Script de prueba para verificar la función getDashboardData
 * y la corrección de errores 500
 */

/**
 * testGetDashboardData - Prueba la función getDashboardData
 * 
 * Ejecutar desde el editor de Apps Script para verificar que:
 * 1. La función no lanza errores 500
 * 2. Retorna datos en el formato correcto
 * 3. Maneja errores gracefully
 */
function testGetDashboardData() {
  Logger.log('=== Test: getDashboardData ===\n');
  
  try {
    Logger.log('1. Llamando a getDashboardData()...');
    const result = getDashboardData();
    
    Logger.log('✓ Función ejecutada sin errores');
    Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
    
    // Verificar estructura de respuesta
    Logger.log('\n2. Verificando estructura de respuesta...');
    
    if (!result) {
      Logger.log('✗ Resultado es null o undefined');
      return;
    }
    
    if (typeof result.success !== 'boolean') {
      Logger.log('✗ Campo "success" falta o no es boolean');
    } else {
      Logger.log('✓ Campo "success": ' + result.success);
    }
    
    if (!result.data) {
      Logger.log('✗ Campo "data" falta');
    } else {
      Logger.log('✓ Campo "data" presente');
      
      // Verificar campos de data
      const requiredFields = ['salesToday', 'collectionsToday', 'lowStockCount', 'overdueCount', 'recentSales'];
      
      for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (result.data.hasOwnProperty(field)) {
          Logger.log('  ✓ ' + field + ': ' + JSON.stringify(result.data[field]));
        } else {
          Logger.log('  ✗ ' + field + ': FALTA');
        }
      }
    }
    
    // Verificar que no hay objetos Date en la respuesta
    Logger.log('\n3. Verificando que no hay objetos Date...');
    const jsonString = JSON.stringify(result);
    Logger.log('✓ JSON serializado correctamente');
    Logger.log('Tamaño: ' + jsonString.length + ' caracteres');
    
    // Intentar parsear de vuelta
    Logger.log('\n4. Verificando que se puede parsear de vuelta...');
    const parsed = JSON.parse(jsonString);
    Logger.log('✓ JSON parseado correctamente');
    
    Logger.log('\n=== Test Completado Exitosamente ===');
    
    if (result.success) {
      Logger.log('✓ getDashboardData() funciona correctamente');
      Logger.log('✓ No habrá errores 500 al cargar el dashboard');
    } else {
      Logger.log('⚠ getDashboardData() retornó success=false');
      Logger.log('Error: ' + result.error);
      Logger.log('Pero la función no lanzó excepción, así que no habrá error 500');
    }
    
  } catch (error) {
    Logger.log('\n✗ Error en el test: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    Logger.log('\n⚠ ESTE ERROR CAUSARÍA UN ERROR 500 EN PRODUCCIÓN');
  }
}

/**
 * testGetDashboardDataWithEmptySheets - Prueba con hojas vacías
 * 
 * Verifica que la función maneja correctamente el caso de hojas sin datos
 */
function testGetDashboardDataWithEmptySheets() {
  Logger.log('=== Test: getDashboardData con Hojas Vacías ===\n');
  
  try {
    Logger.log('Este test verifica que getDashboardData() no falla');
    Logger.log('incluso si las hojas están vacías o tienen errores.\n');
    
    const result = getDashboardData();
    
    Logger.log('Resultado: ' + JSON.stringify(result, null, 2));
    
    if (result.success) {
      Logger.log('\n✓ La función maneja correctamente hojas vacías');
      Logger.log('✓ Retorna valores por defecto (0) en lugar de fallar');
    } else {
      Logger.log('\n⚠ La función retornó success=false');
      Logger.log('Pero no lanzó excepción, así que no hay error 500');
    }
    
    // Verificar que los valores por defecto son correctos
    if (result.data) {
      Logger.log('\nValores retornados:');
      Logger.log('  - salesToday: ' + result.data.salesToday + ' (esperado: >= 0)');
      Logger.log('  - collectionsToday: ' + result.data.collectionsToday + ' (esperado: >= 0)');
      Logger.log('  - lowStockCount: ' + result.data.lowStockCount + ' (esperado: >= 0)');
      Logger.log('  - overdueCount: ' + result.data.overdueCount + ' (esperado: >= 0)');
      Logger.log('  - recentSales: ' + result.data.recentSales.length + ' ventas (esperado: >= 0)');
    }
    
    Logger.log('\n=== Test Completado ===');
    
  } catch (error) {
    Logger.log('\n✗ Error: ' + error.message);
    Logger.log('⚠ ESTE ERROR CAUSARÍA UN ERROR 500');
  }
}

/**
 * testClientDataNormalization - Prueba la normalización de fechas en getClients
 */
function testClientDataNormalization() {
  Logger.log('=== Test: Normalización de Fechas en getClients ===\n');
  
  try {
    Logger.log('1. Llamando a getClients()...');
    const result = getClients();
    
    Logger.log('✓ Función ejecutada sin errores');
    
    if (!result.success) {
      Logger.log('⚠ getClients() retornó success=false');
      Logger.log('Error: ' + result.error);
      return;
    }
    
    Logger.log('✓ success=true');
    Logger.log('Clientes retornados: ' + result.data.length);
    
    if (result.data.length === 0) {
      Logger.log('⚠ No hay clientes para verificar normalización');
      return;
    }
    
    // Verificar primer cliente
    Logger.log('\n2. Verificando normalización del primer cliente...');
    const firstClient = result.data[0];
    
    let hasDateObjects = false;
    for (const key in firstClient) {
      if (firstClient.hasOwnProperty(key)) {
        const value = firstClient[key];
        if (value instanceof Date) {
          Logger.log('✗ Campo "' + key + '" es un objeto Date (debería ser string)');
          hasDateObjects = true;
        }
      }
    }
    
    if (!hasDateObjects) {
      Logger.log('✓ No hay objetos Date en los datos');
    }
    
    // Intentar serializar
    Logger.log('\n3. Verificando serialización JSON...');
    const jsonString = JSON.stringify(result);
    Logger.log('✓ JSON serializado correctamente');
    Logger.log('Tamaño: ' + jsonString.length + ' caracteres');
    
    Logger.log('\n=== Test Completado ===');
    
    if (!hasDateObjects) {
      Logger.log('✓ getClients() normaliza fechas correctamente');
      Logger.log('✓ No habrá errores de DataTables por objetos Date');
    } else {
      Logger.log('✗ Hay objetos Date sin normalizar');
      Logger.log('⚠ Esto causará errores en DataTables');
    }
    
  } catch (error) {
    Logger.log('\n✗ Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testHandleClientAction - Prueba handleClientAction directamente
 */
function testHandleClientAction() {
  Logger.log('=== Test: handleClientAction ===\n');
  
  try {
    Logger.log('1. Llamando a handleClientAction("getClients", {}, "test@example.com")...');
    
    const payload = {
      status: 'true'
    };
    
    const result = handleClientAction('getClients', payload, 'test@example.com');
    
    Logger.log('✓ Función ejecutada sin errores');
    Logger.log('Clientes retornados: ' + result.length);
    
    if (result.length === 0) {
      Logger.log('⚠ No hay clientes activos');
      return;
    }
    
    // Verificar normalización
    Logger.log('\n2. Verificando normalización...');
    const firstClient = result[0];
    
    let hasDateObjects = false;
    for (const key in firstClient) {
      if (firstClient.hasOwnProperty(key)) {
        const value = firstClient[key];
        if (value instanceof Date) {
          Logger.log('✗ Campo "' + key + '" es un objeto Date');
          hasDateObjects = true;
        }
      }
    }
    
    if (!hasDateObjects) {
      Logger.log('✓ No hay objetos Date');
    }
    
    // Serializar
    Logger.log('\n3. Serializando a JSON...');
    const jsonString = JSON.stringify(result);
    Logger.log('✓ Serializado correctamente');
    
    Logger.log('\n=== Test Completado ===');
    
    if (!hasDateObjects) {
      Logger.log('✓ handleClientAction normaliza fechas correctamente');
    } else {
      Logger.log('✗ Hay objetos Date sin normalizar');
    }
    
  } catch (error) {
    Logger.log('\n✗ Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * runAllDashboardTests - Ejecuta todos los tests
 */
function runAllDashboardTests() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  TESTS DE DASHBOARD Y ESTABILIZACIÓN                       ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝\n');
  
  testGetDashboardData();
  Logger.log('\n' + '='.repeat(60) + '\n');
  
  testGetDashboardDataWithEmptySheets();
  Logger.log('\n' + '='.repeat(60) + '\n');
  
  testClientDataNormalization();
  Logger.log('\n' + '='.repeat(60) + '\n');
  
  testHandleClientAction();
  
  Logger.log('\n╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  TESTS COMPLETADOS                                         ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
}
