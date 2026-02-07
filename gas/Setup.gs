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
  
  // Hojas maestras de catálogo
  createCATLinesSheet(ss);
  createCATCategoriesSheet(ss);
  createCATBrandsSheet(ss);
  createCATSizesSheet(ss);
  createCATSuppliersSheet(ss);
  
  // Productos
  createCATProductsSheet(ss);
  
  // Inventario
  createINVStockSheet(ss);
  createINVMovementsSheet(ss);
  
  // CRM
  createCRMClientsSheet(ss);
  
  // POS
  createPOSSalesSheet(ss);
  createPOSSaleItemsSheet(ss);
  
  // Crédito
  createCRDPlansSheet(ss);
  createCRDInstallmentsSheet(ss);
  createCRDPaymentsSheet(ss);
  
  // Caja
  createCASHShiftsSheet(ss);
  createCASHExpensesSheet(ss);
  
  // Auditoría
  createAUDLogSheet(ss);
  
  Logger.log('Configuración completada exitosamente!');
  
  // Intentar mostrar alerta solo si UI está disponible
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('✅ Configuración completada!\n\nSe han creado 19 hojas con sus headers y formato.');
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
 * 2.1 CAT_Lines - Líneas de productos (Hombres, Mujeres, Niños)
 */
function createCATLinesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Lines');
  
  // Headers
  const headers = ['id', 'name', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [150, 200, 80, 150]);
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 3, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 2.2 CAT_Categories - Categorías de productos
 */
function createCATCategoriesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Categories');
  
  // Headers
  const headers = ['id', 'name', 'line_id', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [150, 200, 150, 80, 150]);
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 4, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 2.3 CAT_Brands - Marcas
 */
function createCATBrandsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Brands');
  
  // Headers
  const headers = ['id', 'name', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [150, 200, 80, 150]);
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 3, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 2.4 CAT_Sizes - Tallas por categoría
 */
function createCATSizesSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Sizes');
  
  // Headers
  const headers = ['id', 'category_id', 'value', 'sort_order', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [150, 150, 100, 100, 80, 150]);
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 5, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 2.5 CAT_Suppliers - Proveedores
 */
function createCATSuppliersSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Suppliers');
  
  // Headers
  const headers = ['id', 'name', 'brands_json', 'contact', 'phone', 'email', 'active', 'created_at'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [150, 200, 250, 200, 120, 200, 80, 150]);
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 7, 1000);
  const activeRule = SpreadsheetApp.newDataValidation()
    .requireCheckbox()
    .build();
  activeRange.setDataValidation(activeRule);
}

/**
 * 3. CAT_Products - Catálogo de productos (ACTUALIZADO)
 */
function createCATProductsSheet(ss) {
  const sheet = getOrCreateSheet(ss, 'CAT_Products');
  
  // Headers actualizados con nuevos campos
  const headers = [
    'id', 'barcode', 'name', 'description', 'line_id', 'category_id', 
    'brand_id', 'supplier_id', 'size', 'color', 'presentation',
    'purchase_price', 'price', 'min_stock', 'barcode_url', 
    'active', 'created_at', 'updated_at'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formato
  formatHeaders(sheet, headers.length);
  setColumnWidths(sheet, [
    200, 150, 200, 300, 120, 120, 
    120, 120, 80, 100, 100,
    100, 100, 100, 250,
    80, 150, 150
  ]);
  
  // Formato de moneda para precios
  const purchasePriceRange = sheet.getRange(2, 12, 1000);
  purchasePriceRange.setNumberFormat('$#,##0.00');
  
  const priceRange = sheet.getRange(2, 13, 1000);
  priceRange.setNumberFormat('$#,##0.00');
  
  // Validación de datos para columna 'active'
  const activeRange = sheet.getRange(2, 16, 1000);
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
  
  // Poblar hojas maestras
  seedCATLines(ss);
  seedCATCategories(ss);
  seedCATBrands(ss);
  seedCATSizes(ss);
  seedCATSuppliers(ss);
  
  // Poblar productos y stock
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
    ['ENABLE_BARCODE_SCANNER', 'true', 'Habilitar escaneo de códigos de barras con cámara', 'BOOLEAN'],
    ['DEFAULT_PROFIT_MARGIN', '40', 'Margen de ganancia por defecto (%)', 'NUMBER']
  ];
  
  sheet.getRange(2, 1, params.length, params[0].length).setValues(params);
  Logger.log('CFG_Params: ' + params.length + ' parámetros insertados');
}

