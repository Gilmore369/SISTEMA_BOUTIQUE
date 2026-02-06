/**
 * Setup.gs - Script de configuración automática de hojas de Google Sheets
 * 
 * Este script crea automáticamente todas las hojas necesarias para el sistema
 * Adiction Boutique Suite con sus headers, formato y validaciones.
 * 
 * Uso: Ejecutar setupCompleteSystem() desde el editor de Apps Script
 */

/**
 * Función principal que configura todo el sistema completo
 * Ejecuta setupSheets() y seedData() automáticamente
 * NOTA: Esta función debe ejecutarse desde una hoja de cálculo vinculada
 */
function setupCompleteSystem() {
  try {
    Logger.log('=== INICIANDO CONFIGURACIÓN COMPLETA DEL SISTEMA ===');
    Logger.log('ADVERTENCIA: Esta función debe ejecutarse desde una hoja de cálculo vinculada');
    
    // Verificar si estamos en contexto de hoja de cálculo
    let ui = null;
    try {
      ui = SpreadsheetApp.getUi();
      Logger.log('✓ Contexto de hoja de cálculo detectado - UI disponible');
    } catch (e) {
      Logger.log('⚠️ No hay contexto de hoja de cálculo - ejecutando sin UI');
    }
    
    // Si hay UI disponible, mostrar confirmación
    if (ui) {
      const response = ui.alert(
        'Configuración Completa del Sistema',
        '¿Deseas configurar completamente el sistema Adiction Boutique Suite?\n\n' +
        'Esto incluye:\n' +
        '• Crear 14 hojas con formato y validaciones\n' +
        '• Poblar con datos de ejemplo\n' +
        '• Configurar parámetros del sistema\n\n' +
        '⚠️ ADVERTENCIA: Si las hojas ya existen, se perderán todos los datos.',
        ui.ButtonSet.YES_NO
      );
      
      if (response !== ui.Button.YES) {
        Logger.log('Configuración cancelada por el usuario');
        ui.alert('Configuración cancelada por el usuario.');
        return;
      }
    } else {
      Logger.log('Ejecutando configuración automática sin confirmación de usuario');
    }
    
    // Paso 1: Crear hojas
    Logger.log('Paso 1/2: Creando estructura de hojas...');
    if (ui) ui.alert('Paso 1/2: Creando estructura de hojas...');
    
    setupSheets();
    Logger.log('✓ Estructura de hojas creada exitosamente');
    
    // Paso 2: Poblar datos
    Logger.log('Paso 2/2: Poblando datos de ejemplo...');
    if (ui) ui.alert('Paso 2/2: Poblando datos de ejemplo...');
    
    seedData();
    Logger.log('✓ Datos de ejemplo poblados exitosamente');
    
    // Configuración completada
    const successMessage = 
      '🎉 ¡Sistema Configurado Exitosamente!\n\n' +
      '✅ 14 hojas creadas con formato\n' +
      '✅ Datos de ejemplo poblados\n' +
      '✅ Validaciones configuradas\n' +
      '✅ Parámetros del sistema listos\n\n' +
      'El sistema está listo para usar.';
    
    Logger.log('=== CONFIGURACIÓN COMPLETA EXITOSA ===');
    Logger.log(successMessage);
    
    if (ui) {
      ui.alert('🎉 ¡Sistema Configurado Exitosamente!', successMessage, ui.ButtonSet.OK);
    }
    
    return {
      success: true,
      message: 'Sistema configurado exitosamente',
      sheetsCreated: 14,
      dataPopulated: true
    };
    
  } catch (error) {
    const errorMessage = 'ERROR en configuración: ' + error.toString();
    Logger.log(errorMessage);
    Logger.log('Stack trace: ' + error.stack);
    
    // Intentar mostrar error en UI si está disponible
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Error en la Configuración', errorMessage, ui.ButtonSet.OK);
    } catch (uiError) {
      Logger.log('No se pudo mostrar error en UI: ' + uiError.message);
    }
    
    throw error;
  }
}

