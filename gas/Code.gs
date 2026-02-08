/**
 * Code.gs - Punto de Entrada Principal
 * Adiction Boutique Suite
 * 
 * VERSIÓN CON AUTENTICACIÓN DUAL:
 * - Usuario/contraseña (funciona en modo incógnito)
 * - Email de Google (fallback)
 * 
 * Este archivo contiene las funciones principales de Google Apps Script:
 * - doGet(): Maneja solicitudes HTTP GET (páginas web)
 * - doPost(): Maneja solicitudes HTTP POST (API)
 * 
 * PERMISOS NECESARIOS:
 * =====================
 * Este proyecto requiere los siguientes permisos de Google:
 * 
 * 1. Google Sheets API:
 *    - Leer y escribir en hojas de cálculo
 *    - Scope: https://www.googleapis.com/auth/spreadsheets
 * 
 * 2. Google Drive API:
 *    - Crear y leer archivos (PDFs, imágenes)
 *    - Scope: https://www.googleapis.com/auth/drive.file
 * 
 * 3. Gmail API:
 *    - Enviar emails con adjuntos
 *    - Scope: https://www.googleapis.com/auth/gmail.send
 * 
 * 4. Script Service:
 *    - Obtener información del usuario actual
 *    - Scope: https://www.googleapis.com/auth/script.external_request
 * 
 * CONFIGURACIÓN INICIAL:
 * ======================
 * 1. Crear un nuevo Google Spreadsheet
 * 2. Copiar el ID del spreadsheet
 * 3. Actualizar SPREADSHEET_ID en Const.gs
 * 4. Publicar como Web App con acceso "Anyone with the link"
 * 5. Configurar la allowlist de usuarios en CFG_Users
 */

// ============================================================================
// AUTENTICACIÓN CON USUARIO/CONTRASEÑA
// ============================================================================

const USERS = {
  'admin': 'admin123',
  'gian': 'gian123',
  'vendedor': 'vendedor123'
};

function generateToken(username) {
  const date = new Date().toDateString();
  return Utilities.base64Encode(username + ':' + date);
}

function renderLoginUserPass(attemptedUser, message) {
  // Obtener la URL del script FUERA del template string
  const scriptUrl = ScriptApp.getService().getUrl();
  
  const html = '<!DOCTYPE html>' +
    '<html lang="es">' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Login - Adiction Boutique</title>' +
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' +
    '<style>' +
    'body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }' +
    '.login-box { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 400px; width: 100%; }' +
    'h1 { text-align: center; color: #333; margin-bottom: 30px; }' +
    '.btn-primary { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="login-box">' +
    '<h1>🛍️ Adiction Boutique</h1>' +
    (message ? '<div class="alert alert-' + (message.includes('correctamente') || message.includes('exitoso') ? 'success' : 'danger') + '">' + message + '</div>' : '') +
    '<form method="POST" action="' + scriptUrl + '">' +
    '<div class="mb-3">' +
    '<label class="form-label">Usuario</label>' +
    '<input type="text" name="username" class="form-control" value="' + (attemptedUser || '') + '" required autofocus>' +
    '</div>' +
    '<div class="mb-3">' +
    '<label class="form-label">Contraseña</label>' +
    '<input type="password" name="password" class="form-control" required>' +
    '</div>' +
    '<button type="submit" class="btn btn-primary">Iniciar Sesión</button>' +
    '</form>' +
    '<div class="mt-4 text-center text-muted">' +
    '<small><strong>Usuarios:</strong><br>admin / admin123<br>gian / gian123<br>vendedor / vendedor123</small>' +
    '</div>' +
    '</div>' +
    '</body>' +
    '</html>';
  
  return HtmlService.createHtmlOutput(html)
    .setTitle('Login - Adiction Boutique')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * doGet - Maneja solicitudes HTTP GET
 * 
 * Esta función es el punto de entrada para todas las solicitudes GET.
 * Se utiliza para servir páginas HTML de la interfaz de usuario.
 * 
 * Requisitos: 1.1, 1.2 - Validación de autenticación antes de renderizar
 * 
 * IMPORTANTE: Manejo robusto de errores para evitar pantallas de error de Google
 * 
 * @param {Object} e - Objeto de evento con parámetros de la solicitud
 * @param {Object} e.parameter - Parámetros de la URL
 * @param {string} e.parameter.page - Página solicitada (dashboard, pos, etc.)
 * @param {string} e.parameter.action - Acción especial (logout)
 * @returns {HtmlOutput} Página HTML renderizada
 */
function doGet(e) {
  let userEmail = '';
  
  try {
    Logger.log('=== doGet START ===');
    Logger.log('Event object e: ' + (e ? 'exists' : 'NULL'));
    Logger.log('e.parameter: ' + (e && e.parameter ? JSON.stringify(e.parameter) : 'NULL'));
    
    // CRÍTICO: Validar que e y e.parameter existen
    if (!e) {
      Logger.log('ERROR: Event object e is null');
      return renderLoginUserPass('', 'Error del sistema. Por favor, recargue la página.');
    }
    
    if (!e.parameter) {
      Logger.log('WARNING: e.parameter is null, inicializando como objeto vacío');
      e.parameter = {};
    }
    
    Logger.log('Parameters: ' + JSON.stringify(e.parameter));
    
    // ========================================================================
    // NUEVO: AUTENTICACIÓN CON USUARIO/CONTRASEÑA (FUNCIONA EN INCÓGNITO)
    // ========================================================================
    
    const sessionUser = e.parameter.user;
    const sessionToken = e.parameter.token;
    
    // Manejar logout
    if (e.parameter.action === 'logout') {
      return renderLoginUserPass('', 'Sesión cerrada correctamente');
    }
    
    // Si hay sesión de usuario/contraseña, validar token
    if (sessionUser && sessionToken) {
      const expectedToken = generateToken(sessionUser);
      if (sessionToken === expectedToken) {
        Logger.log('✅ Sesión válida para usuario: ' + sessionUser);
        
        // Crear userData para el sistema
        const userData = {
          email: sessionUser + '@adictionboutique.com',
          name: sessionUser,
          roles: ['Admin', 'Vendedor']
        };
        
        // Parsear parámetros de URL
        const params = parseUrlParams(e.parameter);
        const page = params.page || 'dashboard';
        
        Logger.log('Routing to page: ' + page);
        
        // Enrutar según la página solicitada
        switch (page) {
          case 'dashboard':
            return renderDashboard(userData, params);
          case 'pos':
            return renderPOS(userData, params);
          case 'barcode-scanner':
            return renderBarcodeScanner(userData, params);
          case 'inventory':
            return renderInventory(userData, params);
          case 'products':
          case 'productos':
            return renderProducts(userData, params);
          case 'bulk-entry':
          case 'ingreso-masivo':
            return renderBulkProductEntry(userData, params);
          case 'clients':
            return renderClients(userData, params);
          case 'cliente-form':
            return renderClientForm(userData, params);
          case 'collections':
            return renderCollections(userData, params);
          case 'cash':
            return renderCash(userData, params);
          case 'reports':
            return renderReports(userData, params);
          case 'invoices':
            return renderInvoices(userData, params);
          case 'producto-form':
            return renderProductForm(userData, params);
          case 'settings':
            return renderSettings(userData, params);
          case 'stalled-inventory':
            return renderStalledInventory(userData, params);
          case 'suppliers':
            return renderSuppliers(userData, params);
          case 'purchases':
            return renderPurchases(userData, params);
          default:
            return renderDashboard(userData, params);
        }
      }
    }
    
    // ========================================================================
    // FALLBACK: AUTENTICACIÓN CON EMAIL DE GOOGLE (CÓDIGO ORIGINAL)
    // ========================================================================
    
    // CRÍTICO: Envolver Session.getActiveUser() en try-catch
    // Si falla (múltiples cuentas, permisos, etc.), no debe romper la app
    try {
      userEmail = Session.getActiveUser().getEmail();
      Logger.log('Email detectado automáticamente: ' + userEmail);
    } catch (sessionError) {
      Logger.log('ERROR al obtener email automático: ' + sessionError.message);
      userEmail = '';
    }
    
    // Normalizar email: trim y lowercase
    if (userEmail) {
      userEmail = userEmail.trim().toLowerCase();
      Logger.log('Email normalizado (auto): ' + userEmail);
    }
    
    // Verificar si hay un email en sesión manual (tiene prioridad)
    if (e.parameter.sessionEmail) {
      userEmail = e.parameter.sessionEmail.trim().toLowerCase();
      Logger.log('Usando email de sesión manual: ' + userEmail);
    }
    
    // Si no hay email válido, mostrar login con usuario/contraseña
    if (!userEmail || userEmail === '' || userEmail === 'unknown') {
      Logger.log('No hay email válido, mostrando login con usuario/contraseña');
      Logger.log('userEmail value: "' + userEmail + '"');
      return renderLoginUserPass('', '');
    }
    
    Logger.log('Email final a validar: ' + userEmail);
    
    // LISTA DE EMAILS PERMITIDOS HARDCODED (solución directa)
    const allowedEmails = [
      'gianpepex@gmail.com',
      'karianaghostimporter@gmail.com',
      'gianpapex@gmail.com',
      'admin@adictionboutique.com',
      'vendedor.mujeres@adictionboutique.com',
      'vendedor.hombres@adictionboutique.com',
      'cobrador@adictionboutique.com'
    ];
    
    // Verificar si el email está en la lista hardcoded
    const isInHardcodedList = allowedEmails.indexOf(userEmail) !== -1;
    
    Logger.log('¿Email en lista hardcoded? ' + isInHardcodedList);
    
    if (isInHardcodedList) {
      // ACCESO DIRECTO - sin validar CFG_Users
      Logger.log('✅ Usuario en lista hardcoded - ACCESO DIRECTO PERMITIDO: ' + userEmail);
      
      // Delegar al router directamente
      return routeGet(e, userEmail);
    }
    
    // Si no está en la lista hardcoded, validar con AuthService
    Logger.log('Usuario no en lista hardcoded, validando con AuthService: ' + userEmail);
    const authService = new AuthService();
    let isAllowed = false;
    
    try {
      isAllowed = authService.isUserAllowed(userEmail, true);
    } catch (authError) {
      Logger.log('Error en isUserAllowed: ' + authError.message);
      isAllowed = false;
    }
    
    Logger.log('Resultado de validación AuthService: ' + isAllowed);
    
    if (!isAllowed) {
      // Registrar intento de acceso fallido
      try {
        authService.logAccess(userEmail, false);
      } catch (logError) {
        Logger.log('Error al registrar acceso fallido: ' + logError.message);
      }
      
      Logger.log('Usuario no autorizado: ' + userEmail);
      return renderLoginUserPass(
        userEmail, 
        'El email "' + userEmail + '" no está registrado. Use usuario/contraseña.'
      );
    }
    
    // Registrar acceso exitoso
    try {
      authService.logAccess(userEmail, true);
    } catch (logError) {
      Logger.log('Error al registrar acceso exitoso: ' + logError.message);
    }
    Logger.log('Acceso autorizado para: ' + userEmail);
    
    // Delegar al router
    return routeGet(e, userEmail);
    
  } catch (error) {
    Logger.log('ERROR CRÍTICO en doGet: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    Logger.log('User email: ' + userEmail);
    
    // NUNCA mostrar error de Google, siempre mostrar login manual
    return renderLoginUserPass(
      userEmail, 
      'Error del sistema: ' + error.message
    );
  }
}

/**
 * doPost - Maneja solicitudes HTTP POST
 * 
 * Esta función es el punto de entrada para todas las solicitudes POST.
 * Se utiliza para operaciones de API (crear ventas, registrar pagos, etc.)
 * 
 * Formato de solicitud esperado:
 * {
 *   "action": "sale/create",
 *   "payload": { ... },
 *   "requestId": "uuid-v4"
 * }
 * 
 * Formato de respuesta estándar (envelope):
 * {
 *   "ok": true,
 *   "data": { ... },
 *   "error": null
 * }
 * 
 * o en caso de error:
 * {
 *   "ok": false,
 *   "data": null,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Mensaje descriptivo",
 *     "details": { ... }
 *   }
 * }
 * 
 * @param {Object} e - Objeto de evento con parámetros de la solicitud
 * @param {string} e.postData.contents - Cuerpo de la solicitud (JSON)
 * @returns {TextOutput} Respuesta JSON
 */
/**
 * doPost - Maneja solicitudes HTTP POST
 * 
 * Esta función es el punto de entrada para todas las solicitudes POST.
 * Se utiliza para operaciones de API (crear ventas, registrar pagos, etc.)
 * 
 * Formato de solicitud esperado:
 * {
 *   "action": "sale/create",
 *   "payload": { ... },
 *   "requestId": "uuid-v4"
 * }
 * 
 * Formato de respuesta estándar (envelope):
 * {
 *   "ok": true,
 *   "data": { ... },
 *   "error": null
 * }
 * 
 * o en caso de error:
 * {
 *   "ok": false,
 *   "data": null,
 *   "error": {
 *     "code": "ERROR_CODE",
 *     "message": "Mensaje descriptivo",
 *     "details": { ... }
 *   }
 * }
 * 
 * @param {Object} e - Objeto de evento con parámetros de la solicitud
 * @param {string} e.postData.contents - Cuerpo de la solicitud (JSON)
 * @returns {TextOutput} Respuesta JSON
 */
function doPost(e) {
  let userEmail = '';
  
  try {
    Logger.log('=== doPost START ===');
    
    // ========================================================================
    // NUEVO: MANEJAR LOGIN CON USUARIO/CONTRASEÑA
    // ========================================================================
    
    if (e.parameter && e.parameter.username && e.parameter.password) {
      const username = e.parameter.username;
      const password = e.parameter.password;
      
      Logger.log('Login attempt for: ' + username);
      
      // Validar credenciales
      if (USERS[username] && USERS[username] === password) {
        Logger.log('✅ Login exitoso para: ' + username);
        
        // Generar token
        const token = generateToken(username);
        
        // Redirigir al dashboard usando doGet con parámetros
        const scriptUrl = ScriptApp.getService().getUrl();
        const redirectUrl = scriptUrl + '?user=' + encodeURIComponent(username) + 
                           '&token=' + encodeURIComponent(token);
        
        // Retornar HTML que hace redirect inmediato
        const html = '<html><head><meta http-equiv="refresh" content="0;url=' + redirectUrl + '"></head><body>Redirigiendo...</body></html>';
        
        return HtmlService.createHtmlOutput(html)
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      } else {
        Logger.log('❌ Login fallido para: ' + username);
        return renderLoginUserPass(username, 'Usuario o contraseña incorrectos');
      }
    }
    
    // ========================================================================
    // CÓDIGO ORIGINAL PARA API
    // ========================================================================
    
    // CRÍTICO: Envolver Session.getActiveUser() en try-catch
    try {
      userEmail = Session.getActiveUser().getEmail();
      Logger.log('Email detectado automáticamente: ' + userEmail);
    } catch (sessionError) {
      Logger.log('ERROR al obtener email automático: ' + sessionError.message);
      userEmail = '';
    }
    
    // NUEVO: Intentar obtener email desde parámetros si Session falló
    if (!userEmail && e.parameter && e.parameter.userEmail) {
      userEmail = e.parameter.userEmail;
      Logger.log('Email obtenido desde parámetros: ' + userEmail);
    }
    
    // Normalizar email
    if (userEmail) {
      userEmail = userEmail.trim().toLowerCase();
    }
    
    // Si no hay email, retornar error de autenticación
    if (!userEmail) {
      return createErrorResponse(
        ERROR_CODES.UNAUTHORIZED,
        'No se pudo identificar al usuario. Por favor, inicie sesión.',
        null
      );
    }
    
    Logger.log('POST request from: ' + userEmail);
    
    // Parsear el cuerpo de la solicitud
    let requestData;
    
    // Intentar parsear como JSON primero
    if (e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // Si falla el parseo JSON, intentar usar parámetros de formulario
        Logger.log('JSON parse failed, trying form parameters');
        requestData = null;
      }
    }
    
    // Si no hay JSON, usar parámetros de formulario (para DataTables)
    if (!requestData && e.parameter) {
      Logger.log('Using form parameters');
      const action = e.parameter.action;
      
      if (!action) {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_ERROR,
          'El campo "action" es requerido',
          null
        );
      }
      
      // Construir requestData desde parámetros
      requestData = {
        action: action,
        payload: e.parameter, // Todos los parámetros como payload
        requestId: e.parameter.requestId || null
      };
    }
    
    // Validar que tenemos requestData
    if (!requestData || !requestData.action) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'El campo "action" es requerido',
        null
      );
    }
    
    // Asegurar que payload existe (puede ser vacío para algunas acciones)
    if (!requestData.payload) {
      requestData.payload = {};
    }
    
    // Log de la acción solicitada
    Logger.log('Action: ' + requestData.action);
    Logger.log('Payload: ' + JSON.stringify(requestData.payload));
    
    // Delegar al router
    return routePost(requestData, userEmail);
    
  } catch (error) {
    Logger.log('ERROR CRÍTICO en doPost: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    return createErrorResponse(
      ERROR_CODES.SYSTEM_ERROR,
      'Error interno del servidor',
      { originalError: error.message }
    );
  }
}

