/**
 * SafeSetup.gs - Configuración Segura de Nuevas Funcionalidades
 * 
 * Este script actualiza la base de datos existente SIN BORRAR DATOS.
 * Solo agrega las nuevas hojas maestras y columnas necesarias.
 * 
 * SEGURIDAD:
 * - NO sobrescribe hojas existentes con datos
 * - Solo crea hojas nuevas que no existan
 * - Agrega columnas faltantes sin borrar datos existentes
 * - Genera reporte detallado de cambios
 */

/**
 * safeSetupNewFeatures - Configuración segura de nuevas funcionalidades
 * 
 * Esta función es SEGURA para ejecutar en una base de datos con datos existentes.
 * Solo agrega las nuevas hojas maestras y actualiza la estructura de CAT_Products.
 * 
 * IMPORTANTE: Ejecutar desde el editor de Apps Script
 * NOTA: Esta versión NO requiere UI, funciona desde el editor
 */
function safeSetupNewFeatures() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = {
    sheetsCreated: [],
    sheetsSkipped: [],
    columnsAdded: [],
    warnings: [],
    success: true
  };
  
  try {
    Logger.log('=== INICIANDO CONFIGURACIÓN SEGURA ===');
    Logger.log('Spreadsheet: ' + ss.getName());
    Logger.log('');
    Logger.log('⚠️  IMPORTANTE: Esta operación es SEGURA');
    Logger.log('✓ NO borrará datos existentes');
    Logger.log('✓ Solo creará hojas nuevas');
    Logger.log('✓ Agregará columnas faltantes a CAT_Products');
    Logger.log('');
    Logger.log('Iniciando en 3 segundos...');
    Utilities.sleep(3000);
    
    // 1. Crear hojas maestras nuevas (solo si no existen)
    Logger.log('\n=== PASO 1: Crear hojas maestras ===');
    createSheetSafe(ss, 'CAT_Lines', createCATLinesSheet, report);
    createSheetSafe(ss, 'CAT_Categories', createCATCategoriesSheet, report);
    createSheetSafe(ss, 'CAT_Brands', createCATBrandsSheet, report);
    createSheetSafe(ss, 'CAT_Sizes', createCATSizesSheet, report);
    createSheetSafe(ss, 'CAT_Suppliers', createCATSuppliersSheet, report);
    
    // 2. Actualizar estructura de CAT_Products (agregar columnas faltantes)
    Logger.log('\n=== PASO 2: Actualizar CAT_Products ===');
    updateCATProductsStructure(ss, report);
    
    // 3. Poblar hojas maestras con datos iniciales (solo si están vacías)
    Logger.log('\n=== PASO 3: Poblar datos maestros ===');
    seedMasterDataSafe(ss, report);
    
    // 4. Generar reporte
    Logger.log('\n=== CONFIGURACIÓN COMPLETADA ===');
    showReportLog(report);
    
    return report;
    
  } catch (error) {
    Logger.log('ERROR en safeSetupNewFeatures: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    report.success = false;
    report.warnings.push('ERROR: ' + error.message);
    
    throw error;
  }
}

/**
 * createSheetSafe - Crea una hoja solo si no existe
 * 
 * @param {Spreadsheet} ss - Spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Function} createFunction - Función que crea la hoja
 * @param {Object} report - Objeto de reporte
 */
function createSheetSafe(ss, sheetName, createFunction, report) {
  try {
    const existingSheet = ss.getSheetByName(sheetName);
    
    if (existingSheet) {
      // Verificar si tiene datos
      const lastRow = existingSheet.getLastRow();
      if (lastRow > 1) {
        Logger.log('⚠️  Hoja "' + sheetName + '" ya existe con datos (' + (lastRow - 1) + ' registros) - OMITIDA');
        report.sheetsSkipped.push(sheetName + ' (tiene ' + (lastRow - 1) + ' registros)');
      } else {
        Logger.log('⚠️  Hoja "' + sheetName + '" ya existe vacía - OMITIDA');
        report.sheetsSkipped.push(sheetName + ' (vacía)');
      }
      return;
    }
    
    // Crear la hoja
    Logger.log('✓ Creando hoja "' + sheetName + '"...');
    createFunction(ss);
    report.sheetsCreated.push(sheetName);
    Logger.log('✓ Hoja "' + sheetName + '" creada exitosamente');
    
  } catch (error) {
    Logger.log('✗ Error al crear hoja "' + sheetName + '": ' + error.message);
    report.warnings.push('Error al crear ' + sheetName + ': ' + error.message);
  }
}

