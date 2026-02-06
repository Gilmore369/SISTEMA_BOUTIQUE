/**
 * SeedDataDirecto.gs
 * Llena datos ficticios directamente en el spreadsheet especificado
 * 
 * EJECUTAR: seedDataDirectoCompleto()
 */

const SPREADSHEET_ID = '18G-yq7qd_FM0X-w96GWq_JNvc7z2SqrUpg1w0jl5A_w';

/**
 * Función principal que llena todos los datos
 */
function seedDataDirectoCompleto() {
  Logger.log('=== INICIANDO SEED DIRECTO DE DATOS ===');
  Logger.log('Spreadsheet ID: ' + SPREADSHEET_ID);
  
  try {
    // Abrir spreadsheet por ID
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✓ Spreadsheet abierto: ' + ss.getName());
    
    // Limpiar datos existentes (opcional)
    const clearFirst = false; // Cambiar a true si quieres limpiar primero
    if (clearFirst) {
      Logger.log('Limpiando datos existentes...');
      clearAllDataDirect(ss);
    }
    
    // Crear ventas ficticias
    Logger.log('Creando ventas ficticias...');
    seedSalesDirect(ss);
    
    // Crear planes de crédito
    Logger.log('Creando planes de crédito...');
    seedCreditPlansDirect(ss);
    
    // Crear cuotas
    Logger.log('Creando cuotas...');
    seedInstallmentsDirect(ss);
    
    // Crear pagos
    Logger.log('Creando pagos...');
    seedPaymentsDirect(ss);
    
    // Crear movimientos de inventario
    Logger.log('Creando movimientos de inventario...');
    seedMovementsDirect(ss);
    
    // Actualizar stock
    Logger.log('Actualizando stock...');
    updateStockLevelsDirect(ss);
    
    Logger.log('=== SEED DIRECTO COMPLETADO ===');
    Logger.log('✅ Datos creados exitosamente');
    Logger.log('Recarga la aplicación para ver los datos');
    
    return {
      success: true,
      message: 'Datos ficticios creados exitosamente'
    };
    
  } catch (error) {
    Logger.log('❌ ERROR en seed: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

/**
 * Limpia datos existentes
 */
function clearAllDataDirect(ss) {
  function clearSheet(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('  ⚠️ Hoja ' + sheetName + ' no existe');
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log('  ✓ ' + sheetName + ' ya está vacía');
      return;
    }
    
    const lastColumn = sheet.getLastColumn();
    const numRowsToClear = lastRow - 1;
    
    if (numRowsToClear > 0 && lastColumn > 0) {
      const range = sheet.getRange(2, 1, numRowsToClear, lastColumn);
      range.clearContent();
      Logger.log('  ✓ ' + sheetName + ': ' + numRowsToClear + ' filas limpiadas');
    }
  }
  
  clearSheet('POS_Sales');
  clearSheet('POS_SaleItems');
  clearSheet('CRD_Plans');
  clearSheet('CRD_Installments');
  clearSheet('CRD_Payments');
  clearSheet('INV_Movements');
  
  Logger.log('✓ Datos limpiados');
}

/**
 * Crea ventas ficticias
 */
function seedSalesDirect(ss) {
  const salesSheet = ss.getSheetByName('POS_Sales');
  const itemsSheet = ss.getSheetByName('POS_SaleItems');
  
  if (!salesSheet) {
    Logger.log('⚠️ Hoja POS_Sales no existe');
    return;
  }
  
  // Obtener clientes y productos
  const clientsSheet = ss.getSheetByName('CRM_Clients');
  const productsSheet = ss.getSheetByName('CAT_Products');
  
  if (!clientsSheet || !productsSheet) {
    Logger.log('⚠️ Faltan hojas CRM_Clients o CAT_Products');
    return;
  }
  
  const clientsData = clientsSheet.getDataRange().getValues();
  const productsData = productsSheet.getDataRange().getValues();
  
  // Convertir a objetos (saltar header)
  const clients = [];
  for (let i = 1; i < clientsData.length; i++) {
    if (clientsData[i][0]) { // Si tiene ID
      clients.push({
        id: clientsData[i][0],
        dni: clientsData[i][1],
        name: clientsData[i][2]
      });
    }
  }
  
  const products = [];
  for (let i = 1; i < productsData.length; i++) {
    if (productsData[i][0]) { // Si tiene ID
      products.push({
        id: productsData[i][0],
        name: productsData[i][2],
        price: productsData[i][4]
      });
    }
  }
  
  if (clients.length === 0 || products.length === 0) {
    Logger.log('⚠️ No hay clientes o productos para crear ventas');
    return;
  }
  
  const today = new Date();
  const salesData = [];
  const itemsData = [];
  
  // Crear 50 ventas en los últimos 30 días
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    
    const client = clients[Math.floor(Math.random() * clients.length)];
    const saleType = Math.random() < 0.7 ? 'CONTADO' : 'CREDITO';
    const saleId = 'sale-' + Date.now() + '-' + i;
    
    // Crear 1-5 items por venta
    const numItems = Math.floor(Math.random() * 5) + 1;
    let total = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = parseFloat(product.price) || 50;
      const subtotal = price * quantity;
      total += subtotal;
      
      if (itemsSheet) {
        itemsData.push([
          'item-' + saleId + '-' + j,
          saleId,
          product.id,
          product.name,
          quantity,
          price,
          subtotal,
          saleDate
        ]);
      }
    }
    
    salesData.push([
      saleId,
      saleDate,
      client.id,
      client.name,
      client.dni || '',
      saleType,
      total,
      saleType === 'CONTADO' ? 'PAID' : 'PENDING',
      'alm_mujeres',
      'gianpapex@gmail.com',
      saleDate
    ]);
  }
  
  // Escribir ventas
  if (salesData.length > 0) {
    salesSheet.getRange(salesSheet.getLastRow() + 1, 1, salesData.length, salesData[0].length).setValues(salesData);
    Logger.log('✓ ' + salesData.length + ' ventas creadas');
  }
  
  // Escribir items
  if (itemsSheet && itemsData.length > 0) {
    itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, itemsData.length, itemsData[0].length).setValues(itemsData);
    Logger.log('✓ ' + itemsData.length + ' items de venta creados');
  }
}

