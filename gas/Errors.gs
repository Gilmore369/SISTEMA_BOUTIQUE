/**
 * Errors.gs - Clases de Error Personalizadas
 * Adiction Boutique Suite
 * 
 * Define clases de error personalizadas para el sistema.
 * Permite diferenciar entre errores de negocio y errores del sistema.
 * 
 * Requisitos: 30.4
 */

// ============================================================================
// BUSINESSERROR - Error de Lógica de Negocio
// ============================================================================

/**
 * BusinessError - Error de lógica de negocio
 * 
 * Se lanza cuando una operación no puede completarse debido a reglas
 * de negocio (ej: stock insuficiente, cupo excedido, permisos insuficientes).
 * 
 * Estos errores son esperados y deben mostrarse al usuario con mensajes
 * amigables.
 * 
 * @class
 * @extends Error
 */
function BusinessError(message, code, details) {
  this.name = 'BusinessError';
  this.message = message || 'Error de negocio';
  this.code = code || 'BUSINESS_ERROR';
  this.details = details || {};
  this.timestamp = new Date();
  
  // Capturar stack trace
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, BusinessError);
  } else {
    this.stack = (new Error()).stack;
  }
}

// Heredar de Error
BusinessError.prototype = Object.create(Error.prototype);
BusinessError.prototype.constructor = BusinessError;

/**
 * toJSON - Convierte el error a formato JSON
 * @returns {Object} Representación JSON del error
 */
BusinessError.prototype.toJSON = function() {
  return {
    type: 'BusinessError',
    name: this.name,
    message: this.message,
    code: this.code,
    details: this.details,
    timestamp: this.timestamp
  };
};

// ============================================================================
// SYSTEMERROR - Error del Sistema
// ============================================================================

/**
 * SystemError - Error del sistema
 * 
 * Se lanza cuando ocurre un error técnico o inesperado en el sistema
 * (ej: error de base de datos, error de API externa, error de configuración).
 * 
 * Estos errores son inesperados y deben registrarse en logs para
 * investigación. Al usuario se le muestra un mensaje genérico.
 * 
 * @class
 * @extends Error
 */
function SystemError(message, code, originalError) {
  this.name = 'SystemError';
  this.message = message || 'Error del sistema';
  this.code = code || 'SYSTEM_ERROR';
  this.originalError = originalError || null;
  this.timestamp = new Date();
  
  // Capturar stack trace
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, SystemError);
  } else {
    this.stack = (new Error()).stack;
  }
  
  // Si hay error original, incluir su stack
  if (originalError && originalError.stack) {
    this.originalStack = originalError.stack;
  }
}

// Heredar de Error
SystemError.prototype = Object.create(Error.prototype);
SystemError.prototype.constructor = SystemError;

/**
 * toJSON - Convierte el error a formato JSON
 * @returns {Object} Representación JSON del error
 */
SystemError.prototype.toJSON = function() {
  return {
    type: 'SystemError',
    name: this.name,
    message: this.message,
    code: this.code,
    timestamp: this.timestamp,
    originalError: this.originalError ? this.originalError.message : null
  };
};

// ============================================================================
// VALIDATIONERROR - Error de Validación
// ============================================================================

/**
 * ValidationError - Error de validación de datos
 * 
 * Se lanza cuando los datos de entrada no cumplen con las validaciones
 * requeridas (ej: campo requerido faltante, formato inválido, rango inválido).
 * 
 * @class
 * @extends BusinessError
 */
function ValidationError(message, field, value) {
  BusinessError.call(this, message, 'VALIDATION_ERROR', {
    field: field,
    value: value
  });
  
  this.name = 'ValidationError';
  this.field = field;
  this.value = value;
}

// Heredar de BusinessError
ValidationError.prototype = Object.create(BusinessError.prototype);
ValidationError.prototype.constructor = ValidationError;

// ============================================================================
// NOTFOUNDERROR - Error de Entidad No Encontrada
// ============================================================================

/**
 * NotFoundError - Error de entidad no encontrada
 * 
 * Se lanza cuando se intenta acceder a una entidad que no existe
 * (ej: producto no encontrado, cliente no encontrado, venta no encontrada).
 * 
 * @class
 * @extends BusinessError
 */
function NotFoundError(entityType, entityId) {
  const message = entityType + ' no encontrado' + (entityId ? ': ' + entityId : '');
  
  BusinessError.call(this, message, 'NOT_FOUND', {
    entityType: entityType,
    entityId: entityId
  });
  
  this.name = 'NotFoundError';
  this.entityType = entityType;
  this.entityId = entityId;
}

// Heredar de BusinessError
NotFoundError.prototype = Object.create(BusinessError.prototype);
NotFoundError.prototype.constructor = NotFoundError;

// ============================================================================
// UNAUTHORIZEDERROR - Error de Autorización
// ============================================================================

/**
 * UnauthorizedError - Error de autorización
 * 
 * Se lanza cuando un usuario intenta realizar una operación para la cual
 * no tiene permisos suficientes.
 * 
 * @class
 * @extends BusinessError
 */
