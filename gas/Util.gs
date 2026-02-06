/**
 * Util.gs
 * Utilidades del sistema: validaciones, helpers de fechas, dinero, IDs, etc.
 * 
 * Requisitos: 30.1, 30.3
 */

// ============================================================================
// VALIDACIONES (sin librerías externas)
// ============================================================================

/**
 * Clase Validator con funciones de validación estrictas
 * Todas las validaciones lanzan errores descriptivos en español (es-PE)
 */
var Validator = {
  
  /**
   * Valida que un valor sea requerido (no null, undefined o string vacío)
   * @param {*} value - Valor a validar
   * @param {string} fieldName - Nombre del campo para el mensaje de error
   * @throws {Error} Si el valor es null, undefined o string vacío
   */
  isRequired: function(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      throw new Error(fieldName + ' es requerido');
    }
  },
  
  /**
   * Valida que un valor sea un número válido
   * @param {*} value - Valor a validar
   * @param {string} fieldName - Nombre del campo para el mensaje de error
   * @throws {Error} Si el valor no es un número válido
   */
  isNumber: function(value, fieldName) {
    if (isNaN(value) || value === null || value === undefined || value === '') {
      throw new Error(fieldName + ' debe ser un número válido');
    }
  },
  
  /**
   * Valida que un número sea positivo (mayor que cero)
   * @param {number} value - Valor a validar
   * @param {string} fieldName - Nombre del campo para el mensaje de error
   * @throws {Error} Si el valor no es un número o no es positivo
   */
  isPositive: function(value, fieldName) {
    this.isNumber(value, fieldName);
    var num = Number(value);
    if (num <= 0) {
      throw new Error(fieldName + ' debe ser un número positivo (mayor que cero)');
    }
  },
  
  /**
   * Valida que un string tenga formato de email válido
   * @param {string} value - Email a validar
   * @param {string} fieldName - Nombre del campo para el mensaje de error
   * @throws {Error} Si el email no tiene formato válido
   */
  isEmail: function(value, fieldName) {
    if (!value || typeof value !== 'string') {
      throw new Error(fieldName + ' debe ser un email válido');
    }
    // Regex simple pero efectivo para validar emails
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error(fieldName + ' debe ser un email válido (formato: usuario@dominio.com)');
    }
  },
  
  /**
   * Valida que un número esté dentro de un rango específico (inclusivo)
   * @param {number} value - Valor a validar
   * @param {number} min - Valor mínimo permitido (inclusivo)
   * @param {number} max - Valor máximo permitido (inclusivo)
   * @param {string} fieldName - Nombre del campo para el mensaje de error
   * @throws {Error} Si el valor no está en el rango especificado
   */
  isInRange: function(value, min, max, fieldName) {
    this.isNumber(value, fieldName);
    var num = Number(value);
    if (num < min || num > max) {
      throw new Error(fieldName + ' debe estar entre ' + min + ' y ' + max);
    }
  }
  
};

// ============================================================================
// IDEMPOTENCY MANAGER (operaciones idempotentes)
// ============================================================================

/**
 * IdempotencyManager - Gestión de idempotencia para operaciones críticas
 * Usa CacheService de Apps Script para almacenar requestIds procesados
 * Previene ejecución duplicada de operaciones críticas (ventas, pagos, transferencias)
 * 
 * Requisitos: 20.1, 20.2, 20.3
 */