/**
 * updateCATProductsStructure - Actualiza la estructura de CAT_Products
 * 
 * Agrega las nuevas columnas sin borrar datos existentes.
 * 
 * @param {Spreadsheet} ss - Spreadsheet
 * @param {Object} report - Objeto de reporte
 */
function updateCATProductsStructure(ss, report) {
  try {
    const sheet = ss.getSheetByName('CAT_Products');
    
    if (!sheet) {
      Logger.log('⚠️  Hoja CAT_Products no existe - se creará con estructura completa');
      createCATProductsSheet(ss);
      if (report && report.sheetsCreated) {
        report.sheetsCreated.push('CAT_Products');
      }
      return;
    }
    
    Logger.log('Analizando estructura de CAT_Products...');
    
    // Obtener headers actuales
    const lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) {
      Logger.log('⚠️  CAT_Products está vacía - se agregará estructura completa');
      createCATProductsSheet(ss);
      return;
    }
    
    const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    Logger.log('Headers actuales: ' + currentHeaders.join(', '));
    
    // Headers esperados (nueva estructura)
    const expectedHeaders = [
      'id', 'barcode', 'name', 'description', 'line_id', 'category_id', 
      'brand_id', 'supplier_id', 'size', 'color', 'presentation',
      'purchase_price', 'price', 'min_stock', 'barcode_url', 
      'active', 'created_at', 'updated_at'
    ];
    
    // Encontrar columnas faltantes
    const missingHeaders = [];
    for (let i = 0; i < expectedHeaders.length; i++) {
      const header = expectedHeaders[i];
      if (currentHeaders.indexOf(header) === -1) {
        missingHeaders.push(header);
      }
    }
    
    if (missingHeaders.length === 0) {
      Logger.log('✓ CAT_Products ya tiene todas las columnas necesarias');
      if (report && report.sheetsSkipped) {
        report.sheetsSkipped.push('CAT_Products (estructura completa)');
      }
      return;
    }
    
    Logger.log('Columnas faltantes: ' + missingHeaders.join(', '));
    
    // Agregar columnas faltantes al final
    const startColumn = lastColumn + 1;
    for (let i = 0; i < missingHeaders.length; i++) {
      const header = missingHeaders[i];
      const columnIndex = startColumn + i;
      
      sheet.getRange(1, columnIndex).setValue(header);
      Logger.log('✓ Columna "' + header + '" agregada en posición ' + columnIndex);
      
      if (report && report.columnsAdded) {
        report.columnsAdded.push('CAT_Products.' + header);
      }
    }
    
    // Aplicar formato a los headers nuevos
    const newHeadersRange = sheet.getRange(1, startColumn, 1, missingHeaders.length);
    newHeadersRange.setFontWeight('bold');
    newHeadersRange.setBackground('#4285F4');
    newHeadersRange.setFontColor('#FFFFFF');
    newHeadersRange.setHorizontalAlignment('center');
    
    Logger.log('✓ CAT_Products actualizada con ' + missingHeaders.length + ' columnas nuevas');
    
  } catch (error) {
    Logger.log('✗ Error al actualizar CAT_Products: ' + error.message);
    if (report && report.warnings) {
      report.warnings.push('Error al actualizar CAT_Products: ' + error.message);
    }
  }
}

/**
 * seedMasterDataSafe - Pobla datos maestros solo si las hojas están vacías
 * 
 * @param {Spreadsheet} ss - Spreadsheet
 * @param {Object} report - Objeto de reporte
 */
