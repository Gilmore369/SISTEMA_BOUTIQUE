/**
 * ResponseNormalizer.gs - Normalización de Respuestas Backend-Frontend
 * Adiction Boutique Suite
 * 
 * Este archivo contiene utilidades para garantizar comunicación robusta
 * entre el backend (Apps Script) y el frontend (HTML/JavaScript).
 * 
 * Características:
 * - Conversión automática de Date a ISO strings
 * - Manejo de valores nulos
 * - Envoltura try-catch para todas las operaciones
 * - Estructura de respuesta consistente {success, data/error}
 * 
 * Requisitos: 31.1, 31.2, 31.3
 */

// ============================================================================
// NORMALIZACIÓN DE DATOS
// ============================================================================

/**
 * safeResponse - Convierte todas las fechas a strings ISO y maneja nulos
 * 
 * Esta función recorre recursivamente cualquier objeto o array y:
 * 1. Convierte todas las instancias de Date a strings ISO (.toISOString())
 * 2. Maneja valores nulos de forma segura
 * 3. Preserva la estructura de datos original
 * 
 * Esto previene errores 500 cuando Apps Script intenta serializar fechas
 * nativas de JavaScript para enviarlas al cliente via google.script.run.
 * 
 * Requisitos: 31.1
 * 
 * @param {*} data - Datos a procesar (puede ser objeto, array, primitivo)
 * @returns {*} Datos procesados con fechas convertidas a strings
 * 
 * @example
 * const data = { date: new Date(), items: [{ created: new Date() }] };
 * const safe = safeResponse(data);
 * // Resultado: { date: "2026-02-06T...", items: [{ created: "2026-02-06T..." }] }
 */
function safeResponse(data) {
  // Si es null o undefined, retornar tal cual
  if (data === null || data === undefined) {
    return data;
  }
  
  // Si es una fecha, convertir a ISO string
  if (data instanceof Date) {
    try {
      return data.toISOString();
    } catch (e) {
      // Si la fecha es inválida, retornar null
      Logger.log('Warning: Fecha inválida encontrada: ' + e.message);
      return null;
    }
  }
  
  // Si es un array, procesar cada elemento
  if (Array.isArray(data)) {
    return data.map(function(item) {
      return safeResponse(item);
    });
  }
  
  // Si es un objeto (pero no Date ni Array), procesar cada propiedad
  if (typeof data === 'object') {
    var result = {};
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        result[key] = safeResponse(data[key]);
      }
    }
    return result;
  }
  
  // Si es un primitivo (string, number, boolean), retornar tal cual
  return data;
}

// ============================================================================
// ENVOLTURA DE OPERACIONES
// ============================================================================

/**
 * wrapResponse - Envuelve una función en try-catch y retorna respuesta estructurada
 * 
 * Esta función garantiza que TODAS las operaciones llamadas por google.script.run
 * retornen un objeto estructurado {success: true/false, data/error} y nunca fallen
 * sin retornar una respuesta.
 * 
 * Requisitos: 31.2, 31.3
 * 
 * @param {Function} fn - Función a ejecutar
 * @returns {Object} {success: boolean, data: *, error: string}
 * 
 * @example
 * function getDashboardData() {
 *   return wrapResponse(function() {
 *     // Lógica de negocio aquí
 *     return { ventas: 100, cobros: 50 };
 *   });
 * }
 */
