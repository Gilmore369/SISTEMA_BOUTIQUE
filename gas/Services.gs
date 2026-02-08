/**
 * Services.gs - Capa de Lógica de Negocio (Servicios)
 * Adiction Boutique Suite
 * 
 * Este archivo contiene los servicios del sistema que implementan
 * la lógica de negocio. Comienza con AuthService para autenticación
 * y autorización.
 * 
 * REGLAS:
 * - Servicios sin estado (stateless)
 * - Validaciones estrictas de entrada
 * - Mensajes de error en español
 * - Uso de repositorios para acceso a datos
 * - Auditoría de operaciones críticas
 */

// ============================================================================
// AUTHSERVICE - Autenticación y Autorización
// ============================================================================

/**
 * AuthService - Servicio de autenticación y autorización
 * 
 * Gestiona la validación de usuarios, roles y permisos del sistema.
 * Implementa el modelo RBAC (Role-Based Access Control) con roles por tienda.
 * 
 * Características:
 * - Validación contra allowlist (CFG_Users)
 * - Gestión de roles múltiples por usuario
 * - Verificación de permisos por rol
 * - Auditoría de accesos (exitosos y fallidos)
 * - Caché de usuarios para rendimiento
 * 
 * Requisitos: 1.1, 1.2, 1.3, 1.4, 2.4
 * 
 * @class
 */
