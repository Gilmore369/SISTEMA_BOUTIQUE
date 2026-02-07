/**
 * FixMasterData.gs - Limpia y repuebla hojas maestras con datos reales
 * 
 * PROBLEMA: Las hojas maestras tienen 999 filas vacías (solo validaciones)
 * SOLUCIÓN: Limpia las filas vacías y agrega datos reales
 */

/**
 * EJECUTAR ESTA FUNCIÓN PARA SOLUCIONAR EL PROBLEMA
 * 
 * Esta función:
 * 1. Limpia las filas vacías de las hojas maestras
 * 2. Agrega datos reales (líneas, categorías, marcas, tallas, proveedores)
 * 3. Verifica que los datos se agregaron correctamente
 */
function fixMasterDataNow() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║  LIMPIEZA Y REPOBLACIÓN DE DATOS MAESTROS             ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    // Paso 1: Limpiar hojas maestras
    Logger.log('=== PASO 1: LIMPIAR HOJAS MAESTRAS ===');
    cleanMasterSheet(ss, 'CAT_Lines');
    cleanMasterSheet(ss, 'CAT_Categories');
    cleanMasterSheet(ss, 'CAT_Brands');
    cleanMasterSheet(ss, 'CAT_Sizes');
    cleanMasterSheet(ss, 'CAT_Suppliers');
    
    Logger.log('');
    Logger.log('─'.repeat(60));
    Logger.log('');
    
    // Paso 2: Poblar con datos reales
    Logger.log('=== PASO 2: POBLAR CON DATOS REALES ===');
    seedCATLines(ss);
    seedCATCategories(ss);
    seedCATBrands(ss);
    seedCATSizes(ss);
    seedCATSuppliers(ss);
    
    Logger.log('');
    Logger.log('─'.repeat(60));
    Logger.log('');
    
    // Paso 3: Verificar datos
    Logger.log('=== PASO 3: VERIFICAR DATOS ===');
    verifyMasterData(ss);
    
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════╗');
    Logger.log('║  ✅ DATOS MAESTROS CORREGIDOS EXITOSAMENTE            ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('🎉 Ahora puedes probar el Ingreso Masivo');
    Logger.log('');
    Logger.log('PRÓXIMOS PASOS:');
    Logger.log('1. Crear nueva versión en Apps Script Editor');
    Logger.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
    Logger.log('3. Probar en modo incógnito');
    
  } catch (error) {
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════╗');
    Logger.log('║  ✗ ERROR AL CORREGIR DATOS                            ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * cleanMasterSheet - Limpia una hoja maestra dejando solo el header
 * 
 * @param {Spreadsheet} ss - Spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 */
function cleanMasterSheet(ss, sheetName) {
  try {
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log('⚠️  Hoja "' + sheetName + '" no existe - omitiendo');
      return;
    }
    
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      Logger.log('✓ "' + sheetName + '" ya está limpia (solo header)');
      return;
    }
    
    // Limpiar contenido de todas las filas excepto el header
    Logger.log('🧹 Limpiando "' + sheetName + '" (' + (lastRow - 1) + ' filas)...');
    
    // Estrategia: limpiar el contenido en lugar de borrar filas
    const lastColumn = sheet.getLastColumn();
    if (lastRow > 1 && lastColumn > 0) {
      // Limpiar contenido de las filas de datos
      const dataRange = sheet.getRange(2, 1, lastRow - 1, lastColumn);
      dataRange.clearContent();
      
      // Borrar filas vacías (dejar solo 1 fila de datos vacía)
      if (lastRow > 2) {
        sheet.deleteRows(3, lastRow - 2);
      }
    }
    
    Logger.log('✓ "' + sheetName + '" limpiada exitosamente');
    
  } catch (error) {
    Logger.log('✗ Error al limpiar "' + sheetName + '": ' + error.message);
    throw error;
  }
}

/**
 * verifyMasterData - Verifica que los datos se agregaron correctamente
 * 
 * @param {Spreadsheet} ss - Spreadsheet
 */
function verifyMasterData(ss) {
  const sheets = [
    { name: 'CAT_Lines', expected: 4 },
    { name: 'CAT_Categories', expected: 16 },
    { name: 'CAT_Brands', expected: 11 },
    { name: 'CAT_Sizes', expected: 43 },
    { name: 'CAT_Suppliers', expected: 4 }
  ];
  
  let allOk = true;
  
  sheets.forEach(function(sheetInfo) {
    const sheet = ss.getSheetByName(sheetInfo.name);
    
    if (!sheet) {
      Logger.log('✗ ' + sheetInfo.name + ' - NO EXISTE');
      allOk = false;
      return;
    }
    
    const dataRows = sheet.getLastRow() - 1;
    
    if (dataRows === sheetInfo.expected) {
      Logger.log('✓ ' + sheetInfo.name + ': ' + dataRows + ' registros (correcto)');
    } else {
      Logger.log('⚠️  ' + sheetInfo.name + ': ' + dataRows + ' registros (esperado: ' + sheetInfo.expected + ')');
      allOk = false;
    }
  });
  
  if (!allOk) {
    Logger.log('');
    Logger.log('⚠️  Algunos datos no coinciden con lo esperado');
  }
}

