/**
 * CreditService.gs - Servicio de Gestión de Crédito
 * Adiction Boutique Suite
 * 
 * Este archivo contiene el servicio de crédito que gestiona:
 * - Creación de planes de crédito
 * - Generación de cuotas
 * - Cálculo de montos y fechas de vencimiento
 * - Gestión de cupo de crédito de clientes
 * 
 * Requisitos: 7.3, 7.4, 7.5
 */

// ============================================================================
// CREDITSERVICE - Gestión de Crédito
// ============================================================================

/**
 * CreditService - Servicio de gestión de crédito y cobranzas
 * 
 * Gestiona la creación de planes de crédito, cuotas, pagos y cobranzas.
 * 
 * Características:
 * - Creación de planes de crédito con cuotas
 * - Cálculo automático de montos de cuotas
 * - Cálculo de fechas de vencimiento
 * - Gestión de cupo de crédito de clientes
 * - Validaciones de cupo disponible
 * 
 * Requisitos: 7.3, 7.4, 7.5
 * 
 * @class
 */
class CreditService {
  
  /**
   * Constructor
   * Inicializa los repositorios necesarios
   */
  constructor() {
    this.creditPlanRepo = new CreditPlanRepository();
    this.installmentRepo = new InstallmentRepository();
    this.clientRepo = new ClientRepository();
    this.saleRepo = new SaleRepository();
    this.auditRepo = new AuditRepository();
  }
  
  // ==========================================================================
  // MÉTODOS PÚBLICOS
  // ==========================================================================
  
  /**
   * createCreditPlan - Crea un plan de crédito con sus cuotas
   * 
   * Crea un plan de crédito asociado a una venta, genera las cuotas
   * correspondientes con montos y fechas de vencimiento calculadas,
   * y decrementa el cupo disponible del cliente.
   * 
   * MEJORADO: Usa LockManager para atomicidad e IdempotencyManager
   * 
   * Requisitos: 7.3, 7.4, 7.5
   * 
   * @param {string} saleId - ID de la venta a la que se asocia el plan
   * @param {number} installments - Número de cuotas (1-6)
   * @param {string} requestId - ID único para idempotencia (opcional)
   * @returns {Object} Plan de crédito creado con sus cuotas
   * @throws {Error} Si hay error en validaciones o al crear el plan
   */
  createCreditPlan(saleId, installments, requestId) {
    let lock = null;
    
    try {
      // ========================================================================
      // VALIDACIONES
      // ========================================================================
      
      // Validar parámetros requeridos
      Validator.isRequired(saleId, 'saleId');
      Validator.isRequired(installments, 'installments');
      
      // Validar que installments sea un número válido
      Validator.isNumber(installments, 'installments');
      Validator.isPositive(installments, 'installments');
      
      // Validar que installments esté en el rango permitido (1-6)
      Validator.isInRange(installments, LIMITS.MIN_INSTALLMENTS, LIMITS.MAX_INSTALLMENTS, 'installments');
      
      // Convertir a número entero
      const numInstallments = Math.floor(Number(installments));
      
      // Generar requestId si no se proporciona
      const effectiveRequestId = requestId || ('credit_plan_' + saleId + '_' + new Date().getTime());
      
      Logger.log('createCreditPlan: iniciando para saleId=' + saleId + ', installments=' + numInstallments + ', requestId=' + effectiveRequestId);
      
      // ========================================================================
      // IDEMPOTENCIA
      // ========================================================================
      
      const idempotencyResult = IdempotencyManager.checkAndStore(effectiveRequestId, function() {
        
        // ======================================================================
        // ADQUIRIR LOCK
        // ======================================================================
        
        lock = LockManager.acquireLock('create_credit_plan_' + saleId);
        Logger.log('createCreditPlan: lock adquirido');
        
        // ======================================================================
        // OBTENER DATOS DE LA VENTA
        // ======================================================================
        
        // Buscar la venta
        const sale = this.saleRepo.findById(saleId);
        
        if (!sale) {
          throw new Error('Venta no encontrada con ID: ' + saleId);
        }
        
        // Verificar que la venta sea de tipo CREDITO
        if (sale.sale_type !== SALE_TYPES.CREDITO) {
          throw new Error('La venta debe ser de tipo CREDITO para crear un plan de crédito');
        }
        
        // Verificar que la venta tenga un cliente asociado
        if (!sale.client_id) {
          throw new Error('La venta debe tener un cliente asociado para crear un plan de crédito');
        }
        
        // Obtener el monto total de la venta
        const totalAmount = Number(sale.total) || 0;
        
        if (totalAmount <= 0) {
          throw new Error('El monto total de la venta debe ser mayor a cero');
        }
        
        Logger.log('createCreditPlan: venta encontrada, total=' + totalAmount + ', clientId=' + sale.client_id);
        
        // ======================================================================
        // OBTENER DATOS DEL CLIENTE
        // ======================================================================
        
        // Buscar el cliente
        const client = this.clientRepo.findById(sale.client_id);
        
        if (!client) {
          throw new Error('Cliente no encontrado con ID: ' + sale.client_id);
        }
        
        // Verificar que el cliente esté activo
        if (!client.active) {
          throw new Error('El cliente no está activo');
        }
        
        Logger.log('createCreditPlan: cliente encontrado, name=' + client.name);
        
        // ======================================================================
        // CALCULAR MONTO DE CADA CUOTA
        // ======================================================================
        
        // Calcular monto de cada cuota (total / installments)
        // Usar redondeo a 2 decimales para evitar problemas de precisión
        const installmentAmount = Math.round((totalAmount / numInstallments) * 100) / 100;
        
        Logger.log('createCreditPlan: monto por cuota=' + installmentAmount);
        
        // ======================================================================
        // CREAR PLAN DE CRÉDITO
        // ======================================================================
        
        // Generar ID único para el plan
        const planId = 'plan-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Crear objeto del plan de crédito
        const creditPlan = {
          id: planId,
          sale_id: saleId,
          client_id: sale.client_id,
          total_amount: totalAmount,
          installments_count: numInstallments,
          installment_amount: installmentAmount,
          status: CREDIT_PLAN_STATUS.ACTIVE,
          created_at: new Date()
        };
        
        // Guardar el plan en la base de datos
        const createdPlan = this.creditPlanRepo.create(creditPlan);
        
        Logger.log('createCreditPlan: plan creado con ID=' + planId);
        
        // ======================================================================
        // CREAR CUOTAS
        // ======================================================================
        
        const createdInstallments = [];
        let totalInstallmentsAmount = 0;
        
        // Calcular fechas de vencimiento
        // Primera cuota vence en 30 días, las siguientes cada 30 días adicionales
        const today = new Date();
        
        for (let i = 1; i <= numInstallments; i++) {
          // Calcular fecha de vencimiento (30 días * número de cuota)
          const dueDate = new Date(today);
          dueDate.setDate(dueDate.getDate() + (30 * i));
          
          // Para la última cuota, ajustar el monto para que la suma sea exacta
          let cuotaAmount = installmentAmount;
          
          if (i === numInstallments) {
            // Última cuota: ajustar para que la suma total sea exacta
            cuotaAmount = totalAmount - totalInstallmentsAmount;
            // Redondear a 2 decimales
            cuotaAmount = Math.round(cuotaAmount * 100) / 100;
          }
          
          totalInstallmentsAmount += cuotaAmount;
          
          // Generar ID único para la cuota
          const installmentId = 'inst-' + new Date().getTime() + '-' + i + '-' + Math.random().toString(36).substr(2, 9);
          
          // Crear objeto de la cuota
          const installment = {
            id: installmentId,
            plan_id: planId,
            installment_number: i,
            amount: cuotaAmount,
            due_date: dueDate,
            paid_amount: 0,
            status: INSTALLMENT_STATUS.PENDING,
            paid_at: null
          };
          
          // Guardar la cuota en la base de datos
          const createdInstallment = this.installmentRepo.create(installment);
          createdInstallments.push(createdInstallment);
          
          Logger.log('createCreditPlan: cuota ' + i + ' creada, monto=' + cuotaAmount + ', vence=' + formatDate(dueDate));
        }
        
        Logger.log('createCreditPlan: ' + numInstallments + ' cuotas creadas, suma total=' + totalInstallmentsAmount);
        
        // ======================================================================
        // DECREMENTAR CUPO DISPONIBLE DEL CLIENTE
        // ======================================================================
        
        // Obtener cupo actual usado
        const currentCreditUsed = Number(client.credit_used) || 0;
        
        // Calcular nuevo cupo usado
        const newCreditUsed = currentCreditUsed + totalAmount;
        
        // Actualizar cliente con nuevo cupo usado
        client.credit_used = newCreditUsed;
        
        this.clientRepo.update(client.id, client);
        
        Logger.log('createCreditPlan: cupo del cliente actualizado, usado anterior=' + currentCreditUsed + ', nuevo usado=' + newCreditUsed);
        
        // ======================================================================
        // AUDITORÍA
        // ======================================================================
        
        // Registrar la creación del plan de crédito en auditoría
        this.auditRepo.log(
          'CREATE_CREDIT_PLAN',
          'CREDIT_PLAN',
          planId,
          null,
          {
            sale_id: saleId,
            client_id: sale.client_id,
            total_amount: totalAmount,
            installments_count: numInstallments,
            installment_amount: installmentAmount,
            client_credit_used_before: currentCreditUsed,
            client_credit_used_after: newCreditUsed
          },
          sale.user_id || 'system'
        );
        
        Logger.log('createCreditPlan: auditoría registrada');
        
        // Liberar lock
        if (lock) {
          LockManager.releaseLock(lock);
          lock = null;
        }
        
        // ======================================================================
        // RETORNAR RESULTADO
        // ======================================================================
        
        // Retornar el plan creado con sus cuotas
        return {
          plan: createdPlan,
          installments: createdInstallments,
          client: {
            id: client.id,
            name: client.name,
            credit_limit: client.credit_limit,
            credit_used: newCreditUsed,
            credit_available: (Number(client.credit_limit) || 0) - newCreditUsed
          }
        };
        
      }.bind(this)); // Fin de IdempotencyManager.checkAndStore
      
      // Si ya fue procesado, retornar resultado anterior
      if (idempotencyResult.processed) {
        Logger.log('createCreditPlan: requestId ya procesado, retornando resultado anterior');
        return idempotencyResult.result;
      }
      
      return idempotencyResult.result;
      
    } catch (error) {
      // Asegurar que el lock se libere en caso de error
      if (lock) {
        LockManager.releaseLock(lock);
      }
      
      Logger.log('Error en createCreditPlan: ' + error.message);
      throw new Error('Error al crear plan de crédito: ' + error.message);
    }
  }
  