/**
 * Función alternativa para configurar el sistema sin UI
 * Úsala cuando ejecutes desde el proyecto independiente de Apps Script
 * 
 * @param {string} spreadsheetUrl - URL de la hoja de cálculo donde configurar el sistema
 */
function setupSystemNoUI(spreadsheetUrl) {
  try {
    Logger.log('=== CONFIGURACIÓN AUTOMÁTICA SIN UI ===');
    Logger.log('Iniciando configuración completa del sistema...');
    
    // Validar parámetro
    if (!spreadsheetUrl) {
      throw new Error('Se requiere la URL de la hoja de cálculo. Uso: setupSystemNoUI("https://docs.google.com/spreadsheets/d/ID_DE_TU_HOJA/edit")');
    }
    
    // Obtener la hoja de cálculo por URL
    let ss;
    try {
      ss = SpreadsheetApp.openByUrl(spreadsheetUrl);
      Logger.log('✓ Hoja de cálculo abierta exitosamente: ' + ss.getName());
    } catch (e) {
      throw new Error('No se pudo abrir la hoja de cálculo. Verifica la URL y los permisos: ' + e.message);
    }
    
    // Paso 1: Crear hojas
    Logger.log('Paso 1/2: Creando estructura de hojas...');
    setupSheetsWithSpreadsheet(ss);
    Logger.log('✓ Estructura de hojas creada exitosamente');
    
    // Paso 2: Poblar datos
    Logger.log('Paso 2/2: Poblando datos de ejemplo...');
    seedDataWithSpreadsheet(ss);
    Logger.log('✓ Datos de ejemplo poblados exitosamente');
    
    Logger.log('=== CONFIGURACIÓN COMPLETA EXITOSA ===');
    Logger.log('🎉 Sistema Adiction Boutique Suite configurado exitosamente');
    Logger.log('✅ 14 hojas creadas con formato y validaciones');
    Logger.log('✅ Datos de ejemplo poblados');
    Logger.log('✅ Sistema listo para usar');
    Logger.log('📊 Hoja de cálculo: ' + ss.getUrl());
    
    return {
      success: true,
      message: 'Sistema configurado exitosamente sin UI',
      sheetsCreated: 14,
      dataPopulated: true,
      spreadsheetUrl: ss.getUrl()
    };
    
  } catch (error) {
    Logger.log('ERROR en configuración: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * Función de configuración rápida - crea una nueva hoja de cálculo automáticamente
 * Ideal para configuración inicial desde cero
 */
function setupSystemQuick() {
  try {
    Logger.log('=== CONFIGURACIÓN RÁPIDA - NUEVA HOJA DE CÁLCULO ===');
    
    // Crear nueva hoja de cálculo
    const ss = SpreadsheetApp.create('Adiction Boutique Suite - Base de Datos');
    Logger.log('✓ Nueva hoja de cálculo creada: ' + ss.getName());
    Logger.log('📊 URL: ' + ss.getUrl());
    
    // Configurar el sistema
    Logger.log('Paso 1/2: Creando estructura de hojas...');
    setupSheetsWithSpreadsheet(ss);
    Logger.log('✓ Estructura de hojas creada exitosamente');
    
    Logger.log('Paso 2/2: Poblando datos de ejemplo...');
    seedDataWithSpreadsheet(ss);
    Logger.log('✓ Datos de ejemplo poblados exitosamente');
    
    Logger.log('=== CONFIGURACIÓN RÁPIDA COMPLETADA ===');
    Logger.log('🎉 Sistema Adiction Boutique Suite configurado exitosamente');
    Logger.log('✅ Nueva hoja de cálculo creada y configurada');
    Logger.log('✅ 14 hojas con formato y validaciones');
    Logger.log('✅ Datos de ejemplo poblados');
    Logger.log('📊 Accede a tu sistema en: ' + ss.getUrl());
    
    return {
      success: true,
      message: 'Sistema configurado con nueva hoja de cálculo',
      sheetsCreated: 14,
      dataPopulated: true,
      spreadsheetUrl: ss.getUrl(),
      spreadsheetName: ss.getName()
    };
    
  } catch (error) {
    Logger.log('ERROR en configuración rápida: ' + error.toString());
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * Función principal que crea todas las hojas del sistema
 * Valida: Requisitos 27.1, 27.2
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSheetsWithSpreadsheet(ss);
}

/**
 * Función auxiliar que crea todas las hojas en una hoja de cálculo específica
 * @param {Spreadsheet} ss - Objeto Spreadsheet donde crear las hojas
 */
function setupSheetsWithSpreadsheet(ss) {
  Logger.log('Iniciando configuración de hojas en: ' + ss.getName());
  
  // Crear todas las hojas en orden
  createCFGUsersSheet(ss);
  createCFGParamsSheet(ss);
  createCATProductsSheet(ss);
  createINVStockSheet(ss);
  createINVMovementsSheet(ss);
  createCRMClientsSheet(ss);
  createPOSSalesSheet(ss);
  createPOSSaleItemsSheet(ss);
  createCRDPlansSheet(ss);
  createCRDInstallmentsSheet(ss);
  createCRDPaymentsSheet(ss);
  createCASHShiftsSheet(ss);
  createCASHExpensesSheet(ss);
  createAUDLogSheet(ss);
  
  Logger.log('Configuración completada exitosamente!');
  
  // Intentar mostrar alerta solo si UI está disponible
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('✅ Configuración completada!\n\nSe han creado 14 hojas con sus headers y formato.');
  } catch (e) {
    Logger.log('UI no disponible - configuración completada sin alerta visual');
  }
}

/**
 * Función auxiliar para crear o limpiar una hoja
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    sheet.clear();
    Logger.log('Hoja "' + sheetName + '" limpiada');
  } else {
    sheet = ss.insertSheet(sheetName);
    Logger.log('Hoja "' + sheetName + '" creada');
  }
  return sheet;
}

/**
 * Función auxiliar para aplicar formato a headers
 */
function formatHeaders(sheet, numColumns) {
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
}

/**
 * Función auxiliar para ajustar anchos de columnas
 */
function setColumnWidths(sheet, widths) {
  for (let i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

/**
 * 1. CFG_Users - Usuarios y roles
 */
function createCFGUsersSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CFG_Users');
  
  // Headers
  const headers = ['id', 'email', 'name', 'roles', 'stores', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 250, 200, 150, 150, 80, 150]);
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 6, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 2. CFG_Params - Parámetros del sistema
 */
function createCFGParamsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CFG_Params');
  
  // Headers
  const headers = ['key', 'value', 'description', 'type'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [250, 150, 400, 100]);
  
  // Validación de datos para columna 'type'
  const typeRange = sheet.getRange(2, 4, 1000);
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['NUMBER', 'STRING', 'BOOLEAN', 'JSON'], true)
    .build();
  typeRange.setDataValidation(typeRule);
}

/**
 * 3. CAT_Products - Catálogo de productos
 */
function createCATProductsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Products');
  
  // Headers
  const headers = ['id', 'barcode', 'name', 'description', 'price', 'category', 'min_stock', 'active', 'created_at', 'updated_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 150, 200, 300, 100, 120, 100, 80, 150, 150]);
  
  // Formato de moneda para precio
  const priceRange = sheet.getRange(2, 5, 1000);
  priceRange.setNumberFormat('$#,##0.00');
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 8, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 4. INV_Stock - Stock por almacén
 */
function createINVStockSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'INV_Stock');
  
  // Headers
  const headers = ['id', 'warehouse_id', 'product_id', 'quantity', 'last_updated'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 150, 200, 100, 150]);
  
  // Formato condicional para alertas de stock bajo
  const quantityRange = sheet.getRange(2, 4, 1000);
  const lowStockRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(10)
    .setBackground('#F4CCCC')
    .setRanges([quantityRange])
    .build();
  sheet.setConditionalFormatRules([lowStockRule]);
}

