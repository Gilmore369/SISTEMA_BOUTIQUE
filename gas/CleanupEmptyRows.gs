/**
 * CleanupEmptyRows.gs - Utilidad para limpiar filas vacías
 * 
 * Este script elimina las filas vacías creadas durante el setup inicial
 * para mejorar el rendimiento de las consultas.
 */

/**
 * cleanupAllEmptyRows - Limpia filas vacías de todas las hojas del sistema
 * 
 * Ejecutar desde el editor de Apps Script para optimizar el rendimiento.
 * Esta función elimina todas las filas completamente vacías después de los datos reales.
 * 
 * @returns {Object} Resumen de la limpieza realizada
 */
function cleanupAllEmptyRows() {
  Logger.log('=== INICIANDO LIMPIEZA DE FILAS VACÍAS ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Intentar obtener UI (solo funciona si se ejecuta desde el menú de la hoja)
    let ui = null;
    let hasUI = false;
    try {
      ui = SpreadsheetApp.getUi();
      hasUI = true;
    } catch (e) {
      Logger.log('Ejecutando sin UI (desde editor de scripts)');
      hasUI = false;
    }
    
    // Si hay UI, confirmar con el usuario
    if (hasUI) {
      const response = ui.alert(
        'Limpieza de Filas Vacías',
        '¿Deseas eliminar todas las filas vacías del sistema?\n\n' +
        'Esto mejorará significativamente el rendimiento de las consultas.\n\n' +
        '⚠️ Esta operación puede tardar unos minutos.',
        ui.ButtonSet.YES_NO
      );
      
      if (response !== ui.Button.YES) {
        Logger.log('Limpieza cancelada por el usuario');
        ui.alert('Limpieza cancelada.');
        return { success: false, message: 'Cancelado por el usuario' };
      }
    } else {
      Logger.log('Ejecutando limpieza automática (sin confirmación de usuario)');
    }
    
    // Lista de hojas a limpiar
    const sheetsToClean = [
      SHEETS.CFG_USERS,
      SHEETS.CFG_PARAMS,
      SHEETS.CAT_PRODUCTS,
      SHEETS.INV_STOCK,
      SHEETS.INV_MOVEMENTS,
      SHEETS.CLI_CLIENTS,
      SHEETS.CLI_CREDIT_PLANS,
      SHEETS.CLI_INSTALLMENTS,
      SHEETS.CLI_PAYMENTS,
      SHEETS.TXN_SALES,
      SHEETS.TXN_SALE_ITEMS,
      SHEETS.TXN_CASH_REGISTER,
      SHEETS.TXN_RECEIPTS,
      SHEETS.AUD_LOG
    ];
    
    const results = [];
    let totalRowsDeleted = 0;
    
    // Limpiar cada hoja
    for (let i = 0; i < sheetsToClean.length; i++) {
      const sheetName = sheetsToClean[i];
      Logger.log('Limpiando hoja: ' + sheetName + ' (' + (i + 1) + '/' + sheetsToClean.length + ')');
      
      try {
        const result = cleanupEmptyRowsInSheet(sheetName);
        results.push(result);
        totalRowsDeleted += result.rowsDeleted;
        
        Logger.log('✓ ' + sheetName + ': ' + result.rowsDeleted + ' filas eliminadas');
      } catch (error) {
        Logger.log('✗ Error en ' + sheetName + ': ' + error.message);
        results.push({
          sheetName: sheetName,
          success: false,
          error: error.message,
          rowsDeleted: 0
        });
      }
    }
    
    // Resumen
    const summary = {
      success: true,
      totalSheetsProcessed: sheetsToClean.length,
      totalRowsDeleted: totalRowsDeleted,
      details: results
    };
    
    Logger.log('=== LIMPIEZA COMPLETADA ===');
    Logger.log('Total de filas eliminadas: ' + totalRowsDeleted);
    
    // Mostrar alerta solo si hay UI disponible
    if (hasUI && ui) {
      ui.alert(
        '✅ Limpieza Completada',
        'Se eliminaron ' + totalRowsDeleted + ' filas vacías de ' + sheetsToClean.length + ' hojas.\n\n' +
        'El rendimiento del sistema debería mejorar significativamente.',
        ui.ButtonSet.OK
      );
    }
    
    return summary;
    
  } catch (error) {
    Logger.log('ERROR en limpieza: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    // Intentar mostrar error en UI si está disponible
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Error en la Limpieza', error.message, ui.ButtonSet.OK);
    } catch (uiError) {
      Logger.log('No se pudo mostrar error en UI (ejecutando desde editor)');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * cleanupEmptyRowsInSheet - Limpia filas vacías de una hoja específica
 * 
 * Elimina todas las filas completamente vacías después de la última fila con datos.
 * Mantiene la fila de headers intacta.
 * 
 * @param {string} sheetName - Nombre de la hoja a limpiar
 * @returns {Object} Resultado de la limpieza
 */
function cleanupEmptyRowsInSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('La hoja "' + sheetName + '" no existe');
    }
    
    // Obtener información de la hoja
    const maxRows = sheet.getMaxRows();
    const lastRowWithData = sheet.getLastRow();
    
    // Si no hay filas vacías, no hacer nada
    if (maxRows <= lastRowWithData) {
      return {
        sheetName: sheetName,
        success: true,
        rowsDeleted: 0,
        message: 'No hay filas vacías'
      };
    }
    
    // Calcular cuántas filas vacías hay
    const emptyRowsCount = maxRows - lastRowWithData;
    
    // Eliminar filas vacías
    // NOTA: deleteRows() elimina desde la posición especificada
    sheet.deleteRows(lastRowWithData + 1, emptyRowsCount);
    
    return {
      sheetName: sheetName,
      success: true,
      rowsDeleted: emptyRowsCount,
      message: 'Filas vacías eliminadas exitosamente'
    };
    
  } catch (error) {
    Logger.log('Error en cleanupEmptyRowsInSheet(' + sheetName + '): ' + error.message);
    throw error;
  }
}