  /**
   * recordPayment - Registra un pago y lo aplica a cuotas pendientes
   * 
   * Registra un pago de un cliente y aplica el monto a las cuotas pendientes
   * en orden de antigüedad (oldest_due_first): primero las vencidas más antiguas,
   * luego las por vencer en orden de fecha de vencimiento.
   * 
   * Utiliza locks para garantizar atomicidad e idempotencia para prevenir
   * duplicados.
   * 
   * Requisitos: 9.2, 9.3, 9.4, 9.5
   * 
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.clientId - ID del cliente que realiza el pago
   * @param {number} paymentData.amount - Monto del pago
   * @param {Date} paymentData.paymentDate - Fecha del pago (opcional, default: hoy)
   * @param {string} paymentData.userId - ID del usuario que registra el pago
   * @param {string} paymentData.notes - Notas adicionales (opcional)
   * @param {string} requestId - ID único para idempotencia
   * @returns {Object} Resultado del pago con recibo generado
   * @throws {Error} Si hay error en validaciones o al registrar el pago
   */
  recordPayment(paymentData, requestId) {
    let lock = null;
    
    try {
      // ========================================================================
      // VALIDACIONES
      // ========================================================================
      
      // Validar parámetros requeridos
      Validator.isRequired(paymentData, 'paymentData');
      Validator.isRequired(paymentData.clientId, 'clientId');
      Validator.isRequired(paymentData.amount, 'amount');
      Validator.isRequired(paymentData.userId, 'userId');
      Validator.isRequired(requestId, 'requestId');
      
      // Validar que amount sea un número positivo
      Validator.isNumber(paymentData.amount, 'amount');
      Validator.isPositive(paymentData.amount, 'amount');
      
      const paymentAmount = Number(paymentData.amount);
      const clientId = paymentData.clientId;
      const userId = paymentData.userId;
      const paymentDate = paymentData.paymentDate || new Date();
      const notes = paymentData.notes || '';
      
      Logger.log('recordPayment: iniciando para clientId=' + clientId + ', amount=' + paymentAmount + ', requestId=' + requestId);
      
      // ========================================================================
      // IDEMPOTENCIA
      // ========================================================================
      
      // Verificar si el requestId ya fue procesado
      const idempotencyResult = IdempotencyManager.checkAndStore(requestId, () => {
        
        // ======================================================================
        // ADQUIRIR LOCK
        // ======================================================================
        
        Logger.log('recordPayment: adquiriendo lock para clientId=' + clientId);
        lock = LockManager.acquireLock('payment_' + clientId);
        Logger.log('recordPayment: lock adquirido');
        
        // ======================================================================
        // VERIFICAR CLIENTE
        // ======================================================================
        
        const client = this.clientRepo.findById(clientId);
        
        if (!client) {
          throw new Error('Cliente no encontrado con ID: ' + clientId);
        }
        
        if (!client.active) {
          throw new Error('El cliente no está activo');
        }
        
        Logger.log('recordPayment: cliente encontrado, name=' + client.name);
        
        // ======================================================================
        // OBTENER CUOTAS PENDIENTES ORDENADAS (oldest_due_first)
        // ======================================================================
        
        // Obtener cuotas vencidas (ordenadas por fecha de vencimiento, más antiguas primero)
        const overdueInstallments = this.installmentRepo.findOverdue(clientId);
        
        // Obtener todas las cuotas del cliente para encontrar las pendientes no vencidas
        const clientPlans = this.creditPlanRepo.findByClient(clientId);
        const allInstallments = [];
        
        for (let i = 0; i < clientPlans.length; i++) {
          const planInstallments = this.installmentRepo.findByPlan(clientPlans[i].id);
          allInstallments.push.apply(allInstallments, planInstallments);
        }
        
        // Filtrar cuotas pendientes no vencidas (PENDING o PARTIAL, no vencidas)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingInstallments = [];
        for (let i = 0; i < allInstallments.length; i++) {
          const inst = allInstallments[i];
          
          // Solo cuotas pendientes o parciales
          if (inst.status !== INSTALLMENT_STATUS.PENDING && inst.status !== INSTALLMENT_STATUS.PARTIAL) {
            continue;
          }
          
          // Solo cuotas no vencidas (fecha de vencimiento >= hoy)
          if (!inst.due_date) {
            continue;
          }
          
          const dueDate = new Date(inst.due_date);
          dueDate.setHours(0, 0, 0, 0);
          
          if (dueDate >= today) {
            upcomingInstallments.push(inst);
          }
        }
        
        // Ordenar cuotas por vencer por fecha de vencimiento (más próximas primero)
        upcomingInstallments.sort(function(a, b) {
          const dateA = new Date(a.due_date);
          const dateB = new Date(b.due_date);
          return dateA - dateB;
        });
        
        // Combinar: primero vencidas, luego por vencer (oldest_due_first)
        const pendingInstallments = overdueInstallments.concat(upcomingInstallments);
        
        Logger.log('recordPayment: cuotas vencidas=' + overdueInstallments.length + ', por vencer=' + upcomingInstallments.length + ', total=' + pendingInstallments.length);
        
        if (pendingInstallments.length === 0) {
          throw new Error('El cliente no tiene cuotas pendientes de pago');
        }
        
        // ======================================================================
        // APLICAR MONTO DEL PAGO A CUOTAS EN ORDEN
        // ======================================================================
        
        let remainingAmount = paymentAmount;
        const paidInstallments = [];
        const partialInstallments = [];
        
        for (let i = 0; i < pendingInstallments.length && remainingAmount > 0; i++) {
          const installment = pendingInstallments[i];
          
          // Calcular cuánto falta por pagar de esta cuota
          const installmentAmount = Number(installment.amount) || 0;
          const paidAmount = Number(installment.paid_amount) || 0;
          const pendingAmount = installmentAmount - paidAmount;
          
          if (pendingAmount <= 0) {
            // Esta cuota ya está pagada, saltar
            continue;
          }
          
          // Calcular cuánto aplicar a esta cuota
          const amountToApply = Math.min(remainingAmount, pendingAmount);
          
          // Actualizar cuota
          const newPaidAmount = paidAmount + amountToApply;
          installment.paid_amount = newPaidAmount;
          
          // Actualizar estado de la cuota
          if (newPaidAmount >= installmentAmount) {
            // Cuota completamente pagada
            installment.status = INSTALLMENT_STATUS.PAID;
            installment.paid_at = paymentDate;
            paidInstallments.push({
              id: installment.id,
              installment_number: installment.installment_number,
              amount: installmentAmount,
              paid_amount: amountToApply
            });
            Logger.log('recordPayment: cuota ' + installment.id + ' PAGADA completamente, aplicado=' + amountToApply);
          } else {
            // Cuota parcialmente pagada
            installment.status = INSTALLMENT_STATUS.PARTIAL;
            partialInstallments.push({
              id: installment.id,
              installment_number: installment.installment_number,
              amount: installmentAmount,
              paid_amount: amountToApply,
              remaining: installmentAmount - newPaidAmount
            });
            Logger.log('recordPayment: cuota ' + installment.id + ' PARCIAL, aplicado=' + amountToApply + ', falta=' + (installmentAmount - newPaidAmount));
          }
          
          // Guardar cambios en la cuota
          this.installmentRepo.update(installment.id, installment);
          
          // Decrementar monto restante
          remainingAmount -= amountToApply;
        }
        
        Logger.log('recordPayment: pago aplicado, cuotas pagadas=' + paidInstallments.length + ', cuotas parciales=' + partialInstallments.length + ', sobrante=' + remainingAmount);
        
        // ======================================================================
        // CREAR REGISTRO DE PAGO
        // ======================================================================
        
        const paymentId = 'pay-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9);
        
        const payment = {
          id: paymentId,
          client_id: clientId,
          amount: paymentAmount,
          payment_date: paymentDate,
          user_id: userId,
          receipt_url: '', // Se generará después
          notes: notes,
          created_at: new Date()
        };
        
        // Guardar el pago en la base de datos
        const paymentRepo = new PaymentRepository();
        const createdPayment = paymentRepo.create(payment);
        
        Logger.log('recordPayment: pago registrado con ID=' + paymentId);
        
        // ======================================================================
        // GENERAR RECIBO DE PAGO
        // ======================================================================
        
        const receipt = this._generateReceipt({
          payment: createdPayment,
          client: client,
          paidInstallments: paidInstallments,
          partialInstallments: partialInstallments,
          remainingAmount: remainingAmount
        });
        
        Logger.log('recordPayment: recibo generado');
        
        // ======================================================================
        // AUDITORÍA
        // ======================================================================
        
        this.auditRepo.log(
          'RECORD_PAYMENT',
          'PAYMENT',
          paymentId,
          null,
          {
            client_id: clientId,
            amount: paymentAmount,
            payment_date: paymentDate,
            paid_installments: paidInstallments.length,
            partial_installments: partialInstallments.length,
            remaining_amount: remainingAmount
          },
          userId
        );
        
        Logger.log('recordPayment: auditoría registrada');
        
        // ======================================================================
        // RETORNAR RESULTADO
        // ======================================================================
        
        return {
          success: true,
          payment: createdPayment,
          receipt: receipt,
          paidInstallments: paidInstallments,
          partialInstallments: partialInstallments,
          remainingAmount: remainingAmount,
          client: {
            id: client.id,
            name: client.name
          }
        };
        
      }); // Fin de IdempotencyManager.checkAndStore
      
      // Si ya fue procesado, retornar resultado anterior
      if (idempotencyResult.processed) {
        Logger.log('recordPayment: requestId ya procesado, retornando resultado anterior');
        return idempotencyResult.result;
      }
      
      // Retornar resultado de la operación
      return idempotencyResult.result;
      
    } catch (error) {
      Logger.log('Error en recordPayment: ' + error.message);
      throw new Error('Error al registrar pago: ' + error.message);
    } finally {
      // Liberar lock si fue adquirido
      if (lock) {
        LockManager.releaseLock(lock);
        Logger.log('recordPayment: lock liberado');
      }
    }
  }
  
