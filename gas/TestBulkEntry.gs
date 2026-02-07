/**
 * TestBulkEntry.gs - Script de prueba para Ingreso Masivo
 * 
 * Ejecutar estas funciones desde el editor de Apps Script para:
 * 1. Verificar que las hojas maestras existen
 * 2. Poblar las hojas maestras con datos iniciales
 * 3. Probar el servicio de ingreso masivo
 */

/**
 * Paso 1: Verificar estructura actual
 * Ejecutar primero para ver qué hojas existen y cuáles tienen datos
 */
function testStep1_VerifyStructure() {
  Logger.log('=== PASO 1: VERIFICAR ESTRUCTURA ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = [
    'CAT_Lines',
    'CAT_Categories',
    'CAT_Brands',
    'CAT_Sizes',
    'CAT_Suppliers',
    'CAT_Products',
    'INV_Stock',
    'INV_Movements'
  ];
  
  Logger.log('Verificando hojas necesarias...\n');
  
  requiredSheets.forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log('✗ ' + sheetName + ' - NO EXISTE');
    } else {
      const lastRow = sheet.getLastRow();
      const dataRows = Math.max(0, lastRow - 1);
      Logger.log('✓ ' + sheetName + ' - Existe (' + dataRows + ' registros)');
    }
  });
  
  Logger.log('\n=== VERIFICACIÓN COMPLETADA ===');
}

/**
 * Paso 2: Ejecutar configuración segura
 * Esto creará las hojas maestras y poblará con datos iniciales
 */
function testStep2_SafeSetup() {
  Logger.log('=== PASO 2: CONFIGURACIÓN SEGURA ===');
  Logger.log('Ejecutando safeSetupNewFeatures()...\n');
  
  try {
    const report = safeSetupNewFeatures();
    
    Logger.log('\n✅ Configuración completada exitosamente');
    Logger.log('Hojas creadas: ' + report.sheetsCreated.length);
    Logger.log('Columnas agregadas: ' + report.columnsAdded.length);
    
    return report;
    
  } catch (error) {
    Logger.log('\n✗ Error en configuración: ' + error.message);
    throw error;
  }
}

/**
 * Paso 3: Verificar datos maestros
 * Verifica que las hojas maestras tengan datos
 */