var IdempotencyManager = {
  
  /**
   * Verifica si un requestId ya fue procesado y ejecuta la operación si no existe
   * Si el requestId ya existe, retorna el resultado almacenado sin ejecutar la operación
   * 
   * @param {string} requestId - Identificador único de la operación
   * @param {Function} operation - Función a ejecutar si el requestId no existe
   * @returns {Object} {processed: boolean, result: *}
   *   - processed: true si el requestId ya existía, false si se ejecutó la operación
   *   - result: resultado de la operación (nuevo o almacenado)
   * @throws {Error} Si requestId es inválido o si la operación falla
   */
  checkAndStore: function(requestId, operation) {
    // Validar requestId
    if (!requestId || typeof requestId !== 'string' || requestId.trim() === '') {
      throw new Error('requestId es requerido y debe ser un string válido');
    }
    
    // Validar operation
    if (!operation || typeof operation !== 'function') {
      throw new Error('operation debe ser una función válida');
    }
    
    var cache = CacheService.getScriptCache();
    var key = 'req_' + requestId;
    
    try {
      // Verificar si ya fue procesado
      var cached = cache.get(key);
      
      if (cached) {
        // RequestId ya existe, retornar resultado almacenado
        Logger.log('RequestId ya procesado: ' + requestId);
        
        try {
          var cachedResult = JSON.parse(cached);
          return {
            processed: true,
            result: cachedResult
          };
        } catch (e) {
          // Si falla el parse, retornar el string directamente
          Logger.log('Warning: No se pudo parsear resultado cacheado: ' + e.message);
          return {
            processed: true,
            result: cached
          };
        }
      }
      
      // RequestId no existe, ejecutar operación
      Logger.log('Ejecutando operación para requestId: ' + requestId);
      var result = operation();
      
      // Almacenar resultado por 24 horas (86400 segundos)
      var ttl = LIMITS.CACHE_TTL_IDEMPOTENCY || 86400;
      var resultStr = typeof result === 'string' ? result : JSON.stringify(result);
      
      cache.put(key, resultStr, ttl);
      Logger.log('Resultado almacenado en caché para requestId: ' + requestId);
      
      return {
        processed: false,
        result: result
      };
      
    } catch (e) {
      Logger.log('Error en IdempotencyManager.checkAndStore: ' + e.message);
      throw e;
    }
  },
  
  /**
   * Invalida un requestId del caché (útil para testing o rollback)
   * 
   * @param {string} requestId - Identificador único a invalidar
   */
  invalidate: function(requestId) {
    if (!requestId || typeof requestId !== 'string') {
      Logger.log('Warning: requestId inválido para invalidar');
      return;
    }
    
    try {
      var cache = CacheService.getScriptCache();
      var key = 'req_' + requestId;
      cache.remove(key);
      Logger.log('RequestId invalidado: ' + requestId);
    } catch (e) {
      Logger.log('Error al invalidar requestId: ' + e.message);
    }
  },
  
  /**
   * Verifica si un requestId ya fue procesado (sin ejecutar operación)
   * 
   * @param {string} requestId - Identificador único a verificar
   * @returns {boolean} true si el requestId ya existe en caché
   */
  exists: function(requestId) {
    if (!requestId || typeof requestId !== 'string') {
      return false;
    }
    
    try {
      var cache = CacheService.getScriptCache();
      var key = 'req_' + requestId;
      var cached = cache.get(key);
      return cached !== null;
    } catch (e) {
      Logger.log('Error al verificar requestId: ' + e.message);
      return false;
    }
  }
  
};

// ============================================================================
// CACHE MANAGER (gestión de caché)
// ============================================================================

/**
 * CacheManager - Gestión de caché para catálogos y datos frecuentes
 * Usa CacheService de Apps Script para reducir lecturas a Google Sheets
 * Mejora el rendimiento del sistema cacheando productos, usuarios y parámetros
 * 
 * Requisitos: 29.1, 29.2, 29.4
 */
var CacheManager = {
  
  /**
   * Obtiene un valor del caché
   * @param {string} key - Clave del valor a obtener
   * @returns {*} Valor almacenado (parseado desde JSON) o null si no existe
   */
  get: function(key) {
    if (!key || typeof key !== 'string') {
      Logger.log('Warning: key inválida para CacheManager.get');
      return null;
    }
    
    try {
      var cache = CacheService.getScriptCache();
      var cached = cache.get(key);
      
      if (cached === null) {
        Logger.log('Cache miss para key: ' + key);
        return null;
      }
      
      Logger.log('Cache hit para key: ' + key);
      
      // Intentar parsear como JSON
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Si no es JSON válido, retornar el string directamente
        return cached;
      }
      
    } catch (e) {
      Logger.log('Error en CacheManager.get para key "' + key + '": ' + e.message);
      return null;
    }
  },
  
  /**
   * Almacena un valor en el caché con tiempo de vida (TTL)
   * @param {string} key - Clave para almacenar el valor
   * @param {*} value - Valor a almacenar (será convertido a JSON)
   * @param {number} ttlSeconds - Tiempo de vida en segundos (default: 300 = 5 minutos)
   */
  put: function(key, value, ttlSeconds) {
    if (!key || typeof key !== 'string') {
      Logger.log('Warning: key inválida para CacheManager.put');
      return;
    }
    
    // TTL por defecto: 5 minutos (300 segundos)
    ttlSeconds = ttlSeconds || 300;
    
    // Validar que TTL sea un número positivo
    if (isNaN(ttlSeconds) || ttlSeconds <= 0) {
      Logger.log('Warning: ttlSeconds inválido, usando default de 300 segundos');
      ttlSeconds = 300;
    }
    
    try {
      var cache = CacheService.getScriptCache();
      
      // Convertir valor a string (JSON si es objeto, string directo si ya es string)
      var valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      
      // Almacenar en caché
      cache.put(key, valueStr, ttlSeconds);
      Logger.log('Valor almacenado en caché: key=' + key + ', ttl=' + ttlSeconds + 's');
      
    } catch (e) {
      Logger.log('Error en CacheManager.put para key "' + key + '": ' + e.message);
    }
  },
  
  /**
   * Invalida (elimina) un valor del caché
   * @param {string} key - Clave del valor a invalidar
   */
  invalidate: function(key) {
    if (!key || typeof key !== 'string') {
      Logger.log('Warning: key inválida para CacheManager.invalidate');
      return;
    }
    
    try {
      var cache = CacheService.getScriptCache();
      cache.remove(key);
      Logger.log('Caché invalidado para key: ' + key);
    } catch (e) {
      Logger.log('Error en CacheManager.invalidate para key "' + key + '": ' + e.message);
    }
  }
  
};

