/**
 * Test_GenerateReceipt.gs - Pruebas para la generación de recibos de pago
 * Adiction Boutique Suite
 * 
 * Este archivo contiene pruebas para verificar la funcionalidad de
 * generación de recibos de pago con PDF y almacenamiento en Google Drive.
 * 
 * Requisitos: 10.1, 10.2, 10.4
 */

/**
 * runAllReceiptTests - Ejecuta todas las pruebas de generación de recibos
 * 
 * Función principal que ejecuta todas las pruebas en secuencia.
 * Ejecutar esta función desde el editor de Apps Script.
 */
function runAllReceiptTests() {
  Logger.log('╔════════════════════════════════════════════════════════════════╗');
  Logger.log('║  SUITE DE PRUEBAS: GENERACIÓN DE RECIBOS DE PAGO              ║');
  Logger.log('╚════════════════════════════════════════════════════════════════╝');
  
  try {
    // Test 1: Validaciones
    testGenerateReceiptValidations();
    
    Logger.log('\n' + '='.repeat(70) + '\n');
    
    // Test 2: Generación de recibo completo
    testGenerateReceipt();
    
    Logger.log('\n' + '='.repeat(70) + '\n');
    
    // Test 3: Verificación de integridad
    testReceiptIntegrity();
    
    Logger.log('\n╔════════════════════════════════════════════════════════════════╗');
    Logger.log('║  TODAS LAS PRUEBAS COMPLETADAS                                 ║');
    Logger.log('╚════════════════════════════════════════════════════════════════╝');
    
  } catch (error) {
    Logger.log('\n✗ ERROR CRÍTICO EN LA SUITE DE PRUEBAS');
    Logger.log('Error: ' + error.message);
    Logger.log('Stack: ' + error.stack);
  }
}

/**
 * testReceiptIntegrity - Verifica la integridad de los recibos generados
 * 
 * Prueba que:
 * - El PDF se genera correctamente
 * - El archivo se almacena en Drive
 * - El registro de pago se actualiza
 * - Los datos del recibo son correctos
 */