  /**
   * rescheduleInstallment - Reprograma la fecha de vencimiento de una cuota
   * 
   * Permite modificar la fecha de vencimiento de una cuota pendiente.
   * Requiere permisos de supervisor y un motivo obligatorio.
   * Registra la reprogramación en auditoría.
   * 
   * MEJORADO: Usa LockManager para atomicidad
   * 
   * Requisitos: 24.1, 24.2, 24.3, 24.4, 24.5
   * 
   * @param {string} installmentId - ID de la cuota a reprogramar
   * @param {Date} newDate - Nueva fecha de vencimiento
   * @param {string} reason - Motivo de la reprogramación (obligatorio)
   * @param {string} userId - ID del usuario que realiza la reprogramación
   * @returns {Object} Cuota reprogramada
   * @throws {Error} Si hay error en validaciones o al reprogramar
   */
  rescheduleInstallment(installmentId, newDate, reason, userId) {
    let lock = null;
    
    try {
      // ========================================================================
      // VALIDACIONES
      // ========================================================================
      
      // Validar parámetros requeridos
      Validator.isRequired(installmentId, 'installmentId');
      Validator.isRequired(newDate, 'newDate');
      Validator.isRequired(reason, 'reason');
      Validator.isRequired(userId, 'userId');
      
      // Validar que reason no esté vacío
      if (typeof reason !== 'string' || reason.trim() === '') {
        throw new Error('El motivo de reprogramación es obligatorio y no puede estar vacío');
      }
      
      // Validar que newDate sea una fecha válida
      const newDueDate = new Date(newDate);
      if (isNaN(newDueDate.getTime())) {
        throw new Error('La nueva fecha de vencimiento no es válida');
      }
      
      // Validar que la nueva fecha sea futura
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      newDueDate.setHours(0, 0, 0, 0);
      
      if (newDueDate < today) {
        throw new Error('La nueva fecha de vencimiento debe ser igual o posterior a hoy');
      }
      
      Logger.log('rescheduleInstallment: iniciando para installmentId=' + installmentId + ', newDate=' + formatDate(newDueDate) + ', userId=' + userId);
      
      // ========================================================================
      // VERIFICAR PERMISOS DE SUPERVISOR
      // ========================================================================
      
      const authService = new AuthService();
      
      // Verificar que el usuario tiene permiso de supervisor
      const hasSupervisorPermission = authService.hasPermission(userId, 'reschedule_installment');
      
      if (!hasSupervisorPermission) {
        throw new Error('No tiene permisos de supervisor para reprogramar cuotas');
      }
      
      Logger.log('rescheduleInstallment: permisos de supervisor verificados');
      
      // ========================================================================
      // ADQUIRIR LOCK
      // ========================================================================
      
      lock = LockManager.acquireLock('reschedule_installment_' + installmentId);
      Logger.log('rescheduleInstallment: lock adquirido');
      
      // ========================================================================
      // OBTENER CUOTA
      // ========================================================================
      
      const installment = this.installmentRepo.findById(installmentId);
      
      if (!installment) {
        throw new Error('Cuota no encontrada con ID: ' + installmentId);
      }
      
      // Verificar que la cuota no esté completamente pagada
      if (installment.status === INSTALLMENT_STATUS.PAID) {
        throw new Error('No se puede reprogramar una cuota que ya está completamente pagada');
      }
      
      Logger.log('rescheduleInstallment: cuota encontrada, plan=' + installment.plan_id + ', número=' + installment.installment_number + ', estado=' + installment.status);
      
      // ========================================================================
      // GUARDAR VALORES ANTERIORES PARA AUDITORÍA
      // ========================================================================
      
      const oldValues = {
        due_date: installment.due_date,
        status: installment.status
      };
      
      const oldDueDate = new Date(installment.due_date);
      Logger.log('rescheduleInstallment: fecha anterior=' + formatDate(oldDueDate));
      
      // ========================================================================
      // ACTUALIZAR CUOTA
      // ========================================================================
      
      // Actualizar fecha de vencimiento
      installment.due_date = newDueDate;
      
      // Actualizar estado si la cuota estaba vencida y ahora no lo está
      if (installment.status === INSTALLMENT_STATUS.PENDING) {
        // Verificar si la cuota estaba vencida
        const wasOverdue = oldDueDate < today;
        const isNowOverdue = newDueDate < today;
        
        if (wasOverdue && !isNowOverdue) {
          Logger.log('rescheduleInstallment: cuota ya no está vencida después de reprogramación');
        }
      }
      
      // Guardar cambios
      const updatedInstallment = this.installmentRepo.update(installmentId, installment);
      
      Logger.log('rescheduleInstallment: cuota actualizada, nueva fecha=' + formatDate(newDueDate));
      
      // ========================================================================
      // AUDITORÍA
      // ========================================================================
      
      const newValues = {
        due_date: newDueDate,
        status: installment.status,
        reason: reason.trim()
      };
      
      this.auditRepo.log(
        'RESCHEDULE_INSTALLMENT',
        'INSTALLMENT',
        installmentId,
        oldValues,
        newValues,
        userId
      );
      
      Logger.log('rescheduleInstallment: auditoría registrada');
      
      // Liberar lock
      if (lock) {
        LockManager.releaseLock(lock);
        lock = null;
      }
      
      // ========================================================================
      // RETORNAR RESULTADO
      // ========================================================================
      
      return {
        success: true,
        installment: updatedInstallment,
        oldDueDate: oldDueDate,
        newDueDate: newDueDate,
        reason: reason.trim(),
        rescheduledBy: userId,
        rescheduledAt: new Date()
      };
      
    } catch (error) {
      // Asegurar que el lock se libere en caso de error
      if (lock) {
        LockManager.releaseLock(lock);
      }
      
      Logger.log('Error en rescheduleInstallment: ' + error.message);
      throw new Error('Error al reprogramar cuota: ' + error.message);
    }
  }
  
