/**
 * Const.gs - Constantes del Sistema
 * Adiction Boutique Suite
 * 
 * Este archivo contiene todas las constantes del sistema:
 * - Nombres de sheets
 * - Roles y permisos
 * - Límites y configuraciones
 * - Códigos de error
 */

// ============================================================================
// CONFIGURACIÓN GENERAL
// ============================================================================

/**
 * Función para obtener el ID del spreadsheet activo
 * Se usa en lugar de una constante para evitar errores de contexto
 */
function getSpreadsheetId() {
  return SpreadsheetApp.getActiveSpreadsheet().getId();
}

/**
 * Función para obtener el spreadsheet activo
 * Método recomendado para scripts vinculados
 */
function getActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Versión del sistema
 */
const SYSTEM_VERSION = '1.0.0';

// ============================================================================
// NOMBRES DE SHEETS (Hojas de Google Sheets)
// ============================================================================

const SHEETS = {
  // Configuración
  CFG_USERS: 'CFG_Users',
  CFG_PARAMS: 'CFG_Params',
  
  // Catálogo
  CAT_PRODUCTS: 'CAT_Products',
  
  // Inventario
  INV_STOCK: 'INV_Stock',
  INV_MOVEMENTS: 'INV_Movements',
  
  // CRM
  CRM_CLIENTS: 'CRM_Clients',
  
  // Punto de Venta
  POS_SALES: 'POS_Sales',
  POS_SALE_ITEMS: 'POS_SaleItems',
  
  // Crédito
  CRD_PLANS: 'CRD_Plans',
  CRD_INSTALLMENTS: 'CRD_Installments',
  CRD_PAYMENTS: 'CRD_Payments',
  
  // Caja
  CASH_SHIFTS: 'CASH_Shifts',
  CASH_EXPENSES: 'CASH_Expenses',
  
  // Auditoría
  AUD_LOG: 'AUD_Log'
};

// ============================================================================
// ROLES Y PERMISOS
// ============================================================================

/**
 * Roles disponibles en el sistema
 */
const ROLES = {
  ADMIN: 'Admin',
  VENDEDOR: 'Vendedor',
  CAJERO: 'Cajero',
  COBRADOR: 'Cobrador'
};

/**
 * Permisos por rol
 * Cada rol tiene un conjunto de permisos asociados
 */
const PERMISSIONS = {
  // Admin - Acceso completo
  Admin: [
    'view_dashboard',
    'manage_users',
    'manage_products',
    'manage_inventory',
    'create_sale',
    'void_sale',
    'manage_clients',
    'manage_credit',
    'record_payment',
    'reschedule_installment',
    'manage_cash',
    'record_expense',
    'authorize_expense',
    'authorize_discount',
    'view_reports',
    'manage_invoices',
    'view_audit'
  ],
  
  // Vendedor - Ventas y clientes
  Vendedor: [
    'view_dashboard',
    'manage_products',
    'create_sale',
    'manage_clients',
    'view_reports'
  ],
  
  // Cajero - Caja y ventas
  Cajero: [
    'view_dashboard',
    'create_sale',
    'manage_cash',
    'record_expense',
    'manage_invoices'
  ],
  
  // Cobrador - Cobranzas
  Cobrador: [
    'view_dashboard',
    'manage_clients',
    'record_payment',
    'view_reports'
  ]
};

/**
 * Tiendas disponibles
 */
const STORES = {
  MUJERES: 'Mujeres',
  HOMBRES: 'Hombres'
};

// ============================================================================
// TIPOS Y ESTADOS
// ============================================================================

/**
 * Tipos de venta
 */
const SALE_TYPES = {
  CONTADO: 'CONTADO',
  CREDITO: 'CREDITO'
};

/**
 * Estados de pago
 */
const PAYMENT_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL'
};

/**
 * Tipos de movimiento de inventario
 */
const MOVEMENT_TYPES = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
  AJUSTE: 'AJUSTE',
  TRANSFERENCIA_OUT: 'TRANSFERENCIA_OUT',
  TRANSFERENCIA_IN: 'TRANSFERENCIA_IN'
};

/**
 * Estados de cuota
 */
const INSTALLMENT_STATUS = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE'
};

/**
 * Estados de plan de crédito
 */
const CREDIT_PLAN_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

/**
 * Estados de turno de caja
 */
const SHIFT_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

// ============================================================================
// LÍMITES Y CONFIGURACIONES
// ============================================================================

/**
 * Límites del sistema
 */
