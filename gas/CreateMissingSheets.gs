/**
 * CreateMissingSheets.gs
 * Crea todas las hojas que faltan en el sistema
 * 
 * EJECUTAR: createAllMissingSheets()
 */

function createAllMissingSheets() {
  Logger.log('=== CREANDO HOJAS FALTANTES ===');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Definir todas las hojas necesarias con sus encabezados
  const sheets = {
    'POS_Sales': [
      'id', 'date', 'client_id', 'client_name', 'client_dni', 
      'sale_type', 'total', 'status', 'store_id', 'user_id', 'created_at'
    ],
    'POS_SaleItems': [
      'id', 'sale_id', 'product_id', 'product_name', 
      'quantity', 'price', 'subtotal', 'created_at'
    ],
    'CRD_Plans': [
      'id', 'sale_id', 'client_id', 'client_name', 'total_amount', 
      'installments_count', 'installment_amount', 'paid_amount', 
      'balance', 'status', 'start_date', 'created_at'
    ],
    'CRD_Installments': [
      'id', 'plan_id', 'client_id', 'client_name', 'installment_number', 
      'amount', 'paid_amount', 'balance', 'due_date', 'status', 
      'paid_date', 'created_at'
    ],
    'CRD_Payments': [
      'id', 'plan_id', 'installment_id', 'client_id', 'amount', 
      'payment_method', 'payment_date', 'user_id', 'notes', 'created_at'
    ]
  };
  
  let created = 0;
  let existing = 0;
  
  for (const sheetName in sheets) {
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      // Crear hoja
      const newSheet = ss.insertSheet(sheetName);
      
      // Agregar encabezados
      const headers = sheets[sheetName];
      newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formatear encabezados
      newSheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#4285f4')
        .setFontColor('#ffffff');
      
      // Congelar primera fila
      newSheet.setFrozenRows(1);
      
      // Ajustar ancho de columnas
      for (let i = 1; i <= headers.length; i++) {
        newSheet.setColumnWidth(i, 150);
      }
      
      Logger.log('✓ Hoja creada: ' + sheetName);
      created++;
    } else {
      Logger.log('  Hoja ya existe: ' + sheetName);
      existing++;
    }
  }
  
  Logger.log('=== RESUMEN ===');
  Logger.log('Hojas creadas: ' + created);
  Logger.log('Hojas existentes: ' + existing);
  Logger.log('Total: ' + (created + existing));
  Logger.log('');
  Logger.log('✅ Ahora ejecuta: seedAllDataComplete()');
  
  return {
    success: true,
    created: created,
    existing: existing
  };
}

/**
 * Función para listar todas las hojas actuales
 */
function listAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  Logger.log('=== HOJAS ACTUALES ===');
  sheets.forEach(function(sheet, index) {
    Logger.log((index + 1) + '. ' + sheet.getName() + ' (' + sheet.getLastRow() + ' filas)');
  });
  Logger.log('Total: ' + sheets.length + ' hojas');
}