  /**
   * _generateReceipt - Genera un recibo de pago
   * 
   * Crea un objeto con los datos del recibo de pago que incluye:
   * - Número correlativo
   * - Fecha
   * - Cliente
   * - Monto pagado
   * - Cuotas pagadas
   * - Saldo pendiente
   * 
   * @private
   * @param {Object} data - Datos para generar el recibo
   * @returns {Object} Recibo generado
   */
  _generateReceipt(data) {
    try {
      const payment = data.payment;
      const client = data.client;
      const paidInstallments = data.paidInstallments || [];
      const partialInstallments = data.partialInstallments || [];
      const remainingAmount = data.remainingAmount || 0;
      
      // Generar número correlativo del recibo
      // En una implementación real, esto debería ser un contador secuencial
      const receiptNumber = 'REC-' + new Date().getTime();
      
      // Calcular saldo pendiente del cliente
      // Obtener todas las cuotas pendientes del cliente
      const clientPlans = this.creditPlanRepo.findByClient(client.id);
      let totalPending = 0;
      
      for (let i = 0; i < clientPlans.length; i++) {
        const planInstallments = this.installmentRepo.findByPlan(clientPlans[i].id);
        
        for (let j = 0; j < planInstallments.length; j++) {
          const inst = planInstallments[j];
          
          if (inst.status !== INSTALLMENT_STATUS.PAID) {
            const installmentAmount = Number(inst.amount) || 0;
            const paidAmount = Number(inst.paid_amount) || 0;
            totalPending += (installmentAmount - paidAmount);
          }
        }
      }
      
      // Crear objeto del recibo
      const receipt = {
        receiptNumber: receiptNumber,
        paymentId: payment.id,
        date: payment.payment_date,
        client: {
          id: client.id,
          name: client.name,
          dni: client.dni || ''
        },
        amount: payment.amount,
        paidInstallments: paidInstallments,
        partialInstallments: partialInstallments,
        remainingAmount: remainingAmount,
        totalPendingBalance: totalPending,
        notes: payment.notes || ''
      };
      
      Logger.log('_generateReceipt: recibo generado, número=' + receiptNumber + ', saldo pendiente=' + totalPending);
      
      return receipt;
      
    } catch (error) {
      Logger.log('Error en _generateReceipt: ' + error.message);
      throw new Error('Error al generar recibo: ' + error.message);
    }
  }
  
