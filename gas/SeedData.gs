/**
 * SeedData.gs - Datos de Prueba para Adiction Boutique Suite
 * 
 * Este archivo contiene funciones para poblar la base de datos con datos realistas
 * para probar el sistema completo.
 * 
 * FUNCIONES PRINCIPALES:
 * =====================
 * 1. populateTestData() - Poblar TODOS los datos de prueba
 * 2. populateProducts() - Solo productos
 * 3. populateClients() - Solo clientes
 * 4. populateSales() - Solo ventas
 * 5. clearAllData() - Limpiar todos los datos (mantiene estructura)
 * 
 * EJECUCIÓN:
 * ==========
 * Para poblar todo: populateTestData()
 * Para limpiar: clearAllData()
 */

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * populateTestData - Poblar base de datos con datos de prueba completos
 * 
 * Crea datos realistas para:
 * - 50 productos variados
 * - 30 clientes
 * - 100 ventas (últimos 3 meses)
 * - 20 planes de crédito
 * - Stock inicial
 * - Movimientos de inventario
 */
function populateTestData() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  POBLACIÓN DE DATOS DE PRUEBA                             ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Poblar productos
    Logger.log('1. Poblando productos...');
    const products = populateProducts();
    Logger.log('   ✓ ' + products.length + ' productos creados');
    
    // 2. Poblar clientes
    Logger.log('2. Poblando clientes...');
    const clients = populateClients();
    Logger.log('   ✓ ' + clients.length + ' clientes creados');
    
    // 3. Poblar stock inicial
    Logger.log('3. Poblando stock inicial...');
    const stockRecords = populateStock(products);
    Logger.log('   ✓ ' + stockRecords.length + ' registros de stock creados');
    
    // 4. Poblar ventas
    Logger.log('4. Poblando ventas...');
    const sales = populateSales(products, clients);
    Logger.log('   ✓ ' + sales.length + ' ventas creadas');
    
    // 5. Poblar planes de crédito
    Logger.log('5. Poblando planes de crédito...');
    const creditPlans = populateCreditPlans(sales, clients);
    Logger.log('   ✓ ' + creditPlans.length + ' planes de crédito creados');
    
    // 6. Poblar movimientos de inventario
    Logger.log('6. Poblando movimientos de inventario...');
    const movements = populateMovements(products, sales);
    Logger.log('   ✓ ' + movements.length + ' movimientos creados');
    
    // 7. Poblar pagos de crédito
    Logger.log('7. Poblando pagos de crédito...');
    const payments = populatePayments(clients, creditPlans);
    Logger.log('   ✓ ' + payments.length + ' pagos registrados');
    
    // 8. Poblar turnos de caja
    Logger.log('8. Poblando turnos de caja...');
    const shifts = populateCashShifts(sales);
    Logger.log('   ✓ ' + shifts.length + ' turnos creados');
    
    // 9. Poblar egresos de caja
    Logger.log('9. Poblando egresos de caja...');
    const expenses = populateExpenses(shifts);
    Logger.log('   ✓ ' + expenses.length + ' egresos registrados');
    
    Logger.log('');
    Logger.log('╔════════════════════════════════════════════════════════════╗');
    Logger.log('║  ✓✓✓ POBLACIÓN COMPLETADA ✓✓✓                            ║');
    Logger.log('╚════════════════════════════════════════════════════════════╝');
    Logger.log('');
    Logger.log('Resumen:');
    Logger.log('  • Productos: ' + products.length);
    Logger.log('  • Clientes: ' + clients.length);
    Logger.log('  • Stock: ' + stockRecords.length);
    Logger.log('  • Ventas: ' + sales.length);
    Logger.log('  • Créditos: ' + creditPlans.length);
    Logger.log('  • Movimientos: ' + movements.length);
    Logger.log('  • Pagos: ' + payments.length);
    Logger.log('  • Turnos: ' + shifts.length);
    Logger.log('  • Egresos: ' + expenses.length);
    
  } catch (error) {
    Logger.log('');
    Logger.log('✗✗✗ ERROR ✗✗✗');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
    throw error;
  }
}

// ============================================================================
// FUNCIONES DE POBLACIÓN
// ============================================================================

/**
 * populateProducts - Crear 50 productos variados
 */
function populateProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CAT_Products');
  
  const products = [];
  const colors = ['Negro', 'Blanco', 'Azul', 'Rojo', 'Verde', 'Gris', 'Beige', 'Rosa', 'Amarillo'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'UNICA'];
  
  // Blusas (10)
  for (let i = 1; i <= 10; i++) {
    products.push([
      'prod-' + String(i).padStart(3, '0'),
      '775' + String(1000 + i),
      'Blusa ' + colors[i % colors.length],
      'Blusa elegante de dama',
      'line-001', // Dama
      'cat-001', // Blusas
      'brand-00' + ((i % 5) + 1),
      'sup-00' + ((i % 3) + 1),
      sizes[i % sizes.length],
      colors[i % colors.length],
      'Unidad',
      25 + (i * 2), // purchase_price
      50 + (i * 3), // price
      5, // min_stock
      new Date(2024, 0, i), // entry_date
      '', // barcode_url
      true, // active
      new Date(),
      new Date()
    ]);
  }
  
  // Pantalones (10)
  for (let i = 11; i <= 20; i++) {
    products.push([
      'prod-' + String(i).padStart(3, '0'),
      '775' + String(1000 + i),
      'Pantalón ' + colors[i % colors.length],
      'Pantalón de dama',
      'line-001',
      'cat-002', // Pantalones
      'brand-00' + ((i % 5) + 1),
      'sup-00' + ((i % 3) + 1),
      sizes[i % sizes.length],
      colors[i % colors.length],
      'Unidad',
      40 + (i * 2),
      80 + (i * 3),
      5,
      new Date(2024, 1, i - 10),
      '',
      true,
      new Date(),
      new Date()
    ]);
  }
  
  // Vestidos (10)
  for (let i = 21; i <= 30; i++) {
    products.push([
      'prod-' + String(i).padStart(3, '0'),
      '775' + String(1000 + i),
      'Vestido ' + colors[i % colors.length],
      'Vestido elegante',
      'line-001',
      'cat-003', // Vestidos
      'brand-00' + ((i % 5) + 1),
      'sup-00' + ((i % 3) + 1),
      sizes[i % sizes.length],
      colors[i % colors.length],
      'Unidad',
      60 + (i * 2),
      120 + (i * 3),
      3,
      new Date(2024, 2, i - 20),
      '',
      true,
      new Date(),
      new Date()
    ]);
  }
  
  // Camisas de caballero (10)
  for (let i = 31; i <= 40; i++) {
    products.push([
      'prod-' + String(i).padStart(3, '0'),
      '775' + String(1000 + i),
      'Camisa ' + colors[i % colors.length],
      'Camisa de caballero',
      'line-002', // Caballero
      'cat-005', // Camisas
      'brand-00' + ((i % 5) + 1),
      'sup-00' + ((i % 3) + 1),
      sizes[i % sizes.length],
      colors[i % colors.length],
      'Unidad',
      30 + (i * 2),
      60 + (i * 3),
      5,
      new Date(2024, 3, i - 30),
      '',
      true,
      new Date(),
      new Date()
    ]);
  }
  
  // Accesorios (10)
  for (let i = 41; i <= 50; i++) {
    products.push([
      'prod-' + String(i).padStart(3, '0'),
      '775' + String(1000 + i),
      'Cartera ' + colors[i % colors.length],
      'Cartera de dama',
      'line-004', // Accesorios
      'cat-010', // Carteras
      'brand-00' + ((i % 5) + 1),
      'sup-00' + ((i % 3) + 1),
      'UNICA',
      colors[i % colors.length],
      'Unidad',
      20 + (i * 1.5),
      40 + (i * 2.5),
      10,
      new Date(2024, 4, i - 40),
      '',
      true,
      new Date(),
      new Date()
    ]);
  }
  
  // Insertar en la hoja
  if (products.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, products.length, products[0].length).setValues(products);
  }
  
  return products;
}

/**
 * populateClients - Crear 30 clientes
 */
