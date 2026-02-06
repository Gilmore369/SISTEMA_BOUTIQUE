/**
 * Test_CreditService.gs
 * Tests unitarios para CreditService
 * 
 * Para ejecutar: abrir el editor de Apps Script y ejecutar testCreditServiceComplete()
 */

/**
 * Test completo de CreditService
 * Verifica la creación de planes de crédito, cuotas y actualización de cupo
 */
function testCreditServiceComplete() {
  Logger.log('========================================');
  Logger.log('TESTS COMPLETOS DE CREDITSERVICE');
  Logger.log('========================================');
  Logger.log('');
  
  var passed = 0;
  var failed = 0;
  
  try {
    // ========================================================================
    // PREPARACIÓN: Crear datos de prueba
    // ========================================================================
    
    Logger.log('=== PREPARACIÓN: Creando datos de prueba ===');
    
    // Crear cliente de prueba
    const clientRepo = new ClientRepository();
    const testClientId = 'test-client-' + new Date().getTime();
    const testClient = {
      id: testClientId,
      dni: '12345678',
      name: 'Cliente de Prueba',
      phone: '999888777',
      email: 'test@example.com',
      address: 'Calle Test 123',
      lat: null,
      lng: null,
      credit_limit: 5000,
      credit_used: 0,
      dni_photo_url: null,
      active: true,
      created_at: new Date()
    };
    
    clientRepo.create(testClient);
    Logger.log('✓ Cliente de prueba creado: ' + testClientId);
    
    // Crear venta de prueba de tipo CREDITO
    const saleRepo = new SaleRepository();
    const testSaleId = 'test-sale-' + new Date().getTime();
    const testSale = {
      id: testSaleId,
      sale_number: 'TEST-001',
      store_id: 'Mujeres',
      client_id: testClientId,
      user_id: 'test@example.com',
      sale_type: SALE_TYPES.CREDITO,
      subtotal: 1000,
      discount: 0,
      total: 1000,
      payment_status: PAYMENT_STATUS.PENDING,
      created_at: new Date(),
      voided: false,
      void_reason: null,
      void_user_id: null,
      void_at: null
    };
    
    saleRepo.create(testSale);
    Logger.log('✓ Venta de prueba creada: ' + testSaleId + ', total=' + testSale.total);
    
    Logger.log('');
    
    // ========================================================================
    // TEST 1: Crear plan de crédito con 3 cuotas
    // ========================================================================
    
    Logger.log('=== TEST 1: Crear plan de crédito con 3 cuotas ===');
    
    try {
      const creditService = new CreditService();
      const result = creditService.createCreditPlan(testSaleId, 3);
      
      // Verificar que se retornó un resultado válido
      if (!result || !result.plan || !result.installments) {
        Logger.log('✗ TEST 1 FAIL: Resultado inválido');
        failed++;
      } else {
        Logger.log('✓ Plan creado: ' + result.plan.id);
        Logger.log('  - Total: ' + result.plan.total_amount);
        Logger.log('  - Cuotas: ' + result.plan.installments_count);
        Logger.log('  - Monto por cuota: ' + result.plan.installment_amount);
        Logger.log('  - Estado: ' + result.plan.status);
        
        // Verificar propiedades del plan
        var planOk = true;
        
        if (result.plan.sale_id !== testSaleId) {
          Logger.log('✗ sale_id incorrecto');
          planOk = false;
        }
        
        if (result.plan.client_id !== testClientId) {
          Logger.log('✗ client_id incorrecto');
          planOk = false;
        }
        
        if (result.plan.total_amount !== 1000) {
          Logger.log('✗ total_amount incorrecto: ' + result.plan.total_amount);
          planOk = false;
        }
        
        if (result.plan.installments_count !== 3) {
          Logger.log('✗ installments_count incorrecto: ' + result.plan.installments_count);
          planOk = false;
        }
        
        if (result.plan.status !== CREDIT_PLAN_STATUS.ACTIVE) {
          Logger.log('✗ status incorrecto: ' + result.plan.status);
          planOk = false;
        }
        
        // Verificar cuotas
        if (result.installments.length !== 3) {
          Logger.log('✗ Número de cuotas incorrecto: ' + result.installments.length);
          planOk = false;
        } else {
          Logger.log('✓ Número de cuotas correcto: 3');
          
          // Verificar suma de cuotas
          var totalCuotas = 0;
          for (var i = 0; i < result.installments.length; i++) {
            totalCuotas += Number(result.installments[i].amount);
            Logger.log('  Cuota ' + result.installments[i].installment_number + 
                      ': monto=' + result.installments[i].amount + 
                      ', vence=' + formatDate(result.installments[i].due_date) +
                      ', estado=' + result.installments[i].status);
          }
          
          var diff = Math.abs(totalCuotas - result.plan.total_amount);
          if (diff < 0.01) {
            Logger.log('✓ Suma de cuotas coincide con total: ' + totalCuotas);
          } else {
            Logger.log('✗ Suma de cuotas NO coincide (diferencia: ' + diff + ')');
            planOk = false;
          }
        }
        
        // Verificar actualización de cupo del cliente
        if (result.client.credit_used === 1000) {
          Logger.log('✓ Cupo del cliente actualizado correctamente: ' + result.client.credit_used);
        } else {
          Logger.log('✗ Cupo del cliente incorrecto: ' + result.client.credit_used);
          planOk = false;
        }
        
        if (planOk) {
          Logger.log('✓ TEST 1 PASS: Plan de crédito creado correctamente');
          passed++;
        } else {
          Logger.log('✗ TEST 1 FAIL: Errores en la creación del plan');
          failed++;
        }
      }
    } catch (e) {
      Logger.log('✗ TEST 1 FAIL: ' + e.message);
      Logger.log('Stack: ' + e.stack);
      failed++;
    }
    
    Logger.log('');
    
    // ========================================================================
    // TEST 2: Validación de parámetros
    // ========================================================================
    
    Logger.log('=== TEST 2: Validación de parámetros ===');
    
    var validationTests = 0;
    var validationPassed = 0;
    
    // Test 2.1: saleId nulo
    validationTests++;
    try {
      const creditService = new CreditService();
      creditService.createCreditPlan(null, 3);
      Logger.log('✗ Test 2.1 FAIL: Debería rechazar saleId nulo');
    } catch (e) {
      if (e.message.indexOf('requerido') > -1) {
        Logger.log('✓ Test 2.1 PASS: Rechaza saleId nulo');
        validationPassed++;
      } else {
        Logger.log('✗ Test 2.1 FAIL: Mensaje incorrecto - ' + e.message);
      }
    }
    
    // Test 2.2: installments nulo
    validationTests++;
    try {
      const creditService = new CreditService();
      creditService.createCreditPlan(testSaleId, null);
      Logger.log('✗ Test 2.2 FAIL: Debería rechazar installments nulo');
    } catch (e) {
      if (e.message.indexOf('requerido') > -1) {
        Logger.log('✓ Test 2.2 PASS: Rechaza installments nulo');
        validationPassed++;
      } else {
        Logger.log('✗ Test 2.2 FAIL: Mensaje incorrecto - ' + e.message);
      }
    }
    
    // Test 2.3: installments = 0
    validationTests++;
    try {
      const creditService = new CreditService();
      creditService.createCreditPlan(testSaleId, 0);
      Logger.log('✗ Test 2.3 FAIL: Debería rechazar installments = 0');
    } catch (e) {
      if (e.message.indexOf('positivo') > -1 || e.message.indexOf('entre') > -1) {
        Logger.log('✓ Test 2.3 PASS: Rechaza installments = 0');
        validationPassed++;
      } else {
        Logger.log('✗ Test 2.3 FAIL: Mensaje incorrecto - ' + e.message);
      }
    }
    
    // Test 2.4: installments = 7 (fuera de rango)
    validationTests++;
    try {
      const creditService = new CreditService();
      creditService.createCreditPlan(testSaleId, 7);
      Logger.log('✗ Test 2.4 FAIL: Debería rechazar installments = 7');
    } catch (e) {
      if (e.message.indexOf('entre') > -1) {
        Logger.log('✓ Test 2.4 PASS: Rechaza installments fuera de rango');
        validationPassed++;
      } else {
        Logger.log('✗ Test 2.4 FAIL: Mensaje incorrecto - ' + e.message);
      }
    }
    
    // Test 2.5: saleId inexistente
    validationTests++;
    try {
      const creditService = new CreditService();
      creditService.createCreditPlan('sale-nonexistent-12345', 3);
      Logger.log('✗ Test 2.5 FAIL: Debería rechazar saleId inexistente');
    } catch (e) {
      if (e.message.indexOf('no encontrada') > -1 || e.message.indexOf('no existe') > -1) {
        Logger.log('✓ Test 2.5 PASS: Rechaza saleId inexistente');
        validationPassed++;
      } else {
        Logger.log('✗ Test 2.5 FAIL: Mensaje incorrecto - ' + e.message);
      }
    }
    
    if (validationPassed === validationTests) {
      Logger.log('✓ TEST 2 PASS: Todas las validaciones funcionan correctamente (' + validationPassed + '/' + validationTests + ')');
      passed++;
    } else {
      Logger.log('✗ TEST 2 FAIL: Algunas validaciones fallaron (' + validationPassed + '/' + validationTests + ')');
      failed++;
    }
    
    Logger.log('');
    
    // ========================================================================
    // TEST 3: Verificar persistencia en base de datos
    // ========================================================================
    
    Logger.log('=== TEST 3: Verificar persistencia en base de datos ===');
    
    try {
      // Buscar el plan creado en el TEST 1
      const creditPlanRepo = new CreditPlanRepository();
      const savedPlans = creditPlanRepo.findBySale(testSaleId);
      
      if (!savedPlans) {
        Logger.log('✗ TEST 3 FAIL: Plan no encontrado en la base de datos');
        failed++;
      } else {
        Logger.log('✓ Plan encontrado en la base de datos: ' + savedPlans.id);
        
        // Verificar cuotas
        const installmentRepo = new InstallmentRepository();
        const savedInstallments = installmentRepo.findByPlan(savedPlans.id);
        
        if (savedInstallments.length === 3) {
          Logger.log('✓ Cuotas encontradas en la base de datos: ' + savedInstallments.length);
          Logger.log('✓ TEST 3 PASS: Persistencia verificada correctamente');
          passed++;
        } else {
          Logger.log('✗ TEST 3 FAIL: Número de cuotas incorrecto: ' + savedInstallments.length);
          failed++;
        }
      }
    } catch (e) {
      Logger.log('✗ TEST 3 FAIL: ' + e.message);
      failed++;
    }
    
    Logger.log('');
    
    // ========================================================================
    // TEST 4: Verificar actualización de cliente en base de datos
    // ========================================================================
    
    Logger.log('=== TEST 4: Verificar actualización de cliente en base de datos ===');
    
    try {
      const clientRepo = new ClientRepository();
      const updatedClient = clientRepo.findById(testClientId);
      
      if (!updatedClient) {
        Logger.log('✗ TEST 4 FAIL: Cliente no encontrado');
        failed++;
      } else {
        const creditUsed = Number(updatedClient.credit_used);
        const creditLimit = Number(updatedClient.credit_limit);
        const creditAvailable = creditLimit - creditUsed;
        
        Logger.log('Cliente: ' + updatedClient.name);
        Logger.log('  - Límite de crédito: ' + creditLimit);
        Logger.log('  - Crédito usado: ' + creditUsed);
        Logger.log('  - Crédito disponible: ' + creditAvailable);
        
        if (creditUsed === 1000) {
          Logger.log('✓ TEST 4 PASS: Cupo del cliente actualizado correctamente');
          passed++;
        } else {
          Logger.log('✗ TEST 4 FAIL: Cupo del cliente incorrecto: ' + creditUsed);
          failed++;
        }
      }
    } catch (e) {
      Logger.log('✗ TEST 4 FAIL: ' + e.message);
      failed++;
    }
    
    Logger.log('');
    
    // ========================================================================
    // LIMPIEZA: Eliminar datos de prueba
    // ========================================================================
    
    Logger.log('=== LIMPIEZA: Eliminando datos de prueba ===');
    
    try {
      // Eliminar cuotas
      const installmentRepo = new InstallmentRepository();
      const creditPlanRepo = new CreditPlanRepository();
      const savedPlans = creditPlanRepo.findBySale(testSaleId);
      
      if (savedPlans) {
        const installments = installmentRepo.findByPlan(savedPlans.id);
        for (var i = 0; i < installments.length; i++) {
          installmentRepo.delete(installments[i].id);
        }
        Logger.log('✓ Cuotas eliminadas: ' + installments.length);
        
        // Eliminar plan
        creditPlanRepo.delete(savedPlans.id);
        Logger.log('✓ Plan eliminado');
      }
      
      // Eliminar venta
      saleRepo.delete(testSaleId);
      Logger.log('✓ Venta eliminada');
      
      // Eliminar cliente
      clientRepo.delete(testClientId);
      Logger.log('✓ Cliente eliminado');
      
    } catch (e) {
      Logger.log('⚠ Error en limpieza (no crítico): ' + e.message);
    }
    
    Logger.log('');
    
  } catch (e) {
    Logger.log('✗ ERROR GENERAL: ' + e.message);
    Logger.log('Stack: ' + e.stack);
    failed++;
  }
  
  // ========================================================================
  // RESUMEN
  // ========================================================================
  
  Logger.log('========================================');
  Logger.log('RESUMEN DE TESTS');
  Logger.log('========================================');
  Logger.log('Tests ejecutados: ' + (passed + failed));
  Logger.log('Tests exitosos: ' + passed);
  Logger.log('Tests fallidos: ' + failed);
  Logger.log('');
  
  if (failed === 0) {
    Logger.log('✓✓✓ TODOS LOS TESTS PASARON ✓✓✓');
    return true;
  } else {
    Logger.log('✗✗✗ ALGUNOS TESTS FALLARON ✗✗✗');
    return false;
  }
}

/**
 * Test rápido para verificar que CreditService se carga correctamente
 */
function quickTestCreditService() {
  try {
    const creditService = new CreditService();
    Logger.log('✓ CreditService cargado correctamente');
    return true;
  } catch (e) {
    Logger.log('✗ Error al cargar CreditService: ' + e.message);
    return false;
  }
}
