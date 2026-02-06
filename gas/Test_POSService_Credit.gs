/**
 * Test_POSService_Credit.gs - Pruebas para ventas a crédito en POSService
 * Adiction Boutique Suite
 * 
 * Este archivo contiene pruebas para verificar que el POSService
 * soporta correctamente las ventas a crédito.
 * 
 * Requisitos: 7.1, 7.3
 */

/**
 * testPOSServiceCreditSale - Prueba la creación de una venta a crédito
 * 
 * Verifica que:
 * 1. Se valida el cupo disponible del cliente
 * 2. Se crea la venta con tipo CREDITO
 * 3. Se actualiza el estado de pago a PENDING
 * 4. Se crea el plan de crédito con cuotas
 * 5. Se decrementa el cupo disponible del cliente
 */
function testPOSServiceCreditSale() {
  Logger.log('=== Iniciando pruebas de venta a crédito en POSService ===');
  
  try {
    // ========================================================================
    // PREPARACIÓN
    // ========================================================================
    
    Logger.log('\n1. Preparando datos de prueba...');
    
    // Obtener un cliente de ejemplo con cupo disponible
    const clientRepo = new ClientRepository();
    const clients = clientRepo.findAll();
    
    let testClient = null;
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      if (client.active) {
        const creditLimit = Number(client.credit_limit) || 0;
        const creditUsed = Number(client.credit_used) || 0;
        const creditAvailable = creditLimit - creditUsed;
        
        if (creditAvailable >= 500) {
          testClient = client;
          break;
        }
      }
    }
    
    if (!testClient) {
      Logger.log('✗ No hay clientes con cupo disponible suficiente para probar');
      Logger.log('Por favor, cree un cliente con cupo de crédito >= 500');
      return;
    }
    
    Logger.log('✓ Cliente encontrado: ' + testClient.name);
    Logger.log('  Límite de crédito: ' + testClient.credit_limit);
    Logger.log('  Crédito usado: ' + testClient.credit_used);
    Logger.log('  Crédito disponible: ' + (Number(testClient.credit_limit) - Number(testClient.credit_used)));
    
    // Obtener un producto de ejemplo con stock
    const productRepo = new ProductRepository();
    const products = productRepo.findAll();
    
    if (products.length === 0) {
      Logger.log('✗ No hay productos para probar');
      return;
    }
    
    const testProduct = products[0];
    Logger.log('✓ Producto encontrado: ' + testProduct.name + ', precio=' + testProduct.price);
    
    // Verificar stock disponible
    const inventoryService = new InventoryService();
    const warehouseId = 'WH_MUJERES';
    const availableStock = inventoryService.checkStock(warehouseId, testProduct.id);
    
    if (availableStock < 2) {
      Logger.log('✗ Stock insuficiente para el producto (disponible: ' + availableStock + ')');
      return;
    }
    
    Logger.log('✓ Stock disponible: ' + availableStock);
    
    // ========================================================================
    // PRUEBA 1: Crear venta a crédito con 3 cuotas
    // ========================================================================
    
    Logger.log('\n2. Probando creación de venta a crédito con 3 cuotas...');
    
    const posService = new POSService();
    
    // Preparar datos de la venta
    const saleData = {
      storeId: 'STORE_MUJERES',
      warehouseId: warehouseId,
      userId: 'test@example.com',
      clientId: testClient.id,
      saleType: SALE_TYPES.CREDITO,
      installments: 3,
      items: [
        {
          productId: testProduct.id,
          quantity: 2,
          unitPrice: Number(testProduct.price),
          subtotal: Number(testProduct.price) * 2
        }
      ],
      discount: 0
    };
    
    // Generar requestId único
    const requestId = 'test-credit-' + new Date().getTime();
    
    // Crear venta
    const result = posService.createSale(saleData, requestId);
    
    Logger.log('✓ Venta a crédito creada exitosamente');
    Logger.log('  Sale ID: ' + result.sale.id);
    Logger.log('  Sale Number: ' + result.sale.sale_number);
    Logger.log('  Sale Type: ' + result.sale.sale_type);
    Logger.log('  Payment Status: ' + result.sale.payment_status);
    Logger.log('  Total: ' + result.sale.total);
    
    // ========================================================================
    // VERIFICACIONES
    // ========================================================================
    
    Logger.log('\n3. Verificando resultado de la venta...');
    
    // Verificar que el tipo de venta sea CREDITO
    if (result.sale.sale_type === SALE_TYPES.CREDITO) {
      Logger.log('✓ Tipo de venta es CREDITO');
    } else {
      Logger.log('✗ Tipo de venta NO es CREDITO: ' + result.sale.sale_type);
    }
    
    // Verificar que el estado de pago sea PENDING
    if (result.sale.payment_status === PAYMENT_STATUS.PENDING) {
      Logger.log('✓ Estado de pago es PENDING');
    } else {
      Logger.log('✗ Estado de pago NO es PENDING: ' + result.sale.payment_status);
    }
    
    // Verificar que se creó el plan de crédito
    if (result.creditPlan) {
      Logger.log('✓ Plan de crédito creado');
      Logger.log('  Plan ID: ' + result.creditPlan.id);
      Logger.log('  Total: ' + result.creditPlan.total_amount);
      Logger.log('  Cuotas: ' + result.creditPlan.installments_count);
      Logger.log('  Monto por cuota: ' + result.creditPlan.installment_amount);
    } else {
      Logger.log('✗ Plan de crédito NO fue creado');
    }
    
    // Verificar que se crearon las cuotas
    if (result.installments && result.installments.length === 3) {
      Logger.log('✓ Cuotas creadas correctamente (' + result.installments.length + ')');
      
      let totalCuotas = 0;
      for (let i = 0; i < result.installments.length; i++) {
        const inst = result.installments[i];
        totalCuotas += Number(inst.amount);
        Logger.log('  Cuota ' + inst.installment_number + ': ' + inst.amount + ', vence=' + formatDate(inst.due_date));
      }
      
      // Verificar que la suma de cuotas sea igual al total
      const diff = Math.abs(totalCuotas - result.sale.total);
      if (diff < 0.01) {
        Logger.log('✓ Suma de cuotas coincide con el total de la venta');
      } else {
        Logger.log('✗ Suma de cuotas NO coincide (diferencia: ' + diff + ')');
      }
    } else {
      Logger.log('✗ Cuotas NO fueron creadas correctamente');
    }
    
    // Verificar que se actualizó el cupo del cliente
    if (result.client) {
      Logger.log('✓ Información del cliente actualizada');
      Logger.log('  Crédito usado: ' + result.client.credit_used);
      Logger.log('  Crédito disponible: ' + result.client.credit_available);
      
      // Verificar que el cupo usado aumentó
      const newCreditUsed = Number(result.client.credit_used);
      const oldCreditUsed = Number(testClient.credit_used);
      
      if (newCreditUsed > oldCreditUsed) {
        Logger.log('✓ Cupo del cliente fue decrementado correctamente');
      } else {
        Logger.log('✗ Cupo del cliente NO fue actualizado');
      }
    } else {
      Logger.log('✗ Información del cliente NO está disponible');
    }
    
    // ========================================================================
    // PRUEBA 2: Validar rechazo por cupo insuficiente
    // ========================================================================
    
    Logger.log('\n4. Probando validación de cupo insuficiente...');
    
    // Intentar crear una venta que exceda el cupo disponible
    const saleDataExceedingCredit = {
      storeId: 'STORE_MUJERES',
      warehouseId: warehouseId,
      userId: 'test@example.com',
      clientId: testClient.id,
      saleType: SALE_TYPES.CREDITO,
      installments: 3,
      items: [
        {
          productId: testProduct.id,
          quantity: 2,
          unitPrice: 999999, // Precio muy alto para exceder el cupo
          subtotal: 999999 * 2
        }
      ],
      discount: 0
    };
    
    const requestId2 = 'test-credit-exceed-' + new Date().getTime();
    
    try {
      posService.createSale(saleDataExceedingCredit, requestId2);
      Logger.log('✗ Debería haber rechazado la venta por cupo insuficiente');
    } catch (e) {
      if (e.message.indexOf('Cupo de crédito insuficiente') !== -1) {
        Logger.log('✓ Venta rechazada correctamente por cupo insuficiente');
        Logger.log('  Error: ' + e.message);
      } else {
        Logger.log('✗ Error inesperado: ' + e.message);
      }
    }
    
    // ========================================================================
    // PRUEBA 3: Validar que venta CONTADO sigue funcionando
    // ========================================================================
    
    Logger.log('\n5. Probando que venta CONTADO sigue funcionando...');
    
    const saleDataContado = {
      storeId: 'STORE_MUJERES',
      warehouseId: warehouseId,
      userId: 'test@example.com',
      saleType: SALE_TYPES.CONTADO,
      items: [
        {
          productId: testProduct.id,
          quantity: 1,
          unitPrice: Number(testProduct.price),
          subtotal: Number(testProduct.price)
        }
      ],
      discount: 0
    };
    
    const requestId3 = 'test-contado-' + new Date().getTime();
    
    const resultContado = posService.createSale(saleDataContado, requestId3);
    
    if (resultContado.sale.sale_type === SALE_TYPES.CONTADO && resultContado.sale.payment_status === PAYMENT_STATUS.PAID) {
      Logger.log('✓ Venta CONTADO funciona correctamente');
      Logger.log('  Sale Type: ' + resultContado.sale.sale_type);
      Logger.log('  Payment Status: ' + resultContado.sale.payment_status);
    } else {
      Logger.log('✗ Venta CONTADO NO funciona correctamente');
    }
    
    // Verificar que NO se creó plan de crédito para venta CONTADO
    if (!resultContado.creditPlan) {
      Logger.log('✓ No se creó plan de crédito para venta CONTADO (correcto)');
    } else {
      Logger.log('✗ Se creó plan de crédito para venta CONTADO (incorrecto)');
    }
    
    Logger.log('\n=== Pruebas de venta a crédito completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testPOSServiceCreditValidations - Prueba las validaciones de ventas a crédito
 */
function testPOSServiceCreditValidations() {
  Logger.log('=== Iniciando pruebas de validaciones de venta a crédito ===');
  
  try {
    const posService = new POSService();
    
    // Obtener un producto de ejemplo
    const productRepo = new ProductRepository();
    const products = productRepo.findAll();
    
    if (products.length === 0) {
      Logger.log('✗ No hay productos para probar');
      return;
    }
    
    const testProduct = products[0];
    
    // Probar con clientId faltante para venta CREDITO
    Logger.log('\n1. Probando venta CREDITO sin clientId...');
    try {
      const saleData = {
        storeId: 'STORE_MUJERES',
        warehouseId: 'WH_MUJERES',
        userId: 'test@example.com',
        saleType: SALE_TYPES.CREDITO,
        installments: 3,
        items: [
          {
            productId: testProduct.id,
            quantity: 1,
            unitPrice: Number(testProduct.price),
            subtotal: Number(testProduct.price)
          }
        ],
        discount: 0
      };
      
      posService.createSale(saleData, 'test-no-client-' + new Date().getTime());
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      if (e.message.indexOf('clientId es requerido') !== -1) {
        Logger.log('✓ Error esperado: ' + e.message);
      } else {
        Logger.log('⚠ Error diferente: ' + e.message);
      }
    }
    
    // Probar con installments faltante para venta CREDITO
    Logger.log('\n2. Probando venta CREDITO sin installments...');
    try {
      const saleData = {
        storeId: 'STORE_MUJERES',
        warehouseId: 'WH_MUJERES',
        userId: 'test@example.com',
        clientId: 'client-123',
        saleType: SALE_TYPES.CREDITO,
        items: [
          {
            productId: testProduct.id,
            quantity: 1,
            unitPrice: Number(testProduct.price),
            subtotal: Number(testProduct.price)
          }
        ],
        discount: 0
      };
      
      posService.createSale(saleData, 'test-no-installments-' + new Date().getTime());
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      if (e.message.indexOf('installments es requerido') !== -1) {
        Logger.log('✓ Error esperado: ' + e.message);
      } else {
        Logger.log('⚠ Error diferente: ' + e.message);
      }
    }
    
    // Probar con installments fuera de rango
    Logger.log('\n3. Probando venta CREDITO con installments = 0...');
    try {
      const saleData = {
        storeId: 'STORE_MUJERES',
        warehouseId: 'WH_MUJERES',
        userId: 'test@example.com',
        clientId: 'client-123',
        saleType: SALE_TYPES.CREDITO,
        installments: 0,
        items: [
          {
            productId: testProduct.id,
            quantity: 1,
            unitPrice: Number(testProduct.price),
            subtotal: Number(testProduct.price)
          }
        ],
        discount: 0
      };
      
      posService.createSale(saleData, 'test-invalid-installments-' + new Date().getTime());
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      if (e.message.indexOf('installments debe estar entre') !== -1) {
        Logger.log('✓ Error esperado: ' + e.message);
      } else {
        Logger.log('⚠ Error diferente: ' + e.message);
      }
    }
    
    Logger.log('\n=== Pruebas de validaciones completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}