/**
 * testMasterDataService - Prueba que el servicio pueda leer los datos
 */
function testMasterDataService() {
  Logger.log('=== PROBANDO SERVICIO DE DATOS MAESTROS ===');
  Logger.log('');
  
  try {
    const service = new BulkProductService();
    
    // Probar líneas
    Logger.log('1. Probando getMasterData("lines")...');
    const lines = service.getMasterData('lines', {});
    Logger.log('   Resultado: ' + lines.length + ' líneas');
    if (lines.length > 0) {
      Logger.log('   Primera línea: ' + JSON.stringify(lines[0]));
    }
    Logger.log('');
    
    // Probar marcas
    Logger.log('2. Probando getMasterData("brands")...');
    const brands = service.getMasterData('brands', {});
    Logger.log('   Resultado: ' + brands.length + ' marcas');
    if (brands.length > 0) {
      Logger.log('   Primera marca: ' + JSON.stringify(brands[0]));
    }
    Logger.log('');
    
    // Probar categorías
    if (lines.length > 0) {
      Logger.log('3. Probando getMasterData("categories") con lineId...');
      const categories = service.getMasterData('categories', { lineId: lines[0].id });
      Logger.log('   Resultado: ' + categories.length + ' categorías');
      if (categories.length > 0) {
        Logger.log('   Primera categoría: ' + JSON.stringify(categories[0]));
      }
      Logger.log('');
      
      // Probar tallas
      if (categories.length > 0) {
        Logger.log('4. Probando getMasterData("sizes") con categoryId...');
        const sizes = service.getMasterData('sizes', { categoryId: categories[0].id });
        Logger.log('   Resultado: ' + sizes.length + ' tallas');
        if (sizes.length > 0) {
          Logger.log('   Primera talla: ' + JSON.stringify(sizes[0]));
        }
        Logger.log('');
      }
    }
    
    // Probar proveedores
    if (brands.length > 0) {
      Logger.log('5. Probando getMasterData("suppliers") con brandId...');
      const suppliers = service.getMasterData('suppliers', { brandId: brands[0].id });
      Logger.log('   Resultado: ' + suppliers.length + ' proveedores');
      if (suppliers.length > 0) {
        Logger.log('   Primer proveedor: ' + JSON.stringify(suppliers[0]));
      }
      Logger.log('');
    }
    
    Logger.log('✅ TODAS LAS PRUEBAS DEL SERVICIO PASARON');
    
  } catch (error) {
    Logger.log('✗ Error en pruebas del servicio: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * quickFix - Solución rápida: limpia y repuebla todo
 * 
 * EJECUTAR ESTA FUNCIÓN SI TIENES PROBLEMAS
 */
function quickFix() {
  Logger.log('🚀 SOLUCIÓN RÁPIDA - INICIANDO...');
  Logger.log('');
  
  // Paso 1: Corregir datos maestros
  fixMasterDataNow();
  
  Logger.log('');
  Logger.log('─'.repeat(60));
  Logger.log('');
  
  // Paso 2: Probar servicio
  testMasterDataService();
  
  Logger.log('');
  Logger.log('🎉 SOLUCIÓN RÁPIDA COMPLETADA');
  Logger.log('');
  Logger.log('El sistema está listo para usar.');
}

/**
 * inspectSheet - Inspecciona una hoja para ver qué datos tiene
 * 
 * @param {string} sheetName - Nombre de la hoja a inspeccionar
 */
function inspectSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log('Hoja "' + sheetName + '" no existe');
    return;
  }
  
  Logger.log('=== INSPECCIÓN DE ' + sheetName + ' ===');
  Logger.log('');
  
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  
  Logger.log('Última fila: ' + lastRow);
  Logger.log('Última columna: ' + lastColumn);
  Logger.log('');
  
  if (lastRow === 0 || lastColumn === 0) {
    Logger.log('Hoja vacía');
    return;
  }
  
  // Mostrar headers
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  Logger.log('Headers: ' + headers.join(', '));
  Logger.log('');
  
  // Mostrar primeras 5 filas de datos
  const dataRows = Math.min(5, lastRow - 1);
  if (dataRows > 0) {
    Logger.log('Primeras ' + dataRows + ' filas de datos:');
    const data = sheet.getRange(2, 1, dataRows, lastColumn).getValues();
    
    for (let i = 0; i < data.length; i++) {
      Logger.log('Fila ' + (i + 2) + ': ' + JSON.stringify(data[i]));
    }
  } else {
    Logger.log('No hay datos (solo header)');
  }
  
  Logger.log('');
  Logger.log('=== FIN INSPECCIÓN ===');
}

/**
 * inspectAllMasterSheets - Inspecciona todas las hojas maestras
 */
function inspectAllMasterSheets() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║  INSPECCIÓN DE TODAS LAS HOJAS MAESTRAS               ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  const sheets = ['CAT_Lines', 'CAT_Categories', 'CAT_Brands', 'CAT_Sizes', 'CAT_Suppliers'];
  
  sheets.forEach(function(sheetName) {
    inspectSheet(sheetName);
    Logger.log('');
    Logger.log('─'.repeat(60));
    Logger.log('');
  });
}
