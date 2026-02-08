/**
 * DatabaseSetup.gs - Configuración Unificada de Base de Datos
 * Adiction Boutique Suite
 * 
 * ARCHIVO ÚNICO DE CONFIGURACIÓN DE BASE DE DATOS
 * ================================================
 * Este es el ÚNICO archivo que define la estructura completa de la base de datos.
 * 
 * CONTENIDO:
 * - Estructura de todas las hojas (columnas, anchos, seed data)
 * - Funciones de setup inicial y actualización segura
 * - Funciones de verificación y diagnóstico
 * 
 * FUNCIONES PRINCIPALES:
 * =====================
 * 1. setupCompleteDatabase() - Configuración completa desde cero (⚠️ BORRA DATOS)
 * 2. safeUpdateDatabase() - Actualización segura sin borrar datos (✓ RECOMENDADO)
 * 3. verifyDatabaseStructure() - Verificar estructura actual (solo lectura)
 * 
 * EJECUCIÓN:
 * ==========
 * Para nueva instalación:
 *   - Ejecutar: setupCompleteDatabase()
 * 
 * Para actualizar base existente:
 *   - Ejecutar: safeUpdateDatabase()
 * 
 * Para verificar estructura:
 *   - Ejecutar: verifyDatabaseStructure()
 */

// ============================================================================
// CONSTANTES DE ESTRUCTURA
// ============================================================================

/**
 * Definición completa de la estructura de la base de datos
 */