function wrapResponse(fn) {
  try {
    // Validar que fn sea una función
    if (typeof fn !== 'function') {
      throw new Error('wrapResponse requiere una función como parámetro');
    }
    
    // Ejecutar la función
    var result = fn();
    
    // Normalizar el resultado (convertir fechas, etc.)
    var normalizedResult = safeResponse(result);
    
    // Retornar respuesta exitosa
    return {
      success: true,
      data: normalizedResult,
      error: null
    };
    
  } catch (error) {
    // Registrar error en log
    Logger.log('ERROR en wrapResponse: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    // Retornar respuesta de error estructurada
    return {
      success: false,
      data: null,
      error: error.message || 'Error desconocido'
    };
  }
}

// ============================================================================
// FUNCIONES DE RESPUESTA ESTÁNDAR
// ============================================================================

/**
 * createSuccessResponse - Crea una respuesta exitosa normalizada
 * 
 * @param {*} data - Datos a retornar
 * @returns {TextOutput} Respuesta JSON con formato estándar
 */
function createSuccessResponse(data) {
  var response = {
    success: true,
    ok: true,
    data: safeResponse(data),
    error: null
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * createErrorResponse - Crea una respuesta de error normalizada
 * 
 * @param {string} code - Código de error
 * @param {string} message - Mensaje de error
 * @param {*} details - Detalles adicionales (opcional)
 * @returns {TextOutput} Respuesta JSON con formato estándar
 */
function createErrorResponse(code, message, details) {
  var response = {
    success: false,
    ok: false,
    data: null,
    error: {
      code: code || 'UNKNOWN_ERROR',
      message: message || 'Error desconocido',
      details: safeResponse(details) || null
    }
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testResponseNormalizer - Prueba las funciones de normalización
 */
function testResponseNormalizer() {
  Logger.log('=== Iniciando pruebas de ResponseNormalizer ===');
  
  try {
    // Probar safeResponse con fechas
    Logger.log('\n1. Probando safeResponse con fechas...');
    var dataWithDates = {
      name: 'Test',
      created: new Date(),
      items: [
        { id: 1, date: new Date() },
        { id: 2, date: new Date() }
      ]
    };
    
    var normalized = safeResponse(dataWithDates);
    Logger.log('✓ Datos normalizados:');
    Logger.log(JSON.stringify(normalized, null, 2));
    
    // Probar safeResponse con nulos
    Logger.log('\n2. Probando safeResponse con nulos...');
    var dataWithNulls = {
      name: 'Test',
      value: null,
      items: [null, undefined, 'valid']
    };
    
    var normalizedNulls = safeResponse(dataWithNulls);
    Logger.log('✓ Datos con nulos normalizados:');
    Logger.log(JSON.stringify(normalizedNulls, null, 2));
    
    // Probar wrapResponse con función exitosa
    Logger.log('\n3. Probando wrapResponse con función exitosa...');
    var successResult = wrapResponse(function() {
      return {
        message: 'Operación exitosa',
        timestamp: new Date()
      };
    });
    
    Logger.log('✓ Resultado exitoso:');
    Logger.log(JSON.stringify(successResult, null, 2));
    
    // Probar wrapResponse con función que falla
    Logger.log('\n4. Probando wrapResponse con función que falla...');
    var errorResult = wrapResponse(function() {
      throw new Error('Error simulado para prueba');
    });
    
    Logger.log('✓ Resultado de error:');
    Logger.log(JSON.stringify(errorResult, null, 2));
    
    // Probar createSuccessResponse
    Logger.log('\n5. Probando createSuccessResponse...');
    var successResponse = createSuccessResponse({
      data: 'test',
      date: new Date()
    });
    
    Logger.log('✓ Respuesta exitosa creada:');
    Logger.log(successResponse.getContent());
    
    // Probar createErrorResponse
    Logger.log('\n6. Probando createErrorResponse...');
    var errorResponse = createErrorResponse(
      'TEST_ERROR',
      'Este es un error de prueba',
      { detail1: 'valor1', detail2: 'valor2' }
    );
    
    Logger.log('✓ Respuesta de error creada:');
    Logger.log(errorResponse.getContent());
    
    Logger.log('\n=== Pruebas de ResponseNormalizer completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testResponseNormalizerWithRealData - Prueba con datos reales del sistema
 */
function testResponseNormalizerWithRealData() {
  Logger.log('=== Iniciando pruebas con datos reales ===');
  
  try {
    // Probar con datos de clientes
    Logger.log('\n1. Probando con datos de clientes...');
    var clientRepo = new ClientRepository();
    var clients = clientRepo.findAll();
    
    if (clients.length > 0) {
      var normalizedClients = safeResponse(clients);
      Logger.log('✓ Clientes normalizados: ' + normalizedClients.length + ' registros');
      Logger.log('Primer cliente:');
      Logger.log(JSON.stringify(normalizedClients[0], null, 2));
    } else {
      Logger.log('⚠ No hay clientes para probar');
    }
    
    // Probar con datos de productos
    Logger.log('\n2. Probando con datos de productos...');
    var productRepo = new ProductRepository();
    var products = productRepo.findAll();
    
    if (products.length > 0) {
      var normalizedProducts = safeResponse(products);
      Logger.log('✓ Productos normalizados: ' + normalizedProducts.length + ' registros');
      Logger.log('Primer producto:');
      Logger.log(JSON.stringify(normalizedProducts[0], null, 2));
    } else {
      Logger.log('⚠ No hay productos para probar');
    }
    
    Logger.log('\n=== Pruebas con datos reales completadas ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}