/**
 * Crea planes de crédito
 */
function seedCreditPlansDirect(ss) {
  const plansSheet = ss.getSheetByName('CRD_Plans');
  const salesSheet = ss.getSheetByName('POS_Sales');
  
  if (!plansSheet || !salesSheet) {
    Logger.log('⚠️ Faltan hojas CRD_Plans o POS_Sales');
    return;
  }
  
  const salesData = salesSheet.getDataRange().getValues();
  const creditSales = [];
  
  for (let i = 1; i < salesData.length; i++) {
    if (salesData[i][5] === 'CREDITO') { // sale_type
      creditSales.push({
        id: salesData[i][0],
        date: salesData[i][1],
        clientId: salesData[i][2],
        clientName: salesData[i][3],
        total: salesData[i][6]
      });
    }
  }
  
  const plansData = [];
  
  creditSales.forEach(function(sale, index) {
    const planId = 'plan-' + Date.now() + '-' + index;
    const numInstallments = [3, 6, 12][Math.floor(Math.random() * 3)];
    const installmentAmount = sale.total / numInstallments;
    const startDate = new Date(sale.date);
    startDate.setDate(startDate.getDate() + 7);
    
    plansData.push([
      planId,
      sale.id,
      sale.clientId,
      sale.clientName,
      sale.total,
      numInstallments,
      installmentAmount,
      0, // paid_amount
      sale.total, // balance
      'ACTIVE',
      startDate,
      sale.date
    ]);
  });
  
  if (plansData.length > 0) {
    plansSheet.getRange(plansSheet.getLastRow() + 1, 1, plansData.length, plansData[0].length).setValues(plansData);
    Logger.log('✓ ' + plansData.length + ' planes de crédito creados');
  }
}

/**
 * Crea cuotas
 */
function seedInstallmentsDirect(ss) {
  const installmentsSheet = ss.getSheetByName('CRD_Installments');
  const plansSheet = ss.getSheetByName('CRD_Plans');
  
  if (!installmentsSheet || !plansSheet) {
    Logger.log('⚠️ Faltan hojas CRD_Installments o CRD_Plans');
    return;
  }
  
  const plansData = plansSheet.getDataRange().getValues();
  const installmentsData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < plansData.length; i++) {
    const planId = plansData[i][0];
    const clientId = plansData[i][2];
    const clientName = plansData[i][3];
    const numInstallments = plansData[i][5];
    const installmentAmount = plansData[i][6];
    const startDate = new Date(plansData[i][10]);
    
    for (let j = 0; j < numInstallments; j++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + j);
      
      const installmentId = 'inst-' + planId + '-' + (j + 1);
      
      let status = 'PENDING';
      let paidAmount = 0;
      let paidDate = null;
      
      // 30% pagadas, 20% parciales
      if (Math.random() < 0.3 && dueDate < today) {
        status = 'PAID';
        paidAmount = installmentAmount;
        paidDate = new Date(dueDate);
        paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 5));
      } else if (Math.random() < 0.2 && dueDate < today) {
        status = 'PARTIAL';
        paidAmount = installmentAmount * (Math.random() * 0.8 + 0.1);
      }
      
      installmentsData.push([
        installmentId,
        planId,
        clientId,
        clientName,
        j + 1,
        installmentAmount,
        paidAmount,
        installmentAmount - paidAmount,
        dueDate,
        status,
        paidDate,
        new Date()
      ]);
    }
  }
  
  if (installmentsData.length > 0) {
    installmentsSheet.getRange(installmentsSheet.getLastRow() + 1, 1, installmentsData.length, installmentsData[0].length).setValues(installmentsData);
    Logger.log('✓ ' + installmentsData.length + ' cuotas creadas');
  }
}