const DATABASE_STRUCTURE = {
  'CFG_Users': {
    columns: ['id', 'email', 'name', 'roles', 'stores', 'active', 'created_at'],
    widths: [200, 250, 200, 150, 150, 80, 150],
    seedData: [
      ['usr_001', 'admin@adictionboutique.com', 'María González', '["Admin"]', '["Mujeres", "Hombres"]', 'TRUE', new Date()],
      ['usr_002', 'vendedor.mujeres@adictionboutique.com', 'Ana Rodríguez', '["Vendedor"]', '["Mujeres"]', 'TRUE', new Date()],
      ['usr_003', 'vendedor.hombres@adictionboutique.com', 'Carlos Pérez', '["Vendedor", "Cajero"]', '["Hombres"]', 'TRUE', new Date()],
      ['usr_004', 'cobrador@adictionboutique.com', 'Luis Martínez', '["Cobrador"]', '["Mujeres", "Hombres"]', 'TRUE', new Date()],
      ['usr_005', 'gianpapex@gmail.com', 'Gian Papex', '["Admin", "Vendedor"]', '["Mujeres", "Hombres"]', 'TRUE', new Date()]
    ]
  },
  
  'CFG_Params': {
    columns: ['key', 'value', 'description', 'type'],
    widths: [250, 150, 400, 100],
    seedData: [
      ['MIN_STOCK_ALERT', '10', 'Nivel mínimo de stock para generar alerta', 'NUMBER'],
      ['MAX_DISCOUNT_WITHOUT_AUTH', '100', 'Monto máximo de descuento sin autorización', 'NUMBER'],
      ['MAX_EXPENSE_WITHOUT_AUTH', '500', 'Monto máximo de egreso sin autorización', 'NUMBER'],
      ['BIRTHDAY_DISCOUNT_PERCENT', '15', 'Porcentaje de descuento por cumpleaños', 'NUMBER'],
      ['STALLED_INVENTORY_DAYS', '180', 'Días para considerar mercadería estancada', 'NUMBER']
    ]
  },
  
  'CAT_Lines': {
    columns: ['id', 'code', 'name', 'description', 'active', 'created_at'],
    widths: [150, 100, 200, 300, 80, 150],
    seedData: [
      ['line-001', 'DAMA', 'Ropa de Dama', 'Línea de ropa para mujer', 'TRUE', new Date()],
      ['line-002', 'CABALLERO', 'Ropa de Caballero', 'Línea de ropa para hombre', 'TRUE', new Date()],
      ['line-003', 'NIÑOS', 'Ropa de Niños', 'Línea de ropa infantil', 'TRUE', new Date()],
      ['line-004', 'ACCESORIOS', 'Accesorios', 'Accesorios y complementos', 'TRUE', new Date()],
      ['line-005', 'CALZADO', 'Calzado', 'Zapatos y zapatillas', 'TRUE', new Date()]
    ]
  },
  
  'CAT_Categories': {
    columns: ['id', 'code', 'name', 'line_id', 'description', 'active', 'created_at'],
    widths: [150, 100, 200, 150, 300, 80, 150],
    seedData: [
      ['cat-001', 'BLUSAS', 'Blusas', 'line-001', 'Blusas y camisas de dama', 'TRUE', new Date()],
      ['cat-002', 'PANTALONES', 'Pantalones', 'line-001', 'Pantalones de dama', 'TRUE', new Date()],
      ['cat-003', 'VESTIDOS', 'Vestidos', 'line-001', 'Vestidos', 'TRUE', new Date()],
      ['cat-004', 'FALDAS', 'Faldas', 'line-001', 'Faldas', 'TRUE', new Date()],
      ['cat-005', 'CAMISAS', 'Camisas', 'line-002', 'Camisas de caballero', 'TRUE', new Date()],
      ['cat-006', 'PANTALONES', 'Pantalones', 'line-002', 'Pantalones de caballero', 'TRUE', new Date()],
      ['cat-007', 'POLOS', 'Polos', 'line-002', 'Polos y camisetas', 'TRUE', new Date()],
      ['cat-008', 'CONJUNTOS', 'Conjuntos', 'line-003', 'Conjuntos infantiles', 'TRUE', new Date()],
      ['cat-009', 'POLOS', 'Polos', 'line-003', 'Polos infantiles', 'TRUE', new Date()],
      ['cat-010', 'CARTERAS', 'Carteras', 'line-004', 'Carteras y bolsos', 'TRUE', new Date()],
      ['cat-011', 'CINTURONES', 'Cinturones', 'line-004', 'Cinturones', 'TRUE', new Date()],
      ['cat-012', 'ZAPATILLAS', 'Zapatillas', 'line-005', 'Zapatillas deportivas', 'TRUE', new Date()],
      ['cat-013', 'ZAPATOS', 'Zapatos', 'line-005', 'Zapatos formales', 'TRUE', new Date()]
    ]
  },
  
  'CAT_Brands': {
    columns: ['id', 'code', 'name', 'description', 'active', 'created_at'],
    widths: [150, 100, 200, 300, 80, 150],
    seedData: [
      ['brand-001', 'ADICTION', 'Adiction', 'Marca propia', 'TRUE', new Date()],
      ['brand-002', 'ZARA', 'Zara', 'Marca internacional', 'TRUE', new Date()],
      ['brand-003', 'HM', 'H&M', 'Marca internacional', 'TRUE', new Date()],
      ['brand-004', 'FOREVER21', 'Forever 21', 'Marca internacional', 'TRUE', new Date()],
      ['brand-005', 'MANGO', 'Mango', 'Marca internacional', 'TRUE', new Date()]
    ]
  },
  
  'CAT_Sizes': {
    columns: ['id', 'code', 'name', 'category_id', 'sort_order', 'active', 'created_at'],
    widths: [150, 100, 150, 150, 100, 80, 150],
    seedData: [
      ['size-001', 'XS', 'Extra Small', null, 1, 'TRUE', new Date()],
      ['size-002', 'S', 'Small', null, 2, 'TRUE', new Date()],
      ['size-003', 'M', 'Medium', null, 3, 'TRUE', new Date()],
      ['size-004', 'L', 'Large', null, 4, 'TRUE', new Date()],
      ['size-005', 'XL', 'Extra Large', null, 5, 'TRUE', new Date()],
      ['size-006', 'XXL', 'Double Extra Large', null, 6, 'TRUE', new Date()],
      ['size-007', 'UNICA', 'Talla Única', null, 7, 'TRUE', new Date()]
    ]
  },
  
  'CAT_Suppliers': {
    columns: ['id', 'code', 'name', 'contact_name', 'phone', 'email', 'address', 'active', 'created_at'],
    widths: [150, 100, 200, 150, 120, 200, 300, 80, 150],
    seedData: [
      ['sup-001', 'GAMARRA01', 'Textiles Gamarra SAC', 'Juan Pérez', '987654321', 'ventas@gamarra.com', 'Jr. Gamarra 123, Lima', 'TRUE', new Date()],
      ['sup-002', 'IMPORT01', 'Importaciones Fashion EIRL', 'María López', '987654322', 'contacto@importfashion.com', 'Av. Colonial 456, Lima', 'TRUE', new Date()],
      ['sup-003', 'TEXTIL01', 'Textiles del Sur SA', 'Carlos Rodríguez', '987654323', 'ventas@textilsur.com', 'Av. Arequipa 789, Lima', 'TRUE', new Date()]
    ]
  },
  
  'CAT_Products': {
    columns: ['id', 'barcode', 'name', 'description', 'line_id', 'category_id', 'brand_id', 'supplier_id', 'size', 'color', 'presentation', 'purchase_price', 'price', 'min_stock', 'entry_date', 'barcode_url', 'active', 'created_at', 'updated_at'],
    widths: [200, 150, 200, 300, 120, 120, 120, 120, 80, 100, 100, 100, 100, 100, 120, 250, 80, 150, 150],
    seedData: []
  },
  
  'INV_Stock': {
    columns: ['id', 'warehouse_id', 'product_id', 'quantity', 'last_updated'],
    widths: [200, 150, 200, 100, 150],
    seedData: []
  },
  
  'INV_Movements': {
    columns: ['id', 'warehouse_id', 'product_id', 'type', 'quantity', 'reference_id', 'user_id', 'reason', 'created_at'],
    widths: [200, 150, 200, 150, 100, 200, 200, 300, 150],
    seedData: []
  },
  
  'CRM_Clients': {
    columns: ['id', 'dni', 'name', 'phone', 'email', 'address', 'lat', 'lng', 'credit_limit', 'credit_used', 'dni_photo_url', 'birthday', 'active', 'created_at'],
    widths: [200, 100, 200, 120, 200, 300, 100, 100, 120, 120, 250, 120, 80, 150],
    seedData: []
  },
  
  'POS_Sales': {
    columns: ['id', 'sale_number', 'store_id', 'client_id', 'user_id', 'sale_type', 'subtotal', 'discount', 'total', 'payment_status', 'created_at', 'voided', 'void_reason', 'void_user_id', 'void_at'],
    widths: [200, 120, 150, 200, 200, 100, 100, 100, 100, 120, 150, 80, 250, 200, 150],
    seedData: []
  },
  
  'POS_SaleItems': {
    columns: ['id', 'sale_id', 'product_id', 'quantity', 'unit_price', 'subtotal'],
    widths: [200, 200, 200, 100, 120, 120],
    seedData: []
  },
  
  'CRD_Plans': {
    columns: ['id', 'sale_id', 'client_id', 'total_amount', 'installments_count', 'installment_amount', 'status', 'created_at'],
    widths: [200, 200, 200, 120, 120, 120, 100, 150],
    seedData: []
  },
  
  'CRD_Installments': {
    columns: ['id', 'plan_id', 'installment_number', 'amount', 'due_date', 'paid_amount', 'status', 'paid_at'],
    widths: [200, 200, 120, 120, 120, 120, 100, 150],
    seedData: []
  },
  
  'CRD_Payments': {
    columns: ['id', 'client_id', 'amount', 'payment_date', 'user_id', 'receipt_url', 'created_at'],
    widths: [200, 200, 120, 120, 200, 250, 150],
    seedData: []
  },
  
  'CASH_Shifts': {
    columns: ['id', 'store_id', 'user_id', 'opening_amount', 'opening_at', 'closing_amount', 'expected_amount', 'difference', 'closing_at', 'supervisor_id'],
    widths: [200, 150, 200, 120, 150, 120, 120, 120, 150, 200],
    seedData: []
  },
  
  'CASH_Expenses': {
    columns: ['id', 'shift_id', 'amount', 'concept', 'category', 'receipt_url', 'user_id', 'authorized_by', 'created_at'],
    widths: [200, 200, 120, 250, 150, 250, 200, 200, 150],
    seedData: []
  },
  
  'AUD_Log': {
    columns: ['id', 'timestamp', 'user_id', 'operation', 'entity_type', 'entity_id', 'old_values', 'new_values', 'ip_address'],
    widths: [200, 150, 200, 150, 150, 200, 300, 300, 150],
    seedData: []
  }
};

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * setupCompleteDatabase - Configuración completa desde cero
 * 
 * ADVERTENCIA: Borra todas las hojas existentes y crea nuevas
 * Solo usar para instalación inicial
 */