function testStep3_VerifyMasterData() {
  Logger.log('=== PASO 3: VERIFICAR DATOS MAESTROS ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Verificar CAT_Lines
  const linesSheet = ss.getSheetByName('CAT_Lines');
  if (linesSheet) {
    const linesCount = linesSheet.getLastRow() - 1;
    Logger.log('✓ CAT_Lines: ' + linesCount + ' líneas');
  } else {
    Logger.log('✗ CAT_Lines: NO EXISTE');
  }
  
  // Verificar CAT_Brands
  const brandsSheet = ss.getSheetByName('CAT_Brands');
  if (brandsSheet) {
    const brandsCount = brandsSheet.getLastRow() - 1;
    Logger.log('✓ CAT_Brands: ' + brandsCount + ' marcas');
  } else {
    Logger.log('✗ CAT_Brands: NO EXISTE');
  }
  
  // Verificar CAT_Categories
  const categoriesSheet = ss.getSheetByName('CAT_Categories');
  if (categoriesSheet) {
    const categoriesCount = categoriesSheet.getLastRow() - 1;
    Logger.log('✓ CAT_Categories: ' + categoriesCount + ' categorías');
  } else {
    Logger.log('✗ CAT_Categories: NO EXISTE');
  }
  
  // Verificar CAT_Sizes
  const sizesSheet = ss.getSheetByName('CAT_Sizes');
  if (sizesSheet) {
    const sizesCount = sizesSheet.getLastRow() - 1;
    Logger.log('✓ CAT_Sizes: ' + sizesCount + ' tallas');
  } else {
    Logger.log('✗ CAT_Sizes: NO EXISTE');
  }
  
  // Verificar CAT_Suppliers
  const suppliersSheet = ss.getSheetByName('CAT_Suppliers');
  if (suppliersSheet) {
    const suppliersCount = suppliersSheet.getLastRow() - 1;
    Logger.log('✓ CAT_Suppliers: ' + suppliersCount + ' proveedores');
  } else {
    Logger.log('✗ CAT_Suppliers: NO EXISTE');
  }
  
  Logger.log('\n=== VERIFICACIÓN COMPLETADA ===');
}

/**
 * Paso 4: Probar servicio de ingreso masivo
 * Prueba que el servicio funcione correctamente
 */
function testStep4_TestBulkService() {
  Logger.log('=== PASO 4: PROBAR SERVICIO DE INGRESO MASIVO ===');
  
  try {
    const service = new BulkProductService();
    
    // Probar getMasterData para líneas
    Logger.log('\n1. Probando getMasterData(lines)...');
    const lines = service.getMasterData('lines', {});
    Logger.log('✓ Líneas obtenidas: ' + lines.length);
    
    // Probar getMasterData para marcas
    Logger.log('\n2. Probando getMasterData(brands)...');
    const brands = service.getMasterData('brands', {});
    Logger.log('✓ Marcas obtenidas: ' + brands.length);
    
    // Probar getMasterData para categorías (requiere lineId)
    if (lines.length > 0) {
      Logger.log('\n3. Probando getMasterData(categories) con lineId...');
      const categories = service.getMasterData('categories', { lineId: lines[0].id });
      Logger.log('✓ Categorías obtenidas: ' + categories.length);
      
      // Probar getMasterData para tallas (requiere categoryId)
      if (categories.length > 0) {
        Logger.log('\n4. Probando getMasterData(sizes) con categoryId...');
        const sizes = service.getMasterData('sizes', { categoryId: categories[0].id });
        Logger.log('✓ Tallas obtenidas: ' + sizes.length);
      }
    }
    
    // Probar getMasterData para proveedores (requiere brandId)
    if (brands.length > 0) {
      Logger.log('\n5. Probando getMasterData(suppliers) con brandId...');
      const suppliers = service.getMasterData('suppliers', { brandId: brands[0].id });
      Logger.log('✓ Proveedores obtenidos: ' + suppliers.length);
    }
    
    Logger.log('\n✅ TODAS LAS PRUEBAS PASARON');
    Logger.log('El servicio de ingreso masivo está funcionando correctamente');
    
  } catch (error) {
    Logger.log('\n✗ Error en pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * Ejecutar todos los pasos en secuencia
 * Esta función ejecuta todos los pasos de prueba automáticamente
 */
function testAll_RunAllSteps() {
  Logger.log('╔════════════════════════════════════════════════════════╗');
  Logger.log('║  PRUEBA COMPLETA DE INGRESO MASIVO                    ║');
  Logger.log('╚════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  try {
    // Paso 1: Verificar estructura
    testStep1_VerifyStructure();
    Logger.log('\n' + '─'.repeat(60) + '\n');
    
    // Paso 2: Configuración segura
    testStep2_SafeSetup();
    Logger.log('\n' + '─'.repeat(60) + '\n');
    
    // Paso 3: Verificar datos maestros
    testStep3_VerifyMasterData();
    Logger.log('\n' + '─'.repeat(60) + '\n');
    
    // Paso 4: Probar servicio
    testStep4_TestBulkService();
    
    Logger.log('\n╔════════════════════════════════════════════════════════╗');
    Logger.log('║  ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE        ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('🎉 El sistema de ingreso masivo está listo para usar');
    Logger.log('');
    Logger.log('PRÓXIMOS PASOS:');
    Logger.log('1. Crear nueva versión en Apps Script Editor');
    Logger.log('2. Limpiar caché del navegador (Ctrl+Shift+Delete)');
    Logger.log('3. Probar en modo incógnito');
    Logger.log('4. Acceder a "Ingreso Masivo" desde el menú');
    
  } catch (error) {
    Logger.log('\n╔════════════════════════════════════════════════════════╗');
    Logger.log('║  ✗ ERROR EN LAS PRUEBAS                               ║');
    Logger.log('╚════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Error: ' + error.message);
    Logger.log('');
    Logger.log('Por favor, revisa el error y vuelve a intentar.');
  }
}