/**
 * 5. INV_Movements - Movimientos de inventario
 */
function createINVMovementsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'INV_Movements');
  
  // Headers
  const headers = ['id', 'warehouse_id', 'product_id', 'type', 'quantity', 'reference_id', 'user_id', 'reason', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 150, 200, 150, 100, 200, 200, 300, 150]);
  
  // Validación de datos para columna 'type'
  const typeRange = sheet.getRange(2, 4, 1000);
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA_OUT', 'TRANSFERENCIA_IN'], true)
    .build();
  typeRange.setDataValidation(typeRule);
}

/**
 * 6. CRM_Clients - Clientes
 */
function createCRMClientsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CRM_Clients');
  
  // Headers
  const headers = ['id', 'dni', 'name', 'phone', 'email', 'address', 'lat', 'lng', 'credit_limit', 'credit_used', 'dni_photo_url', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 100, 200, 120, 200, 300, 100, 100, 120, 120, 250, 80, 150]);
  
  // Formato de moneda para límites de crédito
  const creditLimitRange = sheet.getRange(2, 9, 1000);
  creditLimitRange.setNumberFormat('$#,##0.00');
  
  const creditUsedRange = sheet.getRange(2, 10, 1000);
  creditUsedRange.setNumberFormat('$#,##0.00');
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 12, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 7. POS_Sales - Ventas
 */
function createPOSSalesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'POS_Sales');
  
  // Headers
  const headers = ['id', 'sale_number', 'store_id', 'client_id', 'user_id', 'sale_type', 'subtotal', 'discount', 'total', 'payment_status', 'created_at', 'voided', 'void_reason', 'void_user_id', 'void_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 120, 150, 200, 200, 100, 100, 100, 100, 120, 150, 80, 250, 200, 150]);
  
  // Formato de moneda
  const moneyColumns = [7, 8, 9]; // subtotal, discount, total
  moneyColumns.forEach(function(col) {
    const range = sheet.getRange(2, col, 1000);
    range.setNumberFormat('$#,##0.00');
  });
  
  // Validación de datos para 'sale_type'
  const saleTypeRange = sheet.getRange(2, 6, 1000);
  const saleTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['CONTADO', 'CREDITO'], true)
    .build();
  saleTypeRange.setDataValidation(saleTypeRule);
  
  // Validación de datos para 'payment_status'
  const paymentStatusRange = sheet.getRange(2, 10, 1000);
  const paymentStatusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['PAID', 'PENDING', 'PARTIAL'], true)
    .build();
  paymentStatusRange.setDataValidation(paymentStatusRule);
  
  // Validación de datos para 'voided'
  const voidedRange = sheet.getRange(2, 12, 1000);
  const voidedRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  voidedRange.setDataValidation(voidedRule);
}

/**
 * 8. POS_SaleItems - Items de venta
 */
function createPOSSaleItemsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'POS_SaleItems');
  
  // Headers
  const headers = ['id', 'sale_id', 'product_id', 'quantity', 'unit_price', 'subtotal'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 200, 200, 100, 120, 120]);
  
  // Formato de moneda
  const priceRange = sheet.getRange(2, 5, 1000);
  priceRange.setNumberFormat('$#,##0.00');
  
  const subtotalRange = sheet.getRange(2, 6, 1000);
  subtotalRange.setNumberFormat('$#,##0.00');
}

/**
 * 9. CRD_Plans - Planes de crédito
 */
function createCRDPlansSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CRD_Plans');
  
  // Headers
  const headers = ['id', 'sale_id', 'client_id', 'total_amount', 'installments_count', 'installment_amount', 'status', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 200, 200, 120, 120, 120, 100, 150]);
  
  // Formato de moneda
  const moneyColumns = [4, 6]; // total_amount, installment_amount
  moneyColumns.forEach(function(col) {
    const range = sheet.getRange(2, col, 1000);
    range.setNumberFormat('$#,##0.00');
  });
  
  // Validación de datos para 'status'
  const statusRange = sheet.getRange(2, 7, 1000);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ACTIVE', 'COMPLETED', 'CANCELLED'], true)
    .build();
  statusRange.setDataValidation(statusRule);
}