function populateClients() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CRM_Clients');
  
  const clients = [];
  const names = [
    'María García', 'Ana Rodríguez', 'Carmen López', 'Isabel Martínez', 'Rosa Sánchez',
    'Laura Pérez', 'Marta González', 'Elena Fernández', 'Sofía Díaz', 'Paula Torres',
    'Lucía Ramírez', 'Andrea Flores', 'Cristina Morales', 'Patricia Jiménez', 'Raquel Castro',
    'Beatriz Ruiz', 'Silvia Ortiz', 'Mónica Romero', 'Alicia Navarro', 'Teresa Muñoz',
    'Pilar Álvarez', 'Dolores Herrera', 'Amparo Medina', 'Consuelo Vargas', 'Encarna Ramos',
    'Josefa Serrano', 'Francisca Blanco', 'Antonia Molina', 'Mercedes Moreno', 'Rosario Gil'
  ];
  
  const districts = ['San Isidro', 'Miraflores', 'Surco', 'La Molina', 'San Borja', 'Jesús María'];
  
  for (let i = 0; i < 30; i++) {
    const dni = String(40000000 + i * 123456).substring(0, 8);
    const phone = '9' + String(10000000 + i * 12345).substring(0, 8);
    const district = districts[i % districts.length];
    
    clients.push([
      'cli-' + String(i + 1).padStart(3, '0'),
      dni,
      names[i],
      phone,
      'cliente' + (i + 1) + '@email.com',
      'Av. Principal ' + (100 + i * 10) + ', ' + district + ', Lima',
      -12.0464 - (i * 0.001), // lat
      -77.0428 + (i * 0.001), // lng
      2000 + (i * 100), // credit_limit
      0, // credit_used
      '', // dni_photo_url
      new Date(1980 + (i % 30), i % 12, (i % 28) + 1), // birthday
      true, // active
      new Date()
    ]);
  }
  
  // Insertar en la hoja
  if (clients.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, clients.length, clients[0].length).setValues(clients);
  }
  
  return clients;
}

/**
 * populateStock - Crear stock inicial para productos
 */
function populateStock(products) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('INV_Stock');
  
  const stockRecords = [];
  const warehouses = ['Mujeres', 'Hombres'];
  
  // Crear stock para cada producto en cada almacén
  for (let i = 0; i < products.length; i++) {
    const productId = products[i][0];
    
    for (let w = 0; w < warehouses.length; w++) {
      const quantity = Math.floor(Math.random() * 50) + 10; // 10-60 unidades
      
      stockRecords.push([
        'stock-' + String(stockRecords.length + 1).padStart(4, '0'),
        warehouses[w],
        productId,
        quantity,
        new Date()
      ]);
    }
  }
  
  // Insertar en la hoja
  if (stockRecords.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, stockRecords.length, stockRecords[0].length).setValues(stockRecords);
  }
  
  return stockRecords;
}

/**
 * populateSales - Crear 100 ventas de los últimos 3 meses
 */
function populateSales(products, clients) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const salesSheet = ss.getSheetByName('POS_Sales');
  const itemsSheet = ss.getSheetByName('POS_SaleItems');
  
  const sales = [];
  const saleItems = [];
  const stores = ['Mujeres', 'Hombres'];
  const users = ['usr_002', 'usr_003'];
  const saleTypes = ['CONTADO', 'CREDITO'];
  
  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  
  for (let i = 0; i < 100; i++) {
    // Fecha aleatoria en los últimos 3 meses
    const saleDate = new Date(
      threeMonthsAgo.getTime() + Math.random() * (today.getTime() - threeMonthsAgo.getTime())
    );
    
    const saleId = 'sale-' + String(i + 1).padStart(4, '0');
    const saleNumber = 'V' + String(10000 + i);
    const store = stores[i % stores.length];
    const client = clients[i % clients.length];
    const clientId = client[0];
    const userId = users[i % users.length];
    const saleType = saleTypes[i % 5 === 0 ? 1 : 0]; // 20% crédito
    
    // Generar items de venta (1-4 productos por venta)
    const itemCount = Math.floor(Math.random() * 4) + 1;
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const productId = product[0];
      const unitPrice = product[12]; // price
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemSubtotal = unitPrice * quantity;
      
      subtotal += itemSubtotal;
      
      saleItems.push([
        'item-' + String(saleItems.length + 1).padStart(5, '0'),
        saleId,
        productId,
        quantity,
        unitPrice,
        itemSubtotal
      ]);
    }
    
    // Descuento aleatorio (0-20%)
    const discountPercent = Math.random() < 0.3 ? Math.floor(Math.random() * 20) : 0;
    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;
    
    // Algunas ventas anuladas (5%)
    const voided = Math.random() < 0.05;
    
    sales.push([
      saleId,
      saleNumber,
      store,
      clientId,
      userId,
      saleType,
      subtotal,
      discount,
      total,
      saleType === 'CONTADO' ? 'PAGADO' : 'PENDIENTE',
      saleDate,
      voided,
      voided ? 'Error en registro' : '',
      voided ? 'usr_001' : '',
      voided ? new Date() : ''
    ]);
  }
  
  // Insertar ventas
  if (sales.length > 0) {
    salesSheet.getRange(salesSheet.getLastRow() + 1, 1, sales.length, sales[0].length).setValues(sales);
  }
  
  // Insertar items
  if (saleItems.length > 0) {
    itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, saleItems.length, saleItems[0].length).setValues(saleItems);
  }
  
  return sales;
}