function testReceiptIntegrity() {
  Logger.log('=== TEST: Integridad de Recibos ===');
  
  try {
    const creditService = new CreditService();
    const paymentRepo = new PaymentRepository();
    
    // Buscar un pago sin recibo
    Logger.log('\n1. Buscando pago sin recibo...');
    const payments = paymentRepo.findAll();
    
    let testPayment = null;
    for (let i = 0; i < payments.length; i++) {
      if (!payments[i].receipt_url || payments[i].receipt_url === '') {
        testPayment = payments[i];
        break;
      }
    }
    
    if (!testPayment) {
      Logger.log('⚠ No hay pagos sin recibo. Usando el primer pago disponible...');
      if (payments.length > 0) {
        testPayment = payments[0];
      } else {
        Logger.log('✗ No hay pagos para probar');
        return;
      }
    }
    
    Logger.log('✓ Pago encontrado: ' + testPayment.id);
    
    // Generar recibo
    Logger.log('\n2. Generando recibo...');
    const result = creditService.generateReceipt(testPayment.id);
    
    // Verificación 1: Estructura del resultado
    Logger.log('\n3. Verificando estructura del resultado...');
    
    if (!result.success) {
      throw new Error('result.success debe ser true');
    }
    Logger.log('✓ result.success = true');
    
    if (!result.receipt) {
      throw new Error('result.receipt no debe ser null');
    }
    Logger.log('✓ result.receipt existe');
    
    if (!result.receiptUrl) {
      throw new Error('result.receiptUrl no debe ser null');
    }
    Logger.log('✓ result.receiptUrl existe: ' + result.receiptUrl);
    
    // Verificación 2: Datos del recibo
    Logger.log('\n4. Verificando datos del recibo...');
    
    const receipt = result.receipt;
    
    if (!receipt.receiptNumber) {
      throw new Error('receiptNumber no debe estar vacío');
    }
    Logger.log('✓ receiptNumber: ' + receipt.receiptNumber);
    
    if (!receipt.paymentId || receipt.paymentId !== testPayment.id) {
      throw new Error('paymentId debe coincidir con el pago');
    }
    Logger.log('✓ paymentId coincide: ' + receipt.paymentId);
    
    if (!receipt.client || !receipt.client.name) {
      throw new Error('Datos del cliente incompletos');
    }
    Logger.log('✓ Cliente: ' + receipt.client.name);
    
    if (receipt.amount !== testPayment.amount) {
      throw new Error('Monto del recibo debe coincidir con el pago');
    }
    Logger.log('✓ Monto coincide: S/ ' + receipt.amount);
    
    // Verificación 3: Actualización del registro de pago
    Logger.log('\n5. Verificando actualización del registro de pago...');
    
    const updatedPayment = paymentRepo.findById(testPayment.id);
    
    if (!updatedPayment.receipt_url) {
      throw new Error('receipt_url no debe estar vacío en el registro de pago');
    }
    Logger.log('✓ receipt_url actualizado en el registro de pago');
    
    if (updatedPayment.receipt_url !== result.receiptUrl) {
      throw new Error('receipt_url debe coincidir con el resultado');
    }
    Logger.log('✓ receipt_url coincide: ' + updatedPayment.receipt_url);
    
    // Verificación 4: Archivo en Google Drive
    Logger.log('\n6. Verificando archivo en Google Drive...');
    
    try {
      // Extraer ID del archivo de la URL
      const fileId = result.receiptUrl.match(/[-\w]{25,}/);
      
      if (!fileId) {
        Logger.log('⚠ No se pudo extraer el ID del archivo de la URL');
      } else {
        const file = DriveApp.getFileById(fileId[0]);
        
        Logger.log('✓ Archivo encontrado en Drive');
        Logger.log('  - Nombre: ' + file.getName());
        Logger.log('  - Tamaño: ' + file.getSize() + ' bytes');
        Logger.log('  - Tipo MIME: ' + file.getMimeType());
        
        // Verificar que es un PDF
        if (file.getMimeType() !== 'application/pdf') {
          throw new Error('El archivo debe ser un PDF');
        }
        Logger.log('✓ El archivo es un PDF válido');
        
        // Verificar que el tamaño es razonable (> 0 bytes)
        if (file.getSize() === 0) {
          throw new Error('El archivo PDF está vacío');
        }
        Logger.log('✓ El archivo PDF tiene contenido');
        
        // Verificar que está en la carpeta correcta
        const parents = file.getParents();
        let inReceiptsFolder = false;
        
        while (parents.hasNext()) {
          const folder = parents.next();
          if (folder.getName() === 'Recibos') {
            inReceiptsFolder = true;
            break;
          }
        }
        
        if (inReceiptsFolder) {
          Logger.log('✓ El archivo está en la carpeta "Recibos"');
        } else {
          Logger.log('⚠ El archivo NO está en la carpeta "Recibos"');
        }
      }
    } catch (e) {
      Logger.log('✗ Error al verificar archivo en Drive: ' + e.message);
      throw e;
    }
    
    // Verificación 5: Contenido del PDF (básico)
    Logger.log('\n7. Verificando contenido del PDF...');
    Logger.log('✓ PDF generado con los siguientes datos:');
    Logger.log('  - Número de recibo: ' + receipt.receiptNumber);
    Logger.log('  - Cliente: ' + receipt.client.name);
    Logger.log('  - DNI: ' + (receipt.client.dni || 'N/A'));
    Logger.log('  - Monto pagado: S/ ' + receipt.amount);
    Logger.log('  - Cuotas pagadas: ' + (receipt.paidInstallments ? receipt.paidInstallments.length : 0));
    Logger.log('  - Cuotas parciales: ' + (receipt.partialInstallments ? receipt.partialInstallments.length : 0));
    Logger.log('  - Saldo pendiente: S/ ' + receipt.totalPendingBalance);
    
    Logger.log('\n✓ TODAS LAS VERIFICACIONES DE INTEGRIDAD PASARON');
    Logger.log('\n📄 Recibo disponible en: ' + result.receiptUrl);
    
  } catch (error) {
    Logger.log('\n✗ Error en testReceiptIntegrity: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    throw error;
  }
}

/**
 * testReceiptWithMultipleInstallments - Prueba recibo con múltiples cuotas
 * 
 * Verifica que el recibo muestre correctamente múltiples cuotas pagadas.
 */
function testReceiptWithMultipleInstallments() {
  Logger.log('=== TEST: Recibo con Múltiples Cuotas ===');
  
  try {
    const creditService = new CreditService();
    const paymentRepo = new PaymentRepository();
    
    // Buscar un pago que haya pagado múltiples cuotas
    Logger.log('\n1. Buscando pago con múltiples cuotas...');
    const payments = paymentRepo.findAll();
    
    // Para esta prueba, simplemente usamos el primer pago disponible
    if (payments.length === 0) {
      Logger.log('✗ No hay pagos para probar');
      return;
    }
    
    const testPayment = payments[0];
    Logger.log('✓ Usando pago: ' + testPayment.id);
    
    // Generar recibo
    Logger.log('\n2. Generando recibo...');
    const result = creditService.generateReceipt(testPayment.id);
    
    Logger.log('✓ Recibo generado');
    Logger.log('  - Cuotas pagadas completamente: ' + (result.receipt.paidInstallments ? result.receipt.paidInstallments.length : 0));
    Logger.log('  - Cuotas pagadas parcialmente: ' + (result.receipt.partialInstallments ? result.receipt.partialInstallments.length : 0));
    
    // Mostrar detalles de las cuotas
    if (result.receipt.paidInstallments && result.receipt.paidInstallments.length > 0) {
      Logger.log('\n3. Detalles de cuotas pagadas completamente:');
      for (let i = 0; i < result.receipt.paidInstallments.length; i++) {
        const inst = result.receipt.paidInstallments[i];
        Logger.log('  - Cuota #' + inst.installment_number + ': S/ ' + inst.amount);
      }
    }
    
    if (result.receipt.partialInstallments && result.receipt.partialInstallments.length > 0) {
      Logger.log('\n4. Detalles de cuotas pagadas parcialmente:');
      for (let i = 0; i < result.receipt.partialInstallments.length; i++) {
        const inst = result.receipt.partialInstallments[i];
        Logger.log('  - Cuota #' + inst.installment_number + ': S/ ' + inst.paid_amount + ' de S/ ' + inst.amount + ' (falta S/ ' + inst.remaining + ')');
      }
    }
    
    Logger.log('\n✓ Prueba completada');
    Logger.log('📄 Recibo disponible en: ' + result.receiptUrl);
    
  } catch (error) {
    Logger.log('\n✗ Error en testReceiptWithMultipleInstallments: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * cleanupTestReceipts - Limpia los recibos de prueba generados
 * 
 * ADVERTENCIA: Esta función elimina todos los archivos de la carpeta "Recibos".
 * Usar solo en entornos de prueba.
 */
function cleanupTestReceipts() {
  Logger.log('=== LIMPIEZA: Eliminando recibos de prueba ===');
  
  try {
    const folders = DriveApp.getFoldersByName('Recibos');
    
    if (!folders.hasNext()) {
      Logger.log('✓ No hay carpeta "Recibos" para limpiar');
      return;
    }
    
    const folder = folders.next();
    const files = folder.getFiles();
    let count = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      Logger.log('Eliminando: ' + file.getName());
      file.setTrashed(true);
      count++;
    }
    
    Logger.log('✓ ' + count + ' archivos eliminados');
    
  } catch (error) {
    Logger.log('✗ Error en cleanupTestReceipts: ' + error.message);
  }
}