class AuthService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.userRepo = new UserRepository();
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================
  
  /**
   * isUserAllowed - Valida si un usuario está en la allowlist
   * 
   * Verifica que el email del usuario esté registrado en CFG_Users
   * y que su cuenta esté activa.
   * 
   * MEJORADO: Normalización robusta y flush de spreadsheet para lectura inmediata
   * 
   * Requisitos: 1.1, 1.2
   * 
   * @param {string} email - Email del usuario a validar
   * @param {boolean} forceRefresh - Forzar verificación sin caché
   * @returns {boolean} true si el usuario está permitido, false si no
   */
  isUserAllowed(email, forceRefresh = false) {
    try {
      Logger.log('=== isUserAllowed START ===');
      
      // Validar parámetro
      if (!email || typeof email !== 'string') {
        Logger.log('isUserAllowed: email inválido o vacío');
        return false;
      }
      
      // CRÍTICO: Normalizar email - trim y lowercase
      const normalizedEmail = email.trim().toLowerCase();
      Logger.log('Email normalizado: ' + normalizedEmail);
      
      // Si no se fuerza refresh, intentar obtener del caché primero
      if (!forceRefresh) {
        const cacheKey = 'user_allowed_' + normalizedEmail;
        const cached = CacheManager.get(cacheKey);
        
        if (cached !== null) {
          Logger.log('isUserAllowed: resultado desde caché para ' + normalizedEmail + ' = ' + cached);
          return cached === true || cached === 'true';
        }
      }
      
      // CRÍTICO: Flush para asegurar que leemos datos actualizados
      Logger.log('Forzando flush de spreadsheet...');
      SpreadsheetApp.flush();
      
      // Buscar usuario en la base de datos DIRECTAMENTE
      Logger.log('isUserAllowed: verificando directamente en base de datos');
      
      // Acceso directo a la hoja sin repositorio para evitar problemas de caché
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('CFG_Users');
      
      if (!sheet) {
        Logger.log('ERROR: hoja CFG_Users no encontrada');
        return false;
      }
      
      const data = sheet.getDataRange().getValues();
      Logger.log('Total de filas en CFG_Users: ' + data.length);
      
      let userFound = false;
      let isActive = false;
      let rowNumber = -1;
      
      // Buscar usuario directamente en los datos
      // Columnas: [0]=id, [1]=email, [2]=name, [3]=roles, [4]=stores, [5]=active, [6]=created_at
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const cellEmail = row[1];
        
        // Normalizar el email de la celda también
        if (cellEmail && typeof cellEmail === 'string') {
          const normalizedCellEmail = cellEmail.trim().toLowerCase();
          
          if (normalizedCellEmail === normalizedEmail) {
            userFound = true;
            rowNumber = i + 1;
            
            // Verificar si está activo (columna 5)
            const activeValue = row[5];
            isActive = activeValue === true || activeValue === 'TRUE' || activeValue === 'true' || activeValue === 1;
            
            Logger.log('Usuario encontrado en fila ' + rowNumber);
            Logger.log('Email en celda: "' + cellEmail + '"');
            Logger.log('Valor active: ' + activeValue + ' (tipo: ' + typeof activeValue + ')');
            Logger.log('isActive: ' + isActive);
            break;
          }
        }
      }
      
      if (!userFound) {
        Logger.log('Usuario NO encontrado en CFG_Users: ' + normalizedEmail);
      }
      
      const isAllowed = userFound && isActive;
      
      // Guardar en caché solo si no se forzó refresh
      if (!forceRefresh) {
        CacheManager.put('user_allowed_' + normalizedEmail, isAllowed, LIMITS.CACHE_TTL_USERS);
        Logger.log('Resultado guardado en caché');
      }
      
      Logger.log('=== isUserAllowed RESULT: ' + isAllowed + ' ===');
      return isAllowed;
      
    } catch (error) {
      Logger.log('ERROR CRÍTICO en isUserAllowed: ' + error.message);
      Logger.log('Stack trace: ' + error.stack);
      // En caso de error, denegar acceso por seguridad
      return false;
    }
  }
  
  /**
   * getUserRoles - Obtiene los roles de un usuario
   * 
   * Retorna un array con los roles asignados al usuario.
   * Los roles están almacenados como JSON string en CFG_Users.
   * 
   * MEJORADO: Normalización y manejo robusto de errores
   * 
   * Requisitos: 1.3
   * 
   * @param {string} email - Email del usuario
   * @returns {Array<string>} Array de roles del usuario (vacío si no tiene roles o no existe)
   */
  getUserRoles(email) {
    try {
      Logger.log('=== getUserRoles START ===');
      
      // Validar parámetro
      if (!email || typeof email !== 'string') {
        Logger.log('getUserRoles: email inválido');
        return [];
      }
      
      // CRÍTICO: Normalizar email - trim y lowercase
      const normalizedEmail = email.trim().toLowerCase();
      Logger.log('Obteniendo roles para: ' + normalizedEmail);
      
      // Intentar obtener del caché primero
      const cacheKey = 'user_roles_' + normalizedEmail;
      const cached = CacheManager.get(cacheKey);
      
      if (cached !== null) {
        Logger.log('getUserRoles: resultado desde caché');
        return Array.isArray(cached) ? cached : [];
      }
      
      // Buscar usuario en la base de datos
      const user = this.userRepo.findByEmail(normalizedEmail);
      
      if (!user) {
        Logger.log('getUserRoles: usuario no encontrado');
        return [];
      }
      
      // Parsear roles desde JSON
      let roles = [];
      
      if (user.roles) {
        try {
          // Los roles están almacenados como JSON string: '["Admin", "Vendedor"]'
          const parsed = JSON.parse(user.roles);
          
          if (Array.isArray(parsed)) {
            roles = parsed;
            Logger.log('Roles parseados correctamente: ' + JSON.stringify(roles));
          } else {
            Logger.log('getUserRoles: roles no es un array');
          }
        } catch (e) {
          Logger.log('getUserRoles: error al parsear roles: ' + e.message);
        }
      } else {
        Logger.log('getUserRoles: usuario no tiene roles definidos');
      }
      
      // Guardar en caché por 10 minutos
      CacheManager.put(cacheKey, roles, LIMITS.CACHE_TTL_USERS);
      
      Logger.log('=== getUserRoles RESULT: ' + JSON.stringify(roles) + ' ===');
      return roles;
      
    } catch (error) {
      Logger.log('ERROR en getUserRoles: ' + error.message);
      Logger.log('Stack trace: ' + error.stack);
      return [];
    }
  }
  
  /**
   * hasPermission - Verifica si un usuario tiene un permiso específico
   * 
   * Obtiene los roles del usuario y verifica si alguno de sus roles
   * tiene el permiso solicitado. Implementa la unión de permisos
   * cuando el usuario tiene múltiples roles.
   * 
   * Requisitos: 2.4, 1.5
   * 
   * @param {string} email - Email del usuario
   * @param {string} permission - Permiso a verificar (ej: 'create_sale', 'void_sale')
   * @returns {boolean} true si el usuario tiene el permiso, false si no
   */
  hasPermission(email, permission) {
    try {
      // Validar parámetros
      if (!email || typeof email !== 'string') {
        Logger.log('hasPermission: email inválido');
        return false;
      }
      
      if (!permission || typeof permission !== 'string') {
        Logger.log('hasPermission: permission inválido');
        return false;
      }
      
      // Normalizar
      const normalizedEmail = email.toLowerCase().trim();
      const normalizedPermission = permission.trim();
      
      // Obtener roles del usuario
      const userRoles = this.getUserRoles(normalizedEmail);
      
      if (userRoles.length === 0) {
        Logger.log('hasPermission: usuario sin roles ' + normalizedEmail);
        return false;
      }
      
      // Verificar si alguno de los roles del usuario tiene el permiso
      // Esto implementa la unión de permisos (Requisito 1.5)
      for (let i = 0; i < userRoles.length; i++) {
        const role = userRoles[i];
        
        // Obtener permisos del rol desde PERMISSIONS
        const rolePermissions = PERMISSIONS[role];
        
        if (!rolePermissions || !Array.isArray(rolePermissions)) {
          Logger.log('hasPermission: rol sin permisos definidos ' + role);
          continue;
        }
        
        // Verificar si el permiso está en la lista de permisos del rol
        if (rolePermissions.indexOf(normalizedPermission) !== -1) {
          Logger.log('hasPermission: ' + normalizedEmail + ' tiene permiso ' + normalizedPermission + ' por rol ' + role);
          return true;
        }
      }
      
      Logger.log('hasPermission: ' + normalizedEmail + ' NO tiene permiso ' + normalizedPermission);
      return false;
      
    } catch (error) {
      Logger.log('Error en hasPermission: ' + error.message);
      // En caso de error, denegar permiso por seguridad
      return false;
    }
  }
  
  /**
   * logAccess - Registra un intento de acceso en el log de auditoría
   * 
   * Crea una entrada en AUD_Log con los detalles del intento de acceso.
   * Registra tanto accesos exitosos como fallidos para trazabilidad.
   * 
   * Requisitos: 1.4
   * 
   * @param {string} email - Email del usuario que intenta acceder
   * @param {boolean} success - true si el acceso fue exitoso, false si fue denegado
   * @returns {void}
   */
  logAccess(email, success) {
    try {
      // Validar parámetros
      if (!email || typeof email !== 'string') {
        Logger.log('logAccess: email inválido');
        return;
      }
      
      if (typeof success !== 'boolean') {
        Logger.log('logAccess: success debe ser boolean');
        return;
      }
      
      // Crear entrada de auditoría
      const auditEntry = {
        id: this._generateAuditId(),
        timestamp: new Date(),
        user_id: email,
        operation: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        entity_type: 'AUTH',
        entity_id: email,
        old_values: null,
        new_values: JSON.stringify({
          success: success,
          timestamp: new Date().toISOString()
        }),
        ip_address: this._getClientIp()
      };
      
      // Guardar en AUD_Log usando AuditRepository
      const auditRepo = new AuditRepository();
      auditRepo.create(auditEntry);
      
      Logger.log('logAccess: registrado ' + (success ? 'éxito' : 'fallo') + ' para ' + email);
      
    } catch (error) {
      // No lanzar error para no interrumpir el flujo de autenticación
      // Solo registrar en log
      Logger.log('Error en logAccess (no crítico): ' + error.message);
    }
  }
  
  // ==========================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ==========================================================================
  
  /**
   * _generateAuditId - Genera un ID único para entradas de auditoría
   * @private
   * @returns {string} ID único
   */
  _generateAuditId() {
    return 'AUD_' + new Date().getTime() + '_' + Math.floor(Math.random() * 100000);
  }
  
  /**
   * _getClientIp - Obtiene la IP del cliente (si está disponible)
   * @private
   * @returns {string} IP del cliente o 'unknown'
   */
  _getClientIp() {
    try {
      // En Apps Script WebApp, la IP no siempre está disponible
      // Retornar 'unknown' por ahora
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testAuthService - Prueba el AuthService
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que exista la hoja CFG_Users con datos de ejemplo.
 */
function testAuthService() {
  Logger.log('=== Iniciando pruebas de AuthService ===');
  
  try {
    // Crear instancia del servicio
    Logger.log('\n1. Creando instancia de AuthService...');
    const authService = new AuthService();
    Logger.log('✓ Instancia creada correctamente');
    
    // Obtener un usuario de ejemplo de la base de datos
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    if (users.length === 0) {
      Logger.log('✗ No hay usuarios en CFG_Users para probar');
      Logger.log('Por favor, ejecute primero la función de seed data');
      return;
    }
    
    const testUser = users[0];
    const testEmail = testUser.email;
    
    Logger.log('\nUsando usuario de prueba: ' + testEmail);
    
    // Probar isUserAllowed
    Logger.log('\n2. Probando isUserAllowed()...');
    const isAllowed = authService.isUserAllowed(testEmail);
    Logger.log('✓ isUserAllowed(' + testEmail + ') = ' + isAllowed);
    
    // Probar con email no existente
    Logger.log('\n3. Probando isUserAllowed() con email no existente...');
    const isAllowedFake = authService.isUserAllowed('noexiste@example.com');
    Logger.log('✓ isUserAllowed(noexiste@example.com) = ' + isAllowedFake + ' (debe ser false)');
    
    // Probar getUserRoles
    Logger.log('\n4. Probando getUserRoles()...');
    const roles = authService.getUserRoles(testEmail);
    Logger.log('✓ getUserRoles(' + testEmail + ') = ' + JSON.stringify(roles));
    
    // Probar hasPermission
    if (roles.length > 0) {
      Logger.log('\n5. Probando hasPermission()...');
      
      // Probar con un permiso que debería tener
      const hasViewDashboard = authService.hasPermission(testEmail, 'view_dashboard');
      Logger.log('✓ hasPermission(' + testEmail + ', "view_dashboard") = ' + hasViewDashboard);
      
      // Probar con un permiso que probablemente no tenga
      const hasManageUsers = authService.hasPermission(testEmail, 'manage_users');
      Logger.log('✓ hasPermission(' + testEmail + ', "manage_users") = ' + hasManageUsers);
    }
    
    // Probar logAccess
    Logger.log('\n6. Probando logAccess()...');
    authService.logAccess(testEmail, true);
    Logger.log('✓ logAccess() ejecutado (acceso exitoso)');
    
    authService.logAccess('noexiste@example.com', false);
    Logger.log('✓ logAccess() ejecutado (acceso fallido)');
    
    // Verificar que se crearon las entradas de auditoría
    Logger.log('\n7. Verificando entradas de auditoría...');
    const auditRepo = new AuditRepository();
    const auditEntries = auditRepo.findByFilters({
      entityType: 'AUTH'
    });
    Logger.log('✓ Entradas de auditoría encontradas: ' + auditEntries.length);
    
    Logger.log('\n=== Pruebas de AuthService completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testAuthServiceWithCache - Prueba el caché de AuthService
 */
function testAuthServiceWithCache() {
  Logger.log('=== Iniciando pruebas de caché de AuthService ===');
  
  try {
    const authService = new AuthService();
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    if (users.length === 0) {
      Logger.log('✗ No hay usuarios para probar');
      return;
    }
    
    const testEmail = users[0].email;
    
    // Primera llamada (sin caché)
    Logger.log('\n1. Primera llamada a isUserAllowed (sin caché)...');
    const start1 = new Date().getTime();
    const result1 = authService.isUserAllowed(testEmail);
    const time1 = new Date().getTime() - start1;
    Logger.log('✓ Resultado: ' + result1 + ', Tiempo: ' + time1 + 'ms');
    
    // Segunda llamada (con caché)
    Logger.log('\n2. Segunda llamada a isUserAllowed (con caché)...');
    const start2 = new Date().getTime();
    const result2 = authService.isUserAllowed(testEmail);
    const time2 = new Date().getTime() - start2;
    Logger.log('✓ Resultado: ' + result2 + ', Tiempo: ' + time2 + 'ms');
    
    Logger.log('\nMejora de rendimiento: ' + (time1 - time2) + 'ms');
    
    Logger.log('\n=== Pruebas de caché completadas ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
  }
}

// ============================================================================
// INVENTORYSERVICE - Gestión de Inventario
// ============================================================================

/**
 * InventoryService - Servicio de gestión de inventario
 * 
 * Gestiona el stock de productos en almacenes, movimientos de inventario,
 * reservas y alertas de stock mínimo.
 * 
 * Características:
 * - Consulta de stock disponible
 * - Reserva y liberación de stock
 * - Registro de movimientos de inventario
 * - Alertas de stock bajo
 * - Validaciones de stock suficiente
 * 
 * Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * @class
 */
class InventoryService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.stockRepo = new StockRepository();
    this.movementRepo = new MovementRepository();
    this.productRepo = new ProductRepository();
    this.auditRepo = new AuditRepository();
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================
  
  /**
   * checkStock - Consulta el stock disponible de un producto en un almacén
   * 
   * Requisitos: 4.1
   * 
   * @param {string} warehouseId - ID del almacén
   * @param {string} productId - ID del producto
   * @returns {number} Cantidad disponible en stock (0 si no existe registro)
   * @throws {Error} Si hay error al consultar
   */
  checkStock(warehouseId, productId) {
    try {
      // Validar parámetros
      if (!warehouseId) {
        throw new Error('warehouseId es requerido');
      }
      if (!productId) {
        throw new Error('productId es requerido');
      }
      
      // Buscar registro de stock
      const stockRecord = this.stockRepo.findByWarehouseAndProduct(warehouseId, productId);
      
      if (!stockRecord) {
        Logger.log('checkStock: no existe registro de stock para warehouse=' + warehouseId + ', product=' + productId);
        return 0;
      }
      
      // Retornar cantidad (asegurar que sea número)
      const quantity = Number(stockRecord.quantity) || 0;
      
      Logger.log('checkStock: warehouse=' + warehouseId + ', product=' + productId + ', quantity=' + quantity);
      return quantity;
      
    } catch (error) {
      Logger.log('Error en checkStock: ' + error.message);
      throw new Error('Error al consultar stock: ' + error.message);
    }
  }
  
  /**
   * reserveStock - Reserva stock de un producto (decrementa)
   * 
   * Valida que haya stock suficiente antes de decrementar.
   * Registra un movimiento de tipo SALIDA.
   * 
   * Requisitos: 4.2, 4.5
   * 
   * @param {string} warehouseId - ID del almacén
   * @param {string} productId - ID del producto
   * @param {number} quantity - Cantidad a reservar
   * @param {string} referenceId - ID de referencia (ej: ID de venta)
   * @param {string} userId - ID del usuario que realiza la operación
   * @param {string} reason - Motivo de la reserva
   * @returns {Object} Registro de stock actualizado
   * @throws {Error} Si no hay stock suficiente o hay error
   */
  reserveStock(warehouseId, productId, quantity, referenceId, userId, reason) {
    try {
      // Validar parámetros
      if (!warehouseId) {
        throw new Error('warehouseId es requerido');
      }
      if (!productId) {
        throw new Error('productId es requerido');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('quantity debe ser mayor a 0');
      }
      if (!userId) {
        throw new Error('userId es requerido');
      }
      
      // Verificar stock disponible
      const currentStock = this.checkStock(warehouseId, productId);
      
      if (currentStock < quantity) {
        throw new Error('Stock insuficiente. Disponible: ' + currentStock + ', Solicitado: ' + quantity);
      }
      
      // Decrementar stock
      const updatedStock = this.stockRepo.updateQuantity(warehouseId, productId, -quantity);
      
      // Registrar movimiento
      this.recordMovement({
        warehouseId: warehouseId,
        productId: productId,
        type: 'SALIDA',
        quantity: quantity,
        referenceId: referenceId || '',
        userId: userId,
        reason: reason || 'Reserva de stock'
      });
      
      Logger.log('reserveStock: reservado ' + quantity + ' unidades de producto ' + productId + ' en almacén ' + warehouseId);
      
      return updatedStock;
      
    } catch (error) {
      Logger.log('Error en reserveStock: ' + error.message);
      throw new Error('Error al reservar stock: ' + error.message);
    }
  }
  
  /**
   * releaseStock - Libera stock de un producto (incrementa)
   * 
   * Incrementa el stock del producto en el almacén.
   * Registra un movimiento de tipo ENTRADA.
   * 
   * @param {string} warehouseId - ID del almacén
   * @param {string} productId - ID del producto
   * @param {number} quantity - Cantidad a liberar
   * @param {string} referenceId - ID de referencia (ej: ID de anulación)
   * @param {string} userId - ID del usuario que realiza la operación
   * @param {string} reason - Motivo de la liberación
   * @returns {Object} Registro de stock actualizado
   * @throws {Error} Si hay error
   */
  releaseStock(warehouseId, productId, quantity, referenceId, userId, reason) {
    try {
      // Validar parámetros
      if (!warehouseId) {
        throw new Error('warehouseId es requerido');
      }
      if (!productId) {
        throw new Error('productId es requerido');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('quantity debe ser mayor a 0');
      }
      if (!userId) {
        throw new Error('userId es requerido');
      }
      
      // Incrementar stock
      const updatedStock = this.stockRepo.updateQuantity(warehouseId, productId, quantity);
      
      // Registrar movimiento
      this.recordMovement({
        warehouseId: warehouseId,
        productId: productId,
        type: 'ENTRADA',
        quantity: quantity,
        referenceId: referenceId || '',
        userId: userId,
        reason: reason || 'Liberación de stock'
      });
      
      Logger.log('releaseStock: liberado ' + quantity + ' unidades de producto ' + productId + ' en almacén ' + warehouseId);
      
      return updatedStock;
      
    } catch (error) {
      Logger.log('Error en releaseStock: ' + error.message);
      throw new Error('Error al liberar stock: ' + error.message);
    }
  }
  
  /**
   * recordMovement - Registra un movimiento de inventario
   * 
   * Crea un registro en INV_Movements con los detalles del movimiento.
   * 
   * Requisitos: 4.4
   * 
   * @param {Object} movementData - Datos del movimiento
   * @param {string} movementData.warehouseId - ID del almacén
   * @param {string} movementData.productId - ID del producto
   * @param {string} movementData.type - Tipo de movimiento (ENTRADA, SALIDA, AJUSTE, TRANSFERENCIA_OUT, TRANSFERENCIA_IN)
   * @param {number} movementData.quantity - Cantidad del movimiento
   * @param {string} movementData.referenceId - ID de referencia (opcional)
   * @param {string} movementData.userId - ID del usuario
   * @param {string} movementData.reason - Motivo del movimiento
   * @returns {Object} Registro de movimiento creado
   * @throws {Error} Si hay error al registrar
   */
  recordMovement(movementData) {
    try {
      // Validar parámetros requeridos
      if (!movementData.warehouseId) {
        throw new Error('warehouseId es requerido');
      }
      if (!movementData.productId) {
        throw new Error('productId es requerido');
      }
      if (!movementData.type) {
        throw new Error('type es requerido');
      }
      if (!movementData.quantity || movementData.quantity <= 0) {
        throw new Error('quantity debe ser mayor a 0');
      }
      if (!movementData.userId) {
        throw new Error('userId es requerido');
      }
      
      // Validar tipo de movimiento
      const validTypes = ['ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA_OUT', 'TRANSFERENCIA_IN', 'GIFT_BIRTHDAY'];
      if (validTypes.indexOf(movementData.type) === -1) {
        throw new Error('type debe ser uno de: ' + validTypes.join(', '));
      }
      
      // Crear registro de movimiento
      const movement = {
        id: 'mov-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
        warehouse_id: movementData.warehouseId,
        product_id: movementData.productId,
        type: movementData.type,
        quantity: movementData.quantity,
        reference_id: movementData.referenceId || '',
        user_id: movementData.userId,
        reason: movementData.reason || '',
        created_at: new Date()
      };
      
      // Guardar en la base de datos
      const createdMovement = this.movementRepo.create(movement);
      
      Logger.log('recordMovement: registrado movimiento ' + movement.type + ' de ' + movement.quantity + ' unidades');
      
      return createdMovement;
      
    } catch (error) {
      Logger.log('Error en recordMovement: ' + error.message);
      throw new Error('Error al registrar movimiento: ' + error.message);
    }
  }
  
  /**
   * checkLowStock - Verifica productos con stock bajo
   * 
   * Retorna una lista de productos cuyo stock actual está por debajo
   * del nivel mínimo configurado.
   * 
   * Requisitos: 4.3
   * 
   * @param {string} warehouseId - ID del almacén (opcional, si no se proporciona verifica todos)
   * @returns {Array<Object>} Array de productos con stock bajo
   * @throws {Error} Si hay error al verificar
   */
  checkLowStock(warehouseId) {
    try {
      const lowStockProducts = [];
      
      // Obtener todos los registros de stock
      const stockRecords = this.stockRepo.findAll();
      
      // Filtrar por almacén si se especificó
      let filteredRecords = stockRecords;
      if (warehouseId) {
        filteredRecords = stockRecords.filter(function(record) {
          return record.warehouse_id === warehouseId;
        });
      }
      
      // Verificar cada registro
      for (let i = 0; i < filteredRecords.length; i++) {
        const stockRecord = filteredRecords[i];
        
        // Obtener información del producto
        const product = this.productRepo.findById(stockRecord.product_id);
        
        if (!product) {
          Logger.log('checkLowStock: producto no encontrado ' + stockRecord.product_id);
          continue;
        }
        
        // Verificar si el stock está por debajo del mínimo
        const currentStock = Number(stockRecord.quantity) || 0;
        const minStock = Number(product.min_stock) || 0;
        
        if (currentStock < minStock) {
          lowStockProducts.push({
            warehouseId: stockRecord.warehouse_id,
            productId: product.id,
            productName: product.name,
            currentStock: currentStock,
            minStock: minStock,
            deficit: minStock - currentStock
          });
        }
      }
      
      Logger.log('checkLowStock: encontrados ' + lowStockProducts.length + ' productos con stock bajo');
      
      return lowStockProducts;
      
    } catch (error) {
      Logger.log('Error en checkLowStock: ' + error.message);
      throw new Error('Error al verificar stock bajo: ' + error.message);
    }
  }
  
  /**
   * transferStock - Transfiere stock entre almacenes con atomicidad e idempotencia
   * 
   * Utiliza LockManager para garantizar atomicidad y IdempotencyManager
   * para evitar transferencias duplicadas.
   * 
   * Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5
   * 
   * @param {string} fromWarehouse - ID del almacén origen
   * @param {string} toWarehouse - ID del almacén destino
   * @param {string} productId - ID del producto a transferir
   * @param {number} quantity - Cantidad a transferir
   * @param {string} requestId - ID único para idempotencia
   * @param {string} userId - ID del usuario que realiza la transferencia
   * @returns {Object} Resultado de la transferencia con detalles
   * @throws {Error} Si hay error o stock insuficiente
   */
  transferStock(fromWarehouse, toWarehouse, productId, quantity, requestId, userId) {
    let lock = null;
    
    try {
      // Validar parámetros
      if (!fromWarehouse) {
        throw new Error('fromWarehouse es requerido');
      }
      if (!toWarehouse) {
        throw new Error('toWarehouse es requerido');
      }
      if (fromWarehouse === toWarehouse) {
        throw new Error('El almacén origen y destino no pueden ser el mismo');
      }
      if (!productId) {
        throw new Error('productId es requerido');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('quantity debe ser mayor a 0');
      }
      if (!requestId) {
        throw new Error('requestId es requerido para idempotencia');
      }
      if (!userId) {
        throw new Error('userId es requerido');
      }
      
      // Verificar idempotencia
      const idempotencyResult = IdempotencyManager.checkAndStore(requestId, function() {
        // Adquirir lock para atomicidad
        lock = LockManager.acquireLock('transfer_stock_' + productId);
        
        Logger.log('transferStock: iniciando transferencia con lock adquirido');
        
        // Validar stock suficiente en origen
        const originStock = this.checkStock(fromWarehouse, productId);
        
        if (originStock < quantity) {
          throw new Error('Stock insuficiente en almacén origen. Disponible: ' + originStock + ', Solicitado: ' + quantity);
        }
        
        // Generar ID único para vincular los movimientos
        const transferId = 'transfer-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Decrementar stock en origen
        this.stockRepo.updateQuantity(fromWarehouse, productId, -quantity);
        
        // Incrementar stock en destino
        this.stockRepo.updateQuantity(toWarehouse, productId, quantity);
        
        // Registrar movimiento de salida en origen
        const movementOut = this.recordMovement({
          warehouseId: fromWarehouse,
          productId: productId,
          type: 'TRANSFERENCIA_OUT',
          quantity: quantity,
          referenceId: transferId,
          userId: userId,
          reason: 'Transferencia a almacén ' + toWarehouse
        });
        
        // Registrar movimiento de entrada en destino
        const movementIn = this.recordMovement({
          warehouseId: toWarehouse,
          productId: productId,
          type: 'TRANSFERENCIA_IN',
          quantity: quantity,
          referenceId: transferId,
          userId: userId,
          reason: 'Transferencia desde almacén ' + fromWarehouse
        });
        
        // Liberar lock
        if (lock) {
          LockManager.releaseLock(lock);
          lock = null;
        }
        
        Logger.log('transferStock: transferencia completada exitosamente. TransferId: ' + transferId);
        
        // Retornar resultado
        return {
          success: true,
          transferId: transferId,
          fromWarehouse: fromWarehouse,
          toWarehouse: toWarehouse,
          productId: productId,
          quantity: quantity,
          movementOutId: movementOut.id,
          movementInId: movementIn.id,
          timestamp: new Date()
        };
        
      }.bind(this));
      
      // Si ya fue procesado, retornar resultado anterior
      if (idempotencyResult.processed) {
        Logger.log('transferStock: operación ya procesada previamente (idempotencia). RequestId: ' + requestId);
        return idempotencyResult.result;
      }
      
      return idempotencyResult.result;
      
    } catch (error) {
      Logger.log('Error en transferStock: ' + error.message);
      
      // Asegurar que el lock se libere en caso de error
      if (lock) {
        LockManager.releaseLock(lock);
      }
      
      throw new Error('Error al transferir stock: ' + error.message);
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testInventoryService - Prueba el InventoryService
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que existan las hojas INV_Stock, INV_Movements y CAT_Products con datos.
 */
function testInventoryService() {
  Logger.log('=== Iniciando pruebas de InventoryService ===');
  
  try {
    // Crear instancia del servicio
    Logger.log('\n1. Creando instancia de InventoryService...');
    const inventoryService = new InventoryService();
    Logger.log('✓ Instancia creada correctamente');
    
    // Obtener un producto y almacén de ejemplo
    const stockRepo = new StockRepository();
    const stockRecords = stockRepo.findAll();
    
    if (stockRecords.length === 0) {
      Logger.log('✗ No hay registros de stock para probar');
      Logger.log('Por favor, ejecute primero la función de seed data');
      return;
    }
    
    const testStock = stockRecords[0];
    const testWarehouseId = testStock.warehouse_id;
    const testProductId = testStock.product_id;
    
    Logger.log('\nUsando warehouse: ' + testWarehouseId + ', product: ' + testProductId);
    
    // Probar checkStock
    Logger.log('\n2. Probando checkStock()...');
    const currentStock = inventoryService.checkStock(testWarehouseId, testProductId);
    Logger.log('✓ Stock actual: ' + currentStock);
    
    // Probar checkLowStock
    Logger.log('\n3. Probando checkLowStock()...');
    const lowStockProducts = inventoryService.checkLowStock();
    Logger.log('✓ Productos con stock bajo: ' + lowStockProducts.length);
    if (lowStockProducts.length > 0) {
      Logger.log('Primer producto con stock bajo: ' + JSON.stringify(lowStockProducts[0]));
    }
    
    // Probar checkLowStock por almacén
    Logger.log('\n4. Probando checkLowStock() por almacén...');
    const lowStockByWarehouse = inventoryService.checkLowStock(testWarehouseId);
    Logger.log('✓ Productos con stock bajo en almacén ' + testWarehouseId + ': ' + lowStockByWarehouse.length);
    
    Logger.log('\n=== Pruebas de InventoryService completadas exitosamente ===');
    Logger.log('NOTA: No se probaron reserveStock/releaseStock para no modificar datos reales');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}


// ============================================================================
// POSSERVICE - Punto de Venta (Ventas al Contado)
// ============================================================================

/**
 * POSService - Servicio de punto de venta para ventas al contado
 * 
 * Gestiona las operaciones del punto de venta incluyendo:
 * - Gestión de carrito de compras
 * - Cálculo de totales y descuentos
 * - Creación de ventas con locks e idempotencia
 * - Validación de stock
 * - Auditoría de ventas
 * 
 * Características:
 * - Validación de stock antes de confirmar venta
 * - Atomicidad con LockManager
 * - Idempotencia con requestId
 * - Auditoría completa de operaciones
 * 
 * Requisitos: 6.1, 6.3, 6.4, 6.5
 * 
 * @class
 */
class POSService {
  
  /**
   * Constructor
   * Inicializa los repositorios y servicios necesarios
   */
  constructor() {
    this.saleRepo = new SaleRepository();
    this.saleItemRepo = new SaleItemRepository();
    this.inventoryService = new InventoryService();
    this.auditRepo = new AuditRepository();
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================
  
  /**
   * addItemToCart - Agrega un producto al carrito con validación de stock
   * 
   * Valida que existe stock disponible antes de agregar al carrito.
   * El carrito se mantiene en memoria (no se persiste hasta confirmar venta).
   * 
   * Requisitos: 6.1
   * 
   * @param {string} cartId - ID del carrito (puede ser sessionId)
   * @param {string} productId - ID del producto a agregar
   * @param {number} quantity - Cantidad a agregar
   * @param {string} warehouseId - ID del almacén
   * @returns {Object} Item agregado al carrito
   * @throws {Error} Si no hay stock suficiente o hay error
   */
  addItemToCart(cartId, productId, quantity, warehouseId) {
    try {
      // Validar parámetros
      if (!cartId) {
        throw new Error('cartId es requerido');
      }
      if (!productId) {
        throw new Error('productId es requerido');
      }
      if (!quantity || quantity <= 0) {
        throw new Error('quantity debe ser mayor a 0');
      }
      if (!warehouseId) {
        throw new Error('warehouseId es requerido');
      }
      
      // Validar que existe stock disponible
      const availableStock = this.inventoryService.checkStock(warehouseId, productId);
      
      if (availableStock < quantity) {
        throw new Error('Stock insuficiente. Disponible: ' + availableStock + ', Solicitado: ' + quantity);
      }
      
      // Obtener información del producto
      const productRepo = new ProductRepository();
      const product = productRepo.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado: ' + productId);
      }
      
      if (!product.active) {
        throw new Error('El producto no está activo');
      }
      
      // Crear item del carrito
      const cartItem = {
        cartId: cartId,
        productId: productId,
        productName: product.name,
        quantity: quantity,
        unitPrice: Number(product.price) || 0,
        subtotal: (Number(product.price) || 0) * quantity
      };
      
      Logger.log('addItemToCart: agregado ' + quantity + ' unidades de ' + product.name + ' al carrito ' + cartId);
      
      return cartItem;
      
    } catch (error) {
      Logger.log('Error en addItemToCart: ' + error.message);
      throw new Error('Error al agregar item al carrito: ' + error.message);
    }
  }
  
  /**
   * calculateTotal - Calcula el total de una venta con descuentos
   * 
   * Calcula subtotal sumando todos los items y aplica descuentos.
   * 
   * @param {Array<Object>} cartItems - Items del carrito
   * @param {number} discount - Descuento a aplicar (monto fijo)
   * @returns {Object} Objeto con subtotal, discount y total
   * @throws {Error} Si hay error en el cálculo
   */
  calculateTotal(cartItems, discount) {
    try {
      // Validar parámetros
      if (!Array.isArray(cartItems)) {
        throw new Error('cartItems debe ser un array');
      }
      
      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }
      
      // Calcular subtotal
      let subtotal = 0;
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        subtotal += Number(item.subtotal) || 0;
      }
      
      // Aplicar descuento
      const discountAmount = Number(discount) || 0;
      
      if (discountAmount < 0) {
        throw new Error('El descuento no puede ser negativo');
      }
      
      if (discountAmount > subtotal) {
        throw new Error('El descuento no puede ser mayor al subtotal');
      }
      
      // Calcular total
      const total = subtotal - discountAmount;
      
      Logger.log('calculateTotal: subtotal=' + subtotal + ', discount=' + discountAmount + ', total=' + total);
      
      return {
        subtotal: subtotal,
        discount: discountAmount,
        total: total
      };
      
    } catch (error) {
      Logger.log('Error en calculateTotal: ' + error.message);
      throw new Error('Error al calcular total: ' + error.message);
    }
  }
  
  /**
   * applyDiscount - Aplica un descuento a una venta con validación y autorización
   * 
   * Valida que el descuento no exceda el umbral configurado.
   * Si excede, requiere autorización de supervisor.
   * 
   * Requisitos: 25.1, 25.2, 25.3, 25.4, 25.5
   * 
   * @param {number} amount - Monto del descuento
   * @param {string} type - Tipo de descuento ('FIXED' o 'PERCENTAGE')
   * @param {number} subtotal - Subtotal de la venta
   * @param {string} authorizedBy - Email del supervisor que autoriza (opcional)
   * @returns {Object} Objeto con discountAmount y requiresAuthorization
   * @throws {Error} Si el descuento es inválido o no está autorizado
   */
  applyDiscount(amount, type, subtotal, authorizedBy) {
    try {
      // Validar parámetros
      if (!amount || amount <= 0) {
        throw new Error('El monto del descuento debe ser mayor a 0');
      }
      
      if (!type || (type !== 'FIXED' && type !== 'PERCENTAGE')) {
        throw new Error('El tipo de descuento debe ser FIXED o PERCENTAGE');
      }
      
      if (!subtotal || subtotal <= 0) {
        throw new Error('El subtotal debe ser mayor a 0');
      }
      
      // Calcular monto del descuento
      let discountAmount = 0;
      
      if (type === 'FIXED') {
        discountAmount = Number(amount);
      } else if (type === 'PERCENTAGE') {
        if (amount > 100) {
          throw new Error('El porcentaje de descuento no puede ser mayor a 100');
        }
        discountAmount = subtotal * (Number(amount) / 100);
      }
      
      // Validar que el descuento no sea mayor al subtotal
      if (discountAmount > subtotal) {
        throw new Error('El descuento no puede ser mayor al subtotal');
      }
      
      // Obtener umbral de descuento desde parámetros
      const discountThreshold = this._getDiscountThreshold();
      
      // Calcular porcentaje del descuento sobre el subtotal
      const discountPercentage = (discountAmount / subtotal) * 100;
      
      // Verificar si requiere autorización
      const requiresAuthorization = discountPercentage > discountThreshold;
      
      if (requiresAuthorization && !authorizedBy) {
        throw new Error('El descuento de ' + discountPercentage.toFixed(2) + '% requiere autorización de supervisor (umbral: ' + discountThreshold + '%)');
      }
      
      // Si requiere autorización, validar que el autorizador sea supervisor
      if (requiresAuthorization && authorizedBy) {
        const authService = new AuthService();
        const hasSupervisorPermission = authService.hasPermission(authorizedBy, 'authorize_discount');
        
        if (!hasSupervisorPermission) {
          throw new Error('El usuario ' + authorizedBy + ' no tiene permisos de supervisor para autorizar descuentos');
        }
      }
      
      Logger.log('applyDiscount: amount=' + discountAmount + ', percentage=' + discountPercentage.toFixed(2) + '%, requiresAuth=' + requiresAuthorization);
      
      return {
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        requiresAuthorization: requiresAuthorization,
        authorizedBy: authorizedBy || null
      };
      
    } catch (error) {
      Logger.log('Error en applyDiscount: ' + error.message);
      throw new Error('Error al aplicar descuento: ' + error.message);
    }
  }
  
  /**
   * _getDiscountThreshold - Obtiene el umbral de descuento desde parámetros
   * @private
   * @returns {number} Porcentaje de umbral (default: 10%)
   */
  _getDiscountThreshold() {
    try {
      // TODO: Obtener desde CFG_Params cuando esté implementado
      // Por ahora retornar valor por defecto
      return 10; // 10% de descuento sin autorización
    } catch (error) {
      Logger.log('Error getting discount threshold: ' + error.message);
      return 10;
    }
  }
  
  /**
   * createSale - Crea una venta (contado o crédito) con locks e idempotencia
   * 
   * Proceso completo:
   * 1. Validar stock de todos los items
   * 2. Si es crédito, validar cupo disponible del cliente
   * 3. Crear registro de venta
   * 4. Crear registros de items de venta
   * 5. Decrementar stock
   * 6. Registrar movimientos de inventario
   * 7. Si es crédito, crear plan de crédito con cuotas
   * 8. Auditar operación
   * 
   * Utiliza LockManager para atomicidad e IdempotencyManager para evitar duplicados.
   * 
   * Requisitos: 6.3, 6.4, 6.5, 7.1, 7.3
   * 
   * @param {Object} saleData - Datos de la venta
   * @param {string} saleData.storeId - ID de la tienda
   * @param {string} saleData.warehouseId - ID del almacén
   * @param {string} saleData.userId - ID del usuario vendedor
   * @param {string} saleData.clientId - ID del cliente (requerido para crédito)
   * @param {string} saleData.saleType - Tipo de venta: 'CONTADO' o 'CREDITO' (default: 'CONTADO')
   * @param {number} saleData.installments - Número de cuotas (requerido si saleType es CREDITO)
   * @param {Array<Object>} saleData.items - Items de la venta
   * @param {number} saleData.discount - Descuento aplicado
   * @param {string} requestId - ID único para idempotencia
   * @returns {Object} Venta creada con todos los detalles
   * @throws {Error} Si hay error, stock insuficiente o cupo insuficiente
   */
  createSale(saleData, requestId) {
    let lock = null;
    
    try {
      // Validar parámetros requeridos
      if (!saleData.storeId) {
        throw new Error('storeId es requerido');
      }
      if (!saleData.warehouseId) {
        throw new Error('warehouseId es requerido');
      }
      if (!saleData.userId) {
        throw new Error('userId es requerido');
      }
      if (!Array.isArray(saleData.items) || saleData.items.length === 0) {
        throw new Error('items es requerido y debe contener al menos un item');
      }
      if (!requestId) {
        throw new Error('requestId es requerido para idempotencia');
      }
      
      // Determinar tipo de venta (default: CONTADO)
      const saleType = saleData.saleType || SALE_TYPES.CONTADO;
      
      // Validar tipo de venta
      if (saleType !== SALE_TYPES.CONTADO && saleType !== SALE_TYPES.CREDITO) {
        throw new Error('saleType debe ser CONTADO o CREDITO');
      }
      
      // Si es crédito, validar parámetros adicionales
      if (saleType === SALE_TYPES.CREDITO) {
        if (!saleData.clientId) {
          throw new Error('clientId es requerido para ventas a crédito');
        }
        if (!saleData.installments) {
          throw new Error('installments es requerido para ventas a crédito');
        }
        
        // Validar número de cuotas
        const numInstallments = Number(saleData.installments);
        if (isNaN(numInstallments) || numInstallments < LIMITS.MIN_INSTALLMENTS || numInstallments > LIMITS.MAX_INSTALLMENTS) {
          throw new Error('installments debe estar entre ' + LIMITS.MIN_INSTALLMENTS + ' y ' + LIMITS.MAX_INSTALLMENTS);
        }
      }
      
      // Verificar idempotencia
      const idempotencyResult = IdempotencyManager.checkAndStore(requestId, function() {
        // Adquirir lock para atomicidad
        lock = LockManager.acquireLock('create_sale');
        
        Logger.log('createSale: iniciando creación de venta tipo ' + saleType + ' con lock adquirido');
        
        // Validar stock de todos los items
        for (let i = 0; i < saleData.items.length; i++) {
          const item = saleData.items[i];
          const availableStock = this.inventoryService.checkStock(saleData.warehouseId, item.productId);
          
          if (availableStock < item.quantity) {
            throw new Error('Stock insuficiente para producto ' + item.productId + '. Disponible: ' + availableStock + ', Solicitado: ' + item.quantity);
          }
        }
        
        // Calcular totales
        const totals = this.calculateTotal(saleData.items, saleData.discount || 0);
        
        // Si es crédito, validar cupo disponible del cliente (Requisito 7.1)
        let client = null;
        if (saleType === SALE_TYPES.CREDITO) {
          const clientRepo = new ClientRepository();
          client = clientRepo.findById(saleData.clientId);
          
          if (!client) {
            throw new Error('Cliente no encontrado: ' + saleData.clientId);
          }
          
          if (!client.active) {
            throw new Error('El cliente no está activo');
          }
          
          // Calcular cupo disponible
          const creditLimit = Number(client.credit_limit) || 0;
          const creditUsed = Number(client.credit_used) || 0;
          const creditAvailable = creditLimit - creditUsed;
          
          Logger.log('createSale: validando cupo del cliente. Límite=' + creditLimit + ', Usado=' + creditUsed + ', Disponible=' + creditAvailable + ', Requerido=' + totals.total);
          
          // Validar que el cupo disponible sea suficiente
          if (creditAvailable < totals.total) {
            throw new Error('Cupo de crédito insuficiente. Disponible: ' + creditAvailable + ', Requerido: ' + totals.total);
          }
        }
        
        // Generar número de venta
        const saleNumber = this._generateSaleNumber(saleData.storeId);
        
        // Determinar estado de pago según tipo de venta
        const paymentStatus = saleType === SALE_TYPES.CONTADO ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING;
        
        // Crear registro de venta
        const sale = {
          id: 'sale-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
          sale_number: saleNumber,
          store_id: saleData.storeId,
          client_id: saleData.clientId || '',
          user_id: saleData.userId,
          sale_type: saleType,
          subtotal: totals.subtotal,
          discount: totals.discount,
          total: totals.total,
          payment_status: paymentStatus,
          created_at: new Date(),
          voided: false,
          void_reason: '',
          void_user_id: '',
          void_at: ''
        };
        
        const createdSale = this.saleRepo.create(sale);
        
        Logger.log('createSale: venta creada con ID ' + createdSale.id + ', tipo=' + saleType + ', estado pago=' + paymentStatus);
        
        // Crear items de venta y decrementar stock
        const createdItems = [];
        
        for (let i = 0; i < saleData.items.length; i++) {
          const item = saleData.items[i];
          
          // Crear item de venta
          const saleItem = {
            id: 'item-' + new Date().getTime() + '-' + i + '-' + Math.random().toString(36).substr(2, 9),
            sale_id: createdSale.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: item.subtotal
          };
          
          const createdItem = this.saleItemRepo.create(saleItem);
          createdItems.push(createdItem);
          
          // Decrementar stock y registrar movimiento
          this.inventoryService.reserveStock(
            saleData.warehouseId,
            item.productId,
            item.quantity,
            createdSale.id,
            saleData.userId,
            'Venta ' + saleNumber
          );
        }
        
        // Si es crédito, crear plan de crédito (Requisito 7.3)
        let creditPlan = null;
        if (saleType === SALE_TYPES.CREDITO) {
          Logger.log('createSale: creando plan de crédito con ' + saleData.installments + ' cuotas');
          
          const creditService = new CreditService();
          const creditResult = creditService.createCreditPlan(createdSale.id, saleData.installments);
          
          creditPlan = creditResult;
          
          Logger.log('createSale: plan de crédito creado exitosamente. PlanId=' + creditResult.plan.id);
        }
        
        // Auditar venta
        this.auditRepo.log(
          'CREATE_SALE',
          'SALE',
          createdSale.id,
          null,
          {
            saleNumber: saleNumber,
            storeId: saleData.storeId,
            saleType: saleType,
            total: totals.total,
            discount: totals.discount,
            itemsCount: saleData.items.length,
            installments: saleData.installments || null,
            clientId: saleData.clientId || null,
            authorizedBy: saleData.authorizedBy || null
          },
          saleData.userId
        );
        
        // Si hay descuento, auditar específicamente
        if (totals.discount > 0) {
          this.auditRepo.log(
            'APPLY_DISCOUNT',
            'SALE',
            createdSale.id,
            null,
            {
              saleNumber: saleNumber,
              discountAmount: totals.discount,
              subtotal: totals.subtotal,
              discountPercentage: ((totals.discount / totals.subtotal) * 100).toFixed(2),
              authorizedBy: saleData.authorizedBy || null
            },
            saleData.userId
          );
        }
        
        // Liberar lock
        if (lock) {
          LockManager.releaseLock(lock);
          lock = null;
        }
        
        Logger.log('createSale: venta completada exitosamente. SaleId: ' + createdSale.id);
        
        // Retornar resultado completo
        const result = {
          success: true,
          sale: createdSale,
          items: createdItems,
          totals: totals,
          timestamp: new Date()
        };
        
        // Si es crédito, incluir información del plan
        if (creditPlan) {
          result.creditPlan = creditPlan.plan;
          result.installments = creditPlan.installments;
          result.client = creditPlan.client;
        }
        
        return result;
        
      }.bind(this));
      
      // Si ya fue procesado, retornar resultado anterior
      if (idempotencyResult.processed) {
        Logger.log('createSale: operación ya procesada previamente (idempotencia). RequestId: ' + requestId);
        return idempotencyResult.result;
      }
      
      return idempotencyResult.result;
      
    } catch (error) {
      Logger.log('Error en createSale: ' + error.message);
      
      // Asegurar que el lock se libere en caso de error
      if (lock) {
        LockManager.releaseLock(lock);
      }
      
      throw new Error('Error al crear venta: ' + error.message);
    }
  }
  
  /**
   * voidSale - Anula una venta con justificación
   * 
   * Proceso:
   * 1. Validar permisos de supervisor
   * 2. Requerir motivo obligatorio
   * 3. Revertir movimientos de inventario (incrementar stock)
   * 4. Marcar venta como anulada
   * 5. Auditar anulación
   * 
   * Requisitos: 23.1, 23.2, 23.3, 23.5
   * 
   * @param {string} saleId - ID de la venta a anular
   * @param {string} reason - Motivo de la anulación (obligatorio)
   * @param {string} userId - Email del usuario que anula (debe ser supervisor)
   * @returns {Object} Resultado de la anulación
   * @throws {Error} Si no tiene permisos, falta motivo o hay error
   */
  voidSale(saleId, reason, userId) {
    let lock = null;
    
    try {
      // Validar parámetros
      if (!saleId) {
        throw new Error('saleId es requerido');
      }
      if (!reason || reason.trim() === '') {
        throw new Error('El motivo de anulación es obligatorio');
      }
      if (!userId) {
        throw new Error('userId es requerido');
      }
      
      // Validar permisos de supervisor
      const authService = new AuthService();
      const hasSupervisorPermission = authService.hasPermission(userId, 'void_sale');
      
      if (!hasSupervisorPermission) {
        throw new Error('El usuario ' + userId + ' no tiene permisos de supervisor para anular ventas');
      }
      
      // Adquirir lock para atomicidad
      lock = LockManager.acquireLock('void_sale_' + saleId);
      
      Logger.log('voidSale: iniciando anulación con lock adquirido');
      
      // Obtener venta
      const sale = this.saleRepo.findById(saleId);
      
      if (!sale) {
        throw new Error('Venta no encontrada: ' + saleId);
      }
      
      // Verificar que no esté ya anulada
      if (sale.voided === true || sale.voided === 'TRUE') {
        throw new Error('La venta ya está anulada');
      }
      
      // Obtener items de la venta
      const items = this.saleItemRepo.findBySale(saleId);
      
      if (!items || items.length === 0) {
        throw new Error('No se encontraron items para la venta: ' + saleId);
      }
      
      // Revertir stock de cada item (incrementar)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Obtener el almacén de la venta (asumiendo que está en el contexto)
        // TODO: Obtener warehouseId desde la venta cuando esté disponible
        const warehouseId = 'Mujeres'; // Por ahora usar default
        
        this.inventoryService.releaseStock(
          warehouseId,
          item.product_id,
          item.quantity,
          saleId,
          userId,
          'Anulación de venta ' + sale.sale_number
        );
      }
      
      // ========================================================================
      // MANEJO ESPECIAL PARA VENTAS A CRÉDITO (Requisito 23.4)
      // ========================================================================
      
      let creditPlanCancelled = false;
      let creditRestored = 0;
      
      if (sale.sale_type === SALE_TYPES.CREDITO && sale.client_id) {
        Logger.log('voidSale: venta a crédito detectada, cancelando plan y restaurando cupo');
        
        try {
          // Obtener el plan de crédito asociado a la venta
          const creditPlanRepo = new CreditPlanRepository();
          const creditPlan = creditPlanRepo.findBySale(saleId);
          
          if (creditPlan) {
            Logger.log('voidSale: plan de crédito encontrado: ' + creditPlan.id);
            
            // Cancelar el plan de crédito (cambiar estado a CANCELLED)
            creditPlan.status = CREDIT_PLAN_STATUS.CANCELLED;
            creditPlanRepo.update(creditPlan.id, creditPlan);
            
            creditPlanCancelled = true;
            Logger.log('voidSale: plan de crédito cancelado');
            
            // Restaurar cupo del cliente
            const clientRepo = new ClientRepository();
            const client = clientRepo.findById(sale.client_id);
            
            if (client) {
              const currentCreditUsed = Number(client.credit_used) || 0;
              const saleTotal = Number(sale.total) || 0;
              
              // Decrementar el cupo usado (restaurar cupo)
              const newCreditUsed = Math.max(0, currentCreditUsed - saleTotal);
              
              client.credit_used = newCreditUsed;
              clientRepo.update(client.id, client);
              
              creditRestored = saleTotal;
              
              Logger.log('voidSale: cupo del cliente restaurado. Usado anterior=' + currentCreditUsed + ', nuevo usado=' + newCreditUsed + ', restaurado=' + creditRestored);
              
              // Auditar reversión de cupo
              const auditRepo = new AuditRepository();
              auditRepo.log(
                'RESTORE_CREDIT_QUOTA',
                'CLIENT',
                client.id,
                {
                  credit_used: currentCreditUsed
                },
                {
                  credit_used: newCreditUsed,
                  amount_restored: creditRestored,
                  reason: 'Anulación de venta ' + sale.sale_number
                },
                userId
              );
              
              Logger.log('voidSale: auditoría de reversión de cupo registrada');
            } else {
              Logger.log('voidSale: ADVERTENCIA - cliente no encontrado para restaurar cupo: ' + sale.client_id);
            }
          } else {
            Logger.log('voidSale: ADVERTENCIA - no se encontró plan de crédito para la venta a crédito: ' + saleId);
          }
        } catch (creditError) {
          Logger.log('voidSale: ERROR al cancelar plan de crédito o restaurar cupo: ' + creditError.message);
          // No lanzar error, continuar con la anulación de la venta
          // pero registrar el problema
        }
      }
      
      // Marcar venta como anulada
      sale.voided = true;
      sale.void_reason = reason;
      sale.void_user_id = userId;
      sale.void_at = new Date();
      
      this.saleRepo.update(saleId, sale);
      
      // Auditar anulación
      this.auditRepo.log(
        'VOID_SALE',
        'SALE',
        saleId,
        {
          voided: false
        },
        {
          voided: true,
          voidReason: reason,
          voidUserId: userId,
          saleNumber: sale.sale_number,
          total: sale.total,
          saleType: sale.sale_type,
          creditPlanCancelled: creditPlanCancelled,
          creditRestored: creditRestored
        },
        userId
      );
      
      // Liberar lock
      if (lock) {
        LockManager.releaseLock(lock);
        lock = null;
      }
      
      Logger.log('voidSale: venta anulada exitosamente. SaleId: ' + saleId);
      
      return {
        success: true,
        saleId: saleId,
        saleNumber: sale.sale_number,
        saleType: sale.sale_type,
        voidReason: reason,
        voidedBy: userId,
        voidedAt: sale.void_at,
        creditPlanCancelled: creditPlanCancelled,
        creditRestored: creditRestored
      };
      
    } catch (error) {
      Logger.log('Error en voidSale: ' + error.message);
      
      // Asegurar que el lock se libere en caso de error
      if (lock) {
        LockManager.releaseLock(lock);
      }
      
      throw new Error('Error al anular venta: ' + error.message);
    }
  }
  
  // ==========================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ==========================================================================
  
  /**
   * _generateSaleNumber - Genera un número correlativo de venta
   * @private
   * @param {string} storeId - ID de la tienda
   * @returns {string} Número de venta (ej: "MUJ-2024-00001")
   */
  _generateSaleNumber(storeId) {
    try {
      // Obtener todas las ventas de la tienda
      const sales = this.saleRepo.findByStore(storeId, {});
      
      // Obtener el año actual
      const year = new Date().getFullYear();
      
      // Filtrar ventas del año actual
      const salesThisYear = sales.filter(function(sale) {
        const saleYear = new Date(sale.created_at).getFullYear();
        return saleYear === year;
      });
      
      // Calcular siguiente número
      const nextNumber = salesThisYear.length + 1;
      
      // Formatear número con padding
      const paddedNumber = String(nextNumber).padStart(5, '0');
      
      // Generar número de venta
      const storePrefix = storeId.substring(0, 3).toUpperCase();
      const saleNumber = storePrefix + '-' + year + '-' + paddedNumber;
      
      return saleNumber;
      
    } catch (error) {
      Logger.log('Error en _generateSaleNumber: ' + error.message);
      // Fallback a timestamp si hay error
      return 'SALE-' + new Date().getTime();
    }
  }
  
  /**
   * generateTicket - Genera el HTML del ticket de venta
   * 
   * Crea un ticket de venta con formato para impresión.
   * Incluye logo, datos de tienda, items y totales.
   * 
   * Requisitos: 6.3
   * 
   * @param {string} saleId - ID de la venta
   * @returns {string} HTML del ticket
   * @throws {Error} Si la venta no existe o hay error
   */
  generateTicket(saleId) {
    try {
      // Validar parámetro
      if (!saleId) {
        throw new Error('saleId es requerido');
      }
      
      // Obtener venta
      const sale = this.saleRepo.findById(saleId);
      
      if (!sale) {
        throw new Error('Venta no encontrada: ' + saleId);
      }
      
      // Obtener items de la venta
      const items = this.saleItemRepo.findBySale(saleId);
      
      if (!items || items.length === 0) {
        throw new Error('No se encontraron items para la venta: ' + saleId);
      }
      
      // Obtener información de productos
      const productRepo = new ProductRepository();
      const itemsWithDetails = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const product = productRepo.findById(item.product_id);
        
        itemsWithDetails.push({
          name: product ? product.name : 'Producto ' + item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.subtotal
        });
      }
      
      // Obtener nombre de tienda
      const storeName = this._getStoreName(sale.store_id);
      
      // Formatear fecha
      const saleDate = new Date(sale.created_at);
      const formattedDate = this._formatDate(saleDate);
      const formattedTime = this._formatTime(saleDate);
      
      // Generar HTML del ticket
      let html = '<!DOCTYPE html>\n';
      html += '<html>\n<head>\n';
      html += '<meta charset="UTF-8">\n';
      html += '<title>Ticket de Venta - ' + sale.sale_number + '</title>\n';
      html += '<style>\n';
      html += 'body { font-family: "Courier New", monospace; width: 300px; margin: 20px auto; }\n';
      html += '.ticket { border: 1px solid #000; padding: 10px; }\n';
      html += '.header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }\n';
      html += '.header h2 { margin: 5px 0; font-size: 18px; }\n';
      html += '.header p { margin: 2px 0; font-size: 12px; }\n';
      html += '.info { margin-bottom: 10px; font-size: 12px; }\n';
      html += '.items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; }\n';
      html += '.item { margin-bottom: 8px; font-size: 12px; }\n';
      html += '.item-name { font-weight: bold; }\n';
      html += '.item-details { display: flex; justify-content: space-between; }\n';
      html += '.totals { margin-top: 10px; font-size: 12px; }\n';
      html += '.total-row { display: flex; justify-content: space-between; margin: 5px 0; }\n';
      html += '.total-row.final { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 5px; }\n';
      html += '.footer { text-align: center; margin-top: 10px; font-size: 11px; border-top: 1px dashed #000; padding-top: 10px; }\n';
      html += '@media print { body { margin: 0; } .ticket { border: none; } }\n';
      html += '</style>\n';
      html += '</head>\n<body>\n';
      html += '<div class="ticket">\n';
      
      // Header
      html += '<div class="header">\n';
      html += '<h2>ADICTION BOUTIQUE</h2>\n';
      html += '<p>' + storeName + '</p>\n';
      html += '<p>RUC: 20123456789</p>\n';
      html += '<p>Av. Principal 123, Lima</p>\n';
      html += '<p>Tel: (01) 234-5678</p>\n';
      html += '</div>\n';
      
      // Sale Info
      html += '<div class="info">\n';
      html += '<p><strong>Ticket:</strong> ' + sale.sale_number + '</p>\n';
      html += '<p><strong>Fecha:</strong> ' + formattedDate + '</p>\n';
      html += '<p><strong>Hora:</strong> ' + formattedTime + '</p>\n';
      html += '<p><strong>Vendedor:</strong> ' + sale.user_id + '</p>\n';
      html += '<p><strong>Tipo:</strong> ' + sale.sale_type + '</p>\n';
      html += '</div>\n';
      
      // Items
      html += '<div class="items">\n';
      for (let i = 0; i < itemsWithDetails.length; i++) {
        const item = itemsWithDetails[i];
        html += '<div class="item">\n';
        html += '<div class="item-name">' + item.name + '</div>\n';
        html += '<div class="item-details">\n';
        html += '<span>' + item.quantity + ' x S/ ' + this._formatMoney(item.unitPrice) + '</span>\n';
        html += '<span>S/ ' + this._formatMoney(item.subtotal) + '</span>\n';
        html += '</div>\n';
        html += '</div>\n';
      }
      html += '</div>\n';
      
      // Totals
      html += '<div class="totals">\n';
      html += '<div class="total-row">\n';
      html += '<span>Subtotal:</span>\n';
      html += '<span>S/ ' + this._formatMoney(sale.subtotal) + '</span>\n';
      html += '</div>\n';
      
      if (sale.discount > 0) {
        html += '<div class="total-row">\n';
        html += '<span>Descuento:</span>\n';
        html += '<span>- S/ ' + this._formatMoney(sale.discount) + '</span>\n';
        html += '</div>\n';
      }
      
      html += '<div class="total-row final">\n';
      html += '<span>TOTAL:</span>\n';
      html += '<span>S/ ' + this._formatMoney(sale.total) + '</span>\n';
      html += '</div>\n';
      html += '</div>\n';
      
      // Footer
      html += '<div class="footer">\n';
      html += '<p>¡Gracias por su compra!</p>\n';
      html += '<p>Vuelva pronto</p>\n';
      html += '</div>\n';
      
      html += '</div>\n';
      html += '<script>window.print();</script>\n';
      html += '</body>\n</html>';
      
      return html;
      
    } catch (error) {
      Logger.log('Error en generateTicket: ' + error.message);
      throw new Error('Error al generar ticket: ' + error.message);
    }
  }
  
  /**
   * _getStoreName - Obtiene el nombre de la tienda
   * @private
   */
  _getStoreName(storeId) {
    const storeNames = {
      'STORE_MUJERES': 'Tienda Mujeres',
      'STORE_HOMBRES': 'Tienda Hombres'
    };
    return storeNames[storeId] || storeId;
  }
  
  /**
   * _formatDate - Formatea una fecha
   * @private
   */
  _formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return day + '/' + month + '/' + year;
  }
  
  /**
   * _formatTime - Formatea una hora
   * @private
   */
  _formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  }
  
  /**
   * _formatMoney - Formatea un monto de dinero
   * @private
   */
  _formatMoney(amount) {
    return Number(amount || 0).toFixed(2);
  }
}


// ============================================================================
// FUNCIONES DE PRUEBA - POSSERVICE
// ============================================================================

/**
 * testPOSService - Prueba el POSService
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que existan las hojas necesarias con datos de ejemplo.
 */
function testPOSService() {
  Logger.log('=== Iniciando pruebas de POSService ===');
  
  try {
    // Crear instancia del servicio
    Logger.log('\n1. Creando instancia de POSService...');
    const posService = new POSService();
    Logger.log('✓ Instancia creada correctamente');
    
    // Obtener datos de ejemplo
    const stockRepo = new StockRepository();
    const stockRecords = stockRepo.findAll();
    
    if (stockRecords.length === 0) {
      Logger.log('✗ No hay registros de stock para probar');
      return;
    }
    
    const testStock = stockRecords[0];
    const testWarehouseId = testStock.warehouse_id;
    const testProductId = testStock.product_id;
    
    const productRepo = new ProductRepository();
    const testProduct = productRepo.findById(testProductId);
    
    if (!testProduct) {
      Logger.log('✗ Producto no encontrado');
      return;
    }
    
    Logger.log('\nUsando warehouse: ' + testWarehouseId + ', product: ' + testProduct.name);
    
    // Probar addItemToCart
    Logger.log('\n2. Probando addItemToCart()...');
    const cartId = 'test-cart-' + new Date().getTime();
    const cartItem = posService.addItemToCart(cartId, testProductId, 1, testWarehouseId);
    Logger.log('✓ Item agregado al carrito: ' + JSON.stringify(cartItem));
    
    // Probar calculateTotal
    Logger.log('\n3. Probando calculateTotal()...');
    const totals = posService.calculateTotal([cartItem], 0);
    Logger.log('✓ Totales calculados: ' + JSON.stringify(totals));
    
    // Probar calculateTotal con descuento
    Logger.log('\n4. Probando calculateTotal() con descuento...');
    const totalsWithDiscount = posService.calculateTotal([cartItem], 10);
    Logger.log('✓ Totales con descuento: ' + JSON.stringify(totalsWithDiscount));
    
    Logger.log('\n=== Pruebas de POSService completadas exitosamente ===');
    Logger.log('NOTA: No se probó createSale para no modificar datos reales');
    Logger.log('Para probar createSale, ejecute testPOSServiceCreateSale()');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testPOSServiceCreateSale - Prueba la creación de una venta completa
 * 
 * ADVERTENCIA: Esta función crea una venta real y modifica el stock.
 * Solo ejecutar en ambiente de pruebas.
 */
function testPOSServiceCreateSale() {
  Logger.log('=== Iniciando prueba de createSale ===');
  Logger.log('ADVERTENCIA: Esta prueba modificará datos reales');
  
  try {
    const posService = new POSService();
    
    // Obtener datos de ejemplo
    const stockRepo = new StockRepository();
    const stockRecords = stockRepo.findAll();
    
    if (stockRecords.length === 0) {
      Logger.log('✗ No hay registros de stock para probar');
      return;
    }
    
    const testStock = stockRecords[0];
    const testWarehouseId = testStock.warehouse_id;
    const testProductId = testStock.product_id;
    
    const productRepo = new ProductRepository();
    const testProduct = productRepo.findById(testProductId);
    
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    if (users.length === 0) {
      Logger.log('✗ No hay usuarios para probar');
      return;
    }
    
    const testUser = users[0];
    
    // Preparar datos de venta
    const saleData = {
      storeId: 'STORE_MUJERES',
      warehouseId: testWarehouseId,
      userId: testUser.email,
      clientId: '',
      items: [
        {
          productId: testProductId,
          productName: testProduct.name,
          quantity: 1,
          unitPrice: Number(testProduct.price) || 0,
          subtotal: Number(testProduct.price) || 0
        }
      ],
      discount: 0
    };
    
    const requestId = 'test-req-' + new Date().getTime();
    
    Logger.log('\nCreando venta de prueba...');
    Logger.log('RequestId: ' + requestId);
    
    const result = posService.createSale(saleData, requestId);
    
    Logger.log('\n✓ Venta creada exitosamente!');
    Logger.log('Sale ID: ' + result.sale.id);
    Logger.log('Sale Number: ' + result.sale.sale_number);
    Logger.log('Total: ' + result.totals.total);
    Logger.log('Items: ' + result.items.length);
    
    // Probar idempotencia
    Logger.log('\nProbando idempotencia con el mismo requestId...');
    const result2 = posService.createSale(saleData, requestId);
    
    if (result.sale.id === result2.sale.id) {
      Logger.log('✓ Idempotencia funciona correctamente - retornó la misma venta');
    } else {
      Logger.log('✗ Idempotencia falló - se creó una venta diferente');
    }
    
    Logger.log('\n=== Prueba de createSale completada ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en la prueba: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

// ============================================================================
// CASHSERVICE - Gestión de Caja
// ============================================================================

/**
 * CashService - Servicio de gestión de caja y turnos
 * 
 * Gestiona la apertura y cierre de turnos de caja, registro de egresos,
 * cálculo de arqueos y control de efectivo.
 * 
 * Características:
 * - Apertura de turnos de caja
 * - Cierre de turnos con arqueo automático
 * - Registro de egresos con autorización
 * - Cálculo de monto esperado vs real
 * - Validación de turno único por tienda
 * 
 * Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5
 * 
 * @class
 */
class CashService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.shiftRepo = new ShiftRepository();
    this.expenseRepo = new ExpenseRepository();
    this.saleRepo = new SaleRepository();
    this.paymentRepo = new PaymentRepository();
    this.auditRepo = new AuditRepository();
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS - GESTIÓN DE TURNOS
  // ==========================================================================
  
  /**
   * openShift - Abre un nuevo turno de caja
   * 
   * Crea un nuevo turno de caja para una tienda específica.
   * Valida que no exista otro turno abierto en la misma tienda.
   * 
   * Requisitos: 11.1, 11.2
   * 
   * @param {Object} shiftData - Datos del turno a abrir
   * @param {string} shiftData.storeId - ID de la tienda
   * @param {string} shiftData.userId - ID del usuario que abre el turno
   * @param {number} shiftData.openingAmount - Monto inicial en caja
   * @returns {Object} Turno creado
   * @throws {Error} Si ya existe un turno abierto o hay error
   */
  openShift(shiftData) {
    try {
      // Validar parámetros requeridos
      Validator.isRequired(shiftData.storeId, 'storeId');
      Validator.isRequired(shiftData.userId, 'userId');
      Validator.isRequired(shiftData.openingAmount, 'openingAmount');
      Validator.isNumber(shiftData.openingAmount, 'openingAmount');
      
      // Validar que el monto inicial no sea negativo
      if (shiftData.openingAmount < 0) {
        throw new Error('El monto inicial no puede ser negativo');
      }
      
      // Verificar que no existe otro turno abierto en la tienda
      const existingOpenShift = this.shiftRepo.findOpenByStore(shiftData.storeId);
      
      if (existingOpenShift) {
        throw new Error('Ya existe un turno abierto en esta tienda. Debe cerrarlo antes de abrir uno nuevo.');
      }
      
      // Crear el nuevo turno
      const shift = {
        id: 'shift-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
        store_id: shiftData.storeId,
        user_id: shiftData.userId,
        opening_amount: shiftData.openingAmount,
        opening_at: new Date(),
        closing_amount: null,
        expected_amount: null,
        difference: null,
        closing_at: null,
        supervisor_id: null
      };
      
      // Guardar en la base de datos
      const createdShift = this.shiftRepo.create(shift);
      
      // Auditar la apertura
      this.auditRepo.log(
        'OPEN_SHIFT',
        'SHIFT',
        shift.id,
        null,
        {
          store_id: shift.store_id,
          opening_amount: shift.opening_amount,
          opening_at: shift.opening_at
        },
        shiftData.userId
      );
      
      Logger.log('openShift: turno abierto exitosamente - ID: ' + shift.id);
      
      return createdShift;
      
    } catch (error) {
      Logger.log('Error en openShift: ' + error.message);
      throw new Error('Error al abrir turno: ' + error.message);
    }
  }
  
  /**
   * closeShift - Cierra un turno de caja con arqueo
   * 
   * Cierra el turno de caja calculando el monto esperado basado en:
   * - Monto de apertura
   * - Ventas al contado
   * - Cobros de crédito
   * - Egresos
   * 
   * Calcula la diferencia entre el monto esperado y el monto real contado.
   * Requiere firma de supervisor.
   * 
   * Requisitos: 11.3, 11.4, 11.5
   * 
   * @param {string} shiftId - ID del turno a cerrar
   * @param {Object} closingData - Datos del cierre
   * @param {number} closingData.closingAmount - Monto real contado en caja
   * @param {string} closingData.supervisorId - ID del supervisor que autoriza el cierre
   * @param {string} closingData.userId - ID del usuario que cierra (cajero)
   * @returns {Object} Turno cerrado con cálculos de arqueo
   * @throws {Error} Si el turno no existe, ya está cerrado o hay error
   */
  closeShift(shiftId, closingData) {
    try {
      // Validar parámetros requeridos
      Validator.isRequired(shiftId, 'shiftId');
      Validator.isRequired(closingData.closingAmount, 'closingAmount');
      Validator.isRequired(closingData.supervisorId, 'supervisorId');
      Validator.isRequired(closingData.userId, 'userId');
      Validator.isNumber(closingData.closingAmount, 'closingAmount');
      
      // Validar que el monto de cierre no sea negativo
      if (closingData.closingAmount < 0) {
        throw new Error('El monto de cierre no puede ser negativo');
      }
      
      // Obtener el turno
      const shift = this.shiftRepo.findById(shiftId);
      
      if (!shift) {
        throw new Error('Turno no encontrado');
      }
      
      // Verificar que el turno no esté ya cerrado
      if (shift.closing_at) {
        throw new Error('El turno ya está cerrado');
      }
      
      // Calcular monto esperado
      const expectedAmount = this._calculateExpectedAmount(shift);
      
      // Calcular diferencia (real - esperado)
      const difference = closingData.closingAmount - expectedAmount;
      
      // Actualizar el turno con los datos de cierre
      shift.closing_amount = closingData.closingAmount;
      shift.expected_amount = expectedAmount;
      shift.difference = difference;
      shift.closing_at = new Date();
      shift.supervisor_id = closingData.supervisorId;
      
      // Guardar cambios
      const updatedShift = this.shiftRepo.update(shiftId, shift);
      
      // Auditar el cierre
      this.auditRepo.log(
        'CLOSE_SHIFT',
        'SHIFT',
        shiftId,
        null,
        {
          closing_amount: shift.closing_amount,
          expected_amount: shift.expected_amount,
          difference: shift.difference,
          closing_at: shift.closing_at,
          supervisor_id: shift.supervisor_id
        },
        closingData.userId
      );
      
      Logger.log('closeShift: turno cerrado exitosamente - ID: ' + shiftId);
      Logger.log('  Monto esperado: ' + expectedAmount);
      Logger.log('  Monto real: ' + closingData.closingAmount);
      Logger.log('  Diferencia: ' + difference + (difference >= 0 ? ' (sobrante)' : ' (faltante)'));
      
      return updatedShift;
      
    } catch (error) {
      Logger.log('Error en closeShift: ' + error.message);
      throw new Error('Error al cerrar turno: ' + error.message);
    }
  }
  
  /**
   * getShiftBalance - Obtiene el balance actual de un turno
   * 
   * Calcula el balance actual del turno incluyendo:
   * - Monto de apertura
   * - Ventas al contado
   * - Cobros de crédito
   * - Egresos
   * - Efectivo disponible actual
   * 
   * @param {string} shiftId - ID del turno
   * @returns {Object} Balance del turno con desglose
   * @throws {Error} Si el turno no existe o hay error
   */
  getShiftBalance(shiftId) {
    try {
      // Validar parámetro
      Validator.isRequired(shiftId, 'shiftId');
      
      // Obtener el turno
      const shift = this.shiftRepo.findById(shiftId);
      
      if (!shift) {
        throw new Error('Turno no encontrado');
      }
      
      // Calcular componentes del balance
      const openingAmount = Number(shift.opening_amount) || 0;
      const cashSales = this._getCashSalesAmount(shift);
      const collections = this._getCollectionsAmount(shift);
      const expenses = this._getExpensesAmount(shift);
      
      // Calcular efectivo disponible
      const availableCash = openingAmount + cashSales + collections - expenses;
      
      // Preparar respuesta
      const balance = {
        shiftId: shiftId,
        storeId: shift.store_id,
        openingAmount: openingAmount,
        cashSales: cashSales,
        collections: collections,
        expenses: expenses,
        availableCash: availableCash,
        isClosed: shift.closing_at ? true : false
      };
      
      // Si el turno está cerrado, incluir datos de cierre
      if (shift.closing_at) {
        balance.closingAmount = Number(shift.closing_amount) || 0;
        balance.expectedAmount = Number(shift.expected_amount) || 0;
        balance.difference = Number(shift.difference) || 0;
      }
      
      return balance;
      
    } catch (error) {
      Logger.log('Error en getShiftBalance: ' + error.message);
      throw new Error('Error al obtener balance del turno: ' + error.message);
    }
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS - GESTIÓN DE EGRESOS
  // ==========================================================================
  
  /**
   * recordExpense - Registra un egreso de caja
   * 
   * Registra un egreso (salida de dinero) durante un turno de caja.
   * Valida que exista un turno abierto.
   * Requiere autorización de supervisor si el monto supera el umbral configurado.
   * 
   * Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5
   * 
   * @param {Object} expenseData - Datos del egreso
   * @param {string} expenseData.shiftId - ID del turno de caja
   * @param {number} expenseData.amount - Monto del egreso
   * @param {string} expenseData.concept - Concepto del egreso
   * @param {string} expenseData.category - Categoría del egreso
   * @param {string} expenseData.receiptUrl - URL del comprobante en Drive (opcional)
   * @param {string} expenseData.userId - ID del usuario que registra el egreso
   * @param {string} expenseData.authorizedBy - ID del supervisor que autoriza (requerido si supera umbral)
   * @returns {Object} Egreso registrado
   * @throws {Error} Si no hay turno abierto, falta autorización o hay error
   */
  recordExpense(expenseData) {
    try {
      // Validar parámetros requeridos
      Validator.isRequired(expenseData.shiftId, 'shiftId');
      Validator.isRequired(expenseData.amount, 'amount');
      Validator.isRequired(expenseData.concept, 'concept');
      Validator.isRequired(expenseData.category, 'category');
      Validator.isRequired(expenseData.userId, 'userId');
      Validator.isNumber(expenseData.amount, 'amount');
      Validator.isPositive(expenseData.amount, 'amount');
      
      // Verificar que el turno existe y está abierto
      const shift = this.shiftRepo.findById(expenseData.shiftId);
      
      if (!shift) {
        throw new Error('Turno no encontrado');
      }
      
      if (shift.closing_at) {
        throw new Error('El turno ya está cerrado. No se pueden registrar egresos.');
      }
      
      // Verificar si requiere autorización de supervisor
      const maxExpenseWithoutAuth = this._getMaxExpenseWithoutAuthorization();
      
      if (expenseData.amount > maxExpenseWithoutAuth) {
        // Requiere autorización
        if (!expenseData.authorizedBy) {
          throw new Error('Este egreso requiere autorización de supervisor (monto mayor a ' + maxExpenseWithoutAuth + ')');
        }
        
        // Verificar que el autorizador tiene permisos de supervisor
        const authService = new AuthService();
        const hasPermission = authService.hasPermission(expenseData.authorizedBy, 'authorize_expense');
        
        if (!hasPermission) {
          throw new Error('El usuario autorizador no tiene permisos de supervisor');
        }
      }
      
      // Crear el egreso
      const expense = {
        id: 'exp-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
        shift_id: expenseData.shiftId,
        amount: expenseData.amount,
        concept: expenseData.concept,
        category: expenseData.category,
        receipt_url: expenseData.receiptUrl || '',
        user_id: expenseData.userId,
        authorized_by: expenseData.authorizedBy || '',
        created_at: new Date()
      };
      
      // Guardar en la base de datos
      const createdExpense = this.expenseRepo.create(expense);
      
      // Auditar el egreso
      this.auditRepo.log(
        'RECORD_EXPENSE',
        'EXPENSE',
        expense.id,
        null,
        {
          shift_id: expense.shift_id,
          amount: expense.amount,
          concept: expense.concept,
          category: expense.category,
          authorized_by: expense.authorized_by
        },
        expenseData.userId
      );
      
      Logger.log('recordExpense: egreso registrado exitosamente - ID: ' + expense.id + ', Monto: ' + expense.amount);
      
      return createdExpense;
      
    } catch (error) {
      Logger.log('Error en recordExpense: ' + error.message);
      throw new Error('Error al registrar egreso: ' + error.message);
    }
  }
  
  // ==========================================================================
  // MÉTODOS PRIVADOS - CÁLCULOS
  // ==========================================================================
  
  /**
   * _calculateExpectedAmount - Calcula el monto esperado en caja al cierre
   * 
   * Fórmula: Monto apertura + Ventas contado + Cobros - Egresos
   * 
   * Requisitos: 11.3
   * 
   * @private
   * @param {Object} shift - Turno de caja
   * @returns {number} Monto esperado
   */
  _calculateExpectedAmount(shift) {
    try {
      const openingAmount = Number(shift.opening_amount) || 0;
      const cashSales = this._getCashSalesAmount(shift);
      const collections = this._getCollectionsAmount(shift);
      const expenses = this._getExpensesAmount(shift);
      
      const expectedAmount = openingAmount + cashSales + collections - expenses;
      
      Logger.log('_calculateExpectedAmount:');
      Logger.log('  Apertura: ' + openingAmount);
      Logger.log('  Ventas contado: ' + cashSales);
      Logger.log('  Cobros: ' + collections);
      Logger.log('  Egresos: ' + expenses);
      Logger.log('  Esperado: ' + expectedAmount);
      
      return expectedAmount;
      
    } catch (error) {
      Logger.log('Error en _calculateExpectedAmount: ' + error.message);
      return 0;
    }
  }
  
  /**
   * _getCashSalesAmount - Obtiene el total de ventas al contado del turno
   * 
   * @private
   * @param {Object} shift - Turno de caja
   * @returns {number} Total de ventas al contado
   */
  _getCashSalesAmount(shift) {
    try {
      // Obtener ventas al contado de la tienda en el período del turno
      const sales = this.saleRepo.findByStore(shift.store_id, {
        saleType: 'CONTADO',
        startDate: shift.opening_at,
        endDate: shift.closing_at || new Date()
      });
      
      // Sumar totales (solo ventas no anuladas)
      let total = 0;
      for (let i = 0; i < sales.length; i++) {
        const sale = sales[i];
        
        // Verificar que no esté anulada
        if (sale.voided === true || sale.voided === 'TRUE') {
          continue;
        }
        
        total += Number(sale.total) || 0;
      }
      
      return total;
      
    } catch (error) {
      Logger.log('Error en _getCashSalesAmount: ' + error.message);
      return 0;
    }
  }
  
  /**
   * _getCollectionsAmount - Obtiene el total de cobros de crédito del turno
   * 
   * @private
   * @param {Object} shift - Turno de caja
   * @returns {number} Total de cobros
   */
  _getCollectionsAmount(shift) {
    try {
      // Obtener todos los pagos en el período del turno
      const allPayments = this.paymentRepo.findAll();
      
      // Filtrar pagos del período del turno
      let total = 0;
      for (let i = 0; i < allPayments.length; i++) {
        const payment = allPayments[i];
        
        if (!payment.payment_date) {
          continue;
        }
        
        const paymentDate = new Date(payment.payment_date);
        const openingDate = new Date(shift.opening_at);
        const closingDate = shift.closing_at ? new Date(shift.closing_at) : new Date();
        
        // Verificar que el pago esté en el rango del turno
        if (paymentDate >= openingDate && paymentDate <= closingDate) {
          total += Number(payment.amount) || 0;
        }
      }
      
      return total;
      
    } catch (error) {
      Logger.log('Error en _getCollectionsAmount: ' + error.message);
      return 0;
    }
  }
  
  /**
   * _getExpensesAmount - Obtiene el total de egresos del turno
   * 
   * @private
   * @param {Object} shift - Turno de caja
   * @returns {number} Total de egresos
   */
  _getExpensesAmount(shift) {
    try {
      // Obtener egresos del turno
      const expenses = this.expenseRepo.findByShift(shift.id);
      
      // Sumar montos
      let total = 0;
      for (let i = 0; i < expenses.length; i++) {
        total += Number(expenses[i].amount) || 0;
      }
      
      return total;
      
    } catch (error) {
      Logger.log('Error en _getExpensesAmount: ' + error.message);
      return 0;
    }
  }
  
  /**
   * _getMaxExpenseWithoutAuthorization - Obtiene el umbral de egreso sin autorización
   * 
   * @private
   * @returns {number} Monto máximo de egreso sin autorización
   */
  _getMaxExpenseWithoutAuthorization() {
    try {
      // Intentar obtener del caché
      const cached = CacheManager.get('max_expense_without_auth');
      if (cached !== null) {
        return Number(cached);
      }
      
      // Obtener de CFG_Params
      const paramRepo = new BaseRepository(SHEETS.CFG_PARAMS);
      const params = paramRepo.findAll();
      
      for (let i = 0; i < params.length; i++) {
        if (params[i].key === 'MAX_EXPENSE_WITHOUT_AUTH') {
          const value = Number(params[i].value) || 100;
          
          // Guardar en caché por 15 minutos
          CacheManager.put('max_expense_without_auth', value, LIMITS.CACHE_TTL_PARAMS);
          
          return value;
        }
      }
      
      // Valor por defecto si no está configurado
      return 100;
      
    } catch (error) {
      Logger.log('Error en _getMaxExpenseWithoutAuthorization: ' + error.message);
      return 100; // Valor por defecto
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testCashService - Prueba el CashService
 */
function testCashService() {
  Logger.log('=== Iniciando pruebas de CashService ===');
  
  try {
    const cashService = new CashService();
    
    // Obtener un usuario de prueba
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    if (users.length === 0) {
      Logger.log('✗ No hay usuarios para probar');
      return;
    }
    
    const testUser = users[0];
    
    // Probar apertura de turno
    Logger.log('\n1. Probando openShift()...');
    
    const shiftData = {
      storeId: 'STORE_MUJERES',
      userId: testUser.email,
      openingAmount: 500
    };
    
    const shift = cashService.openShift(shiftData);
    Logger.log('✓ Turno abierto: ' + JSON.stringify(shift));
    
    // Probar getShiftBalance
    Logger.log('\n2. Probando getShiftBalance()...');
    const balance = cashService.getShiftBalance(shift.id);
    Logger.log('✓ Balance del turno: ' + JSON.stringify(balance));
    
    // Probar registro de egreso
    Logger.log('\n3. Probando recordExpense()...');
    
    const expenseData = {
      shiftId: shift.id,
      amount: 50,
      concept: 'Compra de insumos',
      category: 'OPERATIVO',
      userId: testUser.email
    };
    
    const expense = cashService.recordExpense(expenseData);
    Logger.log('✓ Egreso registrado: ' + JSON.stringify(expense));
    
    // Probar cierre de turno
    Logger.log('\n4. Probando closeShift()...');
    
    const closingData = {
      closingAmount: 500,
      supervisorId: testUser.email,
      userId: testUser.email
    };
    
    const closedShift = cashService.closeShift(shift.id, closingData);
    Logger.log('✓ Turno cerrado: ' + JSON.stringify(closedShift));
    Logger.log('  Monto esperado: ' + closedShift.expected_amount);
    Logger.log('  Monto real: ' + closedShift.closing_amount);
    Logger.log('  Diferencia: ' + closedShift.difference);
    
    Logger.log('\n=== Pruebas de CashService completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testCashServiceValidations - Prueba las validaciones de CashService
 */
function testCashServiceValidations() {
  Logger.log('=== Iniciando pruebas de validaciones de CashService ===');
  
  try {
    const cashService = new CashService();
    const userRepo = new UserRepository();
    const users = userRepo.findAll();
    
    if (users.length === 0) {
      Logger.log('✗ No hay usuarios para probar');
      return;
    }
    
    const testUser = users[0];
    
    // Abrir un turno
    Logger.log('\n1. Abriendo turno de prueba...');
    const shift = cashService.openShift({
      storeId: 'STORE_MUJERES',
      userId: testUser.email,
      openingAmount: 500
    });
    Logger.log('✓ Turno abierto: ' + shift.id);
    
    // Probar apertura de segundo turno (debe fallar)
    Logger.log('\n2. Intentando abrir segundo turno (debe fallar)...');
    try {
      cashService.openShift({
        storeId: 'STORE_MUJERES',
        userId: testUser.email,
        openingAmount: 500
      });
      Logger.log('✗ No se validó turno único por tienda');
    } catch (error) {
      Logger.log('✓ Validación correcta: ' + error.message);
    }
    
    // Probar egreso en turno cerrado (primero cerrar el turno)
    Logger.log('\n3. Cerrando turno...');
    cashService.closeShift(shift.id, {
      closingAmount: 500,
      supervisorId: testUser.email,
      userId: testUser.email
    });
    Logger.log('✓ Turno cerrado');
    
    Logger.log('\n4. Intentando registrar egreso en turno cerrado (debe fallar)...');
    try {
      cashService.recordExpense({
        shiftId: shift.id,
        amount: 50,
        concept: 'Test',
        category: 'TEST',
        userId: testUser.email
      });
      Logger.log('✗ No se validó turno cerrado');
    } catch (error) {
      Logger.log('✓ Validación correcta: ' + error.message);
    }
    
    Logger.log('\n=== Pruebas de validaciones completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

// ============================================================================
// REPORTSERVICE - Reportes y Análisis
// ============================================================================

/**
 * ReportService - Servicio de reportes y análisis
 * 
 * Genera reportes de ventas, inventario y cuentas por cobrar con
 * agregaciones, filtros y métricas de negocio.
 * 
 * Características:
 * - Reportes de ventas con filtros múltiples
 * - Reportes de inventario con valorización
 * - Reportes de cuentas por cobrar con antigüedad
 * - Top clientes por monto
 * - Cálculo de métricas de negocio
 * 
 * Requisitos: 15.1, 16.1, 17.1
 * 
 * @class
 */
class ReportService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.saleRepo = new SaleRepository();
    this.saleItemRepo = new SaleItemRepository();
    this.productRepo = new ProductRepository();
    this.stockRepo = new StockRepository();
    this.clientRepo = new ClientRepository();
    this.creditPlanRepo = new CreditPlanRepository();
    this.installmentRepo = new InstallmentRepository();
    this.paymentRepo = new PaymentRepository();
  }
  
  // ==========================================================================
  // REPORTES DE VENTAS
  // ==========================================================================
  
  /**
   * getSalesReport - Genera reporte de ventas con filtros
   * 
   * Retorna métricas agregadas de ventas:
   * - Cantidad de ventas
   * - Monto total
   * - Ticket promedio
   * - Productos más vendidos
   * - Comparativa con período anterior
   * 
   * Requisitos: 15.1, 15.2, 15.4
   * 
   * @param {Object} filters - Filtros del reporte
   * @param {Date} filters.startDate - Fecha de inicio
   * @param {Date} filters.endDate - Fecha de fin
   * @param {string} filters.storeId - ID de tienda (opcional)
   * @param {string} filters.userId - ID de vendedor (opcional)
   * @param {string} filters.saleType - Tipo de venta: CONTADO o CREDITO (opcional)
   * @returns {Object} Reporte con métricas y datos
   * @throws {Error} Si hay error al generar el reporte
   */
  getSalesReport(filters) {
    try {
      // Validar parámetros requeridos
      Validator.isRequired(filters.startDate, 'startDate');
      Validator.isRequired(filters.endDate, 'endDate');
      
      // Obtener ventas del período
      let sales = this.saleRepo.findByDateRange(filters.startDate, filters.endDate);
      
      // Aplicar filtros adicionales
      if (filters.storeId) {
        sales = sales.filter(function(sale) {
          return sale.store_id === filters.storeId;
        });
      }
      
      if (filters.userId) {
        sales = sales.filter(function(sale) {
          return sale.user_id === filters.userId;
        });
      }
      
      if (filters.saleType) {
        sales = sales.filter(function(sale) {
          return sale.sale_type === filters.saleType;
        });
      }
      
      // Filtrar ventas no anuladas
      sales = sales.filter(function(sale) {
        return !sale.voided || sale.voided === false || sale.voided === 'FALSE';
      });
      
      // Calcular métricas
      const metrics = this._calculateSalesMetrics(sales);
      
      // Obtener productos más vendidos
      const topProducts = this._getTopProducts(sales, 10);
      
      // Calcular comparativa con período anterior (opcional)
      let comparison = null;
      if (filters.compareWithPrevious) {
        comparison = this._compareSalesWithPrevious(filters, metrics);
      }
      
      // Preparar reporte
      const report = {
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate
        },
        filters: {
          storeId: filters.storeId || 'Todas',
          userId: filters.userId || 'Todos',
          saleType: filters.saleType || 'Todos'
        },
        metrics: metrics,
        topProducts: topProducts,
        comparison: comparison,
        generatedAt: new Date()
      };
      
      Logger.log('getSalesReport: reporte generado con ' + sales.length + ' ventas');
      
      return report;
      
    } catch (error) {
      Logger.log('Error en getSalesReport: ' + error.message);
      throw new Error('Error al generar reporte de ventas: ' + error.message);
    }
  }
  
  /**
   * _calculateSalesMetrics - Calcula métricas de ventas
   * 
   * @private
   * @param {Array<Object>} sales - Array de ventas
   * @returns {Object} Métricas calculadas
   */
  _calculateSalesMetrics(sales) {
    let totalAmount = 0;
    let totalQuantity = sales.length;
    
    for (let i = 0; i < sales.length; i++) {
      totalAmount += Number(sales[i].total) || 0;
    }
    
    const averageTicket = totalQuantity > 0 ? totalAmount / totalQuantity : 0;
    
    return {
      totalSales: totalQuantity,
      totalAmount: totalAmount,
      averageTicket: averageTicket
    };
  }
  
  /**
   * _getTopProducts - Obtiene los productos más vendidos
   * 
   * @private
   * @param {Array<Object>} sales - Array de ventas
   * @param {number} limit - Número de productos a retornar
   * @returns {Array<Object>} Top productos
   */
  _getTopProducts(sales, limit) {
    try {
      // Obtener todos los items de las ventas
      const productSales = {};
      
      for (let i = 0; i < sales.length; i++) {
        const saleId = sales[i].id;
        const items = this.saleItemRepo.findBySale(saleId);
        
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          const productId = item.product_id;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              productId: productId,
              quantity: 0,
              amount: 0
            };
          }
          
          productSales[productId].quantity += Number(item.quantity) || 0;
          productSales[productId].amount += Number(item.subtotal) || 0;
        }
      }
      
      // Convertir a array y ordenar por cantidad
      const productsArray = [];
      for (const productId in productSales) {
        const product = this.productRepo.findById(productId);
        productsArray.push({
          productId: productId,
          productName: product ? product.name : 'Desconocido',
          quantity: productSales[productId].quantity,
          amount: productSales[productId].amount
        });
      }
      
      productsArray.sort(function(a, b) {
        return b.quantity - a.quantity;
      });
      
      // Retornar top N
      return productsArray.slice(0, limit);
      
    } catch (error) {
      Logger.log('Error en _getTopProducts: ' + error.message);
      return [];
    }
  }
  
  /**
   * _compareSalesWithPrevious - Compara ventas con período anterior
   * 
   * @private
   * @param {Object} filters - Filtros originales
   * @param {Object} currentMetrics - Métricas del período actual
   * @returns {Object} Comparativa
   */
  _compareSalesWithPrevious(filters, currentMetrics) {
    try {
      // Calcular período anterior (mismo rango de días)
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      
      const prevStartDate = new Date(prevEndDate);
      prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
      
      // Obtener ventas del período anterior
      const prevFilters = Object.assign({}, filters);
      prevFilters.startDate = prevStartDate;
      prevFilters.endDate = prevEndDate;
      
      let prevSales = this.saleRepo.findByDateRange(prevStartDate, prevEndDate);
      
      // Aplicar mismos filtros
      if (filters.storeId) {
        prevSales = prevSales.filter(function(sale) {
          return sale.store_id === filters.storeId;
        });
      }
      
      prevSales = prevSales.filter(function(sale) {
        return !sale.voided || sale.voided === false;
      });
      
      // Calcular métricas del período anterior
      const prevMetrics = this._calculateSalesMetrics(prevSales);
      
      // Calcular variaciones porcentuales
      const amountVariation = prevMetrics.totalAmount > 0 
        ? ((currentMetrics.totalAmount - prevMetrics.totalAmount) / prevMetrics.totalAmount) * 100
        : 0;
      
      const quantityVariation = prevMetrics.totalSales > 0
        ? ((currentMetrics.totalSales - prevMetrics.totalSales) / prevMetrics.totalSales) * 100
        : 0;
      
      return {
        previousPeriod: {
          startDate: prevStartDate,
          endDate: prevEndDate
        },
        previousMetrics: prevMetrics,
        variations: {
          amountVariation: amountVariation,
          quantityVariation: quantityVariation
        }
      };
      
    } catch (error) {
      Logger.log('Error en _compareSalesWithPrevious: ' + error.message);
      return null;
    }
  }
  
  // ==========================================================================
  // REPORTES DE INVENTARIO
  // ==========================================================================
  
  /**
   * getInventoryReport - Genera reporte de inventario
   * 
   * Retorna el estado actual del inventario con:
   * - Stock por producto y almacén
   * - Valor total del inventario
   * - Productos con stock bajo
   * - Productos sin movimiento
   * 
   * Requisitos: 16.1, 16.2, 16.3, 16.4, 16.5
   * 
   * @param {string} warehouseId - ID del almacén (opcional, si no se proporciona incluye todos)
   * @returns {Object} Reporte de inventario
   * @throws {Error} Si hay error al generar el reporte
   */
  getInventoryReport(warehouseId) {
    try {
      // Obtener todos los registros de stock
      let stockRecords = this.stockRepo.findAll();
      
      // Filtrar por almacén si se especificó
      if (warehouseId) {
        stockRecords = stockRecords.filter(function(record) {
          return record.warehouse_id === warehouseId;
        });
      }
      
      // Preparar datos del reporte
      const inventoryData = [];
      let totalValue = 0;
      const lowStockProducts = [];
      
      for (let i = 0; i < stockRecords.length; i++) {
        const stockRecord = stockRecords[i];
        const product = this.productRepo.findById(stockRecord.product_id);
        
        if (!product) {
          continue;
        }
        
        const quantity = Number(stockRecord.quantity) || 0;
        const price = Number(product.price) || 0;
        const minStock = Number(product.min_stock) || 0;
        const value = quantity * price;
        
        totalValue += value;
        
        const item = {
          warehouseId: stockRecord.warehouse_id,
          productId: product.id,
          productName: product.name,
          category: product.category,
          quantity: quantity,
          price: price,
          value: value,
          minStock: minStock,
          isLowStock: quantity < minStock
        };
        
        inventoryData.push(item);
        
        if (item.isLowStock) {
          lowStockProducts.push(item);
        }
      }
      
      // Ordenar por valor (mayor a menor)
      inventoryData.sort(function(a, b) {
        return b.value - a.value;
      });
      
      // Preparar reporte
      const report = {
        warehouseId: warehouseId || 'Todos',
        totalProducts: inventoryData.length,
        totalValue: totalValue,
        lowStockCount: lowStockProducts.length,
        inventory: inventoryData,
        lowStockProducts: lowStockProducts,
        generatedAt: new Date()
      };
      
      Logger.log('getInventoryReport: reporte generado con ' + inventoryData.length + ' productos');
      
      return report;
      
    } catch (error) {
      Logger.log('Error en getInventoryReport: ' + error.message);
      throw new Error('Error al generar reporte de inventario: ' + error.message);
    }
  }
  
  // ==========================================================================
  // REPORTES DE CUENTAS POR COBRAR
  // ==========================================================================
  
  /**
   * getAccountsReceivableReport - Genera reporte de cuentas por cobrar
   * 
   * Retorna el estado de la cartera de créditos con:
   * - Total por cobrar
   * - Monto vencido
   * - Monto por vencer
   * - Antigüedad de saldos
   * - Índice de morosidad
   * 
   * Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5
   * 
   * @param {Object} filters - Filtros del reporte
   * @param {string} filters.storeId - ID de tienda (opcional)
   * @param {Date} filters.asOfDate - Fecha de corte (opcional, por defecto hoy)
   * @returns {Object} Reporte de cuentas por cobrar
   * @throws {Error} Si hay error al generar el reporte
   */
  getAccountsReceivableReport(filters) {
    try {
      filters = filters || {};
      const asOfDate = filters.asOfDate ? new Date(filters.asOfDate) : new Date();
      asOfDate.setHours(0, 0, 0, 0);
      
      // Obtener todos los planes de crédito activos
      const allPlans = this.creditPlanRepo.findAll();
      const activePlans = allPlans.filter(function(plan) {
        return plan.status === 'ACTIVE';
      });
      
      // Calcular métricas por cliente
      const clientsData = {};
      let totalReceivable = 0;
      let totalOverdue = 0;
      let totalDueSoon = 0;
      
      for (let i = 0; i < activePlans.length; i++) {
        const plan = activePlans[i];
        const clientId = plan.client_id;
        
        // Obtener cuotas del plan
        const installments = this.installmentRepo.findByPlan(plan.id);
        
        for (let j = 0; j < installments.length; j++) {
          const installment = installments[j];
          
          // Solo considerar cuotas pendientes o parciales
          if (installment.status === 'PAID') {
            continue;
          }
          
          const amount = Number(installment.amount) || 0;
          const paidAmount = Number(installment.paid_amount) || 0;
          const balance = amount - paidAmount;
          
          if (balance <= 0) {
            continue;
          }
          
          // Inicializar datos del cliente si no existen
          if (!clientsData[clientId]) {
            const client = this.clientRepo.findById(clientId);
            clientsData[clientId] = {
              clientId: clientId,
              clientName: client ? client.name : 'Desconocido',
              totalBalance: 0,
              overdueBalance: 0,
              currentBalance: 0,
              aging: {
                current: 0,      // 0-30 días
                days30: 0,       // 31-60 días
                days60: 0,       // 61-90 días
                days90Plus: 0    // más de 90 días
              }
            };
          }
          
          clientsData[clientId].totalBalance += balance;
          totalReceivable += balance;
          
          // Calcular si está vencida
          if (installment.due_date) {
            const dueDate = new Date(installment.due_date);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < asOfDate) {
              // Vencida
              clientsData[clientId].overdueBalance += balance;
              totalOverdue += balance;
              
              // Calcular antigüedad
              const daysPastDue = Math.floor((asOfDate - dueDate) / (1000 * 60 * 60 * 24));
              
              if (daysPastDue <= 30) {
                clientsData[clientId].aging.current += balance;
              } else if (daysPastDue <= 60) {
                clientsData[clientId].aging.days30 += balance;
              } else if (daysPastDue <= 90) {
                clientsData[clientId].aging.days60 += balance;
              } else {
                clientsData[clientId].aging.days90Plus += balance;
              }
            } else {
              // Por vencer
              clientsData[clientId].currentBalance += balance;
              totalDueSoon += balance;
            }
          }
        }
      }
      
      // Convertir a array y ordenar por saldo total (mayor a menor)
      const clientsArray = [];
      for (const clientId in clientsData) {
        clientsArray.push(clientsData[clientId]);
      }
      
      clientsArray.sort(function(a, b) {
        return b.totalBalance - a.totalBalance;
      });
      
      // Calcular índice de morosidad
      const delinquencyRate = totalReceivable > 0 
        ? (totalOverdue / totalReceivable) * 100
        : 0;
      
      // Preparar reporte
      const report = {
        asOfDate: asOfDate,
        summary: {
          totalReceivable: totalReceivable,
          totalOverdue: totalOverdue,
          totalDueSoon: totalDueSoon,
          delinquencyRate: delinquencyRate
        },
        clients: clientsArray,
        topDebtors: clientsArray.slice(0, 10),
        generatedAt: new Date()
      };
      
      Logger.log('getAccountsReceivableReport: reporte generado con ' + clientsArray.length + ' clientes');
      
      return report;
      
    } catch (error) {
      Logger.log('Error en getAccountsReceivableReport: ' + error.message);
      throw new Error('Error al generar reporte de cuentas por cobrar: ' + error.message);
    }
  }
  
  /**
   * getTopClientsReport - Obtiene los top clientes por monto
   * 
   * Requisitos: 17.3
   * 
   * @param {number} limit - Número de clientes a retornar
   * @returns {Array<Object>} Top clientes
   * @throws {Error} Si hay error al generar el reporte
   */
  getTopClientsReport(limit) {
    try {
      limit = limit || 10;
      
      // Obtener reporte completo de cuentas por cobrar
      const arReport = this.getAccountsReceivableReport({});
      
      // Retornar top N clientes
      return arReport.topDebtors.slice(0, limit);
      
    } catch (error) {
      Logger.log('Error en getTopClientsReport: ' + error.message);
      throw new Error('Error al generar reporte de top clientes: ' + error.message);
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testReportService - Prueba el ReportService
 */
function testReportService() {
  Logger.log('=== Iniciando pruebas de ReportService ===');
  
  try {
    const reportService = new ReportService();
    
    // Probar reporte de ventas
    Logger.log('\n1. Probando getSalesReport()...');
    
    const salesFilters = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    };
    
    const salesReport = reportService.getSalesReport(salesFilters);
    Logger.log('✓ Reporte de ventas generado');
    Logger.log('  Total ventas: ' + salesReport.metrics.totalSales);
    Logger.log('  Monto total: S/ ' + salesReport.metrics.totalAmount.toFixed(2));
    Logger.log('  Ticket promedio: S/ ' + salesReport.metrics.averageTicket.toFixed(2));
    Logger.log('  Top productos: ' + salesReport.topProducts.length);
    
    // Probar reporte de inventario
    Logger.log('\n2. Probando getInventoryReport()...');
    
    const inventoryReport = reportService.getInventoryReport();
    Logger.log('✓ Reporte de inventario generado');
    Logger.log('  Total productos: ' + inventoryReport.totalProducts);
    Logger.log('  Valor total: S/ ' + inventoryReport.totalValue.toFixed(2));
    Logger.log('  Productos con stock bajo: ' + inventoryReport.lowStockCount);
    
    // Probar reporte de cuentas por cobrar
    Logger.log('\n3. Probando getAccountsReceivableReport()...');
    
    const arReport = reportService.getAccountsReceivableReport({});
    Logger.log('✓ Reporte de cuentas por cobrar generado');
    Logger.log('  Total por cobrar: S/ ' + arReport.summary.totalReceivable.toFixed(2));
    Logger.log('  Total vencido: S/ ' + arReport.summary.totalOverdue.toFixed(2));
    Logger.log('  Índice de morosidad: ' + arReport.summary.delinquencyRate.toFixed(2) + '%');
    Logger.log('  Clientes con deuda: ' + arReport.clients.length);
    
    // Probar top clientes
    Logger.log('\n4. Probando getTopClientsReport()...');
    
    const topClients = reportService.getTopClientsReport(5);
    Logger.log('✓ Top clientes generado: ' + topClients.length);
    
    if (topClients.length > 0) {
      Logger.log('  Top 1: ' + topClients[0].clientName + 
                 ' - S/ ' + topClients[0].totalBalance.toFixed(2));
    }
    
    Logger.log('\n=== Pruebas de ReportService completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

// ============================================================================
// INVOICESERVICE - Facturación Electrónica
// ============================================================================

/**
 * InvoiceService - Servicio de facturación electrónica
 * 
 * Gestiona la generación y envío de facturas electrónicas.
 * Incluye integración con API de facturación (mock inicial) y
 * envío por email con PDF adjunto.
 * 
 * Características:
 * - Generación de facturas con datos fiscales completos
 * - Creación de PDF de factura
 * - Almacenamiento en Google Drive
 * - Envío por email con GmailApp
 * - Registro de envíos
 * 
 * Requisitos: 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 14.2, 14.3, 14.4, 14.5
 * 
 * @class
 */
class InvoiceService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.saleRepo = new SaleRepository();
    this.saleItemRepo = new SaleItemRepository();
    this.clientRepo = new ClientRepository();
    this.productRepo = new ProductRepository();
    this.auditRepo = new AuditRepository();
    
    // Crear repositorio para facturas (usando BaseRepository genérico)
    // En producción, debería existir una hoja INV_Invoices
    try {
      this.invoiceRepo = new BaseRepository('INV_Invoices');
    } catch (error) {
      Logger.log('Advertencia: Hoja INV_Invoices no existe. Creando repositorio temporal.');
      this.invoiceRepo = null;
    }
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================
  
  /**
   * generateInvoice - Genera una factura electrónica para una venta
   * 
   * Crea una factura con todos los datos fiscales requeridos,
   * genera el PDF y lo almacena en Google Drive.
   * 
   * Requisitos: 13.1, 13.3
   * 
   * @param {string} saleId - ID de la venta a facturar
   * @returns {Object} Factura generada con URL del PDF
   * @throws {Error} Si la venta no existe o hay error
   */
  generateInvoice(saleId) {
    try {
      // Validar parámetro
      Validator.isRequired(saleId, 'saleId');
      
      // Obtener la venta
      const sale = this.saleRepo.findById(saleId);
      
      if (!sale) {
        throw new Error('Venta no encontrada');
      }
      
      // Verificar que la venta no esté anulada
      if (sale.voided === true || sale.voided === 'TRUE') {
        throw new Error('No se puede facturar una venta anulada');
      }
      
      // Obtener items de la venta
      const items = this.saleItemRepo.findBySale(saleId);
      
      if (items.length === 0) {
        throw new Error('La venta no tiene items');
      }
      
      // Obtener datos del cliente (si existe)
      let client = null;
      if (sale.client_id) {
        client = this.clientRepo.findById(sale.client_id);
      }
      
      // Generar número de factura correlativo
      const invoiceNumber = this._generateInvoiceNumber();
      
      // Preparar datos de la factura
      const invoiceData = {
        id: 'inv-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
        invoice_number: invoiceNumber,
        sale_id: saleId,
        client_id: sale.client_id || '',
        client_name: client ? client.name : 'Cliente General',
        client_dni: client ? client.dni : '',
        client_address: client ? client.address : '',
        issue_date: new Date(),
        subtotal: Number(sale.subtotal) || 0,
        igv: this._calculateIGV(Number(sale.subtotal) || 0),
        total: Number(sale.total) || 0,
        items: items,
        status: 'GENERATED',
        pdf_url: '',
        sent_at: null,
        sent_to: '',
        created_at: new Date()
      };
      
      // Calcular IGV (18% en Perú)
      invoiceData.igv = this._calculateIGV(invoiceData.subtotal);
      
      // Generar PDF de la factura
      const pdfUrl = this._generateInvoicePDF(invoiceData);
      invoiceData.pdf_url = pdfUrl;
      
      // Guardar factura en la base de datos (si existe el repositorio)
      if (this.invoiceRepo) {
        this.invoiceRepo.create(invoiceData);
      }
      
      // Auditar generación de factura
      this.auditRepo.log(
        'GENERATE_INVOICE',
        'INVOICE',
        invoiceData.id,
        null,
        {
          invoice_number: invoiceData.invoice_number,
          sale_id: saleId,
          total: invoiceData.total
        },
        sale.user_id
      );
      
      Logger.log('generateInvoice: factura generada - ' + invoiceNumber);
      
      return invoiceData;
      
    } catch (error) {
      Logger.log('Error en generateInvoice: ' + error.message);
      throw new Error('Error al generar factura: ' + error.message);
    }
  }
  
  /**
   * sendInvoiceByEmail - Envía una factura por email
   * 
   * Obtiene el PDF de la factura desde Drive, construye un email HTML
   * profesional y lo envía con el PDF adjunto usando GmailApp.
   * 
   * Requisitos: 13.4, 13.5, 14.1, 14.2, 14.3, 14.4, 14.5
   * 
   * @param {string} invoiceId - ID de la factura
   * @param {string} recipientEmail - Email del destinatario
   * @returns {Object} Resultado del envío
   * @throws {Error} Si la factura no existe o hay error al enviar
   */
  sendInvoiceByEmail(invoiceId, recipientEmail) {
    try {
      // Validar parámetros
      Validator.isRequired(invoiceId, 'invoiceId');
      Validator.isRequired(recipientEmail, 'recipientEmail');
      Validator.isEmail(recipientEmail, 'recipientEmail');
      
      // Obtener la factura
      let invoice = null;
      if (this.invoiceRepo) {
        invoice = this.invoiceRepo.findById(invoiceId);
      }
      
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }
      
      // Verificar que tenga PDF
      if (!invoice.pdf_url) {
        throw new Error('La factura no tiene PDF generado');
      }
      
      // Obtener el archivo PDF desde Drive
      let pdfBlob = null;
      try {
        const fileId = this._extractFileIdFromUrl(invoice.pdf_url);
        const file = DriveApp.getFileById(fileId);
        pdfBlob = file.getBlob();
      } catch (error) {
        Logger.log('Error al obtener PDF desde Drive: ' + error.message);
        throw new Error('No se pudo obtener el PDF de la factura');
      }
      
      // Construir email HTML
      const emailSubject = 'Factura Electrónica ' + invoice.invoice_number + ' - Adiction Boutique';
      const emailBody = this._buildInvoiceEmailHTML(invoice);
      
      // Enviar email con PDF adjunto
      try {
        GmailApp.sendEmail(
          recipientEmail,
          emailSubject,
          'Por favor, habilite la visualización de HTML para ver este mensaje.',
          {
            htmlBody: emailBody,
            attachments: [pdfBlob],
            name: 'Adiction Boutique'
          }
        );
        
        // Actualizar factura con datos de envío
        invoice.sent_at = new Date();
        invoice.sent_to = recipientEmail;
        invoice.status = 'SENT';
        
        if (this.invoiceRepo) {
          this.invoiceRepo.update(invoiceId, invoice);
        }
        
        // Auditar envío
        this.auditRepo.log(
          'SEND_INVOICE',
          'INVOICE',
          invoiceId,
          null,
          {
            sent_to: recipientEmail,
            sent_at: invoice.sent_at
          },
          Session.getActiveUser().getEmail()
        );
        
        Logger.log('sendInvoiceByEmail: factura enviada a ' + recipientEmail);
        
        return {
          success: true,
          message: 'Factura enviada exitosamente',
          sentTo: recipientEmail,
          sentAt: invoice.sent_at
        };
        
      } catch (error) {
        Logger.log('Error al enviar email: ' + error.message);
        
        // Registrar error pero no lanzar excepción
        if (this.invoiceRepo) {
          invoice.status = 'SEND_FAILED';
          this.invoiceRepo.update(invoiceId, invoice);
        }
        
        throw new Error('Error al enviar email: ' + error.message);
      }
      
    } catch (error) {
      Logger.log('Error en sendInvoiceByEmail: ' + error.message);
      throw new Error('Error al enviar factura por email: ' + error.message);
    }
  }
  
  /**
   * getInvoicePDF - Obtiene el PDF de una factura desde Drive
   * 
   * @param {string} invoiceId - ID de la factura
   * @returns {Blob} Blob del PDF
   * @throws {Error} Si la factura no existe o no tiene PDF
   */
  getInvoicePDF(invoiceId) {
    try {
      // Validar parámetro
      Validator.isRequired(invoiceId, 'invoiceId');
      
      // Obtener la factura
      let invoice = null;
      if (this.invoiceRepo) {
        invoice = this.invoiceRepo.findById(invoiceId);
      }
      
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }
      
      if (!invoice.pdf_url) {
        throw new Error('La factura no tiene PDF generado');
      }
      
      // Obtener el archivo desde Drive
      const fileId = this._extractFileIdFromUrl(invoice.pdf_url);
      const file = DriveApp.getFileById(fileId);
      
      return file.getBlob();
      
    } catch (error) {
      Logger.log('Error en getInvoicePDF: ' + error.message);
      throw new Error('Error al obtener PDF de factura: ' + error.message);
    }
  }
  
  // ==========================================================================
  // MÉTODOS PRIVADOS
  // ==========================================================================
  
  /**
   * _generateInvoiceNumber - Genera un número de factura correlativo
   * 
   * @private
   * @returns {string} Número de factura (ej: F001-00000123)
   */
  _generateInvoiceNumber() {
    try {
      // En producción, esto debería obtener el último número de la base de datos
      // Por ahora, generar basado en timestamp
      const timestamp = new Date().getTime();
      const sequential = String(timestamp).slice(-6);
      
      return 'F001-' + sequential.padStart(8, '0');
      
    } catch (error) {
      Logger.log('Error en _generateInvoiceNumber: ' + error.message);
      return 'F001-00000001';
    }
  }
  
  /**
   * _calculateIGV - Calcula el IGV (18% en Perú)
   * 
   * @private
   * @param {number} subtotal - Subtotal sin IGV
   * @returns {number} Monto del IGV
   */
  _calculateIGV(subtotal) {
    return subtotal * 0.18;
  }
  
  /**
   * _generateInvoicePDF - Genera el PDF de la factura
   * 
   * Crea un documento HTML con los datos de la factura,
   * lo convierte a PDF y lo almacena en Google Drive.
   * 
   * @private
   * @param {Object} invoiceData - Datos de la factura
   * @returns {string} URL del PDF en Drive
   */
  _generateInvoicePDF(invoiceData) {
    try {
      // Construir HTML de la factura
      const html = this._buildInvoiceHTML(invoiceData);
      
      // Convertir HTML a PDF (usando Google Docs como intermediario)
      const blob = Utilities.newBlob(html, 'text/html', 'factura.html');
      
      // Crear carpeta de facturas si no existe
      const folderName = 'Facturas_Adiction_Boutique';
      let folder = null;
      
      const folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
      
      // Guardar como PDF en Drive
      const fileName = 'Factura_' + invoiceData.invoice_number + '.pdf';
      const file = folder.createFile(blob.setName(fileName));
      
      // Retornar URL del archivo
      return file.getUrl();
      
    } catch (error) {
      Logger.log('Error en _generateInvoicePDF: ' + error.message);
      throw new Error('Error al generar PDF: ' + error.message);
    }
  }
  
  /**
   * _buildInvoiceHTML - Construye el HTML de la factura
   * 
   * @private
   * @param {Object} invoiceData - Datos de la factura
   * @returns {string} HTML de la factura
   */
  _buildInvoiceHTML(invoiceData) {
    let html = '<html><head><style>';
    html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
    html += 'h1 { color: #333; }';
    html += 'table { width: 100%; border-collapse: collapse; margin-top: 20px; }';
    html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
    html += 'th { background-color: #f2f2f2; }';
    html += '.total { font-weight: bold; font-size: 1.2em; }';
    html += '</style></head><body>';
    
    html += '<h1>FACTURA ELECTRÓNICA</h1>';
    html += '<p><strong>Adiction Boutique</strong></p>';
    html += '<p>RUC: 20123456789</p>';
    html += '<p>Dirección: Av. Principal 123, Lima, Perú</p>';
    html += '<hr>';
    
    html += '<p><strong>Factura N°:</strong> ' + invoiceData.invoice_number + '</p>';
    html += '<p><strong>Fecha:</strong> ' + new Date(invoiceData.issue_date).toLocaleDateString('es-PE') + '</p>';
    html += '<p><strong>Cliente:</strong> ' + invoiceData.client_name + '</p>';
    
    if (invoiceData.client_dni) {
      html += '<p><strong>DNI/RUC:</strong> ' + invoiceData.client_dni + '</p>';
    }
    
    if (invoiceData.client_address) {
      html += '<p><strong>Dirección:</strong> ' + invoiceData.client_address + '</p>';
    }
    
    html += '<table>';
    html += '<thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>';
    html += '<tbody>';
    
    for (let i = 0; i < invoiceData.items.length; i++) {
      const item = invoiceData.items[i];
      const product = this.productRepo.findById(item.product_id);
      const productName = product ? product.name : 'Producto';
      
      html += '<tr>';
      html += '<td>' + productName + '</td>';
      html += '<td>' + item.quantity + '</td>';
      html += '<td>S/ ' + Number(item.unit_price).toFixed(2) + '</td>';
      html += '<td>S/ ' + Number(item.subtotal).toFixed(2) + '</td>';
      html += '</tr>';
    }
    
    html += '</tbody></table>';
    
    html += '<p style="text-align: right; margin-top: 20px;">';
    html += '<strong>Subtotal:</strong> S/ ' + invoiceData.subtotal.toFixed(2) + '<br>';
    html += '<strong>IGV (18%):</strong> S/ ' + invoiceData.igv.toFixed(2) + '<br>';
    html += '<span class="total">TOTAL: S/ ' + invoiceData.total.toFixed(2) + '</span>';
    html += '</p>';
    
    html += '<hr>';
    html += '<p style="text-align: center; font-size: 0.9em; color: #666;">';
    html += 'Gracias por su compra - Adiction Boutique';
    html += '</p>';
    
    html += '</body></html>';
    
    return html;
  }
  
  /**
   * _buildInvoiceEmailHTML - Construye el HTML del email de factura
   * 
   * @private
   * @param {Object} invoice - Datos de la factura
   * @returns {string} HTML del email
   */
  _buildInvoiceEmailHTML(invoice) {
    let html = '<html><head><style>';
    html += 'body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }';
    html += '.container { max-width: 600px; margin: 0 auto; padding: 20px; }';
    html += '.header { background-color: #0d6efd; color: white; padding: 20px; text-align: center; }';
    html += '.content { padding: 20px; background-color: #f9f9f9; }';
    html += '.footer { text-align: center; padding: 20px; font-size: 0.9em; color: #666; }';
    html += '</style></head><body>';
    
    html += '<div class="container">';
    html += '<div class="header">';
    html += '<h1>Adiction Boutique</h1>';
    html += '<p>Factura Electrónica</p>';
    html += '</div>';
    
    html += '<div class="content">';
    html += '<p>Estimado/a <strong>' + invoice.client_name + '</strong>,</p>';
    html += '<p>Adjuntamos su factura electrónica correspondiente a su compra.</p>';
    html += '<p><strong>Número de Factura:</strong> ' + invoice.invoice_number + '</p>';
    html += '<p><strong>Fecha:</strong> ' + new Date(invoice.issue_date).toLocaleDateString('es-PE') + '</p>';
    html += '<p><strong>Total:</strong> S/ ' + invoice.total.toFixed(2) + '</p>';
    html += '<p>El documento adjunto es su comprobante de pago válido para fines tributarios.</p>';
    html += '<p>Gracias por su preferencia.</p>';
    html += '</div>';
    
    html += '<div class="footer">';
    html += '<p>Adiction Boutique<br>';
    html += 'Av. Principal 123, Lima, Perú<br>';
    html += 'RUC: 20123456789</p>';
    html += '</div>';
    html += '</div>';
    
    html += '</body></html>';
    
    return html;
  }
  
  /**
   * _extractFileIdFromUrl - Extrae el ID de archivo de una URL de Drive
   * 
   * @private
   * @param {string} url - URL del archivo en Drive
   * @returns {string} ID del archivo
   */
  _extractFileIdFromUrl(url) {
    try {
      // Extraer ID de URLs como: https://drive.google.com/file/d/FILE_ID/view
      const match = url.match(/\/d\/([^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Si no coincide con el patrón, asumir que es el ID directamente
      return url;
      
    } catch (error) {
      Logger.log('Error en _extractFileIdFromUrl: ' + error.message);
      throw new Error('URL de archivo inválida');
    }
  }
  
  /**
   * callInvoiceAPI - Llama a la API de facturación electrónica (mock inicial)
   * 
   * Esta es una implementación mock que simula la respuesta de una API
   * de facturación electrónica real (como SUNAT en Perú).
   * 
   * En producción, esta función debe reemplazarse con la integración real
   * usando UrlFetchApp para hacer llamadas HTTP a la API del proveedor.
   * 
   * Requisitos: 13.2
   * 
   * @param {Object} invoiceData - Datos de la factura a enviar
   * @returns {Object} Respuesta simulada de la API
   */
  callInvoiceAPI(invoiceData) {
    try {
      Logger.log('callInvoiceAPI: iniciando llamada mock a API de facturación');
      
      // Validar datos requeridos
      if (!invoiceData) {
        throw new Error('invoiceData es requerido');
      }
      
      if (!invoiceData.invoice_number) {
        throw new Error('invoice_number es requerido');
      }
      
      // MOCK: Simular delay de red (100-500ms)
      Utilities.sleep(Math.floor(Math.random() * 400) + 100);
      
      // MOCK: Simular respuesta exitosa de la API
      const mockResponse = {
        success: true,
        message: 'Factura registrada exitosamente en SUNAT (MOCK)',
        data: {
          invoice_number: invoiceData.invoice_number,
          cdr_status: 'ACEPTADO',
          cdr_code: '0',
          cdr_description: 'La Factura ha sido aceptada',
          sunat_ticket: 'MOCK-TICKET-' + new Date().getTime(),
          xml_signed_url: 'https://mock-api.sunat.gob.pe/xml/' + invoiceData.invoice_number + '.xml',
          cdr_url: 'https://mock-api.sunat.gob.pe/cdr/' + invoiceData.invoice_number + '.zip',
          timestamp: new Date().toISOString()
        },
        api_version: '1.0-MOCK'
      };
      
      Logger.log('callInvoiceAPI: respuesta mock recibida - ' + mockResponse.data.cdr_status);
      
      // Auditar llamada a API
      this.auditRepo.log(
        'CALL_INVOICE_API',
        'INVOICE',
        invoiceData.id || 'unknown',
        null,
        {
          invoice_number: invoiceData.invoice_number,
          api_response: mockResponse.data.cdr_status,
          is_mock: true
        },
        Session.getActiveUser().getEmail()
      );
      
      return mockResponse;
      
      /* 
       * EJEMPLO DE INTEGRACIÓN REAL:
       * 
       * Para integrar con una API real, reemplazar el código mock anterior con:
       * 
       * const apiUrl = 'https://api.proveedor.com/v1/invoices';
       * const apiKey = PropertiesService.getScriptProperties().getProperty('INVOICE_API_KEY');
       * 
       * const payload = {
       *   invoice_number: invoiceData.invoice_number,
       *   issue_date: invoiceData.issue_date,
       *   client: {
       *     name: invoiceData.client_name,
       *     dni: invoiceData.client_dni,
       *     address: invoiceData.client_address
       *   },
       *   items: invoiceData.items.map(function(item) {
       *     return {
       *       description: item.product_name,
       *       quantity: item.quantity,
       *       unit_price: item.unit_price,
       *       subtotal: item.subtotal
       *     };
       *   }),
       *   subtotal: invoiceData.subtotal,
       *   igv: invoiceData.igv,
       *   total: invoiceData.total
       * };
       * 
       * const options = {
       *   method: 'post',
       *   contentType: 'application/json',
       *   headers: {
       *     'Authorization': 'Bearer ' + apiKey
       *   },
       *   payload: JSON.stringify(payload),
       *   muteHttpExceptions: true
       * };
       * 
       * const response = UrlFetchApp.fetch(apiUrl, options);
       * const responseCode = response.getResponseCode();
       * const responseBody = JSON.parse(response.getContentText());
       * 
       * if (responseCode !== 200 && responseCode !== 201) {
       *   throw new Error('Error en API: ' + responseBody.message);
       * }
       * 
       * return responseBody;
       */
      
    } catch (error) {
      Logger.log('Error en callInvoiceAPI: ' + error.message);
      
      // Retornar respuesta de error
      return {
        success: false,
        message: 'Error al llamar a la API de facturación',
        error: error.message,
        api_version: '1.0-MOCK'
      };
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testInvoiceService - Prueba el InvoiceService
 */
function testInvoiceService() {
  Logger.log('=== Iniciando pruebas de InvoiceService ===');
  
  try {
    const invoiceService = new InvoiceService();
    
    // Obtener una venta de prueba
    const saleRepo = new SaleRepository();
    const sales = saleRepo.findAll();
    
    if (sales.length === 0) {
      Logger.log('✗ No hay ventas para probar');
      return;
    }
    
    // Buscar una venta no anulada
    let testSale = null;
    for (let i = 0; i < sales.length; i++) {
      if (!sales[i].voided || sales[i].voided === false) {
        testSale = sales[i];
        break;
      }
    }
    
    if (!testSale) {
      Logger.log('✗ No hay ventas no anuladas para probar');
      return;
    }
    
    // Probar generación de factura
    Logger.log('\n1. Probando generateInvoice()...');
    Logger.log('Venta ID: ' + testSale.id);
    
    const invoice = invoiceService.generateInvoice(testSale.id);
    Logger.log('✓ Factura generada: ' + invoice.invoice_number);
    Logger.log('  Total: S/ ' + invoice.total.toFixed(2));
    Logger.log('  PDF URL: ' + invoice.pdf_url);
    
    // Probar envío por email (comentado para no enviar emails en pruebas)
    Logger.log('\n2. Información sobre sendInvoiceByEmail()...');
    Logger.log('Para enviar la factura por email, usar:');
    Logger.log('  invoiceService.sendInvoiceByEmail("' + invoice.id + '", "email@example.com")');
    Logger.log('NOTA: No se ejecuta en esta prueba para no enviar emails reales');
    
    Logger.log('\n=== Pruebas de InvoiceService completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}


// ============================================================================
// FUNCIONES SERVIDOR PARA INVOICELIST.HTML
// ============================================================================

/**
 * getAllInvoices - Obtiene todas las facturas para la vista InvoiceList
 * 
 * @returns {Object} Respuesta con array de facturas
 */
function getAllInvoices() {
  return wrapResponse(function() {
    const invoiceService = new InvoiceService();
    
    // Si no existe el repositorio, retornar array vacío
    if (!invoiceService.invoiceRepo) {
      return [];
    }
    
    // Obtener todas las facturas
    const invoices = invoiceService.invoiceRepo.findAll();
    
    return invoices;
  });
}

/**
 * getInvoicePDFUrl - Obtiene la URL del PDF de una factura
 * 
 * @param {string} invoiceId - ID de la factura
 * @returns {Object} Respuesta con URL del PDF
 */
function getInvoicePDFUrl(invoiceId) {
  return wrapResponse(function() {
    const invoiceService = new InvoiceService();
    
    if (!invoiceService.invoiceRepo) {
      throw new Error('Repositorio de facturas no disponible');
    }
    
    const invoice = invoiceService.invoiceRepo.findById(invoiceId);
    
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }
    
    if (!invoice.pdf_url) {
      throw new Error('La factura no tiene PDF generado');
    }
    
    return {
      pdfUrl: invoice.pdf_url
    };
  });
}

/**
 * resendInvoiceByEmail - Reenvía una factura por email
 * 
 * @param {string} invoiceId - ID de la factura
 * @param {string} email - Email del destinatario
 * @returns {Object} Respuesta del envío
 */
function resendInvoiceByEmail(invoiceId, email) {
  return wrapResponse(function() {
    const invoiceService = new InvoiceService();
    
    const result = invoiceService.sendInvoiceByEmail(invoiceId, email);
    
    return result;
  });
}


/**
 * generateInvoiceForSale - Genera una factura para una venta (llamado desde POS)
 * 
 * @param {string} saleId - ID de la venta
 * @returns {Object} Respuesta con factura generada
 */
function generateInvoiceForSale(saleId) {
  return wrapResponse(function() {
    const invoiceService = new InvoiceService();
    
    const invoice = invoiceService.generateInvoice(saleId);
    
    return invoice;
  });
}

/**
 * sendInvoiceEmail - Envía una factura por email (llamado desde POS)
 * 
 * @param {string} invoiceId - ID de la factura
 * @param {string} email - Email del destinatario
 * @returns {Object} Respuesta del envío
 */
function sendInvoiceEmail(invoiceId, email) {
  return wrapResponse(function() {
    const invoiceService = new InvoiceService();
    
    const result = invoiceService.sendInvoiceByEmail(invoiceId, email);
    
    return result;
  });
}


/**
 * getAuditLog - Obtiene el log de auditoría con filtros
 * 
 * @param {Object} filters - Filtros a aplicar
 * @returns {Object} Respuesta con array de entradas de auditoría
 */
function getAuditLog(filters) {
  return wrapResponse(function() {
    const auditRepo = new AuditRepository();
    
    // Preparar filtros
    const queryFilters = {};
    
    if (filters.startDate) {
      queryFilters.startDate = new Date(filters.startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      // Incluir todo el día final
      endDate.setHours(23, 59, 59, 999);
      queryFilters.endDate = endDate;
    }
    
    if (filters.userId) {
      queryFilters.userId = filters.userId;
    }
    
    if (filters.operation) {
      queryFilters.operation = filters.operation;
    }
    
    if (filters.entityType) {
      queryFilters.entityType = filters.entityType;
    }
    
    // Obtener entradas de auditoría
    const entries = auditRepo.findByFilters(queryFilters);
    
    return entries;
  });
}


// ============================================================================
// BULK PRODUCT SERVICE - Ingreso Masivo de Productos
// ============================================================================

/**
 * BulkProductService - Servicio para ingreso masivo de productos
 * 
 * Gestiona la creación masiva de productos con distribución de tallas,
 * generación automática de códigos de barras y registro de movimientos de inventario.
 * 
 * Requisitos: Tarea 3 - Interfaz de Usuario para Ingreso Masivo
 * 
 * @class
 */
class BulkProductService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.productRepo = new ProductRepository();
    this.stockRepo = new StockRepository();
    this.movementRepo = new MovementRepository();
    this.lineRepo = new LineRepository();
    this.categoryRepo = new CategoryRepository();
    this.brandRepo = new BrandRepository();
    this.sizeRepo = new SizeRepository();
    this.supplierRepo = new SupplierRepository();
    this.auditRepo = new AuditRepository();
  }
  
  /**
   * createBulkProducts - Crea múltiples productos con distribución de tallas
   * 
   * Recibe los datos base del producto y un array de tallas con cantidades.
   * Para cada talla/cantidad, genera:
   * - Un producto único en CAT_Products con SKU y código de barras
   * - Un registro de stock en INV_Stock
   * - Un movimiento de entrada en INV_Movements
   * 
   * @param {Object} productData - Datos base del producto
   * @param {string} productData.productName - Nombre del producto
   * @param {string} productData.description - Descripción
   * @param {string} productData.lineId - ID de la línea
   * @param {string} productData.categoryId - ID de la categoría
   * @param {string} productData.brandId - ID de la marca
   * @param {string} productData.supplierId - ID del proveedor
   * @param {string} productData.color - Color
   * @param {string} productData.presentation - Presentación
   * @param {string} productData.warehouseId - ID del almacén
   * @param {number} productData.purchasePrice - Precio de compra
   * @param {number} productData.salePrice - Precio de venta
   * @param {Array<Object>} productData.sizes - Array de tallas con cantidades
   * @param {string} userEmail - Email del usuario que realiza la operación
   * @returns {Object} Resultado con productos creados y total de unidades
   * @throws {Error} Si hay error en la validación o creación
   */
  createBulkProducts(productData, userEmail) {
    try {
      // Validar datos requeridos
      this._validateBulkProductData(productData);
      
      // Obtener datos maestros para validación
      const line = this.lineRepo.findById(productData.lineId);
      const category = this.categoryRepo.findById(productData.categoryId);
      const brand = this.brandRepo.findById(productData.brandId);
      const supplier = this.supplierRepo.findById(productData.supplierId);
      
      if (!line || !category || !brand || !supplier) {
        throw new Error('Datos maestros inválidos (línea, categoría, marca o proveedor no encontrados)');
      }
      
      // Usar lock para operación atómica
      return LockManager.withLock('bulk_product_creation', () => {
        const createdProducts = [];
        let totalUnits = 0;
        
        // Crear un producto por cada talla con cantidad
        productData.sizes.forEach(sizeData => {
          const size = this.sizeRepo.findById(sizeData.sizeId);
          
          if (!size) {
            Logger.log('Talla no encontrada: ' + sizeData.sizeId + ', saltando...');
            return;
          }
          
          // Generar SKU y código de barras
          const barcodeData = BarcodeGenerator.generateProductBarcode({
            categoryId: category.name,
            brandId: brand.name,
            size: sizeData.sizeValue,
            color: productData.color
          });
          
          // Crear producto
          const product = {
            id: 'prod-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
            barcode: barcodeData.sku,
            name: productData.productName + ' - ' + sizeData.sizeValue + ' - ' + productData.color,
            description: productData.description || '',
            price: productData.salePrice,
            category: category.name,
            min_stock: 5, // Stock mínimo por defecto
            active: true,
            created_at: new Date(),
            updated_at: new Date(),
            // Nuevos campos de atributos
            line_id: productData.lineId,
            category_id: productData.categoryId,
            brand_id: productData.brandId,
            supplier_id: productData.supplierId,
            size: sizeData.sizeValue,
            color: productData.color,
            presentation: productData.presentation || '',
            purchase_price: productData.purchasePrice,
            barcode_url: barcodeData.barcodeUrl
          };
          
          // Guardar producto
          const createdProduct = this.productRepo.create(product);
          createdProducts.push(createdProduct);
          
          // Crear registro de stock inicial
          const stockRecord = {
            id: 'stock-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
            warehouse_id: productData.warehouseId,
            product_id: product.id,
            quantity: sizeData.quantity,
            min_stock: product.min_stock,
            last_updated: new Date()
          };
          
          this.stockRepo.create(stockRecord);
          
          // Registrar movimiento de entrada
          const movement = {
            id: 'mov-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
            warehouse_id: productData.warehouseId,
            product_id: product.id,
            type: 'ENTRADA',
            quantity: sizeData.quantity,
            reference_id: 'BULK_ENTRY_' + new Date().getTime(),
            user_id: userEmail,
            reason: 'Ingreso masivo de mercadería - ' + supplier.name,
            created_at: new Date()
          };
          
          this.movementRepo.create(movement);
          
          totalUnits += sizeData.quantity;
          
          Logger.log('Producto creado: ' + product.name + ' (Cantidad: ' + sizeData.quantity + ')');
        });
        
        // Auditar operación
        this.auditRepo.log(
          'BULK_PRODUCT_ENTRY',
          'PRODUCT',
          'BULK_' + new Date().getTime(),
          null,
          {
            productsCreated: createdProducts.length,
            totalUnits: totalUnits,
            supplier: supplier.name,
            brand: brand.name
          },
          userEmail
        );
        
        Logger.log('Ingreso masivo completado: ' + createdProducts.length + ' productos, ' + totalUnits + ' unidades');
        
        return {
          success: true,
          productsCreated: createdProducts.length,
          totalUnits: totalUnits,
          products: createdProducts
        };
      });
      
    } catch (error) {
      Logger.log('Error en createBulkProducts: ' + error.message);
      throw new Error('Error al crear productos masivamente: ' + error.message);
    }
  }
  
  /**
   * getMasterData - Obtiene datos maestros para el formulario
   * 
   * @param {string} type - Tipo de datos (lines, categories, brands, sizes, suppliers)
   * @param {Object} filters - Filtros opcionales
   * @returns {Array<Object>} Array de datos maestros
   * @throws {Error} Si hay error al obtener los datos
   */
  getMasterData(type, filters) {
    try {
      switch (type) {
        case 'lines':
          return this.lineRepo.findActive();
          
        case 'categories':
          if (filters && filters.lineId) {
            return this.categoryRepo.findByLine(filters.lineId);
          }
          return this.categoryRepo.findActive();
          
        case 'brands':
          return this.brandRepo.findActive();
          
        case 'sizes':
          if (filters && filters.categoryId) {
            return this.sizeRepo.findByCategory(filters.categoryId);
          }
          return [];
          
        case 'suppliers':
          if (filters && filters.brandId) {
            return this.supplierRepo.findByBrand(filters.brandId);
          }
          return this.supplierRepo.findActive();
          
        default:
          throw new Error('Tipo de datos maestros no reconocido: ' + type);
      }
    } catch (error) {
      Logger.log('Error en getMasterData: ' + error.message);
      throw new Error('Error al obtener datos maestros: ' + error.message);
    }
  }
  
  /**
   * _validateBulkProductData - Valida los datos del ingreso masivo
   * 
   * @private
   * @param {Object} productData - Datos a validar
   * @throws {Error} Si hay errores de validación
   */
  _validateBulkProductData(productData) {
    // Validar campos requeridos
    Validator.isRequired(productData.productName, 'Nombre del producto');
    Validator.isRequired(productData.lineId, 'Línea');
    Validator.isRequired(productData.categoryId, 'Categoría');
    Validator.isRequired(productData.brandId, 'Marca');
    Validator.isRequired(productData.supplierId, 'Proveedor');
    Validator.isRequired(productData.color, 'Color');
    Validator.isRequired(productData.warehouseId, 'Almacén');
    
    // Validar precios
    Validator.isNumber(productData.purchasePrice, 'Precio de compra');
    Validator.isPositive(productData.purchasePrice, 'Precio de compra');
    Validator.isNumber(productData.salePrice, 'Precio de venta');
    Validator.isPositive(productData.salePrice, 'Precio de venta');
    
    // Validar que el precio de venta sea mayor al de compra
    if (productData.salePrice <= productData.purchasePrice) {
      throw new Error('El precio de venta debe ser mayor al precio de compra');
    }
    
    // Validar tallas
    if (!productData.sizes || !Array.isArray(productData.sizes) || productData.sizes.length === 0) {
      throw new Error('Debe especificar al menos una talla con cantidad');
    }
    
    // Validar cada talla
    productData.sizes.forEach((sizeData, index) => {
      if (!sizeData.sizeId) {
        throw new Error('Talla ' + (index + 1) + ': ID de talla es requerido');
      }
      
      if (!sizeData.quantity || sizeData.quantity <= 0) {
        throw new Error('Talla ' + (index + 1) + ': Cantidad debe ser mayor a 0');
      }
    });
  }
}

/**
 * testBulkProductService - Prueba el BulkProductService
 */
function testBulkProductService() {
  Logger.log('=== Iniciando pruebas de BulkProductService ===');
  
  try {
    const service = new BulkProductService();
    
    // Probar getMasterData
    Logger.log('\n1. Probando getMasterData()...');
    
    const lines = service.getMasterData('lines');
    Logger.log('✓ Líneas obtenidas: ' + lines.length);
    
    if (lines.length > 0) {
      const categories = service.getMasterData('categories', { lineId: lines[0].id });
      Logger.log('✓ Categorías obtenidas para línea ' + lines[0].name + ': ' + categories.length);
      
      if (categories.length > 0) {
        const sizes = service.getMasterData('sizes', { categoryId: categories[0].id });
        Logger.log('✓ Tallas obtenidas para categoría ' + categories[0].name + ': ' + sizes.length);
      }
    }
    
    const brands = service.getMasterData('brands');
    Logger.log('✓ Marcas obtenidas: ' + brands.length);
    
    if (brands.length > 0) {
      const suppliers = service.getMasterData('suppliers', { brandId: brands[0].id });
      Logger.log('✓ Proveedores obtenidos para marca ' + brands[0].name + ': ' + suppliers.length);
    }
    
    Logger.log('\n=== Pruebas de BulkProductService completadas ===');
    Logger.log('NOTA: No se probó createBulkProducts para evitar crear datos de prueba');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

// ============================================================================
// FUNCIONES GLOBALES PARA LLAMADAS DESDE HTML
// ============================================================================

/**
 * handleBulkProductAction - Maneja acciones del formulario de ingreso masivo
 * 
 * Esta función es llamada desde BulkProductEntry.html
 * 
 * @param {string} action - Acción a realizar (getMasterData, createBulkProducts)
 * @param {Object} payload - Datos de la acción
 * @returns {Object} Respuesta con formato estándar
 */
function handleBulkProductAction(action, payload) {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    const service = new BulkProductService();
    
    let result;
    
    if (action === 'getMasterData') {
      result = service.getMasterData(payload.type, payload);
    } else if (action === 'createBulkProducts') {
      result = service.createBulkProducts(payload, userEmail);
    } else {
      throw new Error('Acción no reconocida: ' + action);
    }
    
    return createSuccessResponse(result);
    
  } catch (error) {
    Logger.log('Error en handleBulkProductAction: ' + error.message);
    return createErrorResponse(
      ERROR_CODES.SYSTEM_ERROR,
      error.message,
      null
    );
  }
}


// ============================================================================
// FUNCIONES EXPUESTAS PARA FRONTEND
// ============================================================================

/**
 * createBulkProductsFromFrontend - Función expuesta para el frontend
 * 
 * Wrapper para llamar a BulkProductService.createBulkProducts desde el frontend
 * 
 * @param {Object} data - Datos de la solicitud

/**
// FUNCIONES EXPUESTAS PARA FRONTEND
// ============================================================================

/**
 * createBulkProductsFromFrontend - Función expuesta para el frontend
 * 
 * Wrapper para llamar a BulkProductService.createBulkProducts desde el frontend
 * 
 * @param {Object} data - Datos de la solicitud
 * @returns {Object} Respuesta con wrapResponse
 */
function createBulkProductsFromFrontend(data) {
  return wrapResponse(function() {
    const bulkService = new BulkProductService();
    
    return bulkService.createBulkProducts(
      data.baseProduct,
      data.sizeDistribution,
      data.purchasePrice,
      data.warehouseId,
      data.userId
    );
  });
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testBulkProductService - Prueba el servicio de ingreso masivo
 */
function testBulkProductService() {
  Logger.log('=== Iniciando pruebas de BulkProductService ===');
  
  try {
    const bulkService = new BulkProductService();
    
    // Test 1: Parsear distribución de tallas
    Logger.log('\n1. Probando _parseSizeDistribution...');
    const distribution = '2S, 3M, 4L, 1XL';
    const parsed = bulkService._parseSizeDistribution(distribution);
    
    Logger.log('✓ Distribución parseada:');
    for (let i = 0; i < parsed.length; i++) {
      Logger.log('  - ' + parsed[i].quantity + ' x ' + parsed[i].sizeCode);
    }
    
    // Test 2: Validar tallas
    Logger.log('\n2. Probando _validateSizes...');
    bulkService._validateSizes(parsed);
    Logger.log('✓ Todas las tallas son válidas');
    
    // Test 3: Generar código de barras
    Logger.log('\n3. Probando _generateBarcode...');
    const baseProduct = { name: 'Blusa Test' };
    const barcode = bulkService._generateBarcode(baseProduct, 'M', 0, 0);
    Logger.log('✓ Código de barras generado: ' + barcode);
    
    // Test 4: Crear productos masivos (comentado para no crear datos reales)
    Logger.log('\n4. Test de creación masiva (simulado)');
    Logger.log('⚠ Para probar la creación real, descomentar el código');
    
    /*
    const result = bulkService.createBulkProducts(
      {
        name: 'Blusa Test Ingreso Masivo',
        line_id: 'line-001',
        category_id: 'cat-001',
        brand_id: 'brand-001',
        price: 50.00,
        description: 'Blusa de prueba para ingreso masivo'
      },
      '2S, 2M, 2L',
      30.00,
      'warehouse-001',
      'test@example.com'
    );
    
    Logger.log('✓ Productos creados: ' + result.productsCreated);
    */
    
    Logger.log('\n=== Pruebas de BulkProductService completadas ===');
    
    return {
      success: true,
      message: 'Todas las pruebas pasaron'
    };
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}


// ============================================================================
// BIRTHDAYSERVICE - Detección de Cumpleaños
// ============================================================================

/**
 * BirthdayService - Servicio para detección de cumpleaños
 * 
 * Gestiona la detección de cumpleaños de clientes para aplicar
 * descuentos y obsequios especiales.
 * 
 * Requisitos: 35.1, 35.2
 * 
 * @class
 */
class BirthdayService {
  
  /**
   * Constructor
   */
  constructor() {
    this.clientRepo = new ClientRepository();
  }
  
  /**
   * checkBirthday - Verifica si hoy es el cumpleaños del cliente
   * 
   * Compara la fecha actual (día y mes) con la fecha de cumpleaños
   * del cliente. Ignora el año para detectar cumpleaños anual.
   * 
   * Requisitos: 35.1, 35.2
   * 
   * @param {string} clientId - ID del cliente
   * @returns {Object} Objeto con {isBirthday: boolean, client: Object}
   * @throws {Error} Si el cliente no existe
   */
  checkBirthday(clientId) {
    try {
      Logger.log('=== checkBirthday START ===');
      Logger.log('Client ID: ' + clientId);
      
      // Validar parámetro
      if (!clientId) {
        throw new Error('ID de cliente es requerido');
      }
      
      // Obtener cliente
      const client = this.clientRepo.findById(clientId);
      
      if (!client) {
        throw new Error('Cliente no encontrado');
      }
      
      // Si el cliente no tiene fecha de cumpleaños, retornar false
      if (!client.birthday) {
        Logger.log('Cliente no tiene fecha de cumpleaños registrada');
        return {
          isBirthday: false,
          client: client,
          message: 'Cliente no tiene fecha de cumpleaños registrada'
        };
      }
      
      // Obtener fecha actual
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth(); // 0-11
      
      // Convertir birthday a Date si es string
      let birthdayDate = client.birthday;
      if (typeof birthdayDate === 'string') {
        birthdayDate = new Date(birthdayDate);
      }
      
      // Validar que sea una fecha válida
      if (isNaN(birthdayDate.getTime())) {
        Logger.log('Fecha de cumpleaños inválida');
        return {
          isBirthday: false,
          client: client,
          message: 'Fecha de cumpleaños inválida'
        };
      }
      
      const birthdayDay = birthdayDate.getDate();
      const birthdayMonth = birthdayDate.getMonth(); // 0-11
      
      // Comparar día y mes
      const isBirthday = (todayDay === birthdayDay && todayMonth === birthdayMonth);
      
      Logger.log('Hoy: ' + todayDay + '/' + (todayMonth + 1));
      Logger.log('Cumpleaños: ' + birthdayDay + '/' + (birthdayMonth + 1));
      Logger.log('Es cumpleaños: ' + isBirthday);
      Logger.log('=== checkBirthday END ===');
      
      return {
        isBirthday: isBirthday,
        client: client,
        message: isBirthday ? '¡Hoy es el cumpleaños del cliente!' : 'No es el cumpleaños del cliente'
      };
      
    } catch (error) {
      Logger.log('Error en checkBirthday: ' + error.message);
      throw error;
    }
  }
  
  /**
   * getTodayBirthdays - Obtiene todos los clientes que cumplen años hoy
   * 
   * Retorna una lista de todos los clientes activos que tienen
   * cumpleaños en la fecha actual.
   * 
   * @returns {Array<Object>} Array de clientes con cumpleaños hoy
   */
  getTodayBirthdays() {
    try {
      Logger.log('=== getTodayBirthdays START ===');
      
      // Obtener todos los clientes activos
      const allClients = this.clientRepo.findAll();
      const activeClients = allClients.filter(function(c) {
        return c.active === true || c.active === 'true';
      });
      
      // Obtener fecha actual
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth();
      
      // Filtrar clientes con cumpleaños hoy
      const birthdayClients = [];
      
      for (let i = 0; i < activeClients.length; i++) {
        const client = activeClients[i];
        
        if (!client.birthday) {
          continue;
        }
        
        let birthdayDate = client.birthday;
        if (typeof birthdayDate === 'string') {
          birthdayDate = new Date(birthdayDate);
        }
        
        if (isNaN(birthdayDate.getTime())) {
          continue;
        }
        
        const birthdayDay = birthdayDate.getDate();
        const birthdayMonth = birthdayDate.getMonth();
        
        if (todayDay === birthdayDay && todayMonth === birthdayMonth) {
          birthdayClients.push(client);
        }
      }
      
      Logger.log('Clientes con cumpleaños hoy: ' + birthdayClients.length);
      Logger.log('=== getTodayBirthdays END ===');
      
      return birthdayClients;
      
    } catch (error) {
      Logger.log('Error en getTodayBirthdays: ' + error.message);
      throw error;
    }
  }
  
  /**
   * applyBirthdayDiscount - Aplica descuento de cumpleaños a un total
   * 
   * Obtiene el porcentaje de descuento desde CFG_Params y lo aplica
   * al total de la venta. Registra en auditoría.
   * 
   * Requisitos: 35.3
   * 
   * @param {number} total - Total de la venta
   * @param {string} clientId - ID del cliente
   * @param {string} userId - ID del usuario que aplica el descuento
   * @returns {Object} {discountAmount, newTotal, discountPercent}
   * @throws {Error} Si hay error al aplicar descuento
   */
  applyBirthdayDiscount(total, clientId, userId) {
    try {
      Logger.log('=== applyBirthdayDiscount START ===');
      Logger.log('Total: ' + total);
      Logger.log('Client ID: ' + clientId);
      
      // Validar parámetros
      if (!total || total <= 0) {
        throw new Error('Total debe ser mayor a 0');
      }
      
      if (!clientId) {
        throw new Error('ID de cliente es requerido');
      }
      
      if (!userId) {
        throw new Error('ID de usuario es requerido');
      }
      
      // Verificar que sea cumpleaños del cliente
      const birthdayCheck = this.checkBirthday(clientId);
      
      if (!birthdayCheck.isBirthday) {
        throw new Error('No es el cumpleaños del cliente');
      }
      
      // Obtener porcentaje de descuento desde CFG_Params
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const paramsSheet = ss.getSheetByName('CFG_Params');
      
      if (!paramsSheet) {
        throw new Error('Hoja CFG_Params no encontrada');
      }
      
      const data = paramsSheet.getDataRange().getValues();
      let discountPercent = 15; // Default 15%
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === 'BIRTHDAY_DISCOUNT_PERCENT') {
          discountPercent = Number(data[i][1]) || 15;
          break;
        }
      }
      
      // Calcular descuento
      const discountAmount = (total * discountPercent) / 100;
      const newTotal = total - discountAmount;
      
      Logger.log('Descuento aplicado: ' + discountPercent + '% = S/ ' + discountAmount.toFixed(2));
      Logger.log('Nuevo total: S/ ' + newTotal.toFixed(2));
      
      // Auditar descuento de cumpleaños
      const auditRepo = new AuditRepository();
      auditRepo.log(
        'BIRTHDAY_DISCOUNT',
        'SALE',
        clientId,
        { total: total },
        { total: newTotal, discount: discountAmount, discountPercent: discountPercent },
        userId
      );
      
      Logger.log('=== applyBirthdayDiscount END ===');
      
      return {
        discountAmount: discountAmount,
        newTotal: newTotal,
        discountPercent: discountPercent
      };
      
    } catch (error) {
      Logger.log('Error en applyBirthdayDiscount: ' + error.message);
      throw error;
    }
  }
  
  /**
   * registerBirthdayGift - Registra un obsequio de cumpleaños
   * 
   * Permite registrar una "venta" con precio 0 para obsequios de cumpleaños.
   * Decrementa el stock pero no genera ingreso en caja.
   * Registra movimiento de inventario con motivo GIFT_BIRTHDAY.
   * 
   * Requisitos: 35.4, 35.5
   * 
   * @param {Object} giftData - Datos del obsequio
   * @param {string} giftData.clientId - ID del cliente
   * @param {string} giftData.productId - ID del producto obsequiado
   * @param {number} giftData.quantity - Cantidad obsequiada
   * @param {string} giftData.warehouseId - ID del almacén
   * @param {string} giftData.userId - ID del usuario que registra
   * @returns {Object} Registro del obsequio
   * @throws {Error} Si hay error al registrar
   */
  registerBirthdayGift(giftData) {
    try {
      Logger.log('=== registerBirthdayGift START ===');
      Logger.log('Gift data: ' + JSON.stringify(giftData));
      
      // Validar parámetros
      if (!giftData.clientId) {
        throw new Error('ID de cliente es requerido');
      }
      
      if (!giftData.productId) {
        throw new Error('ID de producto es requerido');
      }
      
      if (!giftData.quantity || giftData.quantity <= 0) {
        throw new Error('Cantidad debe ser mayor a 0');
      }
      
      if (!giftData.warehouseId) {
        throw new Error('ID de almacén es requerido');
      }
      
      if (!giftData.userId) {
        throw new Error('ID de usuario es requerido');
      }
      
      // Verificar que sea cumpleaños del cliente
      const birthdayCheck = this.checkBirthday(giftData.clientId);
      
      if (!birthdayCheck.isBirthday) {
        throw new Error('No es el cumpleaños del cliente');
      }
      
      // Verificar stock disponible
      const inventoryService = new InventoryService();
      const currentStock = inventoryService.checkStock(giftData.warehouseId, giftData.productId);
      
      if (currentStock < giftData.quantity) {
        throw new Error('Stock insuficiente. Disponible: ' + currentStock + ', Solicitado: ' + giftData.quantity);
      }
      
      // Decrementar stock
      inventoryService.reserveStock(
        giftData.warehouseId,
        giftData.productId,
        giftData.quantity,
        'GIFT_BIRTHDAY_' + new Date().getTime(),
        giftData.userId,
        'Obsequio de cumpleaños para cliente ' + giftData.clientId
      );
      
      // Registrar movimiento especial de obsequio
      const movementRepo = new MovementRepository();
      const movement = movementRepo.create({
        id: 'mov-gift-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
        warehouse_id: giftData.warehouseId,
        product_id: giftData.productId,
        type: 'GIFT_BIRTHDAY',
        quantity: giftData.quantity,
        reference_id: giftData.clientId,
        user_id: giftData.userId,
        reason: 'Obsequio de cumpleaños',
        created_at: new Date()
      });
      
      // Auditar obsequio
      const auditRepo = new AuditRepository();
      auditRepo.log(
        'BIRTHDAY_GIFT',
        'INVENTORY',
        movement.id,
        {},
        {
          clientId: giftData.clientId,
          productId: giftData.productId,
          quantity: giftData.quantity,
          warehouseId: giftData.warehouseId
        },
        giftData.userId
      );
      
      Logger.log('Obsequio registrado exitosamente');
      Logger.log('=== registerBirthdayGift END ===');
      
      return {
        movement: movement,
        client: birthdayCheck.client,
        message: 'Obsequio de cumpleaños registrado exitosamente'
      };
      
    } catch (error) {
      Logger.log('Error en registerBirthdayGift: ' + error.message);
      throw error;
    }
  }
}

/**
 * checkClientBirthday - Wrapper para frontend
 * 
 * @param {string} clientId - ID del cliente
 * @returns {Object} Respuesta con wrapResponse
 */
function checkClientBirthday(clientId) {
  return wrapResponse(function() {
    const birthdayService = new BirthdayService();
    return birthdayService.checkBirthday(clientId);
  });
}

/**
 * getTodayBirthdays - Wrapper para frontend
 * 
 * @returns {Object} Respuesta con array de clientes
 */
function getTodayBirthdays() {
  return wrapResponse(function() {
    const birthdayService = new BirthdayService();
    return birthdayService.getTodayBirthdays();
  });
}

/**
 * applyBirthdayDiscountWrapper - Wrapper para frontend
 * 
 * @param {number} total - Total de la venta
 * @param {string} clientId - ID del cliente
 * @param {string} userId - ID del usuario
 * @returns {Object} Respuesta con descuento aplicado
 */
function applyBirthdayDiscountWrapper(total, clientId, userId) {
  return wrapResponse(function() {
    const birthdayService = new BirthdayService();
    return birthdayService.applyBirthdayDiscount(total, clientId, userId);
  });
}

/**
 * registerBirthdayGift - Wrapper para frontend
 * 
 * @param {Object} giftData - Datos del obsequio
 * @returns {Object} Respuesta con obsequio registrado
 */
function registerBirthdayGift(giftData) {
  return wrapResponse(function() {
    const birthdayService = new BirthdayService();
    return birthdayService.registerBirthdayGift(giftData);
  });
}