/**
 * 10. CRD_Installments - Cuotas
 */
function createCRDInstallmentsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CRD_Installments');
  
  // Headers
  const headers = ['id', 'plan_id', 'installment_number', 'amount', 'due_date', 'paid_amount', 'status', 'paid_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 200, 120, 120, 120, 120, 100, 150]);
  
  // Formato de moneda
  const moneyColumns = [4, 6]; // amount, paid_amount
  moneyColumns.forEach(function(col) {
    const range = sheet.getRange(2, col, 1000);
    range.setNumberFormat('$#,##0.00');
  });
  
  // Validación de datos para 'status'
  const statusRange = sheet.getRange(2, 7, 1000);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'], true)
    .build();
  statusRange.setDataValidation(statusRule);
  
  // Formato condicional para cuotas vencidas
  const statusColorRange = sheet.getRange(2, 7, 1000);
  const overdueRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('OVERDUE')
    .setBackground('#F4CCCC')
    .setRanges([statusColorRange])
    .build();
  const paidRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('PAID')
    .setBackground('#D9EAD3')
    .setRanges([statusColorRange])
    .build();
  sheet.setConditionalFormatRules([overdueRule, paidRule]);
}

/**
 * 11. CRD_Payments - Pagos
 */
function createCRDPaymentsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CRD_Payments');
  
  // Headers
  const headers = ['id', 'client_id', 'amount', 'payment_date', 'user_id', 'receipt_url', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 200, 120, 120, 200, 250, 150]);
  
  // Formato de moneda
  const amountRange = sheet.getRange(2, 3, 1000);
  amountRange.setNumberFormat('$#,##0.00');
}

/**
 * 12. CASH_Shifts - Turnos de caja
 */
function createCASHShiftsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CASH_Shifts');
  
  // Headers
  const headers = ['id', 'store_id', 'user_id', 'opening_amount', 'opening_at', 'closing_amount', 'expected_amount', 'difference', 'closing_at', 'supervisor_id'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 150, 200, 120, 150, 120, 120, 120, 150, 200]);
  
  // Formato de moneda
  const moneyColumns = [4, 6, 7, 8]; // opening_amount, closing_amount, expected_amount, difference
  moneyColumns.forEach(function(col) {
    const range = sheet.getRange(2, col, 1000);
    range.setNumberFormat('$#,##0.00');
  });
  
  // Formato condicional para diferencias
  const diffRange = sheet.getRange(2, 8, 1000);
  const negativeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setBackground('#F4CCCC')
    .setRanges([diffRange])
    .build();
  const positiveRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setBackground('#FFF2CC')
    .setRanges([diffRange])
    .build();
  sheet.setConditionalFormatRules([negativeRule, positiveRule]);
}

/**
 * 13. CASH_Expenses - Egresos
 */
function createCASHExpensesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CASH_Expenses');
  
  // Headers
  const headers = ['id', 'shift_id', 'amount', 'concept', 'category', 'receipt_url', 'user_id', 'authorized_by', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 200, 120, 250, 150, 250, 200, 200, 150]);
  
  // Formato de moneda
  const amountRange = sheet.getRange(2, 3, 1000);
  amountRange.setNumberFormat('$#,##0.00');
}

/**
 * 14. AUD_Log - Auditoría
 */
function createAUDLogSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'AUD_Log');
  
  // Headers
  const headers = ['id', 'timestamp', 'user_id', 'operation', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [200, 150, 200, 150, 150, 200, 300, 300, 150]);
  
  // Proteger la hoja contra modificaciones (solo inserción)
  const protection = sheet.protect().setDescription('Log de auditoría - Solo lectura');
  protection.setWarningOnly(true);
}

/**
 * Función para poblar las hojas con datos de ejemplo
 * Valida: Requisitos 27.2
 * 
 * Inserta datos realistas para una tienda de ropa:
 * - 3-4 usuarios con diferentes roles
 * - Parámetros del sistema configurados
 * - 10-15 productos de ejemplo
 * - Stock inicial para los productos
 * - 5-8 clientes de ejemplo
 */