/**
 * populateCreditPlans - Crear planes de crédito para ventas a crédito
 */
function populateCreditPlans(sales, clients) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const plansSheet = ss.getSheetByName('CRD_Plans');
  const installmentsSheet = ss.getSheetByName('CRD_Installments');
  
  const plans = [];
  const installments = [];
  
  // Filtrar solo ventas a crédito
  const creditSales = sales.filter(function(sale) {
    return sale[5] === 'CREDITO'; // sale_type
  });
  
  for (let i = 0; i < creditSales.length; i++) {
    const sale = creditSales[i];
    const saleId = sale[0];
    const clientId = sale[3];
    const total = sale[8];
    const saleDate = sale[10];
    
    // Número de cuotas (3, 6 o 12)
    const installmentsCount = [3, 6, 12][Math.floor(Math.random() * 3)];
    const installmentAmount = total / installmentsCount;
    
    const planId = 'plan-' + String(i + 1).padStart(4, '0');
    
    // Determinar estado del plan
    const paidInstallments = Math.floor(Math.random() * (installmentsCount + 1));
    let status = 'ACTIVO';
    if (paidInstallments === installmentsCount) {
      status = 'COMPLETADO';
    } else if (paidInstallments > 0) {
      status = 'ACTIVO';
    }
    
    plans.push([
      planId,
      saleId,
      clientId,
      total,
      installmentsCount,
      installmentAmount,
      status,
      saleDate
    ]);
    
    // Crear cuotas
    for (let j = 0; j < installmentsCount; j++) {
      const dueDate = new Date(saleDate);
      dueDate.setMonth(dueDate.getMonth() + j + 1);
      
      const isPaid = j < paidInstallments;
      const paidAmount = isPaid ? installmentAmount : 0;
      const installmentStatus = isPaid ? 'PAGADO' : (dueDate < new Date() ? 'VENCIDO' : 'PENDIENTE');
      
      installments.push([
        'inst-' + String(installments.length + 1).padStart(5, '0'),
        planId,
        j + 1,
        installmentAmount,
        dueDate,
        paidAmount,
        installmentStatus,
        isPaid ? new Date(dueDate.getTime() - (Math.random() * 5 * 24 * 60 * 60 * 1000)) : ''
      ]);
    }
  }
  
  // Insertar planes
  if (plans.length > 0) {
    plansSheet.getRange(plansSheet.getLastRow() + 1, 1, plans.length, plans[0].length).setValues(plans);
  }
  
  // Insertar cuotas
  if (installments.length > 0) {
    installmentsSheet.getRange(installmentsSheet.getLastRow() + 1, 1, installments.length, installments[0].length).setValues(installments);
  }
  
  return plans;
}

// ============================================================================
// FUNCIONES DE LIMPIEZA
// ============================================================================

/**
 * clearAllData - Limpiar todos los datos (mantiene estructura)
 */
function clearAllData() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  LIMPIEZA DE DATOS                                        ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  Logger.log('');
  Logger.log('⚠️  ADVERTENCIA: Esto borrará todos los datos de prueba');
  Logger.log('');
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetsToClean = [
    'CAT_Products',
    'INV_Stock',
    'INV_Movements',
    'CRM_Clients',
    'POS_Sales',
    'POS_SaleItems',
    'CRD_Plans',
    'CRD_Installments',
    'CRD_Payments',
    'CASH_Shifts',
    'CASH_Expenses'
  ];
  
  sheetsToClean.forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
        Logger.log('✓ ' + sheetName + ' limpiado');
      }
    }
  });
  
  Logger.log('');
  Logger.log('✓ Limpieza completada');
}


/**
 * populateMovements - Crear movimientos de inventario
 */
