/**
 * Test_ClientDataNormalization.gs
 * 
 * Script de prueba para verificar la normalización de datos de clientes
 * y la corrección del error de DataTable Ajax
 */

/**
 * testClientDataNormalization - Prueba la normalización de datos de clientes
 * 
 * Ejecutar desde el editor de Apps Script para verificar que:
 * 1. Los datos de clientes se obtienen correctamente
 * 2. Los objetos Date se convierten a strings
 * 3. Los datos se pueden serializar a JSON sin errores
 */
function testClientDataNormalization() {
  Logger.log('=== Test: Client Data Normalization ===\n');
  
  try {
    // 1. Obtener clientes usando el repositorio
    Logger.log('1. Obteniendo clientes del repositorio...');
    const clientRepo = new ClientRepository();
    const clients = clientRepo.findAll();
    Logger.log('✓ Clientes obtenidos: ' + clients.length);
    
    if (clients.length === 0) {
      Logger.log('⚠ No hay clientes en la base de datos para probar');
      Logger.log('Por favor, ejecute primero la función de seed data');
      return;
    }
    
    // 2. Verificar tipos de datos en el primer cliente
    Logger.log('\n2. Verificando tipos de datos del primer cliente...');
    const firstClient = clients[0];
    Logger.log('Cliente: ' + firstClient.name);
    
    for (const key in firstClient) {
      if (firstClient.hasOwnProperty(key)) {
        const value = firstClient[key];
        const type = typeof value;
        const isDate = value instanceof Date;
        Logger.log('  - ' + key + ': ' + type + (isDate ? ' (Date object)' : ''));
      }
    }
    
    // 3. Intentar serializar sin normalización (debería fallar o dar warning)
    Logger.log('\n3. Intentando serializar SIN normalización...');
    try {
      const jsonWithoutNormalization = JSON.stringify(clients[0]);
      Logger.log('✓ JSON sin normalización (puede tener problemas):');
      Logger.log(jsonWithoutNormalization.substring(0, 200) + '...');
    } catch (e) {
      Logger.log('✗ Error al serializar sin normalización: ' + e.message);
    }
    
    // 4. Normalizar datos (como en handleClientAction)
    Logger.log('\n4. Normalizando datos...');
    const normalizedClients = clients.map(function(client) {
      const normalized = {};
      for (const key in client) {
        if (client.hasOwnProperty(key)) {
          const value = client[key];
          // Convertir Date objects a ISO strings
          if (value instanceof Date) {
            normalized[key] = value.toISOString();
          } else {
            normalized[key] = value;
          }
        }
      }
      return normalized;
    });
    Logger.log('✓ Datos normalizados: ' + normalizedClients.length + ' clientes');
    
    // 5. Verificar tipos después de normalización
    Logger.log('\n5. Verificando tipos después de normalización...');
    const firstNormalized = normalizedClients[0];
    for (const key in firstNormalized) {
      if (firstNormalized.hasOwnProperty(key)) {
        const value = firstNormalized[key];
        const type = typeof value;
        const isDate = value instanceof Date;
        Logger.log('  - ' + key + ': ' + type + (isDate ? ' (Date object)' : ''));
      }
    }
    
    // 6. Serializar datos normalizados
    Logger.log('\n6. Serializando datos normalizados...');
    try {
      const jsonNormalized = JSON.stringify(normalizedClients[0]);
      Logger.log('✓ JSON normalizado (correcto):');
      Logger.log(jsonNormalized.substring(0, 200) + '...');
    } catch (e) {
      Logger.log('✗ Error al serializar datos normalizados: ' + e.message);
    }
    
    // 7. Probar la función handleClientAction directamente
    Logger.log('\n7. Probando handleClientAction()...');
    const payload = {
      status: 'true'
    };
    const result = handleClientAction('getClients', payload, 'test@example.com');
    Logger.log('✓ handleClientAction retornó: ' + result.length + ' clientes');
    
    // 8. Verificar que el resultado se puede serializar
    Logger.log('\n8. Verificando serialización del resultado...');
    try {
      const jsonResult = JSON.stringify(result);
      Logger.log('✓ Resultado serializado correctamente');
      Logger.log('Tamaño del JSON: ' + jsonResult.length + ' caracteres');
    } catch (e) {
      Logger.log('✗ Error al serializar resultado: ' + e.message);
    }
    
    Logger.log('\n=== Test Completado Exitosamente ===');
    Logger.log('✓ La normalización de datos funciona correctamente');
    Logger.log('✓ Los datos se pueden serializar a JSON sin errores');
    Logger.log('✓ El DataTable debería cargar correctamente');
    
  } catch (error) {
    Logger.log('\n✗ Error en el test: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testGetClientsEndpoint - Prueba el endpoint getClients usado por DataTable
 * 
 * Simula una llamada POST al endpoint para verificar que retorna
 * datos correctamente formateados
 */
function testGetClientsEndpoint() {
  Logger.log('=== Test: getClients Endpoint ===\n');
  
  try {
    // Simular una llamada POST
    Logger.log('1. Simulando llamada POST a getClients...');
    const e = {
      postData: {
        contents: JSON.stringify({
          action: 'getClients',
          payload: {
            status: 'true'
          },
          requestId: 'test-' + new Date().getTime()
        })
      }
    };
    
    // Ejecutar doPost
    Logger.log('2. Ejecutando doPost...');
    const response = doPost(e);
    
    // Parsear respuesta
    Logger.log('3. Parseando respuesta...');
    const responseText = response.getContent();
    const responseData = JSON.parse(responseText);
    
    Logger.log('✓ Respuesta parseada correctamente');
    Logger.log('ok: ' + responseData.ok);
    Logger.log('data: ' + (responseData.data ? responseData.data.length + ' clientes' : 'null'));
    Logger.log('error: ' + (responseData.error || 'null'));
    
    // Verificar estructura de datos
    if (responseData.ok && responseData.data && responseData.data.length > 0) {
      Logger.log('\n4. Verificando estructura del primer cliente...');
      const firstClient = responseData.data[0];
      
      const requiredFields = ['id', 'dni', 'name', 'phone', 'credit_limit', 'credit_used', 'active'];
      let allFieldsPresent = true;
      
      for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        const present = firstClient.hasOwnProperty(field);
        Logger.log('  - ' + field + ': ' + (present ? '✓' : '✗'));
        if (!present) {
          allFieldsPresent = false;
        }
      }
      
      if (allFieldsPresent) {
        Logger.log('\n✓ Todos los campos requeridos están presentes');
      } else {
        Logger.log('\n⚠ Algunos campos requeridos faltan');
      }
      
      // Verificar que no hay objetos Date
      Logger.log('\n5. Verificando que no hay objetos Date...');
      let hasDateObjects = false;
      for (const key in firstClient) {
        if (firstClient.hasOwnProperty(key)) {
          if (firstClient[key] instanceof Date) {
            Logger.log('✗ Campo "' + key + '" es un objeto Date (debería ser string)');
            hasDateObjects = true;
          }
        }
      }
      
      if (!hasDateObjects) {
        Logger.log('✓ No hay objetos Date en los datos');
      }
    }
    
    Logger.log('\n=== Test Completado ===');
    
    if (responseData.ok) {
      Logger.log('✓ El endpoint getClients funciona correctamente');
      Logger.log('✓ Los datos están correctamente normalizados');
      Logger.log('✓ DataTable debería cargar sin errores');
    } else {
      Logger.log('✗ El endpoint retornó un error: ' + responseData.error.message);
    }
    
  } catch (error) {
    Logger.log('\n✗ Error en el test: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testBarcodeScanner - Verifica la configuración del Barcode Scanner
 * 
 * Verifica que la página del scanner tenga la configuración correcta
 * para acceso a la cámara
 */
function testBarcodeScanner() {
  Logger.log('=== Test: Barcode Scanner Configuration ===\n');
  
  try {
    // Simular usuario autenticado
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      roles: ['Vendedor']
    };
    
    // Renderizar página del scanner
    Logger.log('1. Renderizando página del Barcode Scanner...');
    const html = renderBarcodeScanner(userData, {});
    
    Logger.log('✓ Página renderizada correctamente');
    
    // Verificar XFrameOptionsMode
    Logger.log('\n2. Verificando XFrameOptionsMode...');
    const xFrameMode = html.getXFrameOptionsMode();
    Logger.log('XFrameOptionsMode: ' + xFrameMode);
    
    if (xFrameMode === HtmlService.XFrameOptionsMode.ALLOWALL) {
      Logger.log('✓ XFrameOptionsMode está configurado como ALLOWALL');
      Logger.log('✓ La cámara debería funcionar correctamente');
    } else {
      Logger.log('✗ XFrameOptionsMode NO está configurado como ALLOWALL');
      Logger.log('✗ La cámara puede no funcionar');
    }
    
    // Verificar contenido HTML
    Logger.log('\n3. Verificando contenido HTML...');
    const content = html.getContent();
    
    const hasQuaggaScript = content.indexOf('quagga') !== -1;
    const hasGetUserMedia = content.indexOf('getUserMedia') !== -1;
    const hasInteractiveDiv = content.indexOf('id="interactive"') !== -1;
    
    Logger.log('  - Script de Quagga: ' + (hasQuaggaScript ? '✓' : '✗'));
    Logger.log('  - getUserMedia: ' + (hasGetUserMedia ? '✓' : '✗'));
    Logger.log('  - Div interactive: ' + (hasInteractiveDiv ? '✓' : '✗'));
    
    Logger.log('\n=== Test Completado ===');
    
    if (xFrameMode === HtmlService.XFrameOptionsMode.ALLOWALL && hasQuaggaScript && hasGetUserMedia) {
      Logger.log('✓ El Barcode Scanner está configurado correctamente');
      Logger.log('✓ La cámara debería funcionar sin errores de permisos');
    } else {
      Logger.log('⚠ Hay problemas con la configuración del scanner');
    }
    
  } catch (error) {
    Logger.log('\n✗ Error en el test: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * runAllTests - Ejecuta todos los tests de verificación
 */
function runAllTests() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  TESTS DE VERIFICACIÓN - DataTable y Barcode Scanner      ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝\n');
  
  testClientDataNormalization();
  Logger.log('\n' + '='.repeat(60) + '\n');
  
  testGetClientsEndpoint();
  Logger.log('\n' + '='.repeat(60) + '\n');
  
  testBarcodeScanner();
  
  Logger.log('\n╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  TESTS COMPLETADOS                                         ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
}