  /**
   * generateReceipt - Genera un recibo de pago completo con PDF
   * 
   * Genera un recibo de pago, crea un PDF con los datos completos,
   * lo almacena en Google Drive y actualiza el registro de pago
   * con la URL del recibo.
   * 
   * Requisitos: 10.1, 10.2, 10.4
   * 
   * @param {string} paymentId - ID del pago para el cual generar el recibo
   * @returns {Object} Objeto con el recibo y la URL del PDF
   * @throws {Error} Si hay error al generar el recibo o almacenar el PDF
   */
  generateReceipt(paymentId) {
    try {
      // ========================================================================
      // VALIDACIONES
      // ========================================================================
      
      Validator.isRequired(paymentId, 'paymentId');
      
      Logger.log('generateReceipt: iniciando para paymentId=' + paymentId);
      
      // ========================================================================
      // OBTENER DATOS DEL PAGO
      // ========================================================================
      
      const paymentRepo = new PaymentRepository();
      const payment = paymentRepo.findById(paymentId);
      
      if (!payment) {
        throw new Error('Pago no encontrado con ID: ' + paymentId);
      }
      
      Logger.log('generateReceipt: pago encontrado, clientId=' + payment.client_id + ', amount=' + payment.amount);
      
      // ========================================================================
      // OBTENER DATOS DEL CLIENTE
      // ========================================================================
      
      const client = this.clientRepo.findById(payment.client_id);
      
      if (!client) {
        throw new Error('Cliente no encontrado con ID: ' + payment.client_id);
      }
      
      Logger.log('generateReceipt: cliente encontrado, name=' + client.name);
      
      // ========================================================================
      // OBTENER CUOTAS AFECTADAS POR EL PAGO
      // ========================================================================
      
      // Obtener todos los planes del cliente
      const clientPlans = this.creditPlanRepo.findByClient(client.id);
      const paidInstallments = [];
      const partialInstallments = [];
      
      // Buscar cuotas que fueron pagadas en la fecha del pago
      // (esto es una aproximación, en producción se debería tener una tabla de relación)
      const paymentDate = new Date(payment.payment_date);
      
      for (let i = 0; i < clientPlans.length; i++) {
        const planInstallments = this.installmentRepo.findByPlan(clientPlans[i].id);
        
        for (let j = 0; j < planInstallments.length; j++) {
          const inst = planInstallments[j];
          
          // Si la cuota fue pagada en la misma fecha del pago
          if (inst.paid_at) {
            const paidDate = new Date(inst.paid_at);
            
            // Comparar fechas (mismo día)
            if (paidDate.toDateString() === paymentDate.toDateString()) {
              if (inst.status === INSTALLMENT_STATUS.PAID) {
                paidInstallments.push({
                  id: inst.id,
                  installment_number: inst.installment_number,
                  amount: inst.amount,
                  paid_amount: inst.amount
                });
              }
            }
          }
          
          // Si la cuota está parcialmente pagada
          if (inst.status === INSTALLMENT_STATUS.PARTIAL) {
            const installmentAmount = Number(inst.amount) || 0;
            const paidAmount = Number(inst.paid_amount) || 0;
            
            if (paidAmount > 0) {
              partialInstallments.push({
                id: inst.id,
                installment_number: inst.installment_number,
                amount: installmentAmount,
                paid_amount: paidAmount,
                remaining: installmentAmount - paidAmount
              });
            }
          }
        }
      }
      
      Logger.log('generateReceipt: cuotas pagadas=' + paidInstallments.length + ', cuotas parciales=' + partialInstallments.length);
      
      // ========================================================================
      // GENERAR DATOS DEL RECIBO
      // ========================================================================
      
      const receiptData = this._generateReceipt({
        payment: payment,
        client: client,
        paidInstallments: paidInstallments,
        partialInstallments: partialInstallments,
        remainingAmount: 0
      });
      
      Logger.log('generateReceipt: datos del recibo generados, número=' + receiptData.receiptNumber);
      
      // ========================================================================
      // GENERAR PDF DEL RECIBO
      // ========================================================================
      
      const pdfBlob = this._createReceiptPDF(receiptData);
      
      Logger.log('generateReceipt: PDF generado, tamaño=' + pdfBlob.getBytes().length + ' bytes');
      
      // ========================================================================
      // ALMACENAR PDF EN GOOGLE DRIVE
      // ========================================================================
      
      const receiptUrl = this._storeReceiptInDrive(pdfBlob, receiptData.receiptNumber);
      
      Logger.log('generateReceipt: PDF almacenado en Drive, URL=' + receiptUrl);
      
      // ========================================================================
      // ACTUALIZAR REGISTRO DE PAGO CON URL DEL RECIBO
      // ========================================================================
      
      payment.receipt_url = receiptUrl;
      paymentRepo.update(payment.id, payment);
      
      Logger.log('generateReceipt: registro de pago actualizado con receipt_url');
      
      // ========================================================================
      // RETORNAR RESULTADO
      // ========================================================================
      
      return {
        success: true,
        receipt: receiptData,
        receiptUrl: receiptUrl,
        payment: payment
      };
      
    } catch (error) {
      Logger.log('Error en generateReceipt: ' + error.message);
      throw new Error('Error al generar recibo: ' + error.message);
    }
  }
  
  /**
   * _createReceiptPDF - Crea un PDF del recibo de pago
   * 
   * Genera un documento PDF con el formato del recibo de pago
   * incluyendo todos los datos: cliente, monto, cuotas pagadas, etc.
   * 
   * @private
   * @param {Object} receiptData - Datos del recibo
   * @returns {Blob} Blob del PDF generado
   */
  _createReceiptPDF(receiptData) {
    try {
      // Crear contenido HTML del recibo
      const htmlContent = this._buildReceiptHTML(receiptData);
      
      // Convertir HTML a PDF usando Google Apps Script
      // Crear un documento temporal de Google Docs
      const tempDoc = DocumentApp.create('Temp_Receipt_' + receiptData.receiptNumber);
      const body = tempDoc.getBody();
      
      // Limpiar el documento
      body.clear();
      
      // Agregar contenido al documento
      // Título
      const title = body.appendParagraph('RECIBO DE PAGO');
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      title.setFontSize(18);
      title.setBold(true);
      
      body.appendParagraph(''); // Espacio
      
      // Información del recibo
      body.appendParagraph('Número de Recibo: ' + receiptData.receiptNumber);
      body.appendParagraph('Fecha: ' + this._formatDate(receiptData.date));
      
      body.appendParagraph(''); // Espacio
      
      // Información del cliente
      const clientSection = body.appendParagraph('DATOS DEL CLIENTE');
      clientSection.setBold(true);
      body.appendParagraph('Nombre: ' + receiptData.client.name);
      body.appendParagraph('DNI: ' + (receiptData.client.dni || 'N/A'));
      
      body.appendParagraph(''); // Espacio
      
      // Información del pago
      const paymentSection = body.appendParagraph('DETALLE DEL PAGO');
      paymentSection.setBold(true);
      body.appendParagraph('Monto Pagado: S/ ' + this._formatCurrency(receiptData.amount));
      
      // Cuotas pagadas completamente
      if (receiptData.paidInstallments && receiptData.paidInstallments.length > 0) {
        body.appendParagraph(''); // Espacio
        body.appendParagraph('Cuotas Pagadas Completamente:');
        
        for (let i = 0; i < receiptData.paidInstallments.length; i++) {
          const inst = receiptData.paidInstallments[i];
          body.appendParagraph('  - Cuota #' + inst.installment_number + ': S/ ' + this._formatCurrency(inst.amount));
        }
      }
      
      // Cuotas pagadas parcialmente
      if (receiptData.partialInstallments && receiptData.partialInstallments.length > 0) {
        body.appendParagraph(''); // Espacio
        body.appendParagraph('Cuotas Pagadas Parcialmente:');
        
        for (let i = 0; i < receiptData.partialInstallments.length; i++) {
          const inst = receiptData.partialInstallments[i];
          body.appendParagraph('  - Cuota #' + inst.installment_number + ': S/ ' + this._formatCurrency(inst.paid_amount) + ' de S/ ' + this._formatCurrency(inst.amount));
        }
      }
      
      body.appendParagraph(''); // Espacio
      
      // Saldo pendiente
      const balanceSection = body.appendParagraph('SALDO PENDIENTE');
      balanceSection.setBold(true);
      body.appendParagraph('Saldo Total Pendiente: S/ ' + this._formatCurrency(receiptData.totalPendingBalance));
      
      // Notas
      if (receiptData.notes) {
        body.appendParagraph(''); // Espacio
        body.appendParagraph('Notas: ' + receiptData.notes);
      }
      
      body.appendParagraph(''); // Espacio
      body.appendParagraph(''); // Espacio
      
      // Pie de página
      const footer = body.appendParagraph('Gracias por su pago');
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setItalic(true);
      
      // Guardar y cerrar el documento
      tempDoc.saveAndClose();
      
      // Obtener el PDF del documento
      const docId = tempDoc.getId();
      const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
      pdfBlob.setName('Recibo_' + receiptData.receiptNumber + '.pdf');
      
      // Eliminar el documento temporal
      DriveApp.getFileById(docId).setTrashed(true);
      
      Logger.log('_createReceiptPDF: PDF creado exitosamente');
      
      return pdfBlob;
      
    } catch (error) {
      Logger.log('Error en _createReceiptPDF: ' + error.message);
      throw new Error('Error al crear PDF del recibo: ' + error.message);
    }
  }
  
