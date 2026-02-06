/**
 * FixDatabaseStructure.gs
 * Corrige la estructura de la base de datos y asegura que todas las hojas
 * tengan los encabezados correctos según Const.gs
 * 
 * EJECUTAR: fixAllDatabaseStructure()
 */

/**
 * Función principal que corrige toda la estructura de la base de datos
 */
function fixAllDatabaseStructure() {
  Logger.log('=== INICIANDO CORRECCIÓN DE ESTRUCTURA DE BASE DE DATOS ===');
  
  const ss = getActiveSpreadsheet();
  let fixed = 0;
  let created = 0;
  let errors = 0;
  
  try {
    // Definir estructura correcta de todas las hojas
    const sheetsStructure = {
      'CFG_Users': {
        headers: ['id', 'email', 'name', 'roles', 'stores', 'active', 'created_at'],
        widths: [200, 250, 200, 150, 150, 80, 150]
      },
      'CFG_Params': {
        headers: ['key', 'value', 'description', 'type'],
        widths: [250, 150, 400, 100]
      },
      'CAT_Products': {
        headers: ['id', 'barcode', 'name', 'description', 'price', 'category', 'min_stock', 'active', 'created_at', 'updated_at'],
        widths: [200, 150, 200, 300, 100, 120, 100, 80, 150, 150]
      },
      'INV_Stock': {
        headers: ['id', 'warehouse_id', 'product_id', 'quantity', 'min_stock', 'last_updated'],
        widths: [200, 150, 200, 100, 100, 150]
      },
      'INV_Movements': {
        headers: ['id', 'warehouse_id', 'product_id', 'type', 'quantity', 'reference_id', 'user_id', 'reason', 'created_at'],
        widths: [200, 150, 200, 150, 100, 200, 200, 300, 150]
      },
      'CRM_Clients': {
        headers: ['id', 'dni', 'name', 'phone', 'email', 'address', 'lat', 'lng', 'credit_limit', 'credit_used', 'dni_photo_url', 'active', 'created_at'],
        widths: [200, 100, 200, 120, 200, 300, 100, 100, 120, 120, 250, 80, 150]
      },
      'POS_Sales': {
        headers: ['id', 'date', 'client_id', 'client_name', 'client_dni', 'sale_type', 'total', 'status', 'store_id', 'user_id', 'created_at'],
        widths: [200, 150, 200, 200, 100, 100, 100, 100, 150, 200, 150]
      },
      'POS_SaleItems': {
        headers: ['id', 'sale_id', 'product_id', 'product_name', 'quantity', 'price', 'subtotal', 'created_at'],
        widths: [200, 200, 200, 200, 100, 120, 120, 150]
      },
      'CRD_Plans': {
        headers: ['id', 'sale_id', 'client_id', 'client_name', 'total_amount', 'installments_count', 'installment_amount', 'paid_amount', 'balance', 'status', 'start_date', 'created_at'],
        widths: [200, 200, 200, 200, 120, 120, 120, 120, 120, 100, 150, 150]
      },
      'CRD_Installments': {
        headers: ['id', 'plan_id', 'client_id', 'client_name', 'installment_number', 'amount', 'paid_amount', 'balance', 'due_date', 'status', 'paid_date', 'created_at'],
        widths: [200, 200, 200, 200, 120, 120, 120, 120, 120, 100, 150, 150]
      },
      'CRD_Payments': {
        headers: ['id', 'plan_id', 'installment_id', 'client_id', 'amount', 'payment_method', 'payment_date', 'user_id', 'notes', 'created_at'],
        widths: [200, 200, 200, 200, 120, 120, 120, 200, 300, 150]
      },
      'CASH_Shifts': {
        headers: ['id', 'store_id', 'user_id', 'opening_amount', 'opening_at', 'closing_amount', 'expected_amount', 'difference', 'closing_at', 'supervisor_id'],
        widths: [200, 150, 200, 120, 150, 120, 120, 120, 150, 200]
      },
      'CASH_Expenses': {
        headers: ['id', 'shift_id', 'amount', 'concept', 'category', 'receipt_url', 'user_id', 'authorized_by', 'created_at'],
        widths: [200, 200, 120, 250, 150, 250, 200, 200, 150]
      },
      'AUD_Log': {
        headers: ['id', 'timestamp', 'user_id', 'operation', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address'],
        widths: [200, 150, 200, 150, 150, 200, 300, 300, 150]
      }
    };
    
    // Procesar cada hoja
    for (const sheetName in sheetsStructure) {
      try {
        const config = sheetsStructure[sheetName];
        const result = fixSheetStructure(ss, sheetName, config.headers, config.widths);
        
        if (result.created) {
          created++;
          Logger.log('✓ ' + sheetName + ': Hoja creada con estructura correcta');
        } else if (result.fixed) {
          fixed++;
          Logger.log('✓ ' + sheetName + ': Estructura corregida');
        } else {
          Logger.log('  ' + sheetName + ': Ya tiene estructura correcta');
        }
      } catch (e) {
        errors++;
        Logger.log('✗ ' + sheetName + ': ERROR - ' + e.message);
      }
    }
    
    Logger.log('=== RESUMEN ===');
    Logger.log('Hojas creadas: ' + created);
    Logger.log('Hojas corregidas: ' + fixed);
    Logger.log('Errores: ' + errors);
    Logger.log('Total procesadas: ' + Object.keys(sheetsStructure).length);
    
    if (errors === 0) {
      Logger.log('✅ Estructura de base de datos corregida exitosamente');
    } else {
      Logger.log('⚠️ Completado con ' + errors + ' errores');
    }
    
    return {
      success: errors === 0,
      created: created,
      fixed: fixed,
      errors: errors
    };
    
  } catch (error) {
    Logger.log('❌ ERROR CRÍTICO: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Corrige la estructura de una hoja específica
 * 
 * @param {Spreadsheet} ss - Spreadsheet activo
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<string>} correctHeaders - Encabezados correctos
 * @param {Array<number>} widths - Anchos de columnas
 * @returns {Object} Resultado de la operación
 */
function fixSheetStructure(ss, sheetName, correctHeaders, widths) {
  let sheet = ss.getSheetByName(sheetName);
  let created = false;
  let fixed = false;
  
  // Si la hoja no existe, crearla
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    created = true;
  }
  
  // Verificar si tiene datos
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  
  // Si está vacía o solo tiene 1 fila, establecer headers
  if (lastRow === 0 || lastColumn === 0) {
    sheet.getRange(1, 1, 1, correctHeaders.length).setValues([correctHeaders]);
    formatHeaders(sheet, correctHeaders.length);
    setColumnWidths(sheet, widths);
    fixed = true;
    return { created: created, fixed: fixed };
  }
  
  // Leer headers actuales
  const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  
  // Comparar headers
  let headersMatch = true;
  if (currentHeaders.length !== correctHeaders.length) {
    headersMatch = false;
  } else {
    for (let i = 0; i < correctHeaders.length; i++) {
      if (currentHeaders[i] !== correctHeaders[i]) {
        headersMatch = false;
        break;
      }
    }
  }
  
  // Si los headers no coinciden, necesitamos corregir
  if (!headersMatch) {
    Logger.log('  Headers actuales: ' + JSON.stringify(currentHeaders));
    Logger.log('  Headers correctos: ' + JSON.stringify(correctHeaders));
    
    // Si hay datos, necesitamos migrarlos
    if (lastRow > 1) {
      Logger.log('  ⚠️ Hoja tiene ' + (lastRow - 1) + ' filas de datos - migrando...');
      
      // Leer todos los datos
      const allData = sheet.getDataRange().getValues();
      const oldHeaders = allData[0];
      const dataRows = allData.slice(1);
      
      // Crear mapeo de columnas antiguas a nuevas
      const columnMap = {};
      for (let i = 0; i < oldHeaders.length; i++) {
        const oldHeader = oldHeaders[i];
        const newIndex = correctHeaders.indexOf(oldHeader);
        if (newIndex !== -1) {
          columnMap[i] = newIndex;
        }
      }
      
      // Migrar datos a nueva estructura
      const newData = [];
      for (let i = 0; i < dataRows.length; i++) {
        const oldRow = dataRows[i];
        const newRow = new Array(correctHeaders.length).fill('');
        
        // Copiar datos según el mapeo
        for (const oldIndex in columnMap) {
          const newIndex = columnMap[oldIndex];
          newRow[newIndex] = oldRow[oldIndex];
        }
        
        newData.push(newRow);
      }
      
      // Limpiar hoja
      sheet.clear();
      
      // Escribir headers correctos
      sheet.getRange(1, 1, 1, correctHeaders.length).setValues([correctHeaders]);
      
      // Escribir datos migrados
      if (newData.length > 0) {
        sheet.getRange(2, 1, newData.length, correctHeaders.length).setValues(newData);
      }
      
      Logger.log('  ✓ Datos migrados: ' + newData.length + ' filas');
    } else {
      // No hay datos, solo reemplazar headers
      sheet.clear();
      sheet.getRange(1, 1, 1, correctHeaders.length).setValues([correctHeaders]);
    }
    
    // Aplicar formato
    formatHeaders(sheet, correctHeaders.length);
    setColumnWidths(sheet, widths);
    
    fixed = true;
  } else {
    // Headers correctos, solo asegurar formato
    formatHeaders(sheet, correctHeaders.length);
    setColumnWidths(sheet, widths);
  }
  
  return { created: created, fixed: fixed };
}

/**
 * Aplica formato a los headers
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
 * Establece anchos de columnas
 */
function setColumnWidths(sheet, widths) {
  for (let i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }
}

/**
 * Función para verificar la estructura actual de todas las hojas
 */
function verifyDatabaseStructure() {
  Logger.log('=== VERIFICANDO ESTRUCTURA DE BASE DE DATOS ===');
  
  const ss = getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  Logger.log('Total de hojas: ' + sheets.length);
  Logger.log('');
  
  sheets.forEach(function(sheet, index) {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    Logger.log((index + 1) + '. ' + name);
    Logger.log('   Filas: ' + lastRow + ' | Columnas: ' + lastColumn);
    
    if (lastRow > 0 && lastColumn > 0) {
      const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      Logger.log('   Headers: ' + JSON.stringify(headers));
    } else {
      Logger.log('   ⚠️ Hoja vacía');
    }
    
    Logger.log('');
  });
  
  Logger.log('=== FIN DE VERIFICACIÓN ===');
}

/**
 * Función para listar todas las hojas con sus datos
 */
function listAllSheetsWithData() {
  Logger.log('=== LISTADO DE HOJAS CON DATOS ===');
  
  const ss = getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  sheets.forEach(function(sheet) {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    
    Logger.log(name + ': ' + (lastRow - 1) + ' filas de datos');
  });
  
  Logger.log('=== FIN DE LISTADO ===');
}