/**
 * Poblar CAT_Lines con líneas de productos
 */
function seedCATLines(ss) {
  const sheet = ss.getSheetByName('CAT_Lines');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Lines no existe');
    return;
  }
  
  const now = new Date();
  const lines = [
    ['line_001', 'Mujeres', true, now],
    ['line_002', 'Hombres', true, now],
    ['line_003', 'Niños', true, now],
    ['line_004', 'Unisex', true, now]
  ];
  
  sheet.getRange(2, 1, lines.length, lines[0].length).setValues(lines);
  Logger.log('CAT_Lines: ' + lines.length + ' líneas insertadas');
}

/**
 * Poblar CAT_Categories con categorías
 */
function seedCATCategories(ss) {
  const sheet = ss.getSheetByName('CAT_Categories');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Categories no existe');
    return;
  }
  
  const now = new Date();
  const categories = [
    // Mujeres
    ['cat_001', 'Blusas', 'line_001', true, now],
    ['cat_002', 'Pantalones', 'line_001', true, now],
    ['cat_003', 'Vestidos', 'line_001', true, now],
    ['cat_004', 'Faldas', 'line_001', true, now],
    ['cat_005', 'Zapatos', 'line_001', true, now],
    ['cat_006', 'Carteras', 'line_001', true, now],
    
    // Hombres
    ['cat_007', 'Camisas', 'line_002', true, now],
    ['cat_008', 'Pantalones', 'line_002', true, now],
    ['cat_009', 'Polos', 'line_002', true, now],
    ['cat_010', 'Zapatos', 'line_002', true, now],
    ['cat_011', 'Shorts', 'line_002', true, now],
    
    // Niños
    ['cat_012', 'Polos', 'line_003', true, now],
    ['cat_013', 'Pantalones', 'line_003', true, now],
    ['cat_014', 'Vestidos', 'line_003', true, now],
    
    // Unisex
    ['cat_015', 'Perfumes', 'line_004', true, now],
    ['cat_016', 'Accesorios', 'line_004', true, now]
  ];
  
  sheet.getRange(2, 1, categories.length, categories[0].length).setValues(categories);
  Logger.log('CAT_Categories: ' + categories.length + ' categorías insertadas');
}

/**
 * Poblar CAT_Brands con marcas
 */
function seedCATBrands(ss) {
  const sheet = ss.getSheetByName('CAT_Brands');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Brands no existe');
    return;
  }
  
  const now = new Date();
  const brands = [
    ['brand_001', 'Adidas', true, now],
    ['brand_002', 'Nike', true, now],
    ['brand_003', 'Zara', true, now],
    ['brand_004', 'H&M', true, now],
    ['brand_005', 'Forever 21', true, now],
    ['brand_006', 'Levi\'s', true, now],
    ['brand_007', 'Tommy Hilfiger', true, now],
    ['brand_008', 'Calvin Klein', true, now],
    ['brand_009', 'Puma', true, now],
    ['brand_010', 'Reebok', true, now],
    ['brand_011', 'Genérica', true, now]
  ];
  
  sheet.getRange(2, 1, brands.length, brands[0].length).setValues(brands);
  Logger.log('CAT_Brands: ' + brands.length + ' marcas insertadas');
}

/**
 * Poblar CAT_Sizes con tallas por categoría
 */