function seedData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  seedDataWithSpreadsheet(ss);
}

/**
 * Función auxiliar que pobla datos en una hoja de cálculo específica
 * @param {Spreadsheet} ss - Objeto Spreadsheet donde poblar los datos
 */
function seedDataWithSpreadsheet(ss) {
  Logger.log('Iniciando población de datos de ejemplo en: ' + ss.getName());
  
  // Poblar cada hoja con datos de ejemplo
  seedCFGUsers(ss);
  seedCFGParams(ss);
  seedCATProducts(ss);
  seedINVStock(ss);
  seedCRMClients(ss);
  
  Logger.log('Datos de ejemplo insertados exitosamente!');
  
  // Intentar mostrar alerta solo si UI está disponible
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('✅ Datos de ejemplo insertados!\n\nSe han agregado usuarios, productos, stock y clientes de ejemplo.');
  } catch (e) {
    Logger.log('UI no disponible - datos insertados sin alerta visual');
  }
}

/**
 * Poblar CFG_Users con usuarios de ejemplo
 */
function seedCFGUsers(ss) {
  const sheet = ss.getSheetByName('CFG_Users');
  if (!sheet) {
    Logger.log('ERROR: Hoja CFG_Users no existe');
    return;
  }
  
  const users = [
    [
      'usr_001',
      'admin@adictionboutique.com',
      'María González',
      '["Admin"]',
      '["Mujeres", "Hombres"]',
      true,
      new Date()
    ],
    [
      'usr_002',
      'vendedor.mujeres@adictionboutique.com',
      'Ana Rodríguez',
      '["Vendedor"]',
      '["Mujeres"]',
      true,
      new Date()
    ],
    [
      'usr_003',
      'vendedor.hombres@adictionboutique.com',
      'Carlos Pérez',
      '["Vendedor", "Cajero"]',
      '["Hombres"]',
      true,
      new Date()
    ],
    [
      'usr_004',
      'cobrador@adictionboutique.com',
      'Luis Martínez',
      '["Cobrador"]',
      '["Mujeres", "Hombres"]',
      true,
      new Date()
    ],
    [
      'usr_005',
      'gianpapex@gmail.com',
      'Gian Papex',
      '["Admin", "Vendedor"]',
      '["Mujeres", "Hombres"]',
      true,
      new Date()
    ]
  ];
  
  sheet.getRange(2, 1, users.length, users[0].length).setValues(users);
  Logger.log('CFG_Users: ' + users.length + ' usuarios insertados');
}

/**
 * Poblar CFG_Params con parámetros del sistema
 */
function seedCFGParams(ss) {
  const sheet = ss.getSheetByName('CFG_Params');
  if (!sheet) {
    Logger.log('ERROR: Hoja CFG_Params no existe');
    return;
  }
  
  const params = [
    ['MIN_STOCK_ALERT', '10', 'Nivel mínimo de stock para generar alerta', 'NUMBER'],
    ['MAX_DISCOUNT_WITHOUT_AUTH', '100', 'Monto máximo de descuento sin autorización de supervisor', 'NUMBER'],
    ['MAX_EXPENSE_WITHOUT_AUTH', '500', 'Monto máximo de egreso sin autorización de supervisor', 'NUMBER'],
    ['INSTALLMENT_GRACE_DAYS', '3', 'Días de gracia para cuotas vencidas', 'NUMBER'],
    ['CACHE_TTL_PRODUCTS', '300', 'Tiempo de vida del caché de productos (segundos)', 'NUMBER'],
    ['CACHE_TTL_USERS', '600', 'Tiempo de vida del caché de usuarios (segundos)', 'NUMBER'],
    ['DEFAULT_CREDIT_LIMIT', '2000', 'Límite de crédito por defecto para nuevos clientes', 'NUMBER'],
    ['STORE_NAME_MUJERES', 'Adiction Boutique Mujeres', 'Nombre de la tienda de mujeres', 'STRING'],
    ['STORE_NAME_HOMBRES', 'Adiction Boutique Hombres', 'Nombre de la tienda de hombres', 'STRING'],
    ['ENABLE_BARCODE_SCANNER', 'true', 'Habilitar escaneo de códigos de barras con cámara', 'BOOLEAN']
  ];
  
  sheet.getRange(2, 1, params.length, params[0].length).setValues(params);
  Logger.log('CFG_Params: ' + params.length + ' parámetros insertados');
}