function seedMasterDataSafe(ss, report) {
  try {
    // Poblar cada hoja maestra solo si está vacía
    seedSheetSafe(ss, 'CAT_Lines', seedCATLines, report);
    seedSheetSafe(ss, 'CAT_Categories', seedCATCategories, report);
    seedSheetSafe(ss, 'CAT_Brands', seedCATBrands, report);
    seedSheetSafe(ss, 'CAT_Sizes', seedCATSizes, report);
    seedSheetSafe(ss, 'CAT_Suppliers', seedCATSuppliers, report);
    
  } catch (error) {
    Logger.log('✗ Error al poblar datos maestros: ' + error.message);
    report.warnings.push('Error al poblar datos: ' + error.message);
  }
}

/**
 * seedSheetSafe - Pobla una hoja solo si está vacía
 * 
 * @param {Spreadsheet} ss - Spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Function} seedFunction - Función que pobla la hoja
 * @param {Object} report - Objeto de reporte
 */
function seedSheetSafe(ss, sheetName, seedFunction, report) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log('⚠️  Hoja "' + sheetName + '" no existe - omitiendo datos');
      if (report && report.warnings) {
        report.warnings.push('Hoja ' + sheetName + ' no existe');
      }
      return;
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      Logger.log('⚠️  Hoja "' + sheetName + '" ya tiene datos - omitiendo seed');
      return;
    }
    
    Logger.log('✓ Poblando "' + sheetName + '" con datos iniciales...');
    seedFunction(ss);
    Logger.log('✓ Datos iniciales agregados a "' + sheetName + '"');
    
  } catch (error) {
    Logger.log('✗ Error al poblar "' + sheetName + '": ' + error.message);
    if (report && report.warnings) {
      report.warnings.push('Error al poblar ' + sheetName + ': ' + error.message);
    }
  }
}

/**
 * showReportLog - Muestra el reporte en el log (sin UI)
 * 
 * @param {Object} report - Objeto de reporte
 */