/**
 * getEmptyRowsReport - Genera un reporte de filas vacías en todas las hojas
 * 
 * Útil para ver cuántas filas vacías hay antes de limpiar.
 * 
 * @returns {Object} Reporte con información de filas vacías
 */
function getEmptyRowsReport() {
  Logger.log('=== GENERANDO REPORTE DE FILAS VACÍAS ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    const sheetsToCheck = [
      SHEETS.CFG_USERS,
      SHEETS.CFG_PARAMS,
      SHEETS.CAT_PRODUCTS,
      SHEETS.INV_STOCK,
      SHEETS.INV_MOVEMENTS,
      SHEETS.CLI_CLIENTS,
      SHEETS.CLI_CREDIT_PLANS,
      SHEETS.CLI_INSTALLMENTS,
      SHEETS.CLI_PAYMENTS,
      SHEETS.TXN_SALES,
      SHEETS.TXN_SALE_ITEMS,
      SHEETS.TXN_CASH_REGISTER,
      SHEETS.TXN_RECEIPTS,
      SHEETS.AUD_LOG
    ];
    
    const report = [];
    let totalEmptyRows = 0;
    
    for (let i = 0; i < sheetsToCheck.length; i++) {
      const sheetName = sheetsToCheck[i];
      const sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        report.push({
          sheetName: sheetName,
          exists: false
        });
        continue;
      }
      
      const maxRows = sheet.getMaxRows();
      const lastRowWithData = sheet.getLastRow();
      const emptyRows = maxRows - lastRowWithData;
      
      totalEmptyRows += emptyRows;
      
      report.push({
        sheetName: sheetName,
        exists: true,
        maxRows: maxRows,
        lastRowWithData: lastRowWithData,
        emptyRows: emptyRows,
        dataRows: lastRowWithData - 1 // Restar header
      });
      
      Logger.log(sheetName + ': ' + emptyRows + ' filas vacías (datos: ' + (lastRowWithData - 1) + ', total: ' + maxRows + ')');
    }
    
    Logger.log('=== REPORTE COMPLETADO ===');
    Logger.log('Total de filas vacías: ' + totalEmptyRows);
    
    return {
      success: true,
      totalEmptyRows: totalEmptyRows,
      sheets: report
    };
    
  } catch (error) {
    Logger.log('ERROR en reporte: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * showEmptyRowsReport - Muestra el reporte de filas vacías en un diálogo
 * 
 * Ejecutar desde el editor de Apps Script para ver el reporte.
 */
function showEmptyRowsReport() {
  try {
    const report = getEmptyRowsReport();
    
    if (!report.success) {
      throw new Error(report.error);
    }
    
    let message = 'REPORTE DE FILAS VACÍAS\n\n';
    message += 'Total de filas vacías: ' + report.totalEmptyRows + '\n\n';
    
    // Mostrar solo hojas con filas vacías
    const sheetsWithEmptyRows = report.sheets.filter(function(s) {
      return s.exists && s.emptyRows > 0;
    });
    
    if (sheetsWithEmptyRows.length === 0) {
      message += '✅ No hay filas vacías en ninguna hoja.';
    } else {
      message += 'Hojas con filas vacías:\n\n';
      for (let i = 0; i < sheetsWithEmptyRows.length; i++) {
        const sheet = sheetsWithEmptyRows[i];
        message += sheet.sheetName + ':\n';
        message += '  • Datos: ' + sheet.dataRows + ' filas\n';
        message += '  • Vacías: ' + sheet.emptyRows + ' filas\n';
        message += '  • Total: ' + sheet.maxRows + ' filas\n\n';
      }
    }
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('Reporte de Filas Vacías', message, ui.ButtonSet.OK);
    
  } catch (error) {
    Logger.log('ERROR al mostrar reporte: ' + error.message);
    
    try {
      const ui = SpreadsheetApp.getUi();
      ui.alert('❌ Error', error.message, ui.ButtonSet.OK);
    } catch (uiError) {
      // Ignorar error de UI
    }
  }
}


/**
 * cleanupAllEmptyRowsNoUI - Limpia filas vacías sin usar UI
 * 
 * Versión alternativa que se puede ejecutar desde el editor de Apps Script
 * sin necesidad de confirmación del usuario.
 * 
 * USAR ESTA FUNCIÓN cuando ejecutes desde el editor de Apps Script.
 * 
 * @returns {Object} Resumen de la limpieza realizada
 */
function cleanupAllEmptyRowsNoUI() {
  Logger.log('=== INICIANDO LIMPIEZA DE FILAS VACÍAS (SIN UI) ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Lista de hojas a limpiar
    const sheetsToClean = [
      SHEETS.CFG_USERS,
      SHEETS.CFG_PARAMS,
      SHEETS.CAT_PRODUCTS,
      SHEETS.INV_STOCK,
      SHEETS.INV_MOVEMENTS,
      SHEETS.CLI_CLIENTS,
      SHEETS.CLI_CREDIT_PLANS,
      SHEETS.CLI_INSTALLMENTS,
      SHEETS.CLI_PAYMENTS,
      SHEETS.TXN_SALES,
      SHEETS.TXN_SALE_ITEMS,
      SHEETS.TXN_CASH_REGISTER,
      SHEETS.TXN_RECEIPTS,
      SHEETS.AUD_LOG
    ];
    
    const results = [];
    let totalRowsDeleted = 0;
    
    // Limpiar cada hoja
    for (let i = 0; i < sheetsToClean.length; i++) {
      const sheetName = sheetsToClean[i];
      Logger.log('Limpiando hoja: ' + sheetName + ' (' + (i + 1) + '/' + sheetsToClean.length + ')');
      
      try {
        const result = cleanupEmptyRowsInSheet(sheetName);
        results.push(result);
        totalRowsDeleted += result.rowsDeleted;
        
        Logger.log('✓ ' + sheetName + ': ' + result.rowsDeleted + ' filas eliminadas');
      } catch (error) {
        Logger.log('✗ Error en ' + sheetName + ': ' + error.message);
        results.push({
          sheetName: sheetName,
          success: false,
          error: error.message,
          rowsDeleted: 0
        });
      }
    }
    
    // Resumen
    const summary = {
      success: true,
      totalSheetsProcessed: sheetsToClean.length,
      totalRowsDeleted: totalRowsDeleted,
      details: results
    };
    
    Logger.log('=== LIMPIEZA COMPLETADA ===');
    Logger.log('Total de filas eliminadas: ' + totalRowsDeleted);
    Logger.log('Resumen detallado:');
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.success && r.rowsDeleted > 0) {
        Logger.log('  • ' + r.sheetName + ': ' + r.rowsDeleted + ' filas eliminadas');
      }
    }
    
    return summary;
    
  } catch (error) {
    Logger.log('ERROR en limpieza: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * diagnosticProductRows - Diagnóstico de filas de productos
 * 
 * Muestra información detallada sobre las filas de la hoja CAT_Products
 * para entender por qué hay 1000 productos.
 * 
 * @returns {Object} Información de diagnóstico
 */
function diagnosticProductRows() {
  Logger.log('=== DIAGNÓSTICO DE FILAS DE PRODUCTOS ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.CAT_PRODUCTS);
    
    if (!sheet) {
      throw new Error('Hoja CAT_Products no encontrada');
    }
    
    // Información básica
    const maxRows = sheet.getMaxRows();
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    
    Logger.log('Información de la hoja:');
    Logger.log('  • Filas totales (maxRows): ' + maxRows);
    Logger.log('  • Última fila con datos (lastRow): ' + lastRow);
    Logger.log('  • Columnas: ' + lastColumn);
    Logger.log('  • Filas vacías: ' + (maxRows - lastRow));
    
    // Leer todas las filas
    const dataRange = sheet.getRange(1, 1, lastRow, lastColumn);
    const data = dataRange.getValues();
    const headers = data[0];
    
    Logger.log('\nHeaders: ' + headers.join(', '));
    
    // Analizar filas
    let realDataRows = 0;
    let emptyRows = 0;
    let partiallyEmptyRows = 0;
    
    const sampleRealRows = [];
    const sampleEmptyRows = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Contar valores no vacíos
      let nonEmptyCount = 0;
      for (let j = 0; j < row.length; j++) {
        if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
          nonEmptyCount++;
        }
      }
      
      if (nonEmptyCount === 0) {
        emptyRows++;
        if (sampleEmptyRows.length < 3) {
          sampleEmptyRows.push({ rowNum: i + 1, data: row });
        }
      } else if (nonEmptyCount < row.length) {
        partiallyEmptyRows++;
      } else {
        realDataRows++;
        if (sampleRealRows.length < 5) {
          const rowObj = {};
          for (let j = 0; j < headers.length; j++) {
            rowObj[headers[j]] = row[j];
          }
          sampleRealRows.push({ rowNum: i + 1, data: rowObj });
        }
      }
    }
    
    Logger.log('\nAnálisis de filas:');
    Logger.log('  • Filas con datos completos: ' + realDataRows);
    Logger.log('  • Filas parcialmente vacías: ' + partiallyEmptyRows);
    Logger.log('  • Filas completamente vacías: ' + emptyRows);
    Logger.log('  • Total de filas de datos: ' + (lastRow - 1));
    
    Logger.log('\nMuestra de filas con datos (primeras 5):');
    for (let i = 0; i < sampleRealRows.length; i++) {
      const sample = sampleRealRows[i];
      Logger.log('  Fila ' + sample.rowNum + ': ' + JSON.stringify(sample.data));
    }
    
    if (sampleEmptyRows.length > 0) {
      Logger.log('\nMuestra de filas vacías:');
      for (let i = 0; i < sampleEmptyRows.length; i++) {
        const sample = sampleEmptyRows[i];
        Logger.log('  Fila ' + sample.rowNum + ': [vacía]');
      }
    }
    
    // Verificar si hay un patrón en las filas
    Logger.log('\nVerificando patrón de datos...');
    if (realDataRows < 20 && (lastRow - 1) > 100) {
      Logger.log('⚠️ PROBLEMA DETECTADO:');
      Logger.log('  Solo hay ' + realDataRows + ' productos reales');
      Logger.log('  Pero lastRow indica ' + (lastRow - 1) + ' filas de datos');
      Logger.log('  Esto sugiere que hay filas con al menos un valor no vacío');
      Logger.log('  (probablemente IDs generados automáticamente)');
    }
    
    // Verificar columna ID específicamente
    Logger.log('\nVerificando columna ID...');
    const idColumnIndex = headers.indexOf('id');
    if (idColumnIndex !== -1) {
      let idsWithData = 0;
      let idsEmpty = 0;
      
      for (let i = 1; i < Math.min(data.length, 100); i++) {
        const idValue = data[i][idColumnIndex];
        if (idValue !== '' && idValue !== null && idValue !== undefined) {
          idsWithData++;
        } else {
          idsEmpty++;
        }
      }
      
      Logger.log('  • Primeras 100 filas con ID: ' + idsWithData);
      Logger.log('  • Primeras 100 filas sin ID: ' + idsEmpty);
      
      if (idsWithData > realDataRows) {
        Logger.log('  ⚠️ Hay más IDs que filas con datos completos');
        Logger.log('  Esto indica que el setup generó IDs pero no datos completos');
      }
    }
    
    const result = {
      maxRows: maxRows,
      lastRow: lastRow,
      realDataRows: realDataRows,
      partiallyEmptyRows: partiallyEmptyRows,
      emptyRows: emptyRows,
      emptyRowsAtEnd: maxRows - lastRow,
      recommendation: ''
    };
    
    if (emptyRows > 0) {
      result.recommendation = 'Ejecutar cleanupAllEmptyRowsNoUI() para eliminar ' + emptyRows + ' filas vacías dentro del rango de datos';
    }
    
    if (maxRows - lastRow > 0) {
      result.recommendation += (result.recommendation ? ' y ' : 'Ejecutar cleanupAllEmptyRowsNoUI() para eliminar ') + 
        (maxRows - lastRow) + ' filas vacías al final';
    }
    
    Logger.log('\n=== DIAGNÓSTICO COMPLETADO ===');
    Logger.log('Recomendación: ' + result.recommendation);
    
    return result;
    
  } catch (error) {
    Logger.log('ERROR en diagnóstico: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * cleanupProductsAggressively - Limpieza agresiva de productos
 * 
 * Elimina filas que solo tienen ID pero no tienen otros datos.
 * Mantiene solo las filas con datos completos (nombre, precio, etc.)
 * 
 * USAR ESTA FUNCIÓN para limpiar CAT_Products específicamente.
 * 
 * @returns {Object} Resultado de la limpieza
 */
function cleanupProductsAggressively() {
  Logger.log('=== LIMPIEZA AGRESIVA DE PRODUCTOS ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.CAT_PRODUCTS);
    
    if (!sheet) {
      throw new Error('Hoja CAT_Products no encontrada');
    }
    
    // Leer todas las filas
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const dataRange = sheet.getRange(1, 1, lastRow, lastColumn);
    const data = dataRange.getValues();
    const headers = data[0];
    
    Logger.log('Filas originales: ' + (data.length - 1));
    
    // Encontrar filas con datos reales (más de solo ID)
    const realRows = [headers]; // Empezar con headers
    let skippedRows = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Contar valores no vacíos (excluyendo columna ID que es la primera)
      let nonEmptyCount = 0;
      for (let j = 1; j < row.length; j++) { // Empezar en 1 para saltar ID
        if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
          nonEmptyCount++;
        }
      }
      
      // Solo mantener filas con datos reales (no solo ID)
      if (nonEmptyCount > 0) {
        realRows.push(row);
      } else {
        skippedRows++;
      }
    }
    
    Logger.log('Filas con datos reales: ' + (realRows.length - 1));
    Logger.log('Filas a eliminar: ' + skippedRows);
    
    // Limpiar hoja y escribir solo filas reales
    sheet.clear();
    
    // Escribir datos reales
    if (realRows.length > 0) {
      sheet.getRange(1, 1, realRows.length, headers.length).setValues(realRows);
    }
    
    // Aplicar formato a headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    Logger.log('✓ Limpieza agresiva completada');
    Logger.log('Productos finales: ' + (realRows.length - 1));
    
    const result = {
      success: true,
      originalRows: data.length - 1,
      realRows: realRows.length - 1,
      deletedRows: skippedRows
    };
    
    Logger.log('=== RESULTADO ===');
    Logger.log(JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    Logger.log('ERROR en limpieza agresiva: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * cleanupAllSheetsCompletely - Limpieza completa de todas las hojas
 * 
 * Combina limpieza agresiva de productos + limpieza de filas vacías en otras hojas.
 * 
 * EJECUTAR ESTA FUNCIÓN para limpiar todo el sistema de una vez.
 * 
 * @returns {Object} Resumen de la limpieza completa
 */
function cleanupAllSheetsCompletely() {
  Logger.log('=== LIMPIEZA COMPLETA DEL SISTEMA ===');
  
  try {
    const results = [];
    
    // 1. Limpieza agresiva de productos
    Logger.log('\n1. Limpiando CAT_Products (agresivo)...');
    const productsResult = cleanupProductsAggressively();
    results.push({
      sheet: 'CAT_Products',
      method: 'aggressive',
      result: productsResult
    });
    
    // 2. Limpieza de filas vacías en otras hojas
    Logger.log('\n2. Limpiando filas vacías en otras hojas...');
    const emptyRowsResult = cleanupAllEmptyRowsNoUI();
    results.push({
      sheet: 'All Others',
      method: 'empty_rows',
      result: emptyRowsResult
    });
    
    // Resumen final
    let totalDeleted = 0;
    if (productsResult.success) {
      totalDeleted += productsResult.deletedRows;
    }
    if (emptyRowsResult.success) {
      totalDeleted += emptyRowsResult.totalRowsDeleted;
    }
    
    Logger.log('\n=== LIMPIEZA COMPLETA FINALIZADA ===');
    Logger.log('Total de filas eliminadas: ' + totalDeleted);
    Logger.log('Productos finales: ' + (productsResult.realRows || 0));
    
    return {
      success: true,
      totalDeleted: totalDeleted,
      details: results
    };
    
  } catch (error) {
    Logger.log('ERROR en limpieza completa: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}


/**
 * sampleEmptyProductRows - Muestra una muestra de las filas "vacías"
 * 
 * Para entender qué datos tienen las 985 filas que no son productos reales.
 */
function sampleEmptyProductRows() {
  Logger.log('=== MUESTRA DE FILAS "VACÍAS" ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.CAT_PRODUCTS);
    
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const dataRange = sheet.getRange(1, 1, lastRow, lastColumn);
    const data = dataRange.getValues();
    const headers = data[0];
    
    Logger.log('Headers: ' + headers.join(', '));
    Logger.log('\nMuestra de filas 17-25 (después de los 15 productos reales):');
    
    for (let i = 16; i < Math.min(25, data.length); i++) {
      const row = data[i];
      const rowObj = {};
      
      for (let j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = row[j];
      }
      
      Logger.log('\nFila ' + (i + 1) + ':');
      Logger.log(JSON.stringify(rowObj, null, 2));
    }
    
    // Analizar qué columnas tienen datos
    Logger.log('\n=== ANÁLISIS DE COLUMNAS CON DATOS ===');
    const columnStats = {};
    
    for (let j = 0; j < headers.length; j++) {
      columnStats[headers[j]] = 0;
    }
    
    // Contar filas con datos en cada columna (filas 17-1000)
    for (let i = 16; i < data.length; i++) {
      const row = data[i];
      for (let j = 0; j < row.length; j++) {
        if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
          columnStats[headers[j]]++;
        }
      }
    }
    
    Logger.log('\nColumnas con datos en filas 17-1000:');
    for (const col in columnStats) {
      if (columnStats[col] > 0) {
        Logger.log('  • ' + col + ': ' + columnStats[col] + ' filas');
      }
    }
    
  } catch (error) {
    Logger.log('ERROR: ' + error.message);
  }
}


/**
 * cleanupProductsIgnoringFalseActive - Limpieza de productos ignorando active=false
 * 
 * Elimina filas que solo tienen active=false pero no tienen otros datos reales.
 * Considera una fila como vacía si solo tiene active=false.
 * 
 * @returns {Object} Resultado de la limpieza
 */
function cleanupProductsIgnoringFalseActive() {
  Logger.log('=== LIMPIEZA DE PRODUCTOS (IGNORANDO active=false) ===');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEETS.CAT_PRODUCTS);
    
    if (!sheet) {
      throw new Error('Hoja CAT_Products no encontrada');
    }
    
    // Leer todas las filas
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const dataRange = sheet.getRange(1, 1, lastRow, lastColumn);
    const data = dataRange.getValues();
    const headers = data[0];
    
    // Encontrar índice de columna 'active'
    const activeColumnIndex = headers.indexOf('active');
    
    Logger.log('Filas originales: ' + (data.length - 1));
    Logger.log('Índice de columna active: ' + activeColumnIndex);
    
    // Encontrar filas con datos reales (ignorando active=false)
    const realRows = [headers]; // Empezar con headers
    let skippedRows = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Contar valores no vacíos (ignorando active si es false)
      let nonEmptyCount = 0;
      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        
        // Ignorar columna active si es false
        if (j === activeColumnIndex && value === false) {
          continue;
        }
        
        // Contar si tiene valor no vacío
        if (value !== '' && value !== null && value !== undefined) {
          nonEmptyCount++;
        }
      }
      
      // Solo mantener filas con datos reales
      if (nonEmptyCount > 0) {
        realRows.push(row);
      } else {
        skippedRows++;
      }
    }
    
    Logger.log('Filas con datos reales: ' + (realRows.length - 1));
    Logger.log('Filas a eliminar: ' + skippedRows);
    
    // Limpiar hoja y escribir solo filas reales
    sheet.clear();
    
    // Escribir datos reales
    if (realRows.length > 0) {
      sheet.getRange(1, 1, realRows.length, headers.length).setValues(realRows);
    }
    
    // Aplicar formato a headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    
    Logger.log('✓ Limpieza completada');
    Logger.log('Productos finales: ' + (realRows.length - 1));
    
    const result = {
      success: true,
      originalRows: data.length - 1,
      realRows: realRows.length - 1,
      deletedRows: skippedRows
    };
    
    Logger.log('=== RESULTADO ===');
    Logger.log(JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    Logger.log('ERROR en limpieza: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}