function populateMovements(products, sales) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('INV_Movements');
  const salesSheet = ss.getSheetByName('POS_Sales');
  const itemsSheet = ss.getSheetByName('POS_SaleItems');
  
  const movements = [];
  const warehouses = ['Mujeres', 'Hombres'];
  
  // 1. Movimientos de entrada inicial (compras)
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productId = product[0];
    const entryDate = product[14]; // entry_date
    
    // Entrada en cada almacén
    for (let w = 0; w < warehouses.length; w++) {
      const quantity = Math.floor(Math.random() * 30) + 20; // 20-50 unidades
      
      movements.push([
        'mov-' + String(movements.length + 1).padStart(5, '0'),
        warehouses[w],
        productId,
        'ENTRADA',
        quantity,
        'COMPRA-' + String(i + 1).padStart(4, '0'),
        'usr_001',
        'Compra inicial de inventario',
        entryDate
      ]);
    }
  }
  
  // 2. Movimientos de salida por ventas
  // Leer items de ventas para crear movimientos
  const lastRow = itemsSheet.getLastRow();
  if (lastRow > 1) {
    const itemsData = itemsSheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    itemsData.forEach(function(item, index) {
      const saleId = item[1];
      const productId = item[2];
      const quantity = item[3];
      
      // Buscar la venta para obtener fecha y almacén
      const salesData = salesSheet.getRange(2, 1, salesSheet.getLastRow() - 1, 11).getValues();
      const sale = salesData.find(function(s) { return s[0] === saleId; });
      
      if (sale) {
        const warehouse = sale[2]; // store_id
        const saleDate = sale[10]; // created_at
        const userId = sale[4]; // user_id
        
        movements.push([
          'mov-' + String(movements.length + 1).padStart(5, '0'),
          warehouse,
          productId,
          'SALIDA',
          quantity,
          saleId,
          userId,
          'Venta de producto',
          saleDate
        ]);
      }
    });
  }
  
  // 3. Algunos ajustes de inventario (5% de productos)
  const adjustCount = Math.floor(products.length * 0.05);
  for (let i = 0; i < adjustCount; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const productId = product[0];
    const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const isPositive = Math.random() > 0.5;
    
    movements.push([
      'mov-' + String(movements.length + 1).padStart(5, '0'),
      warehouse,
      productId,
      isPositive ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA',
      quantity,
      'ADJ-' + String(i + 1).padStart(4, '0'),
      'usr_001',
      isPositive ? 'Ajuste por inventario físico - sobrante' : 'Ajuste por inventario físico - faltante',
      new Date()
    ]);
  }
  
  // Insertar en la hoja
  if (movements.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, movements.length, movements[0].length).setValues(movements);
  }
  
  return movements;
}

/**
 * populatePayments - Crear pagos de crédito
 */
function populatePayments(clients, creditPlans) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CRD_Payments');
  const installmentsSheet = ss.getSheetByName('CRD_Installments');
  
  const payments = [];
  
  // Leer todas las cuotas pagadas
  const lastRow = installmentsSheet.getLastRow();
  if (lastRow > 1) {
    const installmentsData = installmentsSheet.getRange(2, 1, lastRow - 1, 8).getValues();
    
    // Filtrar solo cuotas pagadas
    const paidInstallments = installmentsData.filter(function(inst) {
      return inst[6] === 'PAGADO'; // status
    });
    
    // Crear un pago por cada cuota pagada
    paidInstallments.forEach(function(inst, index) {
      const planId = inst[1];
      const amount = inst[5]; // paid_amount
      const paidAt = inst[7]; // paid_at
      
      // Buscar el plan para obtener el cliente
      const plansSheet = ss.getSheetByName('CRD_Plans');
      const plansData = plansSheet.getRange(2, 1, plansSheet.getLastRow() - 1, 8).getValues();
      const plan = plansData.find(function(p) { return p[0] === planId; });
      
      if (plan) {
        const clientId = plan[2];
        
        payments.push([
          'pay-' + String(payments.length + 1).padStart(5, '0'),
          clientId,
          amount,
          paidAt,
          'usr_004', // cobrador
          '', // receipt_url
          paidAt
        ]);
      }
    });
  }
  
  // Insertar en la hoja
  if (payments.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, payments.length, payments[0].length).setValues(payments);
  }
  
  return payments;
}

/**
 * populateCashShifts - Crear turnos de caja
 */