// ============================================================================
// ROUTER - Manejo de Rutas
// ============================================================================

/**
 * routeGet - Router para solicitudes GET (páginas HTML)
 * 
 * Maneja el enrutamiento de páginas HTML según el parámetro 'page'.
 * El usuario ya está autenticado en este punto (validado en doGet).
 * 
 * @param {Object} e - Objeto de evento con parámetros
 * @param {string} userEmail - Email del usuario autenticado
 * @returns {HtmlOutput} Página HTML renderizada
 */
function routeGet(e, userEmail) {
  // Parsear parámetros de URL
  const params = parseUrlParams(e.parameter);
  const page = params.page || 'dashboard';
  
  Logger.log('Routing GET to page: ' + page);
  Logger.log('Parsed params: ' + JSON.stringify(params));
  
  // Obtener datos del usuario para pasar al layout
  const authService = new AuthService();
  let userRoles = [];
  
  try {
    userRoles = authService.getUserRoles(userEmail);
  } catch (roleError) {
    Logger.log('Error al obtener roles: ' + roleError.message);
    userRoles = [];
  }
  
  // Si no tiene roles (usuario hardcoded o error), asignar roles por defecto
  if (userRoles.length === 0) {
    Logger.log('Usuario sin roles en CFG_Users, asignando roles por defecto');
    userRoles = ['Admin', 'Vendedor'];
  }
  
  const userData = {
    email: userEmail,
    name: userEmail.split('@')[0], // Usar parte antes del @ como nombre por ahora
    roles: userRoles
  };
  
  // Enrutar según la página solicitada
  switch (page) {
    case 'dashboard':
      return renderDashboard(userData, params);
      
    case 'pos':
      return renderPOS(userData, params);
      
    case 'barcode-scanner':
      return renderBarcodeScanner(userData, params);
      
    case 'inventory':
      return renderInventory(userData, params);
      
    case 'products':
    case 'productos':
      return renderProducts(userData, params);
      
    case 'bulk-entry':
    case 'ingreso-masivo':
      return renderBulkProductEntry(userData, params);
      
    case 'clients':
      return renderClients(userData, params);
      
    case 'cliente-form':
      return renderClientForm(userData, params);
      
    case 'collections':
      return renderCollections(userData, params);
      
    case 'cash':
      return renderCash(userData, params);
      
    case 'reports':
      return renderReports(userData, params);
      
    case 'invoices':
      return renderInvoices(userData, params);
      
    case 'producto-form':
      return renderProductForm(userData, params);
      
    case 'settings':
      return renderSettings(userData, params);
      
    case 'stalled-inventory':
      return renderStalledInventory(userData, params);
      
    case 'suppliers':
      return renderSuppliers(userData, params);
      
    case 'purchases':
      return renderPurchases(userData, params);
      
    default:
      // Página no encontrada - redirigir a dashboard
      Logger.log('Page not found: ' + page + ', redirecting to dashboard');
      return renderDashboard(userData, params);
  }
}

/**
 * routePost - Router para solicitudes POST (API)
 * 
 * Maneja el enrutamiento de operaciones de API según el campo 'action'.
 * Valida autenticación y permisos antes de ejecutar cualquier acción.
 * 
 * @param {Object} requestData - Datos de la solicitud {action, payload, requestId}
 * @param {string} userEmail - Email del usuario autenticado
 * @returns {TextOutput} Respuesta JSON con envelope estándar
 */
function routePost(requestData, userEmail) {
  const action = requestData.action;
  const payload = requestData.payload;
  const requestId = requestData.requestId;
  
  Logger.log('Routing POST to action: ' + action);
  
  // TODO: Validar autenticación con AuthService
  // TODO: Validar permisos según la acción
  // TODO: Implementar idempotencia con requestId para operaciones críticas
  
  try {
    // Enrutar según la acción solicitada
    let result;
    
    // Auth
    if (action === ACTIONS.AUTH_CHECK || action === ACTIONS.AUTH_ME) {
      result = handleAuthAction(action, payload, userEmail);
    }
    // Dashboard
    else if (action === 'getDashboardData') {
      // getDashboardData ya retorna createSuccessResponse, retornar directamente
      return getDashboardData();
    }
    // Stalled Inventory
    else if (action === 'getStalledInventory') {
      return getStalledInventory();
    }
    else if (action === 'applyStalledDiscount') {
      return applyStalledDiscount(payload.productId, payload.discountPercent, payload.newPrice);
    }
    else if (action === 'transferStalledProduct') {
      return transferStalledProduct(payload.productId, payload.destination, payload.quantity, payload.notes);
    }
    else if (action === 'markForLiquidation') {
      return markForLiquidation(payload.productId);
    }
    // System Settings
    else if (action === 'getSystemSettings') {
      return getSystemSettings();
    }
    else if (action === 'updateSystemSettings') {
      return updateSystemSettings(payload, userEmail);
    }
    // Productos (incluyendo acciones sin prefijo para compatibilidad con DataTables)
    else if (action.startsWith('product/') || action === 'getProducts' || action === 'getProduct' || 
             action === 'getProductByBarcode' || action === 'searchProducts' || 
             action === 'createProduct' || action === 'updateProduct') {
      result = handleProductAction(action, payload, userEmail);
    }
    // Inventario
    else if (action.startsWith('stock/') || action.startsWith('movement/') || action === 'getInventoryReport') {
      result = handleInventoryAction(action, payload, userEmail, requestId);
    }
    // POS
    else if (action.startsWith('sale/')) {
      result = handleSaleAction(action, payload, userEmail, requestId);
    }
    // Clientes (incluyendo acciones sin prefijo para compatibilidad con DataTables)
    else if (action.startsWith('client/') || action === 'getClients' || action === 'getClient' || 
             action === 'getClientByDNI' || action === 'searchClients') {
      result = handleClientAction(action, payload, userEmail);
    }
    // Crédito y Cobranzas (incluyendo acciones de Collections)
    else if (action.startsWith('payment/') || action.startsWith('installment/') ||
             action === 'getOverdueInstallments' || action === 'getTodayInstallments' ||
             action === 'getWeekInstallments' || action === 'getCollectionsSummary' ||
             action === 'getClientPendingInstallments' || action === 'registerPayment' ||
             action === 'generateReceipt') {
      // handleCreditAction ya retorna createSuccessResponse, retornar directamente
      return handleCreditAction(action, payload, userEmail, requestId);
    }
    // Caja
    else if (action.startsWith('shift/') || action.startsWith('expense/')) {
      result = handleCashAction(action, payload, userEmail, requestId);
    }
    // Reportes
    else if (action.startsWith('report/')) {
      result = handleReportAction(action, payload, userEmail);
    }
    // Facturación
    else if (action.startsWith('invoice/')) {
      result = handleInvoiceAction(action, payload, userEmail);
    }
    // Acción no reconocida
    else {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Acción no reconocida: ' + action,
        { action: action }
      );
    }
    
    // Retornar respuesta exitosa
    return createSuccessResponse(result);
    
  } catch (error) {
    Logger.log('Error in routePost: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    // Si es un error de negocio, retornar con código específico
    if (error.code) {
      return createErrorResponse(error.code, error.message, error.details);
    }
    
    // Error genérico del sistema
    return createErrorResponse(
      ERROR_CODES.SYSTEM_ERROR,
      'Error al procesar la solicitud',
      { originalError: error.message }
    );
  }
}