  /**
   * _storeReceiptInDrive - Almacena el PDF del recibo en Google Drive
   * 
   * Crea una carpeta "Recibos" si no existe y almacena el PDF del recibo.
   * Retorna la URL del archivo en Drive.
   * 
   * @private
   * @param {Blob} pdfBlob - Blob del PDF a almacenar
   * @param {string} receiptNumber - Número del recibo
   * @returns {string} URL del archivo en Google Drive
   */
  _storeReceiptInDrive(pdfBlob, receiptNumber) {
    try {
      // Obtener o crear carpeta "Recibos"
      const folderName = 'Recibos';
      let folder;
      
      const folders = DriveApp.getFoldersByName(folderName);
      
      if (folders.hasNext()) {
        folder = folders.next();
        Logger.log('_storeReceiptInDrive: carpeta "Recibos" encontrada');
      } else {
        folder = DriveApp.createFolder(folderName);
        Logger.log('_storeReceiptInDrive: carpeta "Recibos" creada');
      }
      
      // Crear el archivo en la carpeta
      const fileName = 'Recibo_' + receiptNumber + '.pdf';
      const file = folder.createFile(pdfBlob);
      file.setName(fileName);
      
      // Obtener la URL del archivo
      const fileUrl = file.getUrl();
      
      Logger.log('_storeReceiptInDrive: archivo creado, URL=' + fileUrl);
      
      return fileUrl;
      
    } catch (error) {
      Logger.log('Error en _storeReceiptInDrive: ' + error.message);
      throw new Error('Error al almacenar recibo en Drive: ' + error.message);
    }
  }
  
  /**
   * _buildReceiptHTML - Construye el HTML del recibo (no usado actualmente)
   * 
   * @private
   * @param {Object} receiptData - Datos del recibo
   * @returns {string} HTML del recibo
   */
  _buildReceiptHTML(receiptData) {
    // Esta función está disponible para futuras implementaciones
    // que requieran generar HTML del recibo
    return '';
  }
  