function setupCompleteDatabase() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  CONFIGURACIÓN COMPLETA DE BASE DE DATOS                  ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('⚠️  ADVERTENCIA: Esta operación borrará todas las hojas existentes');
  Logger.log('');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Spreadsheet: ' + ss.getName());
    Logger.log('');
    
    const report = {
      sheetsCreated: 0,
      dataInserted: 0,
      errors: []
    };
    
    // Crear cada hoja según la estructura
    for (const sheetName in DATABASE_STRUCTURE) {
      try {
        Logger.log('Procesando: ' + sheetName + '...');
        
        const config = DATABASE_STRUCTURE[sheetName];
        
        // Crear o limpiar hoja
        let sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          // IMPORTANTE: Eliminar la hoja completamente y recrearla
          // Esto asegura que no queden validaciones de datos residuales
          ss.deleteSheet(sheet);
          sheet = ss.insertSheet(sheetName);
          Logger.log('  ✓ Hoja eliminada y recreada');
        } else {
          sheet = ss.insertSheet(sheetName);
          Logger.log('  ✓ Hoja creada');
        }
        
        // Agregar headers
        sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns]);
        
        // Formatear headers
        const headerRange = sheet.getRange(1, 1, 1, config.columns.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#4285F4');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');
        sheet.setFrozenRows(1);
        
        // Ajustar anchos de columna
        for (let i = 0; i < config.widths.length; i++) {
          sheet.setColumnWidth(i + 1, config.widths[i]);
        }
        
        // Insertar datos de ejemplo si existen
        if (config.seedData && config.seedData.length > 0) {
          sheet.getRange(2, 1, config.seedData.length, config.seedData[0].length).setValues(config.seedData);
          Logger.log('  ✓ ' + config.seedData.length + ' registros insertados');
          report.dataInserted += config.seedData.length;
        }
        
        // CRÍTICO: Limpiar validaciones de datos y aplicar formato selectivo
        // Esto previene que Google Sheets cree checkboxes automáticamente
        if (config.columns.length > 0) {
          // 1. Limpiar TODAS las validaciones de datos en toda la hoja
          const fullRange = sheet.getRange(1, 1, 1000, config.columns.length);
          fullRange.clearDataValidations();
          
          // 2. Aplicar formato de texto SOLO a columnas problemáticas
          const textColumns = ['active', 'voided', 'name', 'line_id', 'sort_order', 'address', 
                               'supplier_id', 'barcode_url', 'birthday', 'dni_photo_url', 'receipt_url'];
          
          for (let i = 0; i < config.columns.length; i++) {
            const columnName = config.columns[i];
            if (textColumns.indexOf(columnName) !== -1) {
              // Aplicar formato de texto plano a esta columna específica
              const columnRange = sheet.getRange(2, i + 1, 1000, 1);
              columnRange.setNumberFormat('@');
              Logger.log('  ✓ Formato de texto aplicado a columna: ' + columnName);
            }
          }
          
          Logger.log('  ✓ Validaciones de datos limpiadas');
        }
        
        report.sheetsCreated++;
        Logger.log('  ✓ Completado');
        Logger.log('');
        
      } catch (error) {
        Logger.log('  ✗ Error: ' + error.message);
        report.errors.push(sheetName + ': ' + error.message);
      }
    }
    
    // Mostrar resumen
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  ✓✓✓ CONFIGURACIÓN COMPLETADA ✓✓✓                        ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Hojas creadas: ' + report.sheetsCreated);
    Logger.log('Registros insertados: ' + report.dataInserted);
    Logger.log('Errores: ' + report.errors.length);
    
    if (report.errors.length > 0) {
      Logger.log('');
      Logger.log('Errores encontrados:');
      report.errors.forEach(function(error) {
        Logger.log('  • ' + error);
      });
    }
    
    return report;
    
  } catch (error) {
    Logger.log('');
    Logger.log('✗✗✗ ERROR CRÍTICO ✗✗✗');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * safeUpdateDatabase - Actualización segura sin borrar datos
 * 
 * Solo agrega hojas faltantes y columnas faltantes
 * NO borra datos existentes
 */
function safeUpdateDatabase() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  ACTUALIZACIÓN SEGURA DE BASE DE DATOS                    ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('✓ Esta operación es SEGURA - no borrará datos existentes');
  Logger.log('');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Spreadsheet: ' + ss.getName());
    Logger.log('');
    
    const report = {
      sheetsCreated: [],
      sheetsSkipped: [],
      columnsAdded: [],
      errors: []
    };
    
    // Procesar cada hoja
    for (const sheetName in DATABASE_STRUCTURE) {
      try {
        Logger.log('Procesando: ' + sheetName + '...');
        
        const config = DATABASE_STRUCTURE[sheetName];
        let sheet = ss.getSheetByName(sheetName);
        
        if (!sheet) {
          // Crear hoja nueva
          sheet = ss.insertSheet(sheetName);
          
          // Agregar headers
          sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns]);
          
          // Formatear headers
          const headerRange = sheet.getRange(1, 1, 1, config.columns.length);
          headerRange.setFontWeight('bold');
          headerRange.setBackground('#4285F4');
          headerRange.setFontColor('#FFFFFF');
          headerRange.setHorizontalAlignment('center');
          sheet.setFrozenRows(1);
          
          // Ajustar anchos
          for (let i = 0; i < config.widths.length; i++) {
            sheet.setColumnWidth(i + 1, config.widths[i]);
          }
          
          // Insertar datos de ejemplo
          if (config.seedData && config.seedData.length > 0) {
            sheet.getRange(2, 1, config.seedData.length, config.seedData[0].length).setValues(config.seedData);
            Logger.log('  ✓ Hoja creada con ' + config.seedData.length + ' registros');
          } else {
            Logger.log('  ✓ Hoja creada (vacía)');
          }
          
          // CRÍTICO: Limpiar validaciones y aplicar formato selectivo
          if (config.columns.length > 0) {
            const fullRange = sheet.getRange(1, 1, 1000, config.columns.length);
            fullRange.clearDataValidations();
            
            const textColumns = ['active', 'voided', 'name', 'line_id', 'sort_order', 'address', 
                                 'supplier_id', 'barcode_url', 'birthday', 'dni_photo_url', 'receipt_url'];
            
            for (let i = 0; i < config.columns.length; i++) {
              const columnName = config.columns[i];
              if (textColumns.indexOf(columnName) !== -1) {
                const columnRange = sheet.getRange(2, i + 1, 1000, 1);
                columnRange.setNumberFormat('@');
              }
            }
          }
          
          report.sheetsCreated.push(sheetName);
          
        } else {
          // Verificar columnas faltantes
          const lastColumn = sheet.getLastColumn();
          if (lastColumn === 0) {
            // Hoja vacía, agregar estructura completa
            sheet.getRange(1, 1, 1, config.columns.length).setValues([config.columns]);
            Logger.log('  ✓ Headers agregados a hoja vacía');
            report.columnsAdded.push(sheetName + ' (todos los headers)');
          } else {
            const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
            const missingColumns = [];
            
            for (let i = 0; i < config.columns.length; i++) {
              if (currentHeaders.indexOf(config.columns[i]) === -1) {
                missingColumns.push(config.columns[i]);
              }
            }
            
            if (missingColumns.length > 0) {
              // Agregar columnas faltantes
              const startColumn = lastColumn + 1;
              for (let i = 0; i < missingColumns.length; i++) {
                sheet.getRange(1, startColumn + i).setValue(missingColumns[i]);
              }
              Logger.log('  ✓ ' + missingColumns.length + ' columnas agregadas: ' + missingColumns.join(', '));
              report.columnsAdded.push(sheetName + ': ' + missingColumns.join(', '));
            } else {
              Logger.log('  • Ya tiene todas las columnas');
              report.sheetsSkipped.push(sheetName);
            }
          }
        }
        
        Logger.log('');
        
      } catch (error) {
        Logger.log('  ✗ Error: ' + error.message);
        report.errors.push(sheetName + ': ' + error.message);
      }
    }
    
    // Mostrar resumen
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  ✓✓✓ ACTUALIZACIÓN COMPLETADA ✓✓✓                        ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Hojas creadas: ' + report.sheetsCreated.length);
    Logger.log('Hojas actualizadas: ' + report.columnsAdded.length);
    Logger.log('Hojas sin cambios: ' + report.sheetsSkipped.length);
    Logger.log('Errores: ' + report.errors.length);
    
    if (report.sheetsCreated.length > 0) {
      Logger.log('');
      Logger.log('Hojas creadas:');
      report.sheetsCreated.forEach(function(name) {
        Logger.log('  ✓ ' + name);
      });
    }
    
    if (report.columnsAdded.length > 0) {
      Logger.log('');
      Logger.log('Columnas agregadas:');
      report.columnsAdded.forEach(function(info) {
        Logger.log('  ✓ ' + info);
      });
    }
    
    if (report.errors.length > 0) {
      Logger.log('');
      Logger.log('Errores:');
      report.errors.forEach(function(error) {
        Logger.log('  ✗ ' + error);
      });
    }
    
    return report;
    
  } catch (error) {
    Logger.log('');
    Logger.log('✗✗✗ ERROR CRÍTICO ✗✗✗');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * verifyDatabaseStructure - Verificar estructura actual
 * 
 * NO modifica nada, solo genera un reporte
 */
function verifyDatabaseStructure() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  VERIFICACIÓN DE ESTRUCTURA DE BASE DE DATOS              ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
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
      const dataRows = Math.max(0, lastRow - 1);
      
      Logger.log('📄 ' + name);
      Logger.log('   Filas: ' + lastRow + ' (datos: ' + dataRows + ')');
      Logger.log('   Columnas: ' + lastColumn);
      
      if (lastColumn > 0) {
        const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
        Logger.log('   Headers: ' + headers.join(', '));
      }
      
      Logger.log('');
    });
    
    // Verificar hojas esperadas
    Logger.log('═══ HOJAS ESPERADAS ═══');
    for (const sheetName in DATABASE_STRUCTURE) {
      const exists = ss.getSheetByName(sheetName) !== null;
      Logger.log((exists ? '✓' : '✗') + ' ' + sheetName);
    }
    
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  VERIFICACIÓN COMPLETADA                                  ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    
  } catch (error) {
    Logger.log('');
    Logger.log('✗ Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}


// ============================================================================
// FUNCIONES DE DOCUMENTACIÓN Y AYUDA
// ============================================================================

/**
 * getDatabaseDocumentation - Obtener documentación completa de la estructura
 * 
 * Retorna un objeto con toda la información de la estructura de la base de datos
 * Útil para debugging y documentación
 */
function getDatabaseDocumentation() {
  const docs = {
    version: '1.0.0',
    totalSheets: Object.keys(DATABASE_STRUCTURE).length,
    sheets: {}
  };
  
  for (const sheetName in DATABASE_STRUCTURE) {
    const config = DATABASE_STRUCTURE[sheetName];
    docs.sheets[sheetName] = {
      columns: config.columns,
      columnCount: config.columns.length,
      hasSeedData: config.seedData && config.seedData.length > 0,
      seedDataRows: config.seedData ? config.seedData.length : 0
    };
  }
  
  return docs;
}

/**
 * printDatabaseStructure - Imprimir estructura en formato legible
 * 
 * Imprime en el Logger toda la estructura de la base de datos
 * de forma organizada y fácil de leer
 */
function printDatabaseStructure() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  ESTRUCTURA DE BASE DE DATOS - ADICTION BOUTIQUE          ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('Total de hojas: ' + Object.keys(DATABASE_STRUCTURE).length);
  Logger.log('');
  
  let sheetNumber = 1;
  for (const sheetName in DATABASE_STRUCTURE) {
    const config = DATABASE_STRUCTURE[sheetName];
    
    Logger.log('─────────────────────────────────────────────────────────────');
    Logger.log(sheetNumber + '. ' + sheetName);
    Logger.log('─────────────────────────────────────────────────────────────');
    Logger.log('Columnas (' + config.columns.length + '): ' + config.columns.join(', '));
    Logger.log('Seed Data: ' + (config.seedData && config.seedData.length > 0 ? config.seedData.length + ' registros' : 'Sin datos'));
    Logger.log('');
    
    sheetNumber++;
  }
  
  Logger.log('═════════════════════════════════════════════════════════════');
  Logger.log('FIN DE ESTRUCTURA');
  Logger.log('═════════════════════════════════════════════════════════════');
}

/**
 * getSheetStructure - Obtener estructura de una hoja específica
 * 
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Object} Estructura de la hoja o null si no existe
 */
function getSheetStructure(sheetName) {
  if (DATABASE_STRUCTURE[sheetName]) {
    return {
      name: sheetName,
      columns: DATABASE_STRUCTURE[sheetName].columns,
      widths: DATABASE_STRUCTURE[sheetName].widths,
      hasSeedData: DATABASE_STRUCTURE[sheetName].seedData && DATABASE_STRUCTURE[sheetName].seedData.length > 0,
      seedDataCount: DATABASE_STRUCTURE[sheetName].seedData ? DATABASE_STRUCTURE[sheetName].seedData.length : 0
    };
  }
  return null;
}

/**
 * listAllSheets - Listar todas las hojas definidas
 * 
 * @returns {Array<string>} Array con nombres de todas las hojas
 */
function listAllSheets() {
  return Object.keys(DATABASE_STRUCTURE);
}

/**
 * compareDatabaseWithDefinition - Comparar base de datos actual con definición
 * 
 * Compara la estructura actual del spreadsheet con la definición en DATABASE_STRUCTURE
 * y retorna un reporte detallado de diferencias
 */
function compareDatabaseWithDefinition() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  COMPARACIÓN: BASE DE DATOS vs DEFINICIÓN                 ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = {
    missingSheets: [],
    extraSheets: [],
    mismatchedColumns: [],
    correctSheets: []
  };
  
  // Verificar hojas faltantes
  for (const sheetName in DATABASE_STRUCTURE) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      report.missingSheets.push(sheetName);
    } else {
      // Verificar columnas
      const lastColumn = sheet.getLastColumn();
      if (lastColumn > 0) {
        const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
        const expectedHeaders = DATABASE_STRUCTURE[sheetName].columns;
        
        if (JSON.stringify(currentHeaders) !== JSON.stringify(expectedHeaders)) {
          report.mismatchedColumns.push({
            sheet: sheetName,
            current: currentHeaders,
            expected: expectedHeaders
          });
        } else {
          report.correctSheets.push(sheetName);
        }
      } else {
        report.mismatchedColumns.push({
          sheet: sheetName,
          current: [],
          expected: DATABASE_STRUCTURE[sheetName].columns
        });
      }
    }
  }
  
  // Verificar hojas extra
  const allSheets = ss.getSheets();
  allSheets.forEach(function(sheet) {
    const name = sheet.getName();
    if (!DATABASE_STRUCTURE[name]) {
      report.extraSheets.push(name);
    }
  });
  
  // Imprimir reporte
  Logger.log('HOJAS FALTANTES: ' + report.missingSheets.length);
  if (report.missingSheets.length > 0) {
    report.missingSheets.forEach(function(name) {
      Logger.log('  ✗ ' + name);
    });
  }
  Logger.log('');
  
  Logger.log('HOJAS CON COLUMNAS INCORRECTAS: ' + report.mismatchedColumns.length);
  if (report.mismatchedColumns.length > 0) {
    report.mismatchedColumns.forEach(function(item) {
      Logger.log('  ⚠ ' + item.sheet);
      Logger.log('    Actual: ' + JSON.stringify(item.current));
      Logger.log('    Esperado: ' + JSON.stringify(item.expected));
    });
  }
  Logger.log('');
  
  Logger.log('HOJAS EXTRA (no definidas): ' + report.extraSheets.length);
  if (report.extraSheets.length > 0) {
    report.extraSheets.forEach(function(name) {
      Logger.log('  • ' + name);
    });
  }
  Logger.log('');
  
  Logger.log('HOJAS CORRECTAS: ' + report.correctSheets.length);
  if (report.correctSheets.length > 0) {
    report.correctSheets.forEach(function(name) {
      Logger.log('  ✓ ' + name);
    });
  }
  Logger.log('');
  
  Logger.log('═════════════════════════════════════════════════════════════');
  const isComplete = report.missingSheets.length === 0 && report.mismatchedColumns.length === 0;
  if (isComplete) {
    Logger.log('✅ BASE DE DATOS COMPLETA Y CORRECTA');
  } else {
    Logger.log('⚠️ SE REQUIEREN ACTUALIZACIONES');
    Logger.log('Ejecutar: safeUpdateDatabase()');
  }
  Logger.log('═════════════════════════════════════════════════════════════');
  
  return report;
}