/**
 * Poblar CAT_Products con productos de ejemplo
 */
function seedCATProducts(ss) {
  const sheet = ss.getSheetByName('CAT_Products');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Products no existe');
    return;
  }
  
  const now = new Date();
  const products = [
    ['prd_001', '7501234567890', 'Blusa Floral Manga Corta', 'Blusa elegante con estampado floral, manga corta', 89.90, 'Blusas', 5, true, now, now],
    ['prd_002', '7501234567891', 'Pantalón Jean Skinny Mujer', 'Pantalón jean ajustado de mezclilla azul', 129.90, 'Pantalones', 8, true, now, now],
    ['prd_003', '7501234567892', 'Vestido Casual Verano', 'Vestido ligero ideal para verano, varios colores', 149.90, 'Vestidos', 6, true, now, now],
    ['prd_004', '7501234567893', 'Falda Plisada Midi', 'Falda plisada elegante, largo midi', 99.90, 'Faldas', 7, true, now, now],
    ['prd_005', '7501234567894', 'Camisa Formal Hombre Blanca', 'Camisa formal de vestir, color blanco', 119.90, 'Camisas', 10, true, now, now],
    ['prd_006', '7501234567895', 'Pantalón Casual Hombre Beige', 'Pantalón casual de tela, color beige', 139.90, 'Pantalones', 8, true, now, now],
    ['prd_007', '7501234567896', 'Polo Deportivo Hombre', 'Polo deportivo de algodón, varios colores', 69.90, 'Polos', 15, true, now, now],
    ['prd_008', '7501234567897', 'Chaqueta Jean Mujer', 'Chaqueta de mezclilla estilo casual', 179.90, 'Chaquetas', 5, true, now, now],
    ['prd_009', '7501234567898', 'Short Jean Mujer', 'Short de mezclilla, corte moderno', 79.90, 'Shorts', 12, true, now, now],
    ['prd_010', '7501234567899', 'Suéter Cuello V Hombre', 'Suéter de lana, cuello en V', 159.90, 'Suéteres', 6, true, now, now],
    ['prd_011', '7501234567900', 'Leggings Deportivos Mujer', 'Leggings elásticos para deporte o casual', 59.90, 'Deportivo', 20, true, now, now],
    ['prd_012', '7501234567901', 'Camisa Cuadros Hombre', 'Camisa casual a cuadros, manga larga', 99.90, 'Camisas', 9, true, now, now],
    ['prd_013', '7501234567902', 'Blazer Formal Mujer Negro', 'Blazer elegante para oficina, color negro', 249.90, 'Blazers', 4, true, now, now],
    ['prd_014', '7501234567903', 'Bermuda Cargo Hombre', 'Bermuda estilo cargo con bolsillos', 89.90, 'Shorts', 10, true, now, now],
    ['prd_015', '7501234567904', 'Top Crop Mujer', 'Top corto estilo moderno, varios colores', 49.90, 'Tops', 18, true, now, now]
  ];
  
  sheet.getRange(2, 1, products.length, products[0].length).setValues(products);
  Logger.log('CAT_Products: ' + products.length + ' productos insertados');
}

/**
 * Poblar INV_Stock con stock inicial
 */