  /**
   * _formatDate - Formatea una fecha para mostrar en el recibo
   * 
   * @private
   * @param {Date} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  _formatDate(date) {
    if (!date) {
      return 'N/A';
    }
    
    const d = new Date(date);
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    
    return day + '/' + month + '/' + year;
  }
  
  /**
   * _formatCurrency - Formatea un número como moneda
   * 
   * @private
   * @param {number} amount - Monto a formatear
   * @returns {string} Monto formateado
   */
  _formatCurrency(amount) {
    if (amount === null || amount === undefined) {
      return '0.00';
    }
    
    const num = Number(amount);
    return num.toFixed(2);
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testCreditService - Prueba el CreditService
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que existan datos de ejemplo en las hojas correspondientes.
 */
function testCreditService() {
  Logger.log('=== Iniciando pruebas de CreditService ===');
  
  try {
    // Crear instancia del servicio
    Logger.log('\n1. Creando instancia de CreditService...');
    const creditService = new CreditService();
    Logger.log('✓ Instancia creada correctamente');
    
    // Obtener una venta de ejemplo de tipo CREDITO
    Logger.log('\n2. Buscando venta de ejemplo de tipo CREDITO...');
    const saleRepo = new SaleRepository();
    const sales = saleRepo.findAll();
    
    let testSale = null;
    for (let i = 0; i < sales.length; i++) {
      if (sales[i].sale_type === SALE_TYPES.CREDITO && !sales[i].voided) {
        testSale = sales[i];
        break;
      }
    }
    
    if (!testSale) {
      Logger.log('✗ No hay ventas de tipo CREDITO para probar');
      Logger.log('Por favor, cree una venta a crédito primero');
      return;
    }
    
    Logger.log('✓ Venta encontrada: ' + testSale.id + ', total=' + testSale.total);
    
    // Verificar que la venta no tenga ya un plan de crédito
    const creditPlanRepo = new CreditPlanRepository();
    const existingPlan = creditPlanRepo.findBySale(testSale.id);
    
    if (existingPlan) {
      Logger.log('⚠ La venta ya tiene un plan de crédito asociado');
      Logger.log('Plan existente: ' + JSON.stringify(existingPlan));
      Logger.log('Saltando prueba de creación de plan');
      return;
    }
    
    // Probar createCreditPlan con diferentes números de cuotas
    Logger.log('\n3. Probando createCreditPlan() con 3 cuotas...');
    const result = creditService.createCreditPlan(testSale.id, 3);
    
    Logger.log('✓ Plan de crédito creado exitosamente');
    Logger.log('Plan ID: ' + result.plan.id);
    Logger.log('Total: ' + result.plan.total_amount);
    Logger.log('Cuotas: ' + result.plan.installments_count);
    Logger.log('Monto por cuota: ' + result.plan.installment_amount);
    Logger.log('Estado: ' + result.plan.status);
    
    Logger.log('\n4. Verificando cuotas creadas...');
    Logger.log('Número de cuotas: ' + result.installments.length);
    
    let totalCuotas = 0;
    for (let i = 0; i < result.installments.length; i++) {
      const inst = result.installments[i];
      totalCuotas += Number(inst.amount);
      Logger.log('Cuota ' + inst.installment_number + ': monto=' + inst.amount + ', vence=' + formatDate(inst.due_date) + ', estado=' + inst.status);
    }
    
    Logger.log('Suma total de cuotas: ' + totalCuotas);
    Logger.log('Total de la venta: ' + result.plan.total_amount);
    
    // Verificar que la suma de cuotas sea igual al total
    const diff = Math.abs(totalCuotas - result.plan.total_amount);
    if (diff < 0.01) {
      Logger.log('✓ La suma de cuotas coincide con el total de la venta');
    } else {
      Logger.log('✗ La suma de cuotas NO coincide con el total (diferencia: ' + diff + ')');
    }
    
    Logger.log('\n5. Verificando actualización de cupo del cliente...');
    Logger.log('Cliente: ' + result.client.name);
    Logger.log('Límite de crédito: ' + result.client.credit_limit);
    Logger.log('Crédito usado: ' + result.client.credit_used);
    Logger.log('Crédito disponible: ' + result.client.credit_available);
    
    if (result.client.credit_used > 0) {
      Logger.log('✓ El cupo del cliente fue decrementado correctamente');
    } else {
      Logger.log('✗ El cupo del cliente NO fue actualizado');
    }
    
    Logger.log('\n6. Verificando que el plan se guardó en la base de datos...');
    const savedPlan = creditPlanRepo.findById(result.plan.id);
    if (savedPlan) {
      Logger.log('✓ Plan encontrado en la base de datos');
    } else {
      Logger.log('✗ Plan NO encontrado en la base de datos');
    }
    
    Logger.log('\n7. Verificando que las cuotas se guardaron en la base de datos...');
    const installmentRepo = new InstallmentRepository();
    const savedInstallments = installmentRepo.findByPlan(result.plan.id);
    Logger.log('✓ Cuotas encontradas en la base de datos: ' + savedInstallments.length);
    
    if (savedInstallments.length === result.installments.length) {
      Logger.log('✓ Número de cuotas coincide');
    } else {
      Logger.log('✗ Número de cuotas NO coincide');
    }
    
    Logger.log('\n=== Pruebas de CreditService completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testCreditServiceValidations - Prueba las validaciones del CreditService
 */
function testCreditServiceValidations() {
  Logger.log('=== Iniciando pruebas de validaciones de CreditService ===');
  
  try {
    const creditService = new CreditService();
    
    // Probar con saleId nulo
    Logger.log('\n1. Probando con saleId nulo...');
    try {
      creditService.createCreditPlan(null, 3);
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    // Probar con installments nulo
    Logger.log('\n2. Probando con installments nulo...');
    try {
      creditService.createCreditPlan('sale-123', null);
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    // Probar con installments fuera de rango (menor a 1)
    Logger.log('\n3. Probando con installments = 0...');
    try {
      creditService.createCreditPlan('sale-123', 0);
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    // Probar con installments fuera de rango (mayor a 6)
    Logger.log('\n4. Probando con installments = 7...');
    try {
      creditService.createCreditPlan('sale-123', 7);
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    // Probar con saleId inexistente
    Logger.log('\n5. Probando con saleId inexistente...');
    try {
      creditService.createCreditPlan('sale-nonexistent-12345', 3);
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    Logger.log('\n=== Pruebas de validaciones completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testRecordPayment - Prueba el método recordPayment del CreditService
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que existan datos de ejemplo: cliente con cuotas pendientes.
 */
function testRecordPayment() {
  Logger.log('=== Iniciando pruebas de recordPayment ===');
  
  try {
    // Crear instancia del servicio
    Logger.log('\n1. Creando instancia de CreditService...');
    const creditService = new CreditService();
    Logger.log('✓ Instancia creada correctamente');
    
    // Buscar un cliente con cuotas pendientes
    Logger.log('\n2. Buscando cliente con cuotas pendientes...');
    const installmentRepo = new InstallmentRepository();
    const allInstallments = installmentRepo.findAll();
    
    let testClientId = null;
    let testInstallment = null;
    
    for (let i = 0; i < allInstallments.length; i++) {
      const inst = allInstallments[i];
      if (inst.status === INSTALLMENT_STATUS.PENDING || inst.status === INSTALLMENT_STATUS.PARTIAL) {
        // Obtener el plan para encontrar el cliente
        const planRepo = new CreditPlanRepository();
        const plan = planRepo.findById(inst.plan_id);
        
        if (plan && plan.client_id) {
          testClientId = plan.client_id;
          testInstallment = inst;
          break;
        }
      }
    }
    
    if (!testClientId) {
      Logger.log('✗ No hay clientes con cuotas pendientes para probar');
      Logger.log('Por favor, cree una venta a crédito primero');
      return;
    }
    
    Logger.log('✓ Cliente encontrado: ' + testClientId);
    Logger.log('Cuota pendiente: ' + testInstallment.id + ', monto=' + testInstallment.amount + ', pagado=' + testInstallment.paid_amount);
    
    // Obtener información del cliente
    const clientRepo = new ClientRepository();
    const client = clientRepo.findById(testClientId);
    Logger.log('Cliente: ' + client.name);
    
    // Calcular monto a pagar (pagar la mitad de la primera cuota pendiente)
    const installmentAmount = Number(testInstallment.amount) || 0;
    const paidAmount = Number(testInstallment.paid_amount) || 0;
    const pendingAmount = installmentAmount - paidAmount;
    const paymentAmount = Math.round((pendingAmount / 2) * 100) / 100; // Pago parcial
    
    Logger.log('Monto de la cuota: ' + installmentAmount);
    Logger.log('Ya pagado: ' + paidAmount);
    Logger.log('Pendiente: ' + pendingAmount);
    Logger.log('Monto a pagar (50%): ' + paymentAmount);
    
    // Probar recordPayment con pago parcial
    Logger.log('\n3. Probando recordPayment() con pago parcial...');
    
    const paymentData = {
      clientId: testClientId,
      amount: paymentAmount,
      paymentDate: new Date(),
      userId: 'test@example.com',
      notes: 'Pago de prueba - parcial'
    };
    
    const requestId = 'req-test-' + new Date().getTime();
    
    const result = creditService.recordPayment(paymentData, requestId);
    
    Logger.log('✓ Pago registrado exitosamente');
    Logger.log('Payment ID: ' + result.payment.id);
    Logger.log('Monto: ' + result.payment.amount);
    Logger.log('Cuotas pagadas completamente: ' + result.paidInstallments.length);
    Logger.log('Cuotas pagadas parcialmente: ' + result.partialInstallments.length);
    Logger.log('Monto sobrante: ' + result.remainingAmount);
    
    // Verificar recibo
    Logger.log('\n4. Verificando recibo generado...');
    Logger.log('Número de recibo: ' + result.receipt.receiptNumber);
    Logger.log('Saldo pendiente total del cliente: ' + result.receipt.totalPendingBalance);
    
    if (result.receipt.receiptNumber) {
      Logger.log('✓ Recibo generado correctamente');
    } else {
      Logger.log('✗ Recibo NO generado');
    }
    
    // Verificar que la cuota se actualizó
    Logger.log('\n5. Verificando actualización de cuota...');
    const updatedInstallment = installmentRepo.findById(testInstallment.id);
    Logger.log('Estado anterior: ' + testInstallment.status);
    Logger.log('Estado actual: ' + updatedInstallment.status);
    Logger.log('Monto pagado anterior: ' + testInstallment.paid_amount);
    Logger.log('Monto pagado actual: ' + updatedInstallment.paid_amount);
    
    if (Number(updatedInstallment.paid_amount) > Number(testInstallment.paid_amount)) {
      Logger.log('✓ Cuota actualizada correctamente');
    } else {
      Logger.log('✗ Cuota NO actualizada');
    }
    
    // Probar idempotencia (mismo requestId)
    Logger.log('\n6. Probando idempotencia (mismo requestId)...');
    const result2 = creditService.recordPayment(paymentData, requestId);
    
    if (result2.payment.id === result.payment.id) {
      Logger.log('✓ Idempotencia funciona correctamente (retornó el mismo pago)');
    } else {
      Logger.log('✗ Idempotencia NO funciona (creó un pago diferente)');
    }
    
    Logger.log('\n=== Pruebas de recordPayment completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testRecordPaymentFullPayment - Prueba recordPayment con pago completo de múltiples cuotas
 */
function testRecordPaymentFullPayment() {
  Logger.log('=== Iniciando pruebas de recordPayment con pago completo ===');
  
  try {
    const creditService = new CreditService();
    
    // Buscar un cliente con múltiples cuotas pendientes
    Logger.log('\n1. Buscando cliente con múltiples cuotas pendientes...');
    const installmentRepo = new InstallmentRepository();
    const planRepo = new CreditPlanRepository();
    const allPlans = planRepo.findAll();
    
    let testClientId = null;
    let testPlan = null;
    
    for (let i = 0; i < allPlans.length; i++) {
      const plan = allPlans[i];
      if (plan.status === CREDIT_PLAN_STATUS.ACTIVE) {
        const planInstallments = installmentRepo.findByPlan(plan.id);
        
        // Contar cuotas pendientes
        let pendingCount = 0;
        for (let j = 0; j < planInstallments.length; j++) {
          if (planInstallments[j].status !== INSTALLMENT_STATUS.PAID) {
            pendingCount++;
          }
        }
        
        if (pendingCount >= 2) {
          testClientId = plan.client_id;
          testPlan = plan;
          break;
        }
      }
    }
    
    if (!testClientId) {
      Logger.log('✗ No hay clientes con múltiples cuotas pendientes para probar');
      return;
    }
    
    Logger.log('✓ Cliente encontrado: ' + testClientId);
    Logger.log('Plan: ' + testPlan.id + ', total=' + testPlan.total_amount);
    
    // Calcular monto para pagar 2 cuotas completas
    const planInstallments = installmentRepo.findByPlan(testPlan.id);
    let totalToPay = 0;
    let installmentsToPay = 0;
    
    for (let i = 0; i < planInstallments.length && installmentsToPay < 2; i++) {
      const inst = planInstallments[i];
      if (inst.status !== INSTALLMENT_STATUS.PAID) {
        const installmentAmount = Number(inst.amount) || 0;
        const paidAmount = Number(inst.paid_amount) || 0;
        totalToPay += (installmentAmount - paidAmount);
        installmentsToPay++;
      }
    }
    
    Logger.log('Monto para pagar ' + installmentsToPay + ' cuotas: ' + totalToPay);
    
    // Registrar pago
    Logger.log('\n2. Registrando pago de múltiples cuotas...');
    
    const paymentData = {
      clientId: testClientId,
      amount: totalToPay,
      paymentDate: new Date(),
      userId: 'test@example.com',
      notes: 'Pago de prueba - múltiples cuotas'
    };
    
    const requestId = 'req-test-full-' + new Date().getTime();
    
    const result = creditService.recordPayment(paymentData, requestId);
    
    Logger.log('✓ Pago registrado exitosamente');
    Logger.log('Cuotas pagadas completamente: ' + result.paidInstallments.length);
    Logger.log('Cuotas pagadas parcialmente: ' + result.partialInstallments.length);
    
    if (result.paidInstallments.length >= 2) {
      Logger.log('✓ Se pagaron múltiples cuotas correctamente');
    } else {
      Logger.log('⚠ Se esperaban al menos 2 cuotas pagadas, se obtuvieron: ' + result.paidInstallments.length);
    }
    
    // Mostrar detalles de cuotas pagadas
    Logger.log('\n3. Detalles de cuotas pagadas:');
    for (let i = 0; i < result.paidInstallments.length; i++) {
      const inst = result.paidInstallments[i];
      Logger.log('Cuota ' + inst.installment_number + ': monto=' + inst.amount + ', pagado=' + inst.paid_amount);
    }
    
    Logger.log('\n=== Pruebas de pago completo completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}


/**
 * testGenerateReceipt - Prueba la generación de recibos con PDF
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que exista un pago registrado en la base de datos.
 */
function testGenerateReceipt() {
  Logger.log('=== Iniciando pruebas de generateReceipt ===');
  
  try {
    // Crear instancia del servicio
    Logger.log('\n1. Creando instancia de CreditService...');
    const creditService = new CreditService();
    Logger.log('✓ Instancia creada correctamente');
    
    // Buscar un pago de ejemplo
    Logger.log('\n2. Buscando pago de ejemplo...');
    const paymentRepo = new PaymentRepository();
    const payments = paymentRepo.findAll();
    
    if (payments.length === 0) {
      Logger.log('✗ No hay pagos registrados para probar');
      Logger.log('Por favor, registre un pago primero usando testRecordPayment()');
      return;
    }
    
    const testPayment = payments[0];
    Logger.log('✓ Pago encontrado: ' + testPayment.id + ', amount=' + testPayment.amount);
    
    // Probar generateReceipt
    Logger.log('\n3. Probando generateReceipt()...');
    const result = creditService.generateReceipt(testPayment.id);
    
    Logger.log('✓ Recibo generado exitosamente');
    Logger.log('Número de recibo: ' + result.receipt.receiptNumber);
    Logger.log('URL del PDF: ' + result.receiptUrl);
    Logger.log('Monto: S/ ' + result.receipt.amount);
    Logger.log('Cliente: ' + result.receipt.client.name);
    Logger.log('Saldo pendiente: S/ ' + result.receipt.totalPendingBalance);
    
    // Verificar que el pago se actualizó con la URL
    Logger.log('\n4. Verificando actualización del registro de pago...');
    const updatedPayment = paymentRepo.findById(testPayment.id);
    
    if (updatedPayment.receipt_url) {
      Logger.log('✓ Registro de pago actualizado con receipt_url');
      Logger.log('URL: ' + updatedPayment.receipt_url);
    } else {
      Logger.log('✗ Registro de pago NO actualizado');
    }
    
    // Verificar que el archivo existe en Drive
    Logger.log('\n5. Verificando archivo en Google Drive...');
    try {
      const fileId = result.receiptUrl.match(/[-\w]{25,}/);
      if (fileId) {
        const file = DriveApp.getFileById(fileId[0]);
        Logger.log('✓ Archivo encontrado en Drive');
        Logger.log('Nombre: ' + file.getName());
        Logger.log('Tamaño: ' + file.getSize() + ' bytes');
        Logger.log('Tipo: ' + file.getMimeType());
      } else {
        Logger.log('⚠ No se pudo extraer el ID del archivo de la URL');
      }
    } catch (e) {
      Logger.log('⚠ Error al verificar archivo en Drive: ' + e.message);
    }
    
    Logger.log('\n=== Pruebas de generateReceipt completadas exitosamente ===');
    Logger.log('\nPuedes acceder al recibo en: ' + result.receiptUrl);
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testGenerateReceiptValidations - Prueba las validaciones de generateReceipt
 */
function testGenerateReceiptValidations() {
  Logger.log('=== Iniciando pruebas de validaciones de generateReceipt ===');
  
  try {
    const creditService = new CreditService();
    
    // Probar con paymentId nulo
    Logger.log('\n1. Probando con paymentId nulo...');
    try {
      creditService.generateReceipt(null);
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    // Probar con paymentId inexistente
    Logger.log('\n2. Probando con paymentId inexistente...');
    try {
      creditService.generateReceipt('pay-nonexistent-12345');
      Logger.log('✗ Debería haber lanzado error');
    } catch (e) {
      Logger.log('✓ Error esperado: ' + e.message);
    }
    
    Logger.log('\n=== Pruebas de validaciones completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}