/**
 * parseUrlParams - Parsea y sanitiza parámetros de URL
 * 
 * @param {Object} params - Parámetros de URL sin procesar
 * @returns {Object} Parámetros parseados y sanitizados
 */
function parseUrlParams(params) {
  if (!params) {
    return {};
  }
  
  const parsed = {};
  
  // Parsear cada parámetro
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      let value = params[key];
      
      // Sanitizar strings (trim y limitar longitud)
      if (typeof value === 'string') {
        value = value.trim();
        if (value.length > LIMITS.MAX_STRING_LENGTH) {
          value = value.substring(0, LIMITS.MAX_STRING_LENGTH);
        }
      }
      
      parsed[key] = value;
    }
  }
  
  return parsed;
}

// ============================================================================
// HANDLERS DE ACCIONES (Stubs - se implementarán en siguientes tareas)
// ============================================================================

/**
 * handleAuthAction - Maneja acciones de autenticación
 */
function handleAuthAction(action, payload, userEmail) {
  // Stub - retornar información básica del usuario
  return {
    action: action,
    user: userEmail,
    authenticated: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * handleProductAction - Maneja acciones de productos
 */
function handleProductAction(action, payload, userEmail) {
  const productRepo = new ProductRepository();
  
  try {
    // Listar todos los productos
    if (action === 'getProducts') {
      const products = productRepo.findAll();
      
      // Aplicar filtros si se proporcionan
      let filteredProducts = products;
      
      if (payload && payload.category) {
        filteredProducts = filteredProducts.filter(function(p) {
          return p.category === payload.category;
        });
      }
      
      if (payload && payload.status !== undefined && payload.status !== '') {
        const statusFilter = payload.status === 'true' || payload.status === true;
        filteredProducts = filteredProducts.filter(function(p) {
          return p.active === statusFilter;
        });
      }
      
      return filteredProducts;
    }
    
    // Buscar producto por ID
    else if (action === 'getProduct') {
      if (!payload || !payload.id) {
        throw new Error('ID de producto es requerido');
      }
      
      const product = productRepo.findById(payload.id);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      
      return product;
    }
    
    // Buscar producto por código de barras
    else if (action === 'getProductByBarcode') {
      if (!payload || !payload.barcode) {
        throw new Error('Código de barras es requerido');
      }
      
      const product = productRepo.findByBarcode(payload.barcode);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      
      return product;
    }
    
    // Buscar productos (search)
    else if (action === 'searchProducts') {
      if (!payload || !payload.query) {
        return [];
      }
      
      return productRepo.search(payload.query);
    }
    
    // Crear producto
    else if (action === 'createProduct') {
      if (!payload) {
        throw new Error('Datos del producto son requeridos');
      }
      
      // Validar código de barras único
      if (payload.barcode) {
        const existing = productRepo.findByBarcode(payload.barcode);
        if (existing) {
          throw new Error('Ya existe un producto con ese código de barras');
        }
      }
      
      // Generar ID
      payload.id = 'prod-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
      payload.created_at = new Date();
      payload.updated_at = new Date();
      
      const created = productRepo.create(payload);
      
      // Auditar creación
      const auditRepo = new AuditRepository();
      auditRepo.log('CREATE_PRODUCT', 'PRODUCT', created.id, null, payload, userEmail);
      
      return created;
    }
    
    // Actualizar producto
    else if (action === 'updateProduct') {
      if (!payload || !payload.id) {
        throw new Error('ID de producto es requerido');
      }
      
      const existing = productRepo.findById(payload.id);
      if (!existing) {
        throw new Error('Producto no encontrado');
      }
      
      // Validar código de barras único (si cambió)
      if (payload.barcode && payload.barcode !== existing.barcode) {
        const duplicate = productRepo.findByBarcode(payload.barcode);
        if (duplicate && duplicate.id !== payload.id) {
          throw new Error('Ya existe otro producto con ese código de barras');
        }
      }
      
      payload.updated_at = new Date();
      
      const updated = productRepo.update(payload.id, payload);
      
      // Auditar actualización (especialmente cambios de precio)
      if (existing.price !== payload.price) {
        const auditRepo = new AuditRepository();
        auditRepo.log(
          'UPDATE_PRODUCT_PRICE',
          'PRODUCT',
          payload.id,
          { price: existing.price },
          { price: payload.price },
          userEmail
        );
      }
      
      return updated;
    }
    
    else {
      throw new Error('Acción de producto no reconocida: ' + action);
    }
    
  } catch (error) {
    Logger.log('Error en handleProductAction: ' + error.message);
    throw error;
  }
}

/**
 * handleInventoryAction - Maneja acciones de inventario
 */
function handleInventoryAction(action, payload, userEmail, requestId) {
  try {
    // Generar reporte de inventario
    if (action === 'getInventoryReport') {
      const warehouseId = payload.warehouseId || null;
      // getInventoryReport ya retorna createSuccessResponse, extraer solo data
      const response = getInventoryReport(warehouseId);
      // Como getInventoryReport retorna TextOutput, necesitamos parsear
      const parsed = JSON.parse(response.getContent());
      return parsed.data;
    }
    
    // Otras acciones de inventario (stub)
    return {
      action: action,
      message: 'Funcionalidad de inventario pendiente de implementación'
    };
    
  } catch (error) {
    Logger.log('Error en handleInventoryAction: ' + error.message);
    throw error;
  }
}

/**
 * handleSaleAction - Maneja acciones de ventas
 */
function handleSaleAction(action, payload, userEmail, requestId) {
  // Stub - se implementará con POSService
  return {
    action: action,
    message: 'Funcionalidad de POS pendiente de implementación'
  };
}

/**
 * handleClientAction - Maneja acciones de clientes
 */
function handleClientAction(action, payload, userEmail) {
  const clientRepo = new ClientRepository();
  
  try {
    // Listar todos los clientes
    if (action === 'getClients') {
      const clients = clientRepo.findAll();
      
      // Aplicar filtros si se proporcionan
      let filteredClients = clients;
      
      // Filtro por búsqueda (DNI, nombre o teléfono)
      if (payload && payload.search) {
        filteredClients = clientRepo.search(payload.search);
      }
      
      // Filtro por estado
      if (payload && payload.status !== undefined && payload.status !== '') {
        const statusFilter = payload.status === 'true' || payload.status === true;
        filteredClients = filteredClients.filter(function(c) {
          return c.active === statusFilter;
        });
      }
      
      // CRÍTICO: safeResponse se encarga de convertir fechas automáticamente
      // No necesitamos normalización manual
      return filteredClients;
    }
    
    // Buscar cliente por ID
    else if (action === 'getClient') {
      if (!payload || !payload.id) {
        throw new Error('ID de cliente es requerido');
      }
      
      const client = clientRepo.findById(payload.id);
      
      if (!client) {
        throw new Error('Cliente no encontrado');
      }
      
      return client;
    }
    
    // Buscar cliente por DNI
    else if (action === 'getClientByDNI') {
      if (!payload || !payload.dni) {
        throw new Error('DNI es requerido');
      }
      
      const client = clientRepo.findByDNI(payload.dni);
      
      if (!client) {
        throw new Error('Cliente no encontrado');
      }
      
      return client;
    }
    
    // Buscar clientes (search)
    else if (action === 'searchClients') {
      if (!payload || !payload.query) {
        return [];
      }
      
      return clientRepo.search(payload.query);
    }
    
    // Crear cliente
    else if (action === 'createClient' || action === 'client/create') {
      if (!payload) {
        throw new Error('Datos del cliente son requeridos');
      }
      
      // Validar campos requeridos
      if (!payload.dni || !payload.name || !payload.phone) {
        throw new Error('DNI, nombre y teléfono son requeridos');
      }
      
      // Verificar que el DNI no exista
      const existingClient = clientRepo.findByDNI(payload.dni);
      if (existingClient) {
        throw new Error('Ya existe un cliente con ese DNI');
      }
      
      // Preparar datos del cliente
      const clientData = {
        dni: payload.dni,
        name: payload.name,
        phone: payload.phone,
        email: payload.email || '',
        address: payload.address || '',
        lat: payload.lat || null,
        lng: payload.lng || null,
        credit_limit: parseFloat(payload.credit_limit) || 0,
        credit_used: 0,
        dni_photo_url: payload.dni_photo_url || '',
        birthday: payload.birthday ? new Date(payload.birthday) : null,
        active: payload.active !== undefined ? payload.active : true
      };
      
      const newClient = clientRepo.create(clientData);
      
      // Auditar creación
      const auditRepo = new AuditRepository();
      auditRepo.log(
        'CREATE_CLIENT',
        'CLIENT',
        newClient.id,
        {},
        newClient,
        userEmail
      );
      
      return newClient;
    }
    
    // Actualizar cliente
    else if (action === 'updateClient' || action === 'client/update') {
      if (!payload || !payload.id) {
        throw new Error('ID del cliente es requerido');
      }
      
      // Obtener cliente actual
      const currentClient = clientRepo.findById(payload.id);
      if (!currentClient) {
        throw new Error('Cliente no encontrado');
      }
      
      // Si se está cambiando el DNI, verificar que no exista
      if (payload.dni && payload.dni !== currentClient.dni) {
        const existingClient = clientRepo.findByDNI(payload.dni);
        if (existingClient) {
          throw new Error('Ya existe un cliente con ese DNI');
        }
      }
      
      // Preparar datos actualizados
      const updateData = {
        dni: payload.dni || currentClient.dni,
        name: payload.name || currentClient.name,
        phone: payload.phone || currentClient.phone,
        email: payload.email !== undefined ? payload.email : currentClient.email,
        address: payload.address !== undefined ? payload.address : currentClient.address,
        lat: payload.lat !== undefined ? payload.lat : currentClient.lat,
        lng: payload.lng !== undefined ? payload.lng : currentClient.lng,
        credit_limit: payload.credit_limit !== undefined ? parseFloat(payload.credit_limit) : currentClient.credit_limit,
        credit_used: currentClient.credit_used, // No se modifica manualmente
        dni_photo_url: payload.dni_photo_url !== undefined ? payload.dni_photo_url : currentClient.dni_photo_url,
        birthday: payload.birthday !== undefined ? (payload.birthday ? new Date(payload.birthday) : null) : currentClient.birthday,
        active: payload.active !== undefined ? payload.active : currentClient.active
      };
      
      const updatedClient = clientRepo.update(payload.id, updateData);
      
      // Auditar actualización
      const auditRepo = new AuditRepository();
      auditRepo.log(
        'UPDATE_CLIENT',
        'CLIENT',
        payload.id,
        currentClient,
        updatedClient,
        userEmail
      );
      
      return updatedClient;
    }
    
    // Acción no reconocida
    else {
      throw new Error('Acción de cliente no reconocida: ' + action);
    }
    
  } catch (error) {
    Logger.log('Error en handleClientAction: ' + error.message);
    throw error;
  }
}

/**
 * handleCreditAction - Maneja acciones de crédito y cobranzas
 */
function handleCreditAction(action, payload, userEmail, requestId) {
  try {
    // Obtener cuotas vencidas
    if (action === 'getOverdueInstallments') {
      const installmentRepo = new InstallmentRepository();
      const overdueInstallments = installmentRepo.findOverdue();
      
      // Convertir a formato para DataTables
      const data = overdueInstallments.map(function(inst) {
        return {
          id: inst.id,
          plan_id: inst.plan_id,
          client_id: inst.client_id,
          client_name: inst.client_name || 'Cliente',
          installment_number: inst.installment_number,
          amount: parseFloat(inst.amount) || 0,
          paid_amount: parseFloat(inst.paid_amount) || 0,
          balance: parseFloat(inst.balance) || parseFloat(inst.amount) || 0,
          due_date: inst.due_date,
          status: inst.status,
          days_overdue: calculateDaysOverdue(inst.due_date)
        };
      });
      
      return createSuccessResponse(data);
    }
    
    // Obtener cuotas que vencen hoy
    else if (action === 'getTodayInstallments') {
      const installmentRepo = new InstallmentRepository();
      const todayInstallments = installmentRepo.findDueToday();
      
      const data = todayInstallments.map(function(inst) {
        return {
          id: inst.id,
          plan_id: inst.plan_id,
          client_id: inst.client_id,
          client_name: inst.client_name || 'Cliente',
          installment_number: inst.installment_number,
          amount: parseFloat(inst.amount) || 0,
          paid_amount: parseFloat(inst.paid_amount) || 0,
          balance: parseFloat(inst.balance) || parseFloat(inst.amount) || 0,
          due_date: inst.due_date,
          status: inst.status
        };
      });
      
      return createSuccessResponse(data);
    }
    
    // Obtener cuotas que vencen esta semana
    else if (action === 'getWeekInstallments') {
      const installmentRepo = new InstallmentRepository();
      const weekInstallments = installmentRepo.findDueThisWeek();
      
      const data = weekInstallments.map(function(inst) {
        return {
          id: inst.id,
          plan_id: inst.plan_id,
          client_id: inst.client_id,
          client_name: inst.client_name || 'Cliente',
          installment_number: inst.installment_number,
          amount: parseFloat(inst.amount) || 0,
          paid_amount: parseFloat(inst.paid_amount) || 0,
          balance: parseFloat(inst.balance) || parseFloat(inst.amount) || 0,
          due_date: inst.due_date,
          status: inst.status
        };
      });
      
      return createSuccessResponse(data);
    }
    
    // Obtener resumen de cobranzas
    else if (action === 'getCollectionsSummary') {
      const installmentRepo = new InstallmentRepository();
      
      const overdueInstallments = installmentRepo.findOverdue();
      const todayInstallments = installmentRepo.findDueToday();
      const weekInstallments = installmentRepo.findDueThisWeek();
      
      // Calcular totales
      let overdueAmount = 0;
      overdueInstallments.forEach(function(inst) {
        overdueAmount += parseFloat(inst.balance) || parseFloat(inst.amount) || 0;
      });
      
      let todayAmount = 0;
      todayInstallments.forEach(function(inst) {
        todayAmount += parseFloat(inst.balance) || parseFloat(inst.amount) || 0;
      });
      
      let weekAmount = 0;
      weekInstallments.forEach(function(inst) {
        weekAmount += parseFloat(inst.balance) || parseFloat(inst.amount) || 0;
      });
      
      const summary = {
        overdue: {
          count: overdueInstallments.length,
          amount: overdueAmount
        },
        today: {
          count: todayInstallments.length,
          amount: todayAmount
        },
        week: {
          count: weekInstallments.length,
          amount: weekAmount
        }
      };
      
      return createSuccessResponse(summary);
    }
    
    // Obtener cuotas pendientes de un cliente
    else if (action === 'getClientPendingInstallments') {
      const clientId = payload.clientId;
      if (!clientId) {
        return createErrorResponse('VALIDATION_ERROR', 'clientId es requerido');
      }
      
      const installmentRepo = new InstallmentRepository();
      const allInstallments = installmentRepo.findAll();
      
      // Filtrar por cliente y estado pendiente
      const clientInstallments = allInstallments.filter(function(inst) {
        return inst.client_id === clientId && 
               (inst.status === 'PENDING' || inst.status === 'PARTIAL' || inst.status === 'OVERDUE');
      });
      
      const data = clientInstallments.map(function(inst) {
        return {
          id: inst.id,
          plan_id: inst.plan_id,
          installment_number: inst.installment_number,
          amount: parseFloat(inst.amount) || 0,
          paid_amount: parseFloat(inst.paid_amount) || 0,
          balance: parseFloat(inst.balance) || parseFloat(inst.amount) || 0,
          due_date: inst.due_date,
          status: inst.status
        };
      });
      
      return createSuccessResponse(data);
    }
    
    // Registrar pago
    else if (action === 'registerPayment') {
      // TODO: Implementar con CreditService
      throw new Error('Funcionalidad de pagos será implementada en el siguiente milestone');
    }
    
    // Generar recibo de pago
    else if (action === 'generateReceipt') {
      // TODO: Implementar generación de recibo
      throw new Error('Funcionalidad de recibos será implementada en el siguiente milestone');
    }
    
    // Acción no reconocida
    else {
      return createErrorResponse(
        'INVALID_ACTION',
        'Acción de crédito no reconocida: ' + action
      );
    }
    
  } catch (error) {
    Logger.log('Error en handleCreditAction: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    
    return createErrorResponse(
      'CREDIT_ACTION_ERROR',
      'Error al procesar acción de crédito: ' + error.message
    );
  }
}

/**
 * Calcula días de atraso de una cuota
 */
function calculateDaysOverdue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let due = dueDate;
  if (typeof due === 'string') {
    due = new Date(due);
  }
  due.setHours(0, 0, 0, 0);
  
  if (due >= today) {
    return 0;
  }
  
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * handleCashAction - Maneja acciones de caja
 */
function handleCashAction(action, payload, userEmail, requestId) {
  // Stub - se implementará con CashService
  return {
    action: action,
    message: 'Funcionalidad de caja pendiente de implementación'
  };
}

/**
 * handleReportAction - Maneja acciones de reportes
 */
function handleReportAction(action, payload, userEmail) {
  // Stub - se implementará con ReportService
  return {
    action: action,
    message: 'Funcionalidad de reportes pendiente de implementación'
  };
}

/**
 * handleInvoiceAction - Maneja acciones de facturación
 */
function handleInvoiceAction(action, payload, userEmail) {
  // Stub - se implementará con InvoiceService
  return {
    action: action,
    message: 'Funcionalidad de facturación pendiente de implementación'
  };
}

// ============================================================================
// RENDERIZADORES DE PÁGINAS (Stubs - se implementarán en siguientes tareas)
// ============================================================================

/**
 * renderDashboard - Renderiza la página de dashboard
 * 
 * Utiliza el layout base con currentPage='dashboard'
 * 
 * @param {Object} userData - Datos del usuario {email, name, roles}
 * @param {Object} params - Parámetros de URL
 * @returns {HtmlOutput} Página HTML renderizada
 */
function renderDashboard(userData, params) {
  return renderBasePage(userData, 'dashboard');
}

/**
 * renderBasePage - Función base para renderizar cualquier página con el layout principal
 * 
 * @param {Object} userData - Datos del usuario {email, name, roles}
 * @param {string} pageName - Nombre de la página actual
 * @returns {HtmlOutput} Página HTML renderizada
 */
function renderBasePage(userData, pageName) {
  try {
    Logger.log('=== renderBasePage ===');
    Logger.log('Page: ' + pageName);
    Logger.log('User: ' + userData.email);
    
    // Cargar el template HTML desde gas/index.html
    const template = HtmlService.createTemplateFromFile('index');
    
    // Pasar datos del usuario al template - CRÍTICO: establecer antes de evaluate()
    template.userName = userData.name;
    template.userEmail = userData.email;
    template.userRoles = JSON.stringify(userData.roles);
    template.currentPage = pageName; // IMPORTANTE: Debe estar antes de evaluate()
    
    // NUEVO: Pasar la URL correcta del script desplegado
    template.scriptUrl = ScriptApp.getService().getUrl();
    
    Logger.log('Template variables set. Evaluating...');
    Logger.log('Script URL: ' + template.scriptUrl);
    
    // Evaluar el template
    const html = template.evaluate();
    
    // Configurar propiedades de la página
    const pageTitle = getPageTitle(pageName);
    html.setTitle(pageTitle + ' - Adiction Boutique Suite');
    html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    Logger.log('Page rendered successfully: ' + pageTitle);
    
    return html;
    
  } catch (error) {
    Logger.log('ERROR en renderBasePage: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    Logger.log('Page name: ' + pageName);
    Logger.log('User email: ' + userData.email);
    
    // Fallback a página simple si hay error cargando el template
    return createWelcomePage(userData.email);
  }
}

/**
 * getPageTitle - Obtiene el título de la página según el nombre
 * 
 * @param {string} pageName - Nombre de la página
 * @returns {string} Título de la página
 */
function getPageTitle(pageName) {
  const titles = {
    'dashboard': 'Dashboard',
    'pos': 'Punto de Venta',
    'barcode-scanner': 'Escanear Código de Barras',
    'inventory': 'Inventario',
    'clients': 'Clientes',
    'collections': 'Cobranzas',
    'cash': 'Caja',
    'reports': 'Reportes',
    'invoices': 'Facturas',
    'settings': 'Configuración'
  };
  
  return titles[pageName] || 'Adiction Boutique';
}

/**
 * renderPOS - Renderiza la página de punto de venta
 * 
 * Requisitos: 6.1, 6.3, 21.2
 */
function renderPOS(userData, params) {
  return renderBasePage(userData, 'pos');
}

/**
 * renderBarcodeScanner - Renderiza la página de escaneo de códigos de barras
 * 
 * Requisitos: 6.2, 22.1, 22.2, 22.3, 22.4, 22.5
 */
function renderBarcodeScanner(userData, params) {
  return renderBasePage(userData, 'barcode-scanner');
}

/**
 * renderInventory - Renderiza la página de inventario
 */
function renderInventory(userData, params) {
  return renderBasePage(userData, 'inventory');
}

/**
 * renderClients - Renderiza la página de clientes
 */
function renderClients(userData, params) {
  return renderBasePage(userData, 'clients');
}

/**
 * renderProducts - Renderiza la página de productos
 */
function renderProducts(userData, params) {
  return renderBasePage(userData, 'products');
}

/**
 * renderClientForm - Renderiza el formulario de cliente
 */
function renderClientForm(userData, params) {
  return renderBasePage(userData, 'cliente-form');
}

/**
 * renderCollections - Renderiza la página de cobranzas
 */
function renderCollections(userData, params) {
  return renderBasePage(userData, 'collections');
}

/**
 * renderCash - Renderiza la página de caja
 */
function renderCash(userData, params) {
  return renderBasePage(userData, 'cash');
}

/**
 * renderReports - Renderiza la página de reportes
 */
function renderReports(userData, params) {
  return renderBasePage(userData, 'reports');
}

/**
 * renderInvoices - Renderiza la página de facturas
 */
function renderInvoices(userData, params) {
  return renderBasePage(userData, 'invoices');
}

/**
 * renderSettings - Renderiza la página de configuración
 */
function renderSettings(userData, params) {
  return renderBasePage(userData, 'settings');
}

/**
 * renderStalledInventory - Renderiza la página de mercadería estancada
 */
function renderStalledInventory(userData, params) {
  return renderBasePage(userData, 'stalled-inventory');
}

/**
 * renderSuppliers - Renderiza la página de proveedores
 */
function renderSuppliers(userData, params) {
  return renderBasePage(userData, 'suppliers');
}

/**
 * renderPurchases - Renderiza la página de compras
 */
function renderPurchases(userData, params) {
  return renderBasePage(userData, 'purchases');
}

/**
 * renderProductForm - Renderiza el formulario de producto
 */
function renderProductForm(userData, params) {
  return renderBasePage(userData, 'producto-form');
}

/**
 * renderBulkProductEntry - Renderiza el formulario de ingreso masivo
 */
function renderBulkProductEntry(userData, params) {
  return renderBasePage(userData, 'bulk-entry');
}


/**
 * renderManualLogin - Renderiza página de login manual
 * 
 * Permite al usuario ingresar su email manualmente cuando
 * Google Apps Script no puede detectar el email automáticamente.
 * 
 * @param {string} attemptedEmail - Email que se intentó usar (opcional)
 * @param {string} errorMessage - Mensaje de error (opcional)
 * @returns {HtmlOutput} Página HTML de login manual
 */
function renderManualLogin(attemptedEmail, errorMessage) {
  const html = `
    <!DOCTYPE html>
    <html lang="es-PE">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Iniciar Sesión - Adiction Boutique Suite</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.min.css">
      <style>
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .login-container {
          background-color: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
          width: 100%;
        }
        .icon-container {
          text-align: center;
          font-size: 4rem;
          color: #667eea;
          margin-bottom: 1.5rem;
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.8rem;
          text-align: center;
        }
        .form-control {
          padding: 0.75rem;
          font-size: 1rem;
          border-radius: 8px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
          width: 100%;
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
        .alert-custom {
          background-color: #f8d7da;
          border-left: 4px solid #dc3545;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }
        .info-box {
          background-color: #d1ecf1;
          border-left: 4px solid #17a2b8;
          padding: 1rem;
          border-radius: 4px;
          margin-top: 1.5rem;
          font-size: 0.9rem;
        }
        .loading {
          display: none;
          text-align: center;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="icon-container">
          <i class="bi bi-person-circle"></i>
        </div>
        
        <h1>Iniciar Sesión</h1>
        
        ${errorMessage ? `
        <div class="alert-custom">
          <strong><i class="bi bi-exclamation-triangle"></i> Error:</strong>
          <p class="mb-0 mt-1">${errorMessage}</p>
        </div>
        ` : ''}
        
        ${attemptedEmail ? `
        <div class="alert-custom">
          <strong>Email detectado:</strong> ${attemptedEmail}<br>
          <small>Este email no está autorizado. Intente con otro.</small>
        </div>
        ` : ''}
        
        <form id="loginForm">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" name="email" 
                   placeholder="Ingrese su email" required
                   value="${attemptedEmail || ''}">
          </div>
          
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
          </button>
          
          <div class="loading">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Verificando acceso...</p>
          </div>
        </form>
        
        <div class="info-box">
          <strong><i class="bi bi-info-circle"></i> Usuarios Autorizados:</strong>
          <ul class="mb-0 mt-2">
            <li>gianpepex@gmail.com</li>
            <li>karianaghostimporter@gmail.com</li>
            <li>admin@adictionboutique.com</li>
            <li>vendedor.mujeres@adictionboutique.com</li>
            <li>vendedor.hombres@adictionboutique.com</li>
            <li>cobrador@adictionboutique.com</li>
          </ul>
        </div>
        
        <p class="text-muted mt-4 text-center" style="font-size: 0.85rem;">
          Adiction Boutique Suite v${SYSTEM_VERSION}
        </p>
      </div>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const email = document.getElementById('email').value.trim();
          
          if (!email) {
            alert('Por favor ingrese un email');
            return;
          }
          
          // Mostrar loading
          document.querySelector('.btn-primary').style.display = 'none';
          document.querySelector('.loading').style.display = 'block';
          
          // Redirigir con el email en la URL
          const currentUrl = window.location.href.split('?')[0];
          const newUrl = currentUrl + '?sessionEmail=' + encodeURIComponent(email);
          
          window.location.href = newUrl;
        });
        
        // Auto-focus en el campo email
        document.getElementById('email').focus();
      </script>
    </body>
    </html>
  `;
  
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Iniciar Sesión - Adiction Boutique Suite')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * renderAccessDenied - Renderiza la página de acceso denegado
 * 
 * Se muestra cuando un usuario no está en la allowlist o su cuenta
 * está inactiva.
 * 
 * Requisitos: 1.2 - Denegar acceso y mostrar mensaje de error
 * 
 * @param {string} userEmail - Email del usuario que intentó acceder
 * @returns {HtmlOutput} Página HTML de acceso denegado
 */
function renderAccessDenied(userEmail) {
  const html = `
    <!DOCTYPE html>
    <html lang="es-PE">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Acceso Denegado - Adiction Boutique Suite</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.min.css">
      <style>
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .access-denied-container {
          background-color: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
          text-align: center;
        }
        .icon-container {
          font-size: 5rem;
          color: #dc3545;
          margin-bottom: 1.5rem;
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        .user-info {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          font-size: 0.9rem;
        }
        .alert-custom {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 1rem;
          border-radius: 4px;
          text-align: left;
          margin-top: 1.5rem;
        }
        .alert-custom strong {
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="access-denied-container">
        <div class="icon-container">
          <i class="bi bi-shield-x"></i>
        </div>
        
        <h1>Acceso Denegado</h1>
        
        <p class="text-muted">
          Su cuenta no tiene autorización para acceder a este sistema.
        </p>
        
        <div class="user-info">
          <strong>Usuario:</strong> ${userEmail}
        </div>
        
        <div class="alert-custom">
          <strong><i class="bi bi-info-circle"></i> ¿Necesita acceso?</strong>
          <p class="mb-0 mt-2">
            Por favor, contacte al administrador del sistema para solicitar 
            que su cuenta sea agregada a la lista de usuarios autorizados.
          </p>
        </div>
        
        <p class="text-muted mt-4" style="font-size: 0.85rem;">
          Adiction Boutique Suite v${SYSTEM_VERSION}
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Acceso Denegado')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * renderLogout - Renderiza la página de logout
 * 
 * Muestra un mensaje de confirmación de cierre de sesión.
 * Nota: En Google Apps Script, el logout real se maneja a nivel de cuenta Google.
 * 
 * @param {string} userEmail - Email del usuario que cerró sesión
 * @returns {HtmlOutput} Página HTML de logout
 */
function renderLogout(userEmail) {
  const html = `
    <!DOCTYPE html>
    <html lang="es-PE">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Sesión Cerrada - Adiction Boutique Suite</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.min.css">
      <style>
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .logout-container {
          background-color: white;
          padding: 3rem;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          max-width: 500px;
          text-align: center;
        }
        .icon-container {
          font-size: 5rem;
          color: #28a745;
          margin-bottom: 1.5rem;
        }
        h1 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        .btn-primary {
          margin-top: 1.5rem;
          padding: 0.75rem 2rem;
        }
      </style>
    </head>
    <body>
      <div class="logout-container">
        <div class="icon-container">
          <i class="bi bi-check-circle"></i>
        </div>
        
        <h1>Sesión Cerrada</h1>
        
        <p class="text-muted">
          Ha cerrado sesión exitosamente del sistema.
        </p>
        
        <p class="text-muted">
          <strong>Usuario:</strong> ${userEmail}
        </p>
        
        <a href="?" class="btn btn-primary">
          <i class="bi bi-box-arrow-in-right"></i> Volver a Iniciar Sesión
        </a>
        
        <p class="text-muted mt-4" style="font-size: 0.85rem;">
          Adiction Boutique Suite v${SYSTEM_VERSION}
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Sesión Cerrada')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * createPlaceholderPage - Crea una página placeholder para módulos pendientes
 */
function createPlaceholderPage(moduleName, userEmail) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${moduleName} - Adiction Boutique Suite</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        .info {
          background-color: #e3f2fd;
          padding: 15px;
          border-left: 4px solid #2196f3;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .back-link {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #2196f3;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        .back-link:hover {
          background-color: #1976d2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📋 ${moduleName}</h1>
        
        <div class="info">
          <strong>Usuario:</strong> ${userEmail}<br>
          <strong>Estado:</strong> Módulo en desarrollo
        </div>
        
        <p>
          Este módulo está pendiente de implementación en las siguientes iteraciones.
        </p>
        
        <a href="?page=dashboard" class="back-link">← Volver al Dashboard</a>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService
    .createHtmlOutput(html)
    .setTitle(moduleName + ' - Adiction Boutique Suite')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * createSuccessResponse - Crea una respuesta de éxito estándar
 * 
 * @param {Object} data - Datos a retornar
 * @returns {TextOutput} Respuesta JSON
 */
function createSuccessResponse(data) {
  const response = {
    ok: true,
    data: data,
    error: null
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * createErrorResponse - Crea una respuesta de error estándar
 * 
 * @param {string} code - Código de error
 * @param {string} message - Mensaje descriptivo
 * @param {Object} details - Detalles adicionales del error
 * @returns {TextOutput} Respuesta JSON
 */
function createErrorResponse(code, message, details) {
  const response = {
    ok: false,
    data: null,
    error: {
      code: code,
      message: message,
      details: details
    }
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * createWelcomePage - Crea una página de bienvenida básica
 * 
 * @param {string} userEmail - Email del usuario
 * @returns {HtmlOutput} Página HTML
 */
function createWelcomePage(userEmail) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Adiction Boutique Suite</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        .version {
          color: #666;
          font-size: 14px;
          margin-bottom: 30px;
        }
        .user-info {
          background-color: #e3f2fd;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .status {
          color: #4caf50;
          font-weight: bold;
        }
        .info {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }
        .info h3 {
          margin-top: 0;
          color: #856404;
        }
        .info ul {
          margin-bottom: 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🛍️ Adiction Boutique Suite</h1>
        <div class="version">Versión ${SYSTEM_VERSION}</div>
        
        <div class="user-info">
          <strong>Usuario:</strong> ${userEmail}<br>
          <strong>Estado:</strong> <span class="status">✓ Conectado</span>
        </div>
        
        <div class="info">
          <h3>⚙️ Configuración Pendiente</h3>
          <p>El sistema está en fase de configuración inicial. Pasos necesarios:</p>
          <ul>
            <li>Actualizar SPREADSHEET_ID en Const.gs</li>
            <li>Crear las hojas de Google Sheets</li>
            <li>Configurar la allowlist de usuarios</li>
            <li>Implementar el router y servicios</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          <strong>Nota:</strong> Esta es una página temporal. La interfaz completa 
          se implementará en las siguientes iteraciones.
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Adiction Boutique Suite')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * createErrorPage - Crea una página de error
 * 
 * @param {string} errorMessage - Mensaje de error
 * @returns {HtmlOutput} Página HTML
 */
function createErrorPage(errorMessage) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Error - Adiction Boutique Suite</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #d32f2f;
          margin-bottom: 20px;
        }
        .error-message {
          background-color: #ffebee;
          padding: 15px;
          border-left: 4px solid #d32f2f;
          border-radius: 4px;
          color: #c62828;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>❌ Error</h1>
        <div class="error-message">
          ${errorMessage}
        </div>
        <p style="margin-top: 20px; color: #666;">
          Por favor, contacte al administrador del sistema si el problema persiste.
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Error')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * testDoGet - Función de prueba para doGet
 * Ejecutar desde el editor de Apps Script para probar
 */
function testDoGet() {
  const e = {
    parameter: {
      page: 'dashboard'
    }
  };
  
  const result = doGet(e);
  Logger.log('Test doGet result: ' + result.getContent().substring(0, 200) + '...');
  return result;
}

/**
 * testDoPost - Función de prueba para doPost
 * Ejecutar desde el editor de Apps Script para probar
 */
function testDoPost() {
  const e = {
    postData: {
      contents: JSON.stringify({
        action: 'auth/me',
        payload: {},
        requestId: 'test-' + new Date().getTime()
      })
    }
  };
  
  const result = doPost(e);
  Logger.log('Test doPost result: ' + result.getContent());
  return result;
}

/**
 * testRouteGet - Prueba el router GET con diferentes páginas
 */
function testRouteGet() {
  const pages = ['dashboard', 'pos', 'inventory', 'clients', 'invalid-page'];
  
  pages.forEach(function(page) {
    Logger.log('Testing page: ' + page);
    const e = { parameter: { page: page } };
    const result = doGet(e);
    Logger.log('Result for ' + page + ': ' + (result ? 'OK' : 'FAIL'));
  });
}

/**
 * testRoutePost - Prueba el router POST con diferentes acciones
 */
function testRoutePost() {
  const actions = [
    'auth/me',
    'product/list',
    'sale/create',
    'invalid/action'
  ];
  
  actions.forEach(function(action) {
    Logger.log('Testing action: ' + action);
    const e = {
      postData: {
        contents: JSON.stringify({
          action: action,
          payload: { test: true },
          requestId: 'test-' + new Date().getTime()
        })
      }
    };
    const result = doPost(e);
    const response = JSON.parse(result.getContent());
    Logger.log('Result for ' + action + ': ' + (response.ok ? 'OK' : 'ERROR - ' + response.error.code));
  });
}

/**
 * testParseUrlParams - Prueba el parseo de parámetros
 */
function testParseUrlParams() {
  const testCases = [
    { page: 'dashboard', id: '123' },
    { page: '  pos  ', filter: 'active' },
    { page: 'x'.repeat(600) }, // String muy largo
    null,
    {}
  ];
  
  testCases.forEach(function(params, index) {
    Logger.log('Test case ' + (index + 1) + ':');
    Logger.log('Input: ' + JSON.stringify(params));
    const parsed = parseUrlParams(params);
    Logger.log('Output: ' + JSON.stringify(parsed));
  });
}


// ============================================================================
// SERVER-SIDE FUNCTIONS FOR POS
// ============================================================================

/**
 * searchProducts - Busca productos por código de barras o nombre
 * 
 * @param {string} query - Término de búsqueda
 * @returns {Object} Respuesta con productos encontrados
 */
function searchProducts(query) {
  try {
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        error: 'Query es requerido'
      };
    }
    
    const productRepo = new ProductRepository();
    
    // Intentar buscar por código de barras primero
    const productByBarcode = productRepo.findByBarcode(query);
    
    if (productByBarcode) {
      return {
        success: true,
        data: [productByBarcode]
      };
    }
    
    // Si no se encuentra por código, buscar por nombre
    const products = productRepo.search(query);
    
    return {
      success: true,
      data: products
    };
    
  } catch (error) {
    Logger.log('Error in searchProducts: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * addItemToCart - Agrega un producto al carrito (validación de stock)
 * 
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad a agregar
 * @param {string} warehouseId - ID del almacén
 * @returns {Object} Respuesta con item del carrito
 */
function addItemToCart(productId, quantity, warehouseId) {
  try {
    const posService = new POSService();
    const cartId = 'temp-cart'; // Temporal, el carrito se mantiene en el cliente
    
    const cartItem = posService.addItemToCart(cartId, productId, quantity, warehouseId);
    
    return {
      success: true,
      data: cartItem
    };
    
  } catch (error) {
    Logger.log('Error in addItemToCart: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * createSale - Crea una venta (contado o crédito)
 * 
 * @param {Object} saleData - Datos de la venta
 * @param {string} requestId - ID único para idempotencia
 * @returns {Object} Respuesta con venta creada
 */
function createSale(saleData, requestId) {
  try {
    const posService = new POSService();
    
    // Si es venta a crédito, usar CreditService
    if (saleData.saleType === 'CREDITO') {
      // TODO: Implementar en siguiente milestone
      return {
        success: false,
        error: 'Ventas a crédito serán implementadas en el siguiente milestone'
      };
    }
    
    // Crear venta al contado
    const result = posService.createSale(saleData, requestId);
    
    return {
      success: true,
      data: result
    };
    
  } catch (error) {
    Logger.log('Error in createSale: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * getInventoryReport - Genera reporte de inventario
 * 
 * @param {string} warehouseId - ID del almacén (opcional)
 * @returns {Object} Reporte de inventario con safeResponse
 */
function getInventoryReport(warehouseId) {
  return wrapResponse(function() {
    Logger.log('=== getInventoryReport START ===');
    Logger.log('Warehouse ID: ' + (warehouseId || 'Todos'));
    
    const stockRepo = new StockRepository();
    const productRepo = new ProductRepository();
    
    // Obtener todos los registros de stock
    let stockRecords = stockRepo.findAll();
    
    // Filtrar por almacén si se especificó
    if (warehouseId) {
      stockRecords = stockRecords.filter(function(record) {
        return record.warehouse_id === warehouseId;
      });
    }
    
    // Construir reporte
    const inventory = [];
    let totalValue = 0;
    let lowStockCount = 0;
    
    for (let i = 0; i < stockRecords.length; i++) {
      const stockRecord = stockRecords[i];
      
      // Obtener información del producto
      const product = productRepo.findById(stockRecord.product_id);
      
      if (!product) {
        Logger.log('Producto no encontrado: ' + stockRecord.product_id);
        continue;
      }
      
      const quantity = parseFloat(stockRecord.quantity) || 0;
      const price = parseFloat(product.price) || 0;
      const value = quantity * price;
      const minStock = parseFloat(product.min_stock) || 0;
      const isLowStock = quantity < minStock;
      
      if (isLowStock) {
        lowStockCount++;
      }
      
      totalValue += value;
      
      inventory.push({
        productId: product.id,
        productName: product.name,
        category: product.category || '',
        quantity: quantity,
        price: price,
        value: value,
        minStock: minStock,
        isLowStock: isLowStock,
        warehouseId: stockRecord.warehouse_id
      });
    }
    
    const report = {
      totalProducts: inventory.length,
      totalValue: totalValue,
      lowStockCount: lowStockCount,
      inventory: inventory
    };
    
    Logger.log('Reporte generado: ' + inventory.length + ' productos');
    Logger.log('Valor total: S/ ' + totalValue.toFixed(2));
    Logger.log('Stock bajo: ' + lowStockCount);
    Logger.log('=== getInventoryReport END ===');
    
    return report;
  });
}


/**
 * getDashboardData - Obtiene datos para el dashboard
 * 
 * ACTUALIZADO: Usa wrapResponse para manejo robusto de errores
 * Requisitos: 31.2, 31.3
 * 
 * @returns {Object} Respuesta con datos del dashboard
 */
function getDashboardData() {
  return wrapResponse(function() {
    Logger.log('=== getDashboardData START ===');
    
    // Obtener fecha de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Inicializar datos con valores por defecto
    const dashboardData = {
      salesToday: 0,
      collectionsToday: 0,
      lowStockCount: 0,
      overdueCount: 0,
      recentSales: []
    };
    
    Logger.log('Datos inicializados con valores por defecto');
    
    // 1. Ventas de hoy
    try {
      Logger.log('Obteniendo ventas...');
      const saleRepo = new SaleRepository();
      const allSales = saleRepo.findAll();
      Logger.log('Total de ventas en BD: ' + allSales.length);
      
      let salesTodayTotal = 0;
      const recentSales = [];
      
      for (let i = 0; i < allSales.length; i++) {
        const sale = allSales[i];
        
        // Saltar ventas sin datos válidos
        if (!sale.id || !sale.date) {
          continue;
        }
        
        // Convertir fecha si es necesario
        let saleDate = sale.date;
        if (typeof saleDate === 'string') {
          saleDate = new Date(saleDate);
        }
        
        // Verificar si es de hoy
        if (saleDate >= today && saleDate < tomorrow) {
          salesTodayTotal += parseFloat(sale.total) || 0;
        }
        
        // Agregar a ventas recientes (últimas 10 con datos válidos)
        if (recentSales.length < 10) {
          recentSales.push({
            id: sale.id,
            date: saleDate instanceof Date ? saleDate.toISOString().split('T')[0] : saleDate,
            client: sale.client_name || 'Cliente General',
            type: sale.sale_type || 'CONTADO',
            total: parseFloat(sale.total) || 0,
            status: sale.status || 'COMPLETED'
          });
        }
      }
      
      dashboardData.salesToday = salesTodayTotal;
      dashboardData.recentSales = recentSales;
      
      Logger.log('Ventas hoy: S/ ' + salesTodayTotal);
      Logger.log('Ventas recientes válidas: ' + recentSales.length);
    } catch (e) {
      Logger.log('Error al obtener ventas de hoy: ' + e.message);
      // Continuar con valores por defecto
    }
    
    // 2. Cobros de hoy
    try {
      const paymentRepo = new PaymentRepository();
      const allPayments = paymentRepo.findAll();
      
      let collectionsTodayTotal = 0;
      
      for (let i = 0; i < allPayments.length; i++) {
        const payment = allPayments[i];
        
        // Convertir fecha si es necesario
        let paymentDate = payment.payment_date;
        if (typeof paymentDate === 'string') {
          paymentDate = new Date(paymentDate);
        }
        
        // Verificar si es de hoy
        if (paymentDate >= today && paymentDate < tomorrow) {
          collectionsTodayTotal += parseFloat(payment.amount) || 0;
        }
      }
      
      dashboardData.collectionsToday = collectionsTodayTotal;
      
      Logger.log('Cobros hoy: S/ ' + collectionsTodayTotal);
    } catch (e) {
      Logger.log('Error al obtener cobros de hoy: ' + e.message);
      // Continuar con valores por defecto
    }
    
    // 3. Stock bajo
    try {
      Logger.log('Obteniendo stock bajo...');
      const inventoryService = new InventoryService();
      const lowStockProducts = inventoryService.checkLowStock();
      
      Logger.log('lowStockProducts recibidos: ' + lowStockProducts.length);
      if (lowStockProducts.length > 0) {
        Logger.log('Primer producto con stock bajo: ' + JSON.stringify(lowStockProducts[0]));
      }
      
      dashboardData.lowStockCount = lowStockProducts.length;
      
      // Calcular total de unidades faltantes
      let totalDeficit = 0;
      for (let i = 0; i < lowStockProducts.length; i++) {
        totalDeficit += lowStockProducts[i].deficit || 0;
      }
      dashboardData.lowStockTotalUnits = totalDeficit;
      
      Logger.log('Productos con stock bajo: ' + lowStockProducts.length);
      Logger.log('Total unidades faltantes: ' + totalDeficit);
    } catch (e) {
      Logger.log('Error al obtener stock bajo: ' + e.message);
      Logger.log('Stack trace: ' + e.stack);
      // Continuar con valores por defecto
      dashboardData.lowStockCount = 0;
      dashboardData.lowStockTotalUnits = 0;
    }
    
    // 4. Cuotas vencidas
    try {
      const installmentRepo = new InstallmentRepository();
      const allInstallments = installmentRepo.findAll();
      
      let overdueCount = 0;
      
      for (let i = 0; i < allInstallments.length; i++) {
        const installment = allInstallments[i];
        
        // Solo contar cuotas pendientes
        if (installment.status !== 'PAID') {
          // Convertir fecha si es necesario
          let dueDate = installment.due_date;
          if (typeof dueDate === 'string') {
            dueDate = new Date(dueDate);
          }
          
          // Verificar si está vencida
          if (dueDate < today) {
            overdueCount++;
          }
        }
      }
      
      dashboardData.overdueCount = overdueCount;
      
      Logger.log('Cuotas vencidas: ' + overdueCount);
    } catch (e) {
      Logger.log('Error al obtener cuotas vencidas: ' + e.message);
      // Continuar con valores por defecto
    }
    
    // 5. Mercadería estancada (más de 180 días)
    try {
      Logger.log('Calculando mercadería estancada...');
      const productRepo = new ProductRepository();
      const allProducts = productRepo.findAll();
      
      const stalledThresholdDays = 180;
      const stalledThresholdDate = new Date(today);
      stalledThresholdDate.setDate(stalledThresholdDate.getDate() - stalledThresholdDays);
      
      let stalledCount = 0;
      
      for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        
        // Verificar si tiene entry_date
        if (product.entry_date) {
          let entryDate = product.entry_date;
          if (typeof entryDate === 'string') {
            entryDate = new Date(entryDate);
          }
          
          // Si la fecha de entrada es anterior al umbral, está estancado
          if (entryDate < stalledThresholdDate) {
            stalledCount++;
          }
        }
      }
      
      dashboardData.stalledInventoryCount = stalledCount;
      
      Logger.log('Mercadería estancada (>180 días): ' + stalledCount);
    } catch (e) {
      Logger.log('Error al calcular mercadería estancada: ' + e.message);
      dashboardData.stalledInventoryCount = 0;
    }
    
    Logger.log('=== getDashboardData END ===');
    
    // wrapResponse se encarga de normalizar fechas automáticamente
    return dashboardData;
  });
}


/**
 * getStalledInventory - Obtiene productos con más de 180 días en inventario
 * 
 * @returns {Object} Respuesta con lista de productos estancados
 */
function getStalledInventory() {
  return wrapResponse(function() {
    Logger.log('=== getStalledInventory START ===');
    
    const productRepo = new ProductRepository();
    const allProducts = productRepo.findAll();
    
    const today = new Date();
    const stalledThresholdDays = 180;
    const stalledThresholdDate = new Date(today);
    stalledThresholdDate.setDate(stalledThresholdDate.getDate() - stalledThresholdDays);
    
    const stalledProducts = [];
    
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      
      // Verificar si tiene entry_date y stock > 0
      if (product.entry_date && (product.stock > 0 || !product.stock)) {
        let entryDate = product.entry_date;
        if (typeof entryDate === 'string') {
          entryDate = new Date(entryDate);
        }
        
        // Si la fecha de entrada es anterior al umbral, está estancado
        if (entryDate < stalledThresholdDate) {
          stalledProducts.push({
            id: product.id,
            name: product.name,
            size: product.size,
            entry_date: entryDate,
            purchase_price: product.purchase_price,
            sale_price: product.sale_price,
            stock: product.stock || 0,
            category: product.category,
            supplier: product.supplier
          });
        }
      }
    }
    
    Logger.log('Productos estancados encontrados: ' + stalledProducts.length);
    Logger.log('=== getStalledInventory END ===');
    
    return stalledProducts;
  });
}


/**
 * applyStalledDiscount - Aplica descuento a producto estancado
 * 
 * @param {string} productId - ID del producto
 * @param {number} discountPercent - Porcentaje de descuento
 * @param {number} newPrice - Nuevo precio de venta
 * @returns {Object} Respuesta con resultado
 */
function applyStalledDiscount(productId, discountPercent, newPrice) {
  return wrapResponse(function() {
    Logger.log('=== applyStalledDiscount START ===');
    Logger.log('Product ID: ' + productId);
    Logger.log('Discount: ' + discountPercent + '%');
    Logger.log('New Price: ' + newPrice);
    
    const productRepo = new ProductRepository();
    const product = productRepo.findById(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    
    const oldPrice = product.sale_price;
    
    // Actualizar precio
    product.sale_price = newPrice;
    productRepo.update(product);
    
    // Registrar en auditoría
    const auditService = new AuditService();
    auditService.logAction(
      'STALLED_DISCOUNT',
      'PRODUCT',
      productId,
      { sale_price: oldPrice },
      { sale_price: newPrice, discount_percent: discountPercent },
      Session.getActiveUser().getEmail()
    );
    
    Logger.log('Descuento aplicado exitosamente');
    Logger.log('=== applyStalledDiscount END ===');
    
    return { productId: productId, newPrice: newPrice };
  });
}


/**
 * transferStalledProduct - Registra transferencia de producto estancado
 * 
 * @param {string} productId - ID del producto
 * @param {string} destination - Destino de la transferencia
 * @param {number} quantity - Cantidad a transferir
 * @param {string} notes - Notas adicionales
 * @returns {Object} Respuesta con resultado
 */
function transferStalledProduct(productId, destination, quantity, notes) {
  return wrapResponse(function() {
    Logger.log('=== transferStalledProduct START ===');
    Logger.log('Product ID: ' + productId);
    Logger.log('Destination: ' + destination);
    Logger.log('Quantity: ' + quantity);
    
    const productRepo = new ProductRepository();
    const product = productRepo.findById(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    
    if (quantity > product.stock) {
      throw new Error('Cantidad insuficiente en stock');
    }
    
    // Decrementar stock
    product.stock = (product.stock || 0) - quantity;
    productRepo.update(product);
    
    // Registrar movimiento
    const movementRepo = new MovementRepository();
    const movement = {
      id: Utilities.getUuid(),
      product_id: productId,
      product_name: product.name,
      movement_type: 'TRANSFER_OUT',
      quantity: quantity,
      movement_date: new Date(),
      notes: 'Transferencia a ' + destination + (notes ? ': ' + notes : ''),
      user_email: Session.getActiveUser().getEmail()
    };
    movementRepo.create(movement);
    
    // Registrar en auditoría
    const auditService = new AuditService();
    auditService.logAction(
      'STALLED_TRANSFER',
      'PRODUCT',
      productId,
      { stock: (product.stock || 0) + quantity },
      { stock: product.stock, destination: destination },
      Session.getActiveUser().getEmail()
    );
    
    Logger.log('Transferencia registrada exitosamente');
    Logger.log('=== transferStalledProduct END ===');
    
    return { productId: productId, destination: destination, quantity: quantity };
  });
}


/**
 * markForLiquidation - Marca producto para liquidación
 * 
 * @param {string} productId - ID del producto
 * @returns {Object} Respuesta con resultado
 */
function markForLiquidation(productId) {
  return wrapResponse(function() {
    Logger.log('=== markForLiquidation START ===');
    Logger.log('Product ID: ' + productId);
    
    const productRepo = new ProductRepository();
    const product = productRepo.findById(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    
    // Agregar etiqueta de liquidación (si no existe el campo, lo creamos)
    const oldStatus = product.liquidation_status || 'NORMAL';
    product.liquidation_status = 'LIQUIDATION';
    productRepo.update(product);
    
    // Registrar en auditoría
    const auditService = new AuditService();
    auditService.logAction(
      'MARK_LIQUIDATION',
      'PRODUCT',
      productId,
      { liquidation_status: oldStatus },
      { liquidation_status: 'LIQUIDATION' },
      Session.getActiveUser().getEmail()
    );
    
    Logger.log('Producto marcado para liquidación');
    Logger.log('=== markForLiquidation END ===');
    
    return { productId: productId, status: 'LIQUIDATION' };
  });
}


/**
 * getClients - Obtiene lista de clientes activos
 * 
 * @returns {Object} Respuesta con lista de clientes
 */
function getClients() {
  return wrapResponse(function() {
    const clientRepo = new ClientRepository();
    const clients = clientRepo.findAll();
    
    // Filtrar solo clientes activos
    const activeClients = clients.filter(function(client) {
      return client.active === true || client.active === 'TRUE';
    });
    
    return activeClients;
  });
}


/**
 * generateTicket - Genera y retorna el ticket de venta
 * 
 * @param {string} saleId - ID de la venta
 * @returns {Object} Respuesta con HTML del ticket
 */
function generateTicket(saleId) {
  return wrapResponse(function() {
    const posService = new POSService();
    const ticketHtml = posService.generateTicket(saleId);
    
    return {
      html: ticketHtml
    };
  });
}


/**
 * voidSale - Anula una venta
 * 
 * @param {string} saleId - ID de la venta
 * @param {string} reason - Motivo de anulación
 * @param {string} userId - Email del usuario supervisor
 * @returns {Object} Respuesta con resultado de anulación
 */
function voidSale(saleId, reason, userId) {
  return wrapResponse(function() {
    const posService = new POSService();
    const result = posService.voidSale(saleId, reason, userId);
    
    return result;
  });
}

// ============================================================================
// UTILIDADES PARA TEMPLATES
// ============================================================================

/**
 * include - Función global para incluir archivos HTML en templates
 * 
 * Esta función permite la inclusión de sub-vistas HTML dentro del layout principal.
 * Se usa en los templates con la sintaxis: <?!= include('NombreArchivo'); ?>
 * 
 * IMPORTANTE: Extrae solo el contenido del <body> para evitar conflictos con
 * las librerías ya cargadas en index.html
 * 
 * @param {string} filename - Nombre del archivo HTML a incluir (sin extensión)
 * @returns {string} Contenido HTML del archivo o mensaje de error visible
 */
function include(filename) {
  try {
    Logger.log('Intentando incluir archivo: ' + filename);
    
    // CRÍTICO: Usar createTemplateFromFile para evaluar variables del servidor
    // Esto permite que <?= scriptUrl ?> y otras variables funcionen en archivos incluidos
    const template = HtmlService.createTemplateFromFile(filename);
    let content = template.evaluate().getContent();
    
    // Extraer solo el contenido del body para evitar conflictos
    // Buscar <body> y </body>
    const bodyStart = content.indexOf('<body>');
    const bodyEnd = content.indexOf('</body>');
    
    if (bodyStart !== -1 && bodyEnd !== -1) {
      // Extraer contenido entre <body> y </body>
      content = content.substring(bodyStart + 6, bodyEnd);
      Logger.log('Contenido del body extraído para: ' + filename);
    } else {
      Logger.log('No se encontraron etiquetas <body>, usando contenido completo para: ' + filename);
    }
    
    // Extraer y mover scripts al final para que se ejecuten después de que jQuery esté disponible
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const scripts = [];
    let match;
    
    while ((match = scriptRegex.exec(content)) !== null) {
      scripts.push(match[0]);
    }
    
    // Remover scripts del contenido
    content = content.replace(scriptRegex, '');
    
    // Agregar scripts al final con un pequeño delay para asegurar que jQuery esté listo
    if (scripts.length > 0) {
      content += '\n<!-- Scripts del módulo ' + filename + ' -->\n';
      content += '<script>\n';
      content += '// Esperar a que jQuery esté disponible\n';
      content += 'if (typeof jQuery === "undefined") {\n';
      content += '  console.error("jQuery no está disponible para ' + filename + '");\n';
      content += '} else {\n';
      content += '  console.log("jQuery disponible, inicializando ' + filename + '");\n';
      content += '}\n';
      content += '</script>\n';
      content += scripts.join('\n');
    }
    
    Logger.log('Archivo incluido exitosamente: ' + filename);
    return content;
    
  } catch (error) {
    Logger.log('ERROR al incluir archivo "' + filename + '": ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    // Retornar un mensaje de error visible en HTML en lugar de fallar silenciosamente
    return `
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading"><i class="bi bi-exclamation-triangle"></i> Error al cargar el módulo</h4>
        <p><strong>Archivo:</strong> ${filename}.html</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <hr>
        <p class="mb-0">
          <small>Por favor, verifica que el archivo existe y tiene el formato correcto.</small>
        </p>
      </div>
    `;
  }
}


// ============================================================================
// SYSTEM SETTINGS - Gestión de Configuración del Sistema
// ============================================================================

/**
 * getSystemSettings - Obtiene todos los parámetros del sistema
 * 
 * Lee la hoja CFG_Params y retorna todos los parámetros como un objeto JSON.
 * Normaliza números y booleanos para facilitar el uso en el cliente.
 * 
 * @returns {Object} Respuesta con parámetros del sistema
 */
function getSystemSettings() {
  return wrapResponse(function() {
    Logger.log('=== getSystemSettings START ===');
    
    const ss = getActiveSpreadsheet();
    const paramsSheet = ss.getSheetByName('CFG_Params');
    
    if (!paramsSheet) {
      throw new Error('Hoja CFG_Params no encontrada');
    }
    
    // Leer todos los parámetros
    const data = paramsSheet.getDataRange().getValues();
    const settings = {};
    
    // Saltar header (fila 0)
    for (let i = 1; i < data.length; i++) {
      const key = data[i][0];
      let value = data[i][1];
      
      if (!key) continue;
      
      // Normalizar valores
      // Si es número, convertir a número
      if (!isNaN(value) && value !== '') {
        value = Number(value);
      }
      // Si es booleano, convertir a booleano
      else if (value === 'TRUE' || value === true) {
        value = true;
      }
      else if (value === 'FALSE' || value === false) {
        value = false;
      }
      
      settings[key] = value;
    }
    
    Logger.log('Parámetros cargados: ' + Object.keys(settings).length);
    Logger.log('=== getSystemSettings END ===');
    
    return settings;
  });
}

/**
 * updateSystemSettings - Actualiza parámetros del sistema
 * 
 * Actualiza masivamente la hoja CFG_Params con los nuevos valores.
 * Invalida el caché y registra en auditoría.
 * 
 * @param {Object} payload - Datos de la solicitud
 * @param {string} userEmail - Email del usuario que hace el cambio
 * @returns {Object} Respuesta con resultado de la actualización
 */
function updateSystemSettings(payload, userEmail) {
  try {
    Logger.log('=== updateSystemSettings START ===');
    Logger.log('User: ' + userEmail);
    
    // Parsear settings si viene como string
    let newSettings = payload.settings;
    if (typeof newSettings === 'string') {
      newSettings = JSON.parse(newSettings);
    }
    
    Logger.log('Nuevos settings: ' + JSON.stringify(newSettings));
    
    const ss = getActiveSpreadsheet();
    const paramsSheet = ss.getSheetByName('CFG_Params');
    
    if (!paramsSheet) {
      throw new Error('Hoja CFG_Params no encontrada');
    }
    
    // Leer parámetros actuales para comparar
    const data = paramsSheet.getDataRange().getValues();
    const oldSettings = {};
    const rowMap = {}; // Mapeo de key a número de fila
    
    for (let i = 1; i < data.length; i++) {
      const key = data[i][0];
      if (key) {
        oldSettings[key] = data[i][1];
        rowMap[key] = i + 1; // +1 porque getRange usa 1-based index
      }
    }
    
    // Actualizar cada parámetro
    const changes = [];
    
    for (const key in newSettings) {
      if (newSettings.hasOwnProperty(key)) {
        const newValue = newSettings[key];
        const oldValue = oldSettings[key];
        
        // Solo actualizar si cambió
        if (newValue !== oldValue) {
          const row = rowMap[key];
          
          if (row) {
            // Actualizar valor existente
            paramsSheet.getRange(row, 2).setValue(newValue);
            
            changes.push({
              key: key,
              oldValue: oldValue,
              newValue: newValue
            });
            
            Logger.log('Actualizado ' + key + ': ' + oldValue + ' → ' + newValue);
          } else {
            // Crear nuevo parámetro
            const newRow = paramsSheet.getLastRow() + 1;
            paramsSheet.getRange(newRow, 1, 1, 2).setValues([[key, newValue]]);
            
            changes.push({
              key: key,
              oldValue: null,
              newValue: newValue
            });
            
            Logger.log('Creado ' + key + ': ' + newValue);
          }
        }
      }
    }
    
    // Invalidar caché de configuración
    try {
      CacheService.getScriptCache().remove('system_params');
      Logger.log('Caché de configuración invalidado');
    } catch (e) {
      Logger.log('Error al invalidar caché: ' + e.message);
    }
    
    // Registrar en auditoría
    if (changes.length > 0) {
      try {
        const auditRepo = new AuditRepository();
        auditRepo.log(
          'UPDATE_SYSTEM_SETTINGS',
          'SYSTEM',
          'CFG_Params',
          oldSettings,
          newSettings,
          userEmail
        );
        Logger.log('Cambios registrados en auditoría');
      } catch (e) {
        Logger.log('Error al registrar auditoría: ' + e.message);
      }
    }
    
    Logger.log('Total de cambios: ' + changes.length);
    Logger.log('=== updateSystemSettings END ===');
    
    return createSuccessResponse({
      updated: changes.length,
      changes: changes
    });
    
  } catch (error) {
    Logger.log('ERROR en updateSystemSettings: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    return createErrorResponse(
      'SETTINGS_UPDATE_ERROR',
      'Error al actualizar configuración del sistema',
      { originalError: error.message }
    );
  }
}


/**
 * getClientById - Obtiene un cliente por ID (wrapper para frontend)
 * 
 * @param {string} clientId - ID del cliente
 * @returns {Object} Respuesta con datos del cliente
 */
function getClientById(clientId) {
  return wrapResponse(function() {
    const clientRepo = new ClientRepository();
    const client = clientRepo.findById(clientId);
    
    if (!client) {
      throw new Error('Cliente no encontrado');
    }
    
    return client;
  });
}

/**
 * createClient - Crea un nuevo cliente (wrapper para frontend)
 * 
 * @param {Object} clientData - Datos del cliente
 * @returns {Object} Respuesta con cliente creado
 */
function createClient(clientData) {
  return wrapResponse(function() {
    const session = Session.getActiveUser().getEmail();
    return handleClientAction('createClient', clientData, session);
  });
}

/**
 * updateClient - Actualiza un cliente existente (wrapper para frontend)
 * 
 * @param {Object} clientData - Datos del cliente (debe incluir id)
 * @returns {Object} Respuesta con cliente actualizado
 */
function updateClient(clientData) {
  return wrapResponse(function() {
    const session = Session.getActiveUser().getEmail();
    return handleClientAction('updateClient', clientData, session);
  });
}


// ============================================================================
// FUNCIONES PARA PROVEEDORES
// ============================================================================

/**
 * getSuppliers - Obtiene lista de proveedores
 * 
 * @returns {Object} Respuesta con lista de proveedores
 */
function getSuppliers() {
  return wrapResponse(function() {
    Logger.log('=== getSuppliers START ===');
    
    const supplierRepo = new SupplierRepository();
    const suppliers = supplierRepo.findAll();
    
    Logger.log('Proveedores obtenidos: ' + suppliers.length);
    Logger.log('=== getSuppliers END ===');
    
    return suppliers;
  });
}

/**
 * getSupplier - Obtiene un proveedor por ID
 * 
 * @param {string} supplierId - ID del proveedor
 * @returns {Object} Respuesta con datos del proveedor
 */
function getSupplier(supplierId) {
  return wrapResponse(function() {
    Logger.log('=== getSupplier START ===');
    Logger.log('Supplier ID: ' + supplierId);
    
    if (!supplierId) {
      throw new Error('ID de proveedor es requerido');
    }
    
    const supplierRepo = new SupplierRepository();
    const supplier = supplierRepo.findById(supplierId);
    
    if (!supplier) {
      throw new Error('Proveedor no encontrado');
    }
    
    Logger.log('Proveedor encontrado: ' + supplier.name);
    Logger.log('=== getSupplier END ===');
    
    return supplier;
  });
}

/**
 * createSupplier - Crea un nuevo proveedor
 * 
 * @param {Object} supplierData - Datos del proveedor
 * @returns {Object} Respuesta con proveedor creado
 */
function createSupplier(supplierData) {
  return wrapResponse(function() {
    Logger.log('=== createSupplier START ===');
    Logger.log('Supplier data: ' + JSON.stringify(supplierData));
    
    // Validar campos requeridos
    if (!supplierData.code || !supplierData.name) {
      throw new Error('Código y nombre son requeridos');
    }
    
    const supplierRepo = new SupplierRepository();
    
    // Verificar que el código no exista
    const existing = supplierRepo.findByCode(supplierData.code);
    if (existing) {
      throw new Error('Ya existe un proveedor con ese código');
    }
    
    // Generar ID
    supplierData.id = 'sup-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
    supplierData.created_at = new Date();
    supplierData.updated_at = new Date();
    
    const newSupplier = supplierRepo.create(supplierData);
    
    Logger.log('Proveedor creado: ' + newSupplier.id);
    Logger.log('=== createSupplier END ===');
    
    return newSupplier;
  });
}

/**
 * updateSupplier - Actualiza un proveedor existente
 * 
 * @param {Object} supplierData - Datos del proveedor (debe incluir id)
 * @returns {Object} Respuesta con proveedor actualizado
 */
function updateSupplier(supplierData) {
  return wrapResponse(function() {
    Logger.log('=== updateSupplier START ===');
    Logger.log('Supplier data: ' + JSON.stringify(supplierData));
    
    if (!supplierData.id) {
      throw new Error('ID de proveedor es requerido');
    }
    
    const supplierRepo = new SupplierRepository();
    
    // Verificar que existe
    const existing = supplierRepo.findById(supplierData.id);
    if (!existing) {
      throw new Error('Proveedor no encontrado');
    }
    
    // Si cambió el código, verificar que no exista
    if (supplierData.code && supplierData.code !== existing.code) {
      const duplicate = supplierRepo.findByCode(supplierData.code);
      if (duplicate && duplicate.id !== supplierData.id) {
        throw new Error('Ya existe otro proveedor con ese código');
      }
    }
    
    supplierData.updated_at = new Date();
    
    const updatedSupplier = supplierRepo.update(supplierData.id, supplierData);
    
    Logger.log('Proveedor actualizado: ' + updatedSupplier.id);
    Logger.log('=== updateSupplier END ===');
    
    return updatedSupplier;
  });
}

// ============================================================================
// FUNCIONES PARA COMPRAS
// ============================================================================

/**
 * getPurchases - Obtiene lista de compras
 * 
 * @param {Object} filters - Filtros opcionales (dateFrom, dateTo, supplierId)
 * @returns {Object} Respuesta con lista de compras
 */
function getPurchases(filters) {
  return wrapResponse(function() {
    Logger.log('=== getPurchases START ===');
    Logger.log('Filters: ' + JSON.stringify(filters));
    
    // Por ahora retornar array vacío ya que no tenemos la tabla de compras implementada
    // TODO: Implementar cuando se cree la tabla PUR_Purchases
    Logger.log('Funcionalidad de compras pendiente de implementación');
    Logger.log('=== getPurchases END ===');
    
    return [];
  });
}