function seedINVStock(ss) {
  const sheet = ss.getSheetByName('INV_Stock');
  if (!sheet) {
    Logger.log('ERROR: Hoja INV_Stock no existe');
    return;
  }
  
  const now = new Date();
  const stock = [
    // Almacén Mujeres
    ['stk_001', 'alm_mujeres', 'prd_001', 25, now],
    ['stk_002', 'alm_mujeres', 'prd_002', 30, now],
    ['stk_003', 'alm_mujeres', 'prd_003', 20, now],
    ['stk_004', 'alm_mujeres', 'prd_004', 18, now],
    ['stk_005', 'alm_mujeres', 'prd_008', 15, now],
    ['stk_006', 'alm_mujeres', 'prd_009', 28, now],
    ['stk_007', 'alm_mujeres', 'prd_011', 40, now],
    ['stk_008', 'alm_mujeres', 'prd_013', 12, now],
    ['stk_009', 'alm_mujeres', 'prd_015', 35, now],
    
    // Almacén Hombres
    ['stk_010', 'alm_hombres', 'prd_005', 22, now],
    ['stk_011', 'alm_hombres', 'prd_006', 26, now],
    ['stk_012', 'alm_hombres', 'prd_007', 45, now],
    ['stk_013', 'alm_hombres', 'prd_010', 18, now],
    ['stk_014', 'alm_hombres', 'prd_012', 24, now],
    ['stk_015', 'alm_hombres', 'prd_014', 30, now],
    
    // Algunos productos en ambos almacenes
    ['stk_016', 'alm_hombres', 'prd_001', 8, now],
    ['stk_017', 'alm_mujeres', 'prd_007', 12, now]
  ];
  
  sheet.getRange(2, 1, stock.length, stock[0].length).setValues(stock);
  Logger.log('INV_Stock: ' + stock.length + ' registros de stock insertados');
}

/**
 * Poblar CRM_Clients con clientes de ejemplo
 */
function seedCRMClients(ss) {
  const sheet = ss.getSheetByName('CRM_Clients');
  if (!sheet) {
    Logger.log('ERROR: Hoja CRM_Clients no existe');
    return;
  }
  
  const now = new Date();
  const clients = [
    [
      'cli_001',
      '12345678',
      'Patricia Sánchez',
      '987654321',
      'patricia.sanchez@email.com',
      'Av. Los Pinos 123, San Isidro',
      -12.0897,
      -77.0282,
      3000.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_002',
      '23456789',
      'Roberto Flores',
      '987654322',
      'roberto.flores@email.com',
      'Jr. Las Flores 456, Miraflores',
      -12.1197,
      -77.0282,
      2500.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_003',
      '34567890',
      'Carmen Torres',
      '987654323',
      'carmen.torres@email.com',
      'Calle Los Olivos 789, Surco',
      -12.1397,
      -77.0082,
      2000.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_004',
      '45678901',
      'Jorge Ramírez',
      '987654324',
      'jorge.ramirez@email.com',
      'Av. Primavera 321, San Borja',
      -12.0997,
      -77.0082,
      3500.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_005',
      '56789012',
      'Lucía Mendoza',
      '987654325',
      'lucia.mendoza@email.com',
      'Jr. Los Jazmines 654, La Molina',
      -12.0797,
      -76.9482,
      2800.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_006',
      '67890123',
      'Miguel Vargas',
      '987654326',
      'miguel.vargas@email.com',
      'Calle Las Rosas 987, Barranco',
      -12.1497,
      -77.0182,
      2200.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_007',
      '78901234',
      'Elena Castro',
      '987654327',
      'elena.castro@email.com',
      'Av. Arequipa 147, Lince',
      -12.0797,
      -77.0382,
      3200.00,
      0.00,
      '',
      true,
      now
    ],
    [
      'cli_008',
      '89012345',
      'Fernando Díaz',
      '987654328',
      'fernando.diaz@email.com',
      'Jr. Independencia 258, Jesús María',
      -12.0697,
      -77.0482,
      2600.00,
      0.00,
      '',
      true,
      now
    ]
  ];
  
  sheet.getRange(2, 1, clients.length, clients[0].length).setValues(clients);
  Logger.log('CRM_Clients: ' + clients.length + ' clientes insertados');
}