/**
 * Crea pagos
 */
function seedPaymentsDirect(ss) {
  const paymentsSheet = ss.getSheetByName('CRD_Payments');
  const installmentsSheet = ss.getSheetByName('CRD_Installments');
  
  if (!paymentsSheet || !installmentsSheet) {
    Logger.log('⚠️ Faltan hojas CRD_Payments o CRD_Installments');
    return;
  }
  
  const installmentsData = installmentsSheet.getDataRange().getValues();
  const paymentsData = [];
  
  for (let i = 1; i < installmentsData.length; i++) {
    const status = installmentsData[i][9];
    
    if (status === 'PAID' || status === 'PARTIAL') {
      const installmentId = installmentsData[i][0];
      const planId = installmentsData[i][1];
      const clientId = installmentsData[i][2];
      const amount = installmentsData[i][6];
      const paymentDate = installmentsData[i][10] || new Date();
      
      const paymentId = 'pay-' + Date.now() + '-' + i;
      
      paymentsData.push([
        paymentId,
        planId,
        installmentId,
        clientId,
        amount,
        'EFECTIVO',
        paymentDate,
        'gianpapex@gmail.com',
        '',
        new Date()
      ]);
    }
  }
  
  if (paymentsData.length > 0) {
    paymentsSheet.getRange(paymentsSheet.getLastRow() + 1, 1, paymentsData.length, paymentsData[0].length).setValues(paymentsData);
    Logger.log('✓ ' + paymentsData.length + ' pagos creados');
  }
}

/**
 * Crea movimientos de inventario
 */
function seedMovementsDirect(ss) {
  const movementsSheet = ss.getSheetByName('INV_Movements');
  
  if (!movementsSheet) {
    Logger.log('⚠️ Hoja INV_Movements no existe');
    return;
  }
  
  const productsSheet = ss.getSheetByName('CAT_Products');
  if (!productsSheet) {
    Logger.log('⚠️ Hoja CAT_Products no existe');
    return;
  }
  
  const productsData = productsSheet.getDataRange().getValues();
  const products = [];
  
  for (let i = 1; i < productsData.length; i++) {
    if (productsData[i][0]) {
      products.push({ id: productsData[i][0] });
    }
  }
  
  const movementsData = [];
  const today = new Date();
  
  for (let i = 0; i < 100; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const movDate = new Date(today);
    movDate.setDate(movDate.getDate() - daysAgo);
    
    const product = products[Math.floor(Math.random() * products.length)];
    const types = ['ENTRADA', 'SALIDA', 'AJUSTE'];
    const type = types[Math.floor(Math.random() * types.length)];
    const quantity = Math.floor(Math.random() * 20) + 1;
    
    movementsData.push([
      'mov-' + Date.now() + '-' + i,
      'alm_mujeres',
      product.id,
      type,
      quantity,
      'sale-' + i,
      'gianpapex@gmail.com',
      type === 'ENTRADA' ? 'Compra' : type === 'SALIDA' ? 'Venta' : 'Ajuste',
      movDate
    ]);
  }
  
  if (movementsData.length > 0) {
    movementsSheet.getRange(movementsSheet.getLastRow() + 1, 1, movementsData.length, movementsData[0].length).setValues(movementsData);
    Logger.log('✓ ' + movementsData.length + ' movimientos creados');
  }
}

/**
 * Actualiza niveles de stock
 */
function updateStockLevelsDirect(ss) {
  const stockSheet = ss.getSheetByName('INV_Stock');
  
  if (!stockSheet) {
    Logger.log('⚠️ Hoja INV_Stock no existe');
    return;
  }
  
  const stockData = stockSheet.getDataRange().getValues();
  let lowStockCount = 0;
  
  for (let i = 1; i < stockData.length; i++) {
    const minStock = stockData[i][4] || 10;
    
    let newQuantity;
    if (Math.random() < 0.3) {
      newQuantity = Math.floor(Math.random() * minStock);
      lowStockCount++;
    } else {
      newQuantity = Math.floor(Math.random() * 50) + minStock;
    }
    
    stockSheet.getRange(i + 1, 4).setValue(newQuantity);
    stockSheet.getRange(i + 1, 6).setValue(new Date());
  }
  
  Logger.log('✓ Stock actualizado (' + lowStockCount + ' productos con stock bajo)');
}