function showReportLog(report) {
  Logger.log('');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('✅ CONFIGURACIÓN COMPLETADA');
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('');
  
  // Hojas creadas
  if (report.sheetsCreated.length > 0) {
    Logger.log('📝 HOJAS CREADAS (' + report.sheetsCreated.length + '):');
    report.sheetsCreated.forEach(function(sheet) {
      Logger.log('  ✓ ' + sheet);
    });
    Logger.log('');
  }
  
  // Hojas omitidas
  if (report.sheetsSkipped.length > 0) {
    Logger.log('⏭️  HOJAS OMITIDAS (' + report.sheetsSkipped.length + '):');
    report.sheetsSkipped.forEach(function(sheet) {
      Logger.log('  • ' + sheet);
    });
    Logger.log('');
  }
  
  // Columnas agregadas
  if (report.columnsAdded.length > 0) {
    Logger.log('➕ COLUMNAS AGREGADAS (' + report.columnsAdded.length + '):');
    report.columnsAdded.forEach(function(col) {
      Logger.log('  ✓ ' + col);
    });
    Logger.log('');
  }
  
  // Advertencias
  if (report.warnings.length > 0) {
    Logger.log('⚠️  ADVERTENCIAS (' + report.warnings.length + '):');
    report.warnings.forEach(function(warning) {
      Logger.log('  ! ' + warning);
    });
    Logger.log('');
  }
  
  // Resumen
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  Logger.log('RESUMEN:');
  Logger.log('• Hojas creadas: ' + report.sheetsCreated.length);
  Logger.log('• Hojas omitidas: ' + report.sheetsSkipped.length);
  Logger.log('• Columnas agregadas: ' + report.columnsAdded.length);
  Logger.log('• Advertencias: ' + report.warnings.length);
  Logger.log('');
  
  if (report.success) {
    Logger.log('✅ Sistema actualizado exitosamente');
  } else {
    Logger.log('⚠️  Completado con advertencias');
  }
  Logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * showReport - Muestra el reporte de la configuración (con UI)
 * 
 * @param {Ui} ui - Objeto UI de SpreadsheetApp
 * @param {Object} report - Objeto de reporte
 */
function showReport(ui, report) {
  let message = '✅ CONFIGURACIÓN COMPLETADA\n\n';
  
  // Hojas creadas
  if (report.sheetsCreated.length > 0) {
    message += '📝 HOJAS CREADAS (' + report.sheetsCreated.length + '):\n';
    report.sheetsCreated.forEach(function(sheet) {
      message += '  ✓ ' + sheet + '\n';
    });
    message += '\n';
  }
  
  // Hojas omitidas
  if (report.sheetsSkipped.length > 0) {
    message += '⏭️  HOJAS OMITIDAS (' + report.sheetsSkipped.length + '):\n';
    report.sheetsSkipped.forEach(function(sheet) {
      message += '  • ' + sheet + '\n';
    });
    message += '\n';
  }
  
  // Columnas agregadas
  if (report.columnsAdded.length > 0) {
    message += '➕ COLUMNAS AGREGADAS (' + report.columnsAdded.length + '):\n';
    report.columnsAdded.forEach(function(col) {
      message += '  ✓ ' + col + '\n';
    });
    message += '\n';
  }
  
  // Advertencias
  if (report.warnings.length > 0) {
    message += '⚠️  ADVERTENCIAS (' + report.warnings.length + '):\n';
    report.warnings.forEach(function(warning) {
      message += '  ! ' + warning + '\n';
    });
    message += '\n';
  }
  
  // Resumen
  message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  message += 'RESUMEN:\n';
  message += '• Hojas creadas: ' + report.sheetsCreated.length + '\n';
  message += '• Hojas omitidas: ' + report.sheetsSkipped.length + '\n';
  message += '• Columnas agregadas: ' + report.columnsAdded.length + '\n';
  message += '• Advertencias: ' + report.warnings.length + '\n';
  
  if (report.success) {
    message += '\n✅ Sistema actualizado exitosamente';
  } else {
    message += '\n⚠️  Completado con advertencias';
  }
  
  Logger.log('\n' + message);
  
  try {
    ui.alert('Reporte de Configuración', message, ui.ButtonSet.OK);
  } catch (e) {
    Logger.log('No se pudo mostrar UI alert: ' + e.message);
  }
}

/**
 * verifyCurrentStructure - Verifica la estructura actual de la base de datos
 * 
 * Esta función NO modifica nada, solo genera un reporte de lo que existe.
 * Útil para revisar antes de ejecutar safeSetupNewFeatures().
 */
function verifyCurrentStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('=== VERIFICACIÓN DE ESTRUCTURA ACTUAL ===');
  Logger.log('Spreadsheet: ' + ss.getName());
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('');
  
  const allSheets = ss.getSheets();
  Logger.log('Total de hojas: ' + allSheets.length);
  Logger.log('');
  
  // Verificar cada hoja
  allSheets.forEach(function(sheet) {
    const name = sheet.getName();
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const dataRows = Math.max(0, lastRow - 1); // Restar header
    
    Logger.log('📄 ' + name);
    Logger.log('   Filas: ' + lastRow + ' (datos: ' + dataRows + ')');
    Logger.log('   Columnas: ' + lastColumn);
    
    if (lastColumn > 0) {
      const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      Logger.log('   Headers: ' + headers.join(', '));
    }
    
    Logger.log('');
  });
  
  // Verificar hojas maestras necesarias
  Logger.log('=== HOJAS MAESTRAS NECESARIAS ===');
  const requiredSheets = [
    'CAT_Lines',
    'CAT_Categories',
    'CAT_Brands',
    'CAT_Sizes',
    'CAT_Suppliers'
  ];
  
  requiredSheets.forEach(function(sheetName) {
    const exists = ss.getSheetByName(sheetName) !== null;
    Logger.log((exists ? '✓' : '✗') + ' ' + sheetName);
  });
  
  Logger.log('');
  Logger.log('=== VERIFICACIÓN COMPLETADA ===');
  
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Verificación Completada',
      'Revisa el log de ejecución (Ver → Registros) para ver el reporte completo.',
      ui.ButtonSet.OK
    );
  } catch (e) {
    // Ignorar error de UI
  }
}