/**
 * fixSheetFormats - Corrige el formato de las columnas para prevenir checkboxes automáticos
 * 
 * Esta función establece todas las columnas de datos como texto plano para evitar que
 * Google Sheets interprete automáticamente valores como checkboxes, fechas, etc.
 * 
 * PROBLEMA COMÚN: Google Sheets detecta automáticamente tipos de datos y puede convertir
 * columnas como 'active', 'supplier_id', 'barcode_url', etc. en checkboxes.
 * 
 * SOLUCIÓN: Esta función establece el formato '@' (texto plano) en todas las columnas
 * de datos, previniendo la detección automática de tipos.
 * 
 * HOJAS AFECTADAS COMÚNMENTE:
 * - CAT_Products (supplier_id, barcode_url, active)
 * - CRM_Clients (active, dni_photo_url)
 * - POS_Sales (voided)
 * - CAT_Suppliers (active)
 * - Y otras hojas con columnas booleanas o URLs
 * 
 * EJECUTAR: 
 * - fixSheetFormats() - Corrige todas las hojas
 * - fixSheetFormats('CAT_Products') - Corrige solo una hoja específica
 */
function fixSheetFormats(specificSheet) {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  CORRECCIÓN DE FORMATOS DE HOJAS                          ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('⚠️  PROBLEMA: Google Sheets convierte automáticamente algunas');
  Logger.log('   columnas en checkboxes (active, voided, URLs, etc.)');
  Logger.log('');
  Logger.log('✓ SOLUCIÓN: Establecer formato de texto plano (@) en todas');
  Logger.log('   las columnas de datos');
  Logger.log('');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const report = {
      sheetsFixed: [],
      errors: []
    };
    
    // Determinar qué hojas procesar
    const sheetsToProcess = specificSheet 
      ? [specificSheet] 
      : Object.keys(DATABASE_STRUCTURE);
    
    sheetsToProcess.forEach(function(sheetName) {
      try {
        Logger.log('Procesando: ' + sheetName + '...');
        
        const sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          Logger.log('  ⚠️  Hoja no existe, omitiendo');
          return;
        }
        
        const config = DATABASE_STRUCTURE[sheetName];
        if (!config) {
          Logger.log('  ⚠️  No hay configuración para esta hoja, omitiendo');
          return;
        }
        
        // Limpiar validaciones de datos y aplicar formato selectivo
        // Solo a columnas que típicamente tienen problemas de checkbox
        const fullRange = sheet.getRange(1, 1, 1000, config.columns.length);
        fullRange.clearDataValidations(); // Limpiar TODAS las validaciones
        
        // Aplicar formato de texto solo a columnas problemáticas
        const textColumns = ['active', 'voided', 'name', 'line_id', 'sort_order', 'address', 
                             'supplier_id', 'barcode_url', 'birthday', 'dni_photo_url', 'receipt_url'];
        
        let columnsFixed = 0;
        for (let i = 0; i < config.columns.length; i++) {
          const columnName = config.columns[i];
          if (textColumns.indexOf(columnName) !== -1) {
            const columnRange = sheet.getRange(2, i + 1, 1000, 1);
            columnRange.setNumberFormat('@'); // Formato de texto plano
            columnsFixed++;
          }
        }
        
        Logger.log('  ✓ Validaciones de datos limpiadas en todas las columnas');
        Logger.log('  ✓ Formato de texto aplicado a ' + columnsFixed + ' columnas problemáticas');
        report.sheetsFixed.push(sheetName);
        
      } catch (error) {
        Logger.log('  ✗ Error: ' + error.message);
        report.errors.push(sheetName + ': ' + error.message);
      }
    });
    
    // Mostrar resumen
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  CORRECCIÓN COMPLETADA                                     ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Hojas corregidas: ' + report.sheetsFixed.length);
    Logger.log('Errores: ' + report.errors.length);
    
    if (report.sheetsFixed.length > 0) {
      Logger.log('');
      Logger.log('Hojas corregidas:');
      report.sheetsFixed.forEach(function(name) {
        Logger.log('  ✓ ' + name);
      });
    }
    
    if (report.errors.length > 0) {
      Logger.log('');
      Logger.log('Errores:');
      report.errors.forEach(function(error) {
        Logger.log('  ✗ ' + error);
      });
    }
    
    Logger.log('');
    Logger.log('✅ Las columnas ahora están configuradas como texto plano');
    Logger.log('   Esto previene que Google Sheets interprete valores como checkboxes');
    Logger.log('');
    Logger.log('NOTA: Si ya existen checkboxes en las celdas, es posible que');
    Logger.log('      necesites ejecutar setupCompleteDatabase() para recrear');
    Logger.log('      las hojas desde cero con el formato correcto.');
    
    return report;
    
  } catch (error) {
    Logger.log('');
    Logger.log('✗✗✗ ERROR CRÍTICO ✗✗✗');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * fixCATProductsFormat - Atajo para corregir solo la hoja CAT_Products
 * 
 * EJECUTAR: fixCATProductsFormat()
 */
function fixCATProductsFormat() {
  return fixSheetFormats('CAT_Products');
}