// ============================================================================
// HELPERS DE UTILIDAD (para futuras iteraciones)
// ============================================================================

/**
 * Genera un ID único usando timestamp + random
 * @returns {string} ID único
 */
function generateId() {
  return 'ID_' + new Date().getTime() + '_' + Math.floor(Math.random() * 10000);
}

/**
 * Genera un requestId único para idempotencia
 * @returns {string} RequestId único
 */
function generateRequestId() {
  return 'REQ_' + new Date().getTime() + '_' + Math.floor(Math.random() * 100000);
}

/**
 * Formatea un número como dinero con 2 decimales
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado (ej: "123.45")
 */
function formatMoney(amount) {
  if (isNaN(amount)) return '0.00';
  return Number(amount).toFixed(2);
}

/**
 * Convierte un string de dinero a número con 2 decimales
 * @param {string|number} value - Valor a convertir
 * @returns {number} Número con 2 decimales
 */
function parseMoney(value) {
  var num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 100) / 100;
}

/**
 * Formatea una fecha en formato ISO (YYYY-MM-DD)
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato ISO
 */
function formatDate(date) {
  if (!(date instanceof Date)) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Formatea una fecha y hora en formato ISO (YYYY-MM-DD HH:mm:ss)
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha y hora en formato ISO
 */
function formatDateTime(date) {
  if (!(date instanceof Date)) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Sanitiza un string: trim y limita longitud
 * @param {string} str - String a sanitizar
 * @param {number} maxLength - Longitud máxima (default: 500)
 * @returns {string} String sanitizado
 */
function sanitizeString(str, maxLength) {
  if (!str || typeof str !== 'string') return '';
  maxLength = maxLength || 500;
  return str.trim().substring(0, maxLength);
}

/**
 * Convierte un objeto a JSON de forma segura
 * @param {*} obj - Objeto a convertir
 * @returns {string} JSON string o string vacío si falla
 */
function safeJsonStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    Logger.log('Error en safeJsonStringify: ' + e.message);
    return '';
  }
}

/**
 * Parsea JSON de forma segura
 * @param {string} jsonStr - String JSON a parsear
 * @returns {*} Objeto parseado o null si falla
 */
function safeJsonParse(jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    Logger.log('Error en safeJsonParse: ' + e.message);
    return null;
  }
}

// ============================================================================
// LOCK MANAGER (manejo de concurrencia)
// ============================================================================

/**
 * LockManager - Gestión de locks para operaciones concurrentes
 * Usa LockService de Apps Script para prevenir condiciones de carrera
 * 
 * Requisitos: 19.1, 19.2
 */
var LockManager = {
  
  /**
   * Adquiere un lock para operaciones críticas
   * @param {string} lockKey - Identificador del lock (para logging)
   * @param {number} timeoutMs - Timeout en milisegundos (default: 30000)
   * @returns {Lock} Objeto lock de Apps Script
   * @throws {Error} Si no se puede adquirir el lock después del timeout
   */
  acquireLock: function(lockKey, timeoutMs) {
    timeoutMs = timeoutMs || LIMITS.LOCK_TIMEOUT_MS || 30000;
    
    var lock = LockService.getScriptLock();
    
    try {
      var acquired = lock.waitLock(timeoutMs);
      
      if (!acquired) {
        throw new Error('No se pudo adquirir el lock después de ' + timeoutMs + 'ms');
      }
      
      Logger.log('Lock adquirido: ' + lockKey);
      return lock;
      
    } catch (e) {
      Logger.log('Error al adquirir lock "' + lockKey + '": ' + e.message);
      throw new Error('No se pudo adquirir el lock. El sistema está ocupado, intente nuevamente en unos segundos.');
    }
  },
  
  /**
   * Libera un lock previamente adquirido
   * @param {Lock} lock - Objeto lock a liberar
   */
  releaseLock: function(lock) {
    if (lock) {
      try {
        lock.releaseLock();
        Logger.log('Lock liberado correctamente');
      } catch (e) {
        Logger.log('Error al liberar lock: ' + e.message);
      }
    }
  },
  
  /**
   * Ejecuta una función con lock automático (patrón try-finally)
   * Garantiza que el lock se libere incluso si la función lanza error
   * 
   * @param {string} lockKey - Identificador del lock
   * @param {Function} fn - Función a ejecutar con lock
   * @returns {*} Resultado de la función ejecutada
   * @throws {Error} Si no se puede adquirir el lock o si la función lanza error
   */
  withLock: function(lockKey, fn) {
    var lock = null;
    
    try {
      lock = this.acquireLock(lockKey);
      return fn();
    } finally {
      this.releaseLock(lock);
    }
  }
  
};