function UnauthorizedError(operation, userId) {
  const message = 'No tiene permisos para realizar esta operación' + (operation ? ': ' + operation : '');
  
  BusinessError.call(this, message, 'UNAUTHORIZED', {
    operation: operation,
    userId: userId
  });
  
  this.name = 'UnauthorizedError';
  this.operation = operation;
  this.userId = userId;
}

// Heredar de BusinessError
UnauthorizedError.prototype = Object.create(BusinessError.prototype);
UnauthorizedError.prototype.constructor = UnauthorizedError;

// ============================================================================
// ERRORHANDLER - Manejador Central de Errores
// ============================================================================

/**
 * ErrorHandler - Manejador central de errores
 * 
 * Proporciona funciones para manejar errores de forma consistente
 * en todo el sistema.
 */
var ErrorHandler = {
  
  /**
   * handle - Maneja un error y retorna una respuesta estructurada
   * 
   * @param {Error} error - Error a manejar
   * @param {string} context - Contexto donde ocurrió el error (nombre de función)
   * @returns {Object} Respuesta estructurada con el error
   */
  handle: function(error, context) {
    // Registrar error en log
    this.log(error, context);
    
    // Determinar tipo de error y construir respuesta
    if (error instanceof BusinessError) {
      return {
        success: false,
        error: error.message,
        errorType: 'business',
        errorCode: error.code,
        details: error.details
      };
    } else if (error instanceof SystemError) {
      return {
        success: false,
        error: 'Error del sistema. Por favor contacte al administrador.',
        errorType: 'system',
        errorCode: error.code
      };
    } else {
      // Error genérico
      return {
        success: false,
        error: error.message || 'Error desconocido',
        errorType: 'unknown'
      };
    }
  },
  
  /**
   * log - Registra un error en el log
   * 
   * @param {Error} error - Error a registrar
   * @param {string} context - Contexto donde ocurrió el error
   */
  log: function(error, context) {
    const logMessage = '[' + (context || 'Unknown') + '] ' + error.name + ': ' + error.message;
    
    Logger.log(logMessage);
    
    // Si es SystemError, registrar también el error original
    if (error instanceof SystemError && error.originalError) {
      Logger.log('Original error: ' + error.originalError.message);
      if (error.originalStack) {
        Logger.log('Original stack: ' + error.originalStack);
      }
    }
    
    // Registrar stack trace
    if (error.stack) {
      Logger.log('Stack trace: ' + error.stack);
    }
  },
  
  /**
   * wrap - Envuelve una función con manejo de errores
   * 
   * @param {Function} fn - Función a envolver
   * @param {string} context - Contexto de la función
   * @returns {Function} Función envuelta con manejo de errores
   */
  wrap: function(fn, context) {
    return function() {
      try {
        return fn.apply(this, arguments);
      } catch (error) {
        return ErrorHandler.handle(error, context);
      }
    };
  }
};

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testErrors - Prueba las clases de error personalizadas
 */
function testErrors() {
  Logger.log('=== Iniciando pruebas de clases de error ===');
  
  try {
    // Probar BusinessError
    Logger.log('\n1. Probando BusinessError...');
    const businessError = new BusinessError('Stock insuficiente', 'INSUFFICIENT_STOCK', {
      productId: 'PROD123',
      requested: 10,
      available: 5
    });
    Logger.log('✓ BusinessError creado: ' + businessError.message);
    Logger.log('  JSON: ' + JSON.stringify(businessError.toJSON()));
    
    // Probar SystemError
    Logger.log('\n2. Probando SystemError...');
    const originalError = new Error('Database connection failed');
    const systemError = new SystemError('Error al conectar con la base de datos', 'DB_CONNECTION_ERROR', originalError);
    Logger.log('✓ SystemError creado: ' + systemError.message);
    Logger.log('  JSON: ' + JSON.stringify(systemError.toJSON()));
    
    // Probar ValidationError
    Logger.log('\n3. Probando ValidationError...');
    const validationError = new ValidationError('El email es inválido', 'email', 'invalid-email');
    Logger.log('✓ ValidationError creado: ' + validationError.message);
    Logger.log('  Field: ' + validationError.field);
    
    // Probar NotFoundError
    Logger.log('\n4. Probando NotFoundError...');
    const notFoundError = new NotFoundError('Producto', 'PROD123');
    Logger.log('✓ NotFoundError creado: ' + notFoundError.message);
    
    // Probar UnauthorizedError
    Logger.log('\n5. Probando UnauthorizedError...');
    const unauthorizedError = new UnauthorizedError('void_sale', 'user@example.com');
    Logger.log('✓ UnauthorizedError creado: ' + unauthorizedError.message);
    
    // Probar ErrorHandler
    Logger.log('\n6. Probando ErrorHandler...');
    const response = ErrorHandler.handle(businessError, 'testErrors');
    Logger.log('✓ ErrorHandler.handle() ejecutado');
    Logger.log('  Response: ' + JSON.stringify(response));
    
    Logger.log('\n=== Pruebas de clases de error completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}