function seedCATSizes(ss) {
  const sheet = ss.getSheetByName('CAT_Sizes');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Sizes no existe');
    return;
  }
  
  const now = new Date();
  const sizes = [
    // Tallas de ropa (XS, S, M, L, XL, XXL)
    ['size_001', 'cat_001', 'XS', 1, true, now],
    ['size_002', 'cat_001', 'S', 2, true, now],
    ['size_003', 'cat_001', 'M', 3, true, now],
    ['size_004', 'cat_001', 'L', 4, true, now],
    ['size_005', 'cat_001', 'XL', 5, true, now],
    ['size_006', 'cat_001', 'XXL', 6, true, now],
    
    // Pantalones mujeres (tallas numéricas)
    ['size_007', 'cat_002', '26', 1, true, now],
    ['size_008', 'cat_002', '28', 2, true, now],
    ['size_009', 'cat_002', '30', 3, true, now],
    ['size_010', 'cat_002', '32', 4, true, now],
    ['size_011', 'cat_002', '34', 5, true, now],
    ['size_012', 'cat_002', '36', 6, true, now],
    
    // Vestidos (XS-XXL)
    ['size_013', 'cat_003', 'XS', 1, true, now],
    ['size_014', 'cat_003', 'S', 2, true, now],
    ['size_015', 'cat_003', 'M', 3, true, now],
    ['size_016', 'cat_003', 'L', 4, true, now],
    ['size_017', 'cat_003', 'XL', 5, true, now],
    
    // Zapatos mujeres (35-40)
    ['size_018', 'cat_005', '35', 1, true, now],
    ['size_019', 'cat_005', '36', 2, true, now],
    ['size_020', 'cat_005', '37', 3, true, now],
    ['size_021', 'cat_005', '38', 4, true, now],
    ['size_022', 'cat_005', '39', 5, true, now],
    ['size_023', 'cat_005', '40', 6, true, now],
    
    // Camisas hombres (S-XXL)
    ['size_024', 'cat_007', 'S', 1, true, now],
    ['size_025', 'cat_007', 'M', 2, true, now],
    ['size_026', 'cat_007', 'L', 3, true, now],
    ['size_027', 'cat_007', 'XL', 4, true, now],
    ['size_028', 'cat_007', 'XXL', 5, true, now],
    
    // Pantalones hombres (30-40)
    ['size_029', 'cat_008', '30', 1, true, now],
    ['size_030', 'cat_008', '32', 2, true, now],
    ['size_031', 'cat_008', '34', 3, true, now],
    ['size_032', 'cat_008', '36', 4, true, now],
    ['size_033', 'cat_008', '38', 5, true, now],
    ['size_034', 'cat_008', '40', 6, true, now],
    
    // Zapatos hombres (39-44)
    ['size_035', 'cat_010', '39', 1, true, now],
    ['size_036', 'cat_010', '40', 2, true, now],
    ['size_037', 'cat_010', '41', 3, true, now],
    ['size_038', 'cat_010', '42', 4, true, now],
    ['size_039', 'cat_010', '43', 5, true, now],
    ['size_040', 'cat_010', '44', 6, true, now],
    
    // Perfumes (presentaciones)
    ['size_041', 'cat_015', '50ml', 1, true, now],
    ['size_042', 'cat_015', '100ml', 2, true, now],
    ['size_043', 'cat_015', '150ml', 3, true, now]
  ];
  
  sheet.getRange(2, 1, sizes.length, sizes[0].length).setValues(sizes);
  Logger.log('CAT_Sizes: ' + sizes.length + ' tallas insertadas');
}

/**
 * Poblar CAT_Suppliers con proveedores
 */
function seedCATSuppliers(ss) {
  const sheet = ss.getSheetByName('CAT_Suppliers');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Suppliers no existe');
    return;
  }
  
  const now = new Date();
  const suppliers = [
    [
      'sup_001',
      'Distribuidora Deportiva SAC',
      '["brand_001", "brand_002", "brand_009", "brand_010"]',
      'Carlos Mendoza',
      '987123456',
      'ventas@distdeportiva.com',
      true,
      now
    ],
    [
      'sup_002',
      'Importaciones Fashion Peru',
      '["brand_003", "brand_004", "brand_005"]',
      'María González',
      '987234567',
      'contacto@fashionperu.com',
      true,
      now
    ],
    [
      'sup_003',
      'Textiles Premium EIRL',
      '["brand_006", "brand_007", "brand_008"]',
      'Roberto Silva',
      '987345678',
      'ventas@textilespremium.com',
      true,
      now
    ],
    [
      'sup_004',
      'Mayorista Ropa Nacional',
      '["brand_011"]',
      'Ana Torres',
      '987456789',
      'info@mayoristanacional.com',
      true,
      now
    ]
  ];
  
  sheet.getRange(2, 1, suppliers.length, suppliers[0].length).setValues(suppliers);
  Logger.log('CAT_Suppliers: ' + suppliers.length + ' proveedores insertados');
}

/**
 * Poblar CAT_Products con productos de ejemplo (ACTUALIZADO)
 */