const LIMITS = {
  // Crédito
  MIN_INSTALLMENTS: 1,
  MAX_INSTALLMENTS: 6,
  
  // Paginación
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
  MIN_RECORDS_FOR_PAGINATION: 100,
  
  // Validaciones
  MAX_STRING_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_BARCODE_LENGTH: 50,
  MAX_DNI_LENGTH: 20,
  MAX_PHONE_LENGTH: 20,
  MAX_EMAIL_LENGTH: 100,
  
  // Concurrencia
  LOCK_TIMEOUT_MS: 30000, // 30 segundos
  LOCK_MAX_RETRIES: 3,
  
  // Caché
  CACHE_TTL_PRODUCTS: 300,    // 5 minutos
  CACHE_TTL_USERS: 600,       // 10 minutos
  CACHE_TTL_PARAMS: 900,      // 15 minutos
  CACHE_TTL_IDEMPOTENCY: 86400 // 24 horas
};

/**
 * Parámetros configurables del sistema
 * Estos valores se pueden sobrescribir desde CFG_Params
 */
const DEFAULT_PARAMS = {
  MIN_STOCK_ALERT: 10,
  DISCOUNT_THRESHOLD_PERCENT: 15,
  DISCOUNT_THRESHOLD_AMOUNT: 100,
  EXPENSE_AUTHORIZATION_THRESHOLD: 500,
  DAYS_GRACE_INSTALLMENTS: 3
};

// ============================================================================
// CÓDIGOS DE ERROR
// ============================================================================

/**
 * Códigos de error del sistema
 */
const ERROR_CODES = {
  // Autenticación y autorización (400-403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validación (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  
  // Negocio (422)
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INSUFFICIENT_CREDIT: 'INSUFFICIENT_CREDIT',
  DUPLICATE_BARCODE: 'DUPLICATE_BARCODE',
  DUPLICATE_DNI: 'DUPLICATE_DNI',
  SHIFT_NOT_OPEN: 'SHIFT_NOT_OPEN',
  SHIFT_ALREADY_OPEN: 'SHIFT_ALREADY_OPEN',
  INVALID_INSTALLMENTS: 'INVALID_INSTALLMENTS',
  
  // Concurrencia (409)
  LOCK_TIMEOUT: 'LOCK_TIMEOUT',
  ALREADY_PROCESSED: 'ALREADY_PROCESSED',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
  
  // Sistema (500)
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SHEET_ACCESS_ERROR: 'SHEET_ACCESS_ERROR',
  DRIVE_ACCESS_ERROR: 'DRIVE_ACCESS_ERROR',
  EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
  CACHE_ERROR: 'CACHE_ERROR'
};

// ============================================================================
// ACCIONES (para router)
// ============================================================================

/**
 * Acciones disponibles en el API
 */
const ACTIONS = {
  // Auth
  AUTH_CHECK: 'auth/check',
  AUTH_ME: 'auth/me',
  
  // Productos
  PRODUCT_LIST: 'product/list',
  PRODUCT_GET: 'product/get',
  PRODUCT_CREATE: 'product/create',
  PRODUCT_UPDATE: 'product/update',
  PRODUCT_SEARCH: 'product/search',
  
  // Inventario
  STOCK_GET: 'stock/get',
  STOCK_LIST: 'stock/list',
  STOCK_TRANSFER: 'stock/transfer',
  MOVEMENT_LIST: 'movement/list',
  
  // POS
  SALE_CREATE: 'sale/create',
  SALE_GET: 'sale/get',
  SALE_LIST: 'sale/list',
  SALE_VOID: 'sale/void',
  
  // Clientes
  CLIENT_LIST: 'client/list',
  CLIENT_GET: 'client/get',
  CLIENT_CREATE: 'client/create',
  CLIENT_UPDATE: 'client/update',
  
  // Crédito y Cobranzas
  PAYMENT_RECORD: 'payment/record',
  INSTALLMENT_LIST: 'installment/list',
  INSTALLMENT_RESCHEDULE: 'installment/reschedule',
  
  // Caja
  SHIFT_OPEN: 'shift/open',
  SHIFT_CLOSE: 'shift/close',
  SHIFT_GET: 'shift/get',
  EXPENSE_RECORD: 'expense/record',
  
  // Reportes
  REPORT_SALES: 'report/sales',
  REPORT_INVENTORY: 'report/inventory',
  REPORT_AR: 'report/ar',
  
  // Facturación
  INVOICE_GENERATE: 'invoice/generate',
  INVOICE_SEND: 'invoice/send'
};

// ============================================================================
// MENSAJES
// ============================================================================

/**
 * Mensajes del sistema
 */
const MESSAGES = {
  ACCESS_DENIED: 'Acceso denegado. Usuario no autorizado.',
  INSUFFICIENT_PERMISSIONS: 'No tiene permisos suficientes para realizar esta operación.',
  OPERATION_SUCCESS: 'Operación realizada exitosamente.',
  VALIDATION_ERROR: 'Error de validación en los datos proporcionados.',
  SYSTEM_ERROR: 'Error del sistema. Por favor, intente nuevamente.'
};
