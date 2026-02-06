/**
 * SeedDataCompleto.gs
 * Llena TODAS las tablas con datos ficticios para pruebas
 * 
 * EJECUTAR ESTA FUNCIÓN: seedAllDataComplete()
 */

/**
 * FUNCIÓN PRINCIPAL - EJECUTAR ESTA
 * Llena todas las tablas con datos ficticios completos
 */
function seedAllDataComplete() {
  Logger.log('=== INICIANDO SEED COMPLETO DE DATOS ===');
  
  try {
    // 1. Limpiar datos existentes (opcional)
    const clearFirst = true;
    if (clearFirst) {
      Logger.log('Limpiando datos existentes...');
      clearAllData();
    }
    
    // 2. Crear ventas ficticias (últimos 30 días)
    Logger.log('Creando ventas ficticias...');
    seedSales();
    
    // 3. Crear planes de crédito y cuotas
    Logger.log('Creando planes de crédito...');
    seedCreditPlans();
    
    // 4. Crear cuotas vencidas, de hoy y de la semana
    Logger.log('Creando cuotas...');
    seedInstallments();
    
    // 5. Crear pagos
    Logger.log('Creando pagos...');
    seedPayments();
    
    // 6. Crear movimientos de inventario
    Logger.log('Creando movimientos de inventario...');
    seedMovements();
    
    // 7. Actualizar stock de productos (algunos con stock bajo)
    Logger.log('Actualizando stock...');
    updateStockLevels();
    
    Logger.log('=== SEED COMPLETO FINALIZADO ===');
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
 * Limpia todos los datos (excepto configuración y catálogos)
 */
function clearAllData() {
  const ss = getActiveSpreadsheet(); // Usar función helper de Const.gs
  
  // Helper para limpiar una hoja de forma segura
  function clearSheet(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log('  ⚠️ Hoja ' + sheetName + ' no existe, saltando...');
      return;
    }
    
    const lastRow = sheet.getLastRow();
    
    // Si solo tiene header (1 fila) o está vacía, no hacer nada
    if (lastRow <= 1) {
      Logger.log('  ✓ ' + sheetName + ' ya está vacía');
      return;
    }
    
    // En lugar de borrar filas, limpiar el contenido (más seguro)
    // Esto evita el error "No puedes borrar todas las filas móviles"
    const lastColumn = sheet.getLastColumn();
    const numRowsToClear = lastRow - 1;
    
    if (numRowsToClear > 0 && lastColumn > 0) {
      // Limpiar contenido de todas las filas excepto el header
      const range = sheet.getRange(2, 1, numRowsToClear, lastColumn);
      range.clearContent();
      Logger.log('  ✓ ' + sheetName + ': ' + numRowsToClear + ' filas limpiadas');
    }
  }
  
  // Limpiar cada hoja
  clearSheet('POS_Sales');
  clearSheet('POS_SaleItems');
  clearSheet('CRD_Plans');
  clearSheet('CRD_Installments');
  clearSheet('CRD_Payments');
  clearSheet('INV_Movements');
  
  Logger.log('✓ Datos limpiados');
}

/**
 * Crea ventas ficticias de los últimos 30 días
 */
function seedSales() {
  const ss = getActiveSpreadsheet();
  const salesSheet = ss.getSheetByName('POS_Sales');
  const itemsSheet = ss.getSheetByName('POS_SaleItems');
  
  if (!salesSheet) {
    Logger.log('⚠️ Hoja POS_Sales no existe. Saltando ventas.');
    return;
  }
  
  // Obtener clientes y productos usando repositorios
  const clientRepo = new ClientRepository();
  const productRepo = new ProductRepository();
  const clients = clientRepo.findAll();
  const products = productRepo.findAll();
  
  if (clients.length === 0 || products.length === 0) {
    Logger.log('⚠️ No hay clientes o productos. Ejecuta Setup.gs primero');
    return;
  }
  
  const today = new Date();
  const salesData = [];
  const itemsData = [];
  
  // Crear 50 ventas en los últimos 30 días
  for (let i = 0; i < 50; i++) {
    // Fecha aleatoria en los últimos 30 días
    const daysAgo = Math.floor(Math.random() * 30);
    const saleDate = new Date(today);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    
    // Cliente aleatorio
    const client = clients[Math.floor(Math.random() * clients.length)];
    
    // Tipo de venta (70% contado, 30% crédito)
    const saleType = Math.random() < 0.7 ? 'CONTADO' : 'CREDITO';
    
    // ID de venta
    const saleId = 'sale-' + Date.now() + '-' + i;
    
    // Crear 1-5 items por venta
    const numItems = Math.floor(Math.random() * 5) + 1;
    let total = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = parseFloat(product.price);
      const subtotal = price * quantity;
      total += subtotal;
      
      // Solo agregar items si la hoja existe
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
    
    // Agregar venta
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
  
  // Escribir items solo si la hoja existe
  if (itemsSheet && itemsData.length > 0) {
    itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, itemsData.length, itemsData[0].length).setValues(itemsData);
    Logger.log('✓ ' + itemsData.length + ' items de venta creados');
  } else if (!itemsSheet) {
    Logger.log('⚠️ Hoja POS_SaleItems no existe. Items no guardados.');
  }
}

/**
 * Crea planes de crédito ficticios
 */
function seedCreditPlans() {
  const ss = getActiveSpreadsheet();
  const plansSheet = ss.getSheetByName('CRD_Plans');
  const salesSheet = ss.getSheetByName('POS_Sales');
  
  if (!plansSheet || !salesSheet) {
    Logger.log('⚠️ Hojas CRD_Plans o POS_Sales no existen. Saltando planes.');
    return;
  }
  
  // Obtener ventas a crédito
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
    const numInstallments = [3, 6, 12][Math.floor(Math.random() * 3)]; // 3, 6 o 12 cuotas
    const installmentAmount = sale.total / numInstallments;
    const startDate = new Date(sale.date);
    startDate.setDate(startDate.getDate() + 7); // Primera cuota en 7 días
    
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
 * Crea cuotas (vencidas, de hoy, de la semana)
 */
function seedInstallments() {
  const ss = getActiveSpreadsheet();
  const installmentsSheet = ss.getSheetByName('CRD_Installments');
  const plansSheet = ss.getSheetByName('CRD_Plans');
  
  if (!installmentsSheet || !plansSheet) {
    Logger.log('⚠️ Hojas CRD_Installments o CRD_Plans no existen. Saltando cuotas.');
    return;
  }
  
  // Obtener planes
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
    
    // Crear cuotas
    for (let j = 0; j < numInstallments; j++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + j);
      
      const installmentId = 'inst-' + planId + '-' + (j + 1);
      
      // Determinar estado
      let status = 'PENDING';
      let paidAmount = 0;
      let paidDate = null;
      
      // 30% de cuotas pagadas
      if (Math.random() < 0.3 && dueDate < today) {
        status = 'PAID';
        paidAmount = installmentAmount;
        paidDate = new Date(dueDate);
        paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 5));
      }
      // 20% de cuotas parcialmente pagadas
      else if (Math.random() < 0.2 && dueDate < today) {
        status = 'PARTIAL';
        paidAmount = installmentAmount * (Math.random() * 0.8 + 0.1); // 10-90%
      }
      
      installmentsData.push([
        installmentId,
        planId,
        clientId,
        clientName,
        j + 1, // installment_number
        installmentAmount,
        paidAmount,
        installmentAmount - paidAmount, // balance
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
    
    // Contar cuotas vencidas, de hoy y de la semana
    let overdue = 0, todayCount = 0, weekCount = 0;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    installmentsData.forEach(function(inst) {
      const dueDate = new Date(inst[8]);
      const status = inst[9];
      
      if (status === 'PENDING' || status === 'PARTIAL') {
        if (dueDate < today) overdue++;
        else if (dueDate >= today && dueDate < tomorrow) todayCount++;
        else if (dueDate >= tomorrow && dueDate < nextWeek) weekCount++;
      }
    });
    
    Logger.log('  - Vencidas: ' + overdue);
    Logger.log('  - Vencen hoy: ' + todayCount);
    Logger.log('  - Vencen esta semana: ' + weekCount);
  }
}

/**
 * Crea pagos ficticios
 */
function seedPayments() {
  const ss = getActiveSpreadsheet();
  const paymentsSheet = ss.getSheetByName('CRD_Payments');
  const installmentsSheet = ss.getSheetByName('CRD_Installments');
  
  if (!paymentsSheet || !installmentsSheet) {
    Logger.log('⚠️ Hojas CRD_Payments o CRD_Installments no existen. Saltando pagos.');
    return;
  }
  
  // Obtener cuotas pagadas
  const installmentsData = installmentsSheet.getDataRange().getValues();
  const paymentsData = [];
  
  for (let i = 1; i < installmentsData.length; i++) {
    const status = installmentsData[i][9];
    
    if (status === 'PAID' || status === 'PARTIAL') {
      const installmentId = installmentsData[i][0];
      const planId = installmentsData[i][1];
      const clientId = installmentsData[i][2];
      const amount = installmentsData[i][6]; // paid_amount
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
function seedMovements() {
  const ss = getActiveSpreadsheet();
  const movementsSheet = ss.getSheetByName('INV_Movements');
  
  if (!movementsSheet) {
    Logger.log('⚠️ Hoja INV_Movements no existe. Saltando movimientos.');
    return;
  }
  
  const productRepo = new ProductRepository();
  const products = productRepo.findAll();
  
  const movementsData = [];
  const today = new Date();
  
  // Crear movimientos de los últimos 30 días
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
      type === 'ENTRADA' ? 'Compra de mercadería' : 
      type === 'SALIDA' ? 'Venta' : 'Ajuste de inventario',
      movDate
    ]);
  }
  
  if (movementsData.length > 0) {
    movementsSheet.getRange(movementsSheet.getLastRow() + 1, 1, movementsData.length, movementsData[0].length).setValues(movementsData);
    Logger.log('✓ ' + movementsData.length + ' movimientos creados');
  }
}

/**
 * Actualiza niveles de stock (algunos con stock bajo)
 */
function updateStockLevels() {
  const ss = getActiveSpreadsheet();
  const stockSheet = ss.getSheetByName('INV_Stock');
  
  if (!stockSheet) {
    Logger.log('⚠️ Hoja INV_Stock no existe. Saltando actualización de stock.');
    return;
  }
  
  const stockData = stockSheet.getDataRange().getValues();
  
  let lowStockCount = 0;
  
  for (let i = 1; i < stockData.length; i++) {
    const minStock = stockData[i][4]; // min_stock
    
    // 30% de productos con stock bajo
    let newQuantity;
    if (Math.random() < 0.3) {
      newQuantity = Math.floor(Math.random() * minStock); // Por debajo del mínimo
      lowStockCount++;
    } else {
      newQuantity = Math.floor(Math.random() * 50) + minStock; // Por encima del mínimo
    }
    
    stockSheet.getRange(i + 1, 4).setValue(newQuantity); // quantity
    stockSheet.getRange(i + 1, 6).setValue(new Date()); // last_updated
  }
  
  Logger.log('✓ Stock actualizado (' + lowStockCount + ' productos con stock bajo)');
}

/**
 * Función de prueba rápida
 */
function testSeedComplete() {
  Logger.log('Iniciando seed completo...');
  const result = seedAllDataComplete();
  Logger.log('Resultado: ' + JSON.stringify(result));
}