function populateCashShifts(sales) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CASH_Shifts');
  
  const shifts = [];
  const stores = ['Mujeres', 'Hombres'];
  const users = ['usr_002', 'usr_003'];
  
  // Agrupar ventas por día y tienda
  const salesByDay = {};
  
  sales.forEach(function(sale) {
    const saleDate = sale[10]; // created_at
    const store = sale[2]; // store_id
    const total = sale[8]; // total
    const voided = sale[11]; // voided
    
    // Solo ventas no anuladas
    if (!voided) {
      const dateKey = saleDate.toDateString() + '_' + store;
      
      if (!salesByDay[dateKey]) {
        salesByDay[dateKey] = {
          date: saleDate,
          store: store,
          total: 0,
          count: 0
        };
      }
      
      salesByDay[dateKey].total += total;
      salesByDay[dateKey].count++;
    }
  });
  
  // Crear un turno por cada día con ventas
  let shiftIndex = 0;
  for (const key in salesByDay) {
    const dayData = salesByDay[key];
    const openingAmount = 200; // Fondo fijo de apertura
    const expectedAmount = openingAmount + dayData.total;
    
    // Algunas diferencias de caja (10% de turnos)
    const hasDifference = Math.random() < 0.1;
    const difference = hasDifference ? (Math.random() * 20 - 10) : 0; // -10 a +10
    const closingAmount = expectedAmount + difference;
    
    const openingDate = new Date(dayData.date);
    openingDate.setHours(9, 0, 0, 0);
    
    const closingDate = new Date(dayData.date);
    closingDate.setHours(19, 0, 0, 0);
    
    const userId = users[shiftIndex % users.length];
    
    shifts.push([
      'shift-' + String(shiftIndex + 1).padStart(4, '0'),
      dayData.store,
      userId,
      openingAmount,
      openingDate,
      closingAmount,
      expectedAmount,
      difference,
      closingDate,
      Math.abs(difference) > 5 ? 'usr_001' : '' // supervisor si hay diferencia significativa
    ]);
    
    shiftIndex++;
  }
  
  // Insertar en la hoja
  if (shifts.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, shifts.length, shifts[0].length).setValues(shifts);
  }
  
  return shifts;
}

/**
 * populateExpenses - Crear egresos de caja
 */
function populateExpenses(shifts) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CASH_Expenses');
  
  const expenses = [];
  const categories = ['SERVICIOS', 'MANTENIMIENTO', 'TRANSPORTE', 'SUMINISTROS', 'OTROS'];
  const concepts = {
    'SERVICIOS': ['Pago de luz', 'Pago de agua', 'Internet', 'Teléfono'],
    'MANTENIMIENTO': ['Reparación de equipo', 'Limpieza', 'Pintura'],
    'TRANSPORTE': ['Taxi', 'Combustible', 'Estacionamiento'],
    'SUMINISTROS': ['Papel', 'Bolsas', 'Etiquetas', 'Limpieza'],
    'OTROS': ['Propina', 'Refrigerio', 'Varios']
  };
  
  // Crear 2-5 egresos por cada 3 turnos
  const expenseCount = Math.floor(shifts.length / 3) * Math.floor(Math.random() * 4 + 2);
  
  for (let i = 0; i < expenseCount; i++) {
    const shift = shifts[Math.floor(Math.random() * shifts.length)];
    const shiftId = shift[0];
    const userId = shift[2];
    const shiftDate = shift[4]; // opening_at
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const conceptOptions = concepts[category];
    const concept = conceptOptions[Math.floor(Math.random() * conceptOptions.length)];
    
    // Montos según categoría
    let amount;
    if (category === 'SERVICIOS') {
      amount = Math.floor(Math.random() * 200) + 50; // 50-250
    } else if (category === 'MANTENIMIENTO') {
      amount = Math.floor(Math.random() * 300) + 100; // 100-400
    } else {
      amount = Math.floor(Math.random() * 100) + 20; // 20-120
    }
    
    // Algunos requieren autorización (montos > 200)
    const needsAuth = amount > 200;
    
    expenses.push([
      'exp-' + String(i + 1).padStart(5, '0'),
      shiftId,
      amount,
      concept,
      category,
      '', // receipt_url
      userId,
      needsAuth ? 'usr_001' : '',
      new Date(shiftDate.getTime() + Math.random() * 8 * 60 * 60 * 1000) // Durante el turno
    ]);
  }
  
  // Insertar en la hoja
  if (expenses.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, expenses.length, expenses[0].length).setValues(expenses);
  }
  
  return expenses;
}