function seedCATProducts(ss) {
  const sheet = ss.getSheetByName('CAT_Products');
  if (!sheet) {
    Logger.log('ERROR: Hoja CAT_Products no existe');
    return;
  }
  
  const now = new Date();
  // Estructura: id, barcode, name, description, line_id, category_id, brand_id, supplier_id, 
  //             size, color, presentation, purchase_price, price, min_stock, barcode_url, active, created_at, updated_at
  const products = [
    // Blusas Mujeres
    ['prd_001', '7501234567890', 'Blusa Floral Manga Corta', 'Blusa elegante con estampado floral', 'line_001', 'cat_001', 'brand_003', 'sup_002', 'M', 'Floral', 'Unidad', 45.00, 89.90, 5, '', true, now, now],
    ['prd_002', '7501234567891', 'Blusa Floral Manga Corta', 'Blusa elegante con estampado floral', 'line_001', 'cat_001', 'brand_003', 'sup_002', 'L', 'Floral', 'Unidad', 45.00, 89.90, 5, '', true, now, now],
    
    // Pantalones Mujeres
    ['prd_003', '7501234567892', 'Pantalón Jean Skinny', 'Pantalón jean ajustado de mezclilla azul', 'line_001', 'cat_002', 'brand_006', 'sup_003', '28', 'Azul', 'Unidad', 65.00, 129.90, 8, '', true, now, now],
    ['prd_004', '7501234567893', 'Pantalón Jean Skinny', 'Pantalón jean ajustado de mezclilla azul', 'line_001', 'cat_002', 'brand_006', 'sup_003', '30', 'Azul', 'Unidad', 65.00, 129.90, 8, '', true, now, now],
    ['prd_005', '7501234567894', 'Pantalón Jean Skinny', 'Pantalón jean ajustado de mezclilla azul', 'line_001', 'cat_002', 'brand_006', 'sup_003', '32', 'Azul', 'Unidad', 65.00, 129.90, 8, '', true, now, now],
    
    // Vestidos
    ['prd_006', '7501234567895', 'Vestido Casual Verano', 'Vestido ligero ideal para verano', 'line_001', 'cat_003', 'brand_004', 'sup_002', 'S', 'Rojo', 'Unidad', 75.00, 149.90, 6, '', true, now, now],
    ['prd_007', '7501234567896', 'Vestido Casual Verano', 'Vestido ligero ideal para verano', 'line_001', 'cat_003', 'brand_004', 'sup_002', 'M', 'Rojo', 'Unidad', 75.00, 149.90, 6, '', true, now, now],
    
    // Camisas Hombres
    ['prd_008', '7501234567897', 'Camisa Formal Blanca', 'Camisa formal de vestir', 'line_002', 'cat_007', 'brand_007', 'sup_003', 'M', 'Blanco', 'Unidad', 60.00, 119.90, 10, '', true, now, now],
    ['prd_009', '7501234567898', 'Camisa Formal Blanca', 'Camisa formal de vestir', 'line_002', 'cat_007', 'brand_007', 'sup_003', 'L', 'Blanco', 'Unidad', 60.00, 119.90, 10, '', true, now, now],
    ['prd_010', '7501234567899', 'Camisa Cuadros', 'Camisa casual a cuadros', 'line_002', 'cat_007', 'brand_007', 'sup_003', 'M', 'Azul', 'Unidad', 50.00, 99.90, 9, '', true, now, now],
    
    // Pantalones Hombres
    ['prd_011', '7501234567900', 'Pantalón Casual Beige', 'Pantalón casual de tela', 'line_002', 'cat_008', 'brand_006', 'sup_003', '32', 'Beige', 'Unidad', 70.00, 139.90, 8, '', true, now, now],
    ['prd_012', '7501234567901', 'Pantalón Casual Beige', 'Pantalón casual de tela', 'line_002', 'cat_008', 'brand_006', 'sup_003', '34', 'Beige', 'Unidad', 70.00, 139.90, 8, '', true, now, now],
    
    // Polos Deportivos
    ['prd_013', '7501234567902', 'Polo Deportivo', 'Polo deportivo de algodón', 'line_002', 'cat_009', 'brand_001', 'sup_001', 'M', 'Negro', 'Unidad', 35.00, 69.90, 15, '', true, now, now],
    ['prd_014', '7501234567903', 'Polo Deportivo', 'Polo deportivo de algodón', 'line_002', 'cat_009', 'brand_001', 'sup_001', 'L', 'Negro', 'Unidad', 35.00, 69.90, 15, '', true, now, now],
    ['prd_015', '7501234567904', 'Polo Deportivo', 'Polo deportivo de algodón', 'line_002', 'cat_009', 'brand_002', 'sup_001', 'M', 'Azul', 'Unidad', 35.00, 69.90, 15, '', true, now, now]
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
