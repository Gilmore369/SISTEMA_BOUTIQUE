# Plan de Implementación: Adiction Boutique Suite

## Visión General

Este plan descompone el sistema Adiction Boutique Suite en tareas incrementales de codificación. Cada tarea construye sobre las anteriores, asegurando que no quede código huérfano. El plan sigue 6 milestones principales, desde la infraestructura base hasta la facturación electrónica.

## Tareas

### Milestone 1: Fundamentos

- [x] 1. Configurar proyecto de Google Apps Script y estructura base
  - Crear nuevo proyecto de Apps Script
  - Crear archivo Config.gs con constantes del sistema
  - Crear archivo Main.gs con funciones doGet() y doPost()
  - Configurar permisos necesarios (Sheets, Drive, Gmail)
  - _Requisitos: 26.1_

- [x] 2. Implementar Router básico con manejo de rutas
  - Crear función routeGet() para manejar solicitudes GET
  - Crear función routePost() para manejar solicitudes POST
  - Implementar parseo de parámetros de URL
  - Implementar respuestas JSON y HTML
  - _Requisitos: 21.1_

- [x] 3. Crear plantilla de Google Sheets con todas las hojas
  - Crear hoja CFG_Users con headers y formato
  - Crear hoja CFG_Params con headers y formato
  - Crear hoja CAT_Products con headers y formato
  - Crear hoja INV_Stock con headers y formato
  - Crear hoja INV_Movements con headers y formato
  - Crear hoja CRM_Clients con headers y formato
  - Crear hoja POS_Sales con headers y formato
  - Crear hoja POS_SaleItems con headers y formato
  - Crear hoja CRD_Plans con headers y formato
  - Crear hoja CRD_Installments con headers y formato
  - Crear hoja CRD_Payments con headers y formato
  - Crear hoja CASH_Shifts con headers y formato
  - Crear hoja CASH_Expenses con headers y formato
  - Crear hoja AUD_Log con headers y formato
  - _Requisitos: 27.1, 27.2_


- [x] 4. Poblar hojas con datos de ejemplo (seed data)
  - Insertar usuarios de ejemplo en CFG_Users
  - Insertar parámetros del sistema en CFG_Params
  - Insertar productos de ejemplo en CAT_Products
  - Insertar stock inicial en INV_Stock
  - Insertar clientes de ejemplo en CRM_Clients
  - _Requisitos: 27.2_

- [x] 5. Implementar clase BaseRepository con operaciones CRUD
  - Crear archivo BaseRepository.gs
  - Implementar constructor que recibe nombre de hoja
  - Implementar método findAll() para obtener todos los registros
  - Implementar método findById(id) para buscar por ID
  - Implementar método create(obj) para insertar registro
  - Implementar método update(id, obj) para actualizar registro
  - Implementar métodos auxiliares _rowToObject() y _objectToRow()
  - _Requisitos: 4.1_

- [ ] 6. Implementar repositorios específicos heredando de BaseRepository
  - [x] 6.1 Crear UserRepository para CFG_Users
    - Implementar método findByEmail(email)
    - _Requisitos: 1.1_
  
  - [x] 6.2 Crear ProductRepository para CAT_Products
    - Implementar método findByBarcode(barcode)
    - Implementar método search(query) para búsqueda por nombre/categoría
    - _Requisitos: 3.1, 3.3_
  
  - [x] 6.3 Crear StockRepository para INV_Stock
    - Implementar método findByWarehouseAndProduct(warehouseId, productId)
    - Implementar método updateQuantity(warehouseId, productId, delta)
    - _Requisitos: 4.1_


- [ ] 7. Implementar utilidades del sistema
  - [x] 7.1 Crear Validator.gs con funciones de validación
    - Implementar isRequired(value, fieldName)
    - Implementar isNumber(value, fieldName)
    - Implementar isPositive(value, fieldName)
    - Implementar isEmail(value, fieldName)
    - Implementar isInRange(value, min, max, fieldName)
    - _Requisitos: 30.1, 30.3_
  
  - [x] 7.2 Crear LockManager.gs para manejo de concurrencia
    - Implementar acquireLock(lockKey, timeoutMs)
    - Implementar releaseLock(lock)
    - Implementar withLock(lockKey, fn) para ejecutar con lock
    - _Requisitos: 19.1, 19.2_
  
  - [x] 7.3 Crear IdempotencyManager.gs para operaciones idempotentes
    - Implementar checkAndStore(requestId, operation)
    - Usar CacheService para almacenar requestIds procesados
    - _Requisitos: 20.1, 20.2, 20.3_
  
  - [x] 7.4 Crear CacheManager.gs para gestión de caché
    - Implementar get(key)
    - Implementar put(key, value, ttlSeconds)
    - Implementar invalidate(key)
    - _Requisitos: 29.1, 29.2, 29.4_

- [x] 8. Implementar AuthService para autenticación y autorización
  - Crear archivo AuthService.gs
  - Implementar isUserAllowed(email) validando contra CFG_Users
  - Implementar getUserRoles(email) obteniendo roles del usuario
  - Implementar hasPermission(email, permission) verificando permisos por rol
  - Implementar logAccess(email, success) para auditoría de accesos
  - _Requisitos: 1.1, 1.2, 1.3, 1.4, 2.4_


- [ ]* 9. Escribir property tests para autenticación
  - **Propiedad 1: Validación de Acceso por Allowlist**
  - **Valida: Requisitos 1.1, 1.2**
  
- [ ]* 10. Escribir property tests para roles y permisos
  - **Propiedad 3: Unión de Permisos para Múltiples Roles**
  - **Valida: Requisitos 1.5**

- [x] 11. Crear layout HTML base con Bootstrap 5
  - Crear archivo Layout.html con estructura HTML5
  - Implementar topbar con navbar de Bootstrap
  - Implementar sidebar con menú de navegación
  - Incluir CDN de Bootstrap 5.3, Bootstrap Icons y DataTables
  - Implementar área de contenido principal
  - Hacer responsive para móviles
  - _Requisitos: 21.1, 21.2, 21.3, 21.4, 21.5_

- [x] 12. Integrar router con AuthService y layout
  - Modificar doGet() para validar autenticación antes de renderizar
  - Implementar página de acceso denegado para usuarios no autorizados
  - Pasar datos de usuario al layout (nombre, roles)
  - Implementar logout
  - _Requisitos: 1.1, 1.2_

- [x] 13. Checkpoint - Verificar fundamentos
  - Verificar que el WebApp se publica correctamente
  - Verificar que solo usuarios en allowlist pueden acceder
  - Verificar que el layout se renderiza correctamente
  - Verificar que los datos de ejemplo están en las hojas
  - Preguntar al usuario si hay dudas o ajustes necesarios


### Milestone 2: Catálogo e Inventario

- [ ] 14. Implementar repositorios adicionales para inventario
  - [x] 14.1 Crear MovementRepository para INV_Movements
    - Implementar método findByWarehouse(warehouseId, filters)
    - Implementar método findByProduct(productId)
    - _Requisitos: 4.4_
  
  - [x] 14.2 Crear ClientRepository para CRM_Clients
    - Implementar método findByDNI(dni)
    - Implementar método search(query)
    - _Requisitos: 8.1, 8.2_
  
  - [x] 14.3 Crear AuditRepository para AUD_Log
    - Implementar método log(operation, entityType, entityId, oldValues, newValues, userId)
    - Implementar método findByFilters(filters)
    - _Requisitos: 18.1, 18.3_

- [x] 15. Implementar InventoryService para gestión de inventario
  - Crear archivo InventoryService.gs
  - Implementar checkStock(warehouseId, productId) consultando StockRepository
  - Implementar reserveStock(warehouseId, productId, quantity) con validación
  - Implementar releaseStock(warehouseId, productId, quantity)
  - Implementar recordMovement(movementData) creando registro en MovementRepository
  - Implementar checkLowStock() para alertas de stock mínimo
  - _Requisitos: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 16. Implementar transferStock() con locks e idempotencia
  - Implementar transferStock(fromWarehouse, toWarehouse, productId, quantity, requestId)
  - Validar stock suficiente en origen
  - Usar LockManager para atomicidad
  - Usar IdempotencyManager para evitar duplicados
  - Decrementar stock en origen e incrementar en destino
  - Crear dos movimientos vinculados (salida y entrada)
  - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ]* 17. Escribir property tests para inventario
  - **Propiedad 6: Unicidad de Código de Barras**
  - **Valida: Requisitos 3.2**
  - **Propiedad 8: Invariante de Stock en Ventas**
  - **Valida: Requisitos 4.2**
  - **Propiedad 13: Atomicidad de Transferencias**
  - **Valida: Requisitos 5.3, 5.4, 5.5**

- [x] 18. Crear vista de listado de productos con DataTables
  - Crear archivo ProductList.html
  - Implementar tabla con DataTables mostrando productos
  - Implementar búsqueda y filtros
  - Implementar paginación (25, 50, 100 registros)
  - Agregar botones de acción (editar, ver stock)
  - _Requisitos: 3.3, 28.1, 28.2, 28.3_

- [x] 19. Crear formulario CRUD de productos
  - Crear archivo ProductForm.html
  - Implementar formulario con validación de campos
  - Implementar guardado con validación de código de barras único
  - Implementar auditoría de cambios de precio
  - Integrar con ProductRepository
  - _Requisitos: 3.1, 3.2, 3.4_

- [x] 20. Crear vista de consulta de stock por almacén
  - Crear archivo StockView.html
  - Mostrar stock actual por producto y almacén
  - Resaltar productos con stock bajo (alerta)
  - Implementar filtros por almacén y categoría
  - Mostrar valor total del inventario
  - _Requisitos: 4.1, 4.3_


- [x] 21. Crear vista de movimientos de inventario
  - Crear archivo MovementList.html
  - Mostrar historial de movimientos con DataTables
  - Implementar filtros por fecha, almacén, tipo y producto
  - Mostrar detalles de cada movimiento (usuario, motivo, referencia)
  - _Requisitos: 4.4_

- [x] 22. Implementar formulario de transferencia entre almacenes
  - Crear archivo TransferForm.html
  - Implementar selección de almacén origen y destino
  - Implementar selección de producto y cantidad
  - Validar stock disponible en origen
  - Ejecutar transferencia con requestId generado
  - Mostrar confirmación con detalles de la transferencia
  - _Requisitos: 5.1, 5.3, 5.4_

- [x] 23. Checkpoint - Verificar catálogo e inventario
  - Verificar CRUD de productos funciona correctamente
  - Verificar consulta de stock muestra datos correctos
  - Verificar transferencias actualizan stock en ambos almacenes
  - Verificar movimientos se registran correctamente
  - Preguntar al usuario si hay dudas o ajustes necesarios

### Milestone 3: POS Contado

- [x] 24. Implementar repositorios para ventas
  - [x] 24.1 Crear SaleRepository para POS_Sales
    - Implementar método findByStore(storeId, filters)
    - Implementar método findByDateRange(startDate, endDate)
    - _Requisitos: 6.3_
  
  - [x] 24.2 Crear SaleItemRepository para POS_SaleItems
    - Implementar método findBySale(saleId)
    - _Requisitos: 6.3_


- [x] 25. Implementar POSService para ventas al contado
  - Crear archivo POSService.gs
  - Implementar addItemToCart(cartId, productId, quantity) con validación de stock
  - Implementar calculateTotal(cartItems, discounts) calculando subtotal y total
  - Implementar createSale(saleData, requestId) con locks e idempotencia
  - En createSale: validar stock, crear venta, crear items, decrementar stock, registrar movimientos
  - Implementar auditoría de la venta
  - _Requisitos: 6.1, 6.3, 6.4, 6.5_

- [ ]* 26. Escribir property tests para ventas contado
  - **Propiedad 11: Rechazo de Ventas sin Stock**
  - **Valida: Requisitos 4.5**
  - **Propiedad 15: Completitud de Operaciones de Venta**
  - **Valida: Requisitos 6.3**
  - **Propiedad 16: Idempotencia de Operaciones Críticas**
  - **Valida: Requisitos 6.4, 20.2, 20.3**

- [x] 27. Crear vista de POS (Punto de Venta)
  - Crear archivo POS.html
  - Implementar buscador de productos (input + botón escanear)
  - Implementar tabla de carrito con items agregados
  - Implementar panel de totales (subtotal, descuento, total)
  - Implementar selector de tipo de venta (contado/crédito)
  - Implementar botón "Confirmar Venta"
  - Hacer responsive para tablets y móviles
  - _Requisitos: 6.1, 6.3, 21.2_

- [x] 28. Implementar funcionalidad de escaneo de códigos de barras
  - Agregar botón para activar cámara en POS
  - Implementar captura de video con getUserMedia()
  - Integrar librería de escaneo de códigos de barras (ej: QuaggaJS)
  - Al detectar código, buscar producto y agregar al carrito
  - Manejar errores si código no existe
  - _Requisitos: 6.2, 22.1, 22.2, 22.3, 22.4, 22.5_


- [x] 29. Implementar generación de tickets de venta
  - Crear función generateTicket(saleId) en POSService
  - Generar HTML del ticket con datos de venta
  - Incluir logo, datos de tienda, items, totales
  - Permitir imprimir ticket desde navegador
  - _Requisitos: 6.3_

- [x] 30. Implementar funcionalidad de descuentos en ventas
  - Agregar campo de descuento en vista POS
  - Implementar applyDiscount(amount, type) en POSService
  - Validar umbral de descuento y requerir autorización si excede
  - Registrar descuento en detalle de venta
  - Auditar descuentos aplicados
  - _Requisitos: 25.1, 25.2, 25.3, 25.4, 25.5_

- [ ]* 31. Escribir property tests para descuentos
  - **Propiedad 42: Cálculo de Total con Descuento**
  - **Valida: Requisitos 25.4**
  - **Propiedad 43: Autorización de Descuentos Mayores**
  - **Valida: Requisitos 25.2**

- [x] 32. Implementar anulación de ventas
  - Implementar voidSale(saleId, reason, userId) en POSService
  - Validar permisos de supervisor
  - Requerir motivo obligatorio
  - Revertir movimientos de inventario (incrementar stock)
  - Marcar venta como anulada
  - Auditar anulación
  - _Requisitos: 23.1, 23.2, 23.3, 23.5_


- [ ]* 33. Escribir property tests para anulaciones
  - **Propiedad 39: Reversión de Stock en Anulaciones**
  - **Valida: Requisitos 23.3**

- [x] 34. Checkpoint - Verificar POS contado
  - Verificar que se pueden agregar productos al carrito
  - Verificar que el stock se decrementa correctamente
  - Verificar que se generan tickets de venta
  - Verificar que los descuentos se aplican correctamente
  - Verificar que las anulaciones revierten el stock
  - Preguntar al usuario si hay dudas o ajustes necesarios

### Milestone 4: Crédito y Cobranzas

- [ ] 35. Implementar repositorios para crédito
  - [x] 35.1 Crear CreditPlanRepository para CRD_Plans
    - Implementar método findByClient(clientId)
    - Implementar método findBySale(saleId)
    - _Requisitos: 7.3_
  
  - [x] 35.2 Crear InstallmentRepository para CRD_Installments
    - Implementar método findByPlan(planId)
    - Implementar método findOverdue(clientId)
    - Implementar método findDueToday()
    - Implementar método findDueThisWeek()
    - _Requisitos: 7.3, 9.1_
  
  - [x] 35.3 Crear PaymentRepository para CRD_Payments
    - Implementar método findByClient(clientId)
    - _Requisitos: 9.5_


- [x] 36. Implementar CreditService para gestión de crédito
  - Crear archivo CreditService.gs
  - Implementar createCreditPlan(saleId, installments) creando plan y cuotas
  - Calcular monto de cada cuota (total / installments)
  - Calcular fechas de vencimiento de cuotas
  - Decrementar cupo disponible del cliente
  - _Requisitos: 7.3, 7.4, 7.5_

- [ ]* 37. Escribir property tests para planes de crédito
  - **Propiedad 18: Invariante de Suma de Cuotas**
  - **Valida: Requisitos 7.4**
  - **Propiedad 19: Invariante de Cupo de Cliente**
  - **Valida: Requisitos 7.5**

- [x] 38. Extender POSService para ventas a crédito
  - Modificar createSale() para soportar tipo CREDITO
  - Validar cupo disponible del cliente
  - Llamar a CreditService.createCreditPlan() si es crédito
  - Actualizar estado de pago a PENDING
  - _Requisitos: 7.1, 7.3_

- [x] 39. Implementar registro de pagos con aplicación a cuotas
  - Implementar recordPayment(paymentData, requestId) en CreditService
  - Usar locks e idempotencia
  - Obtener cuotas pendientes ordenadas por fecha de vencimiento (oldest_due_first)
  - Aplicar monto del pago a cuotas en orden
  - Actualizar estado de cuotas a PAID cuando se completan
  - Generar recibo de pago
  - _Requisitos: 9.2, 9.3, 9.4, 9.5_


- [ ]* 40. Escribir property tests para pagos
  - **Propiedad 23: Aplicación de Pagos en Orden de Antigüedad**
  - **Valida: Requisitos 9.2**
  - **Propiedad 24: Actualización de Estado de Cuotas**
  - **Valida: Requisitos 9.4**

- [x] 41. Implementar generación de recibos de pago
  - Crear función generateReceipt(paymentId) en CreditService
  - Generar PDF del recibo con datos completos
  - Almacenar PDF en Google Drive
  - Guardar URL del recibo en registro de pago
  - _Requisitos: 10.1, 10.2, 10.4_

- [x] 42. Crear vista de gestión de clientes
  - Crear archivo ClientList.html con DataTables
  - Mostrar listado de clientes con DNI, nombre, teléfono, cupo
  - Implementar búsqueda y filtros
  - Agregar botones de acción (ver detalle, editar)
  - _Requisitos: 8.1_

- [x] 43. Crear formulario de registro de clientes
  - Crear archivo ClientForm.html
  - Implementar campos: DNI, nombre, teléfono, email, dirección, cupo
  - Validar unicidad de DNI
  - Implementar captura de geolocalización (opcional)
  - Implementar carga de foto de DNI a Google Drive
  - _Requisitos: 8.1, 8.2, 8.3, 8.4_


- [x] 44. Crear vista de detalle de cliente con historial
  - Crear archivo ClientDetail.html
  - Mostrar datos completos del cliente
  - Mostrar historial de compras con DataTables
  - Mostrar historial de pagos con DataTables
  - Mostrar estado de cuotas pendientes
  - Calcular y mostrar cupo disponible
  - _Requisitos: 8.5_

- [x] 45. Crear vista de cobranzas con bandejas
  - Crear archivo Collections.html
  - Implementar tabs: Vencidas / Hoy / Esta Semana
  - Mostrar cuotas en cada bandeja con DataTables
  - Mostrar: Cliente, Cuota, Monto, Vencimiento, Días vencido
  - Agregar botón "Registrar Pago" por fila
  - _Requisitos: 9.1_

- [x] 46. Implementar modal de registro de pago
  - Crear modal en Collections.html
  - Implementar campos: Monto, Método de pago
  - Mostrar cuotas que se pagarán con el monto ingresado
  - Ejecutar recordPayment() al confirmar
  - Mostrar recibo generado
  - Permitir imprimir o enviar recibo por email
  - _Requisitos: 9.2, 9.3, 9.5_

- [x] 47. Implementar reprogramación de cuotas
  - Crear función rescheduleInstallment(installmentId, newDate, reason, userId) en CreditService
  - Validar permisos de supervisor
  - Requerir motivo obligatorio
  - Actualizar fecha de vencimiento y estado
  - Auditar reprogramación
  - _Requisitos: 24.1, 24.2, 24.3, 24.4, 24.5_


- [x] 48. Extender anulación de ventas para crédito
  - Modificar voidSale() para manejar ventas a crédito
  - Cancelar plan de crédito (estado CANCELLED)
  - Restaurar cupo del cliente
  - Auditar reversión de cupo
  - _Requisitos: 23.4_

- [ ]* 49. Escribir property tests para anulaciones de crédito
  - **Propiedad 40: Reversión de Cupo en Anulaciones de Crédito**
  - **Valida: Requisitos 23.4**

- [x] 50. Checkpoint - Verificar crédito y cobranzas
  - Verificar que se pueden crear ventas a crédito
  - Verificar que el cupo se decrementa correctamente
  - Verificar que los pagos se aplican en orden correcto
  - Verificar que se generan recibos de pago
  - Verificar que las reprogramaciones funcionan
  - Preguntar al usuario si hay dudas o ajustes necesarios

### Milestone 5: Caja y Reportes

- [x] 51. Implementar repositorios para caja
  - [x] 51.1 Crear ShiftRepository para CASH_Shifts
    - Implementar método findOpenByStore(storeId)
    - Implementar método findByDateRange(startDate, endDate)
    - _Requisitos: 11.1, 11.2_
  
  - [x] 51.2 Crear ExpenseRepository para CASH_Expenses
    - Implementar método findByShift(shiftId)
    - _Requisitos: 12.1_


- [x] 52. Implementar CashService para gestión de caja
  - Crear archivo CashService.gs
  - Implementar openShift(shiftData) creando turno abierto
  - Validar que no existe otro turno abierto en la tienda
  - Implementar closeShift(shiftId, closingData) calculando montos
  - Calcular monto esperado: apertura + ventas contado + cobros - egresos
  - Calcular diferencia: real - esperado
  - Requerir firma de supervisor en cierre
  - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 53. Escribir property tests para caja
  - **Propiedad 27: Unicidad de Turno Abierto por Tienda**
  - **Valida: Requisitos 11.2**
  - **Propiedad 28: Cálculo de Monto Esperado en Cierre de Caja**
  - **Valida: Requisitos 11.3**
  - **Propiedad 29: Cálculo de Diferencia en Cierre de Caja**
  - **Valida: Requisitos 11.4**

- [x] 54. Implementar registro de egresos
  - Implementar recordExpense(expenseData) en CashService
  - Validar que existe turno abierto
  - Validar autorización si monto supera umbral
  - Decrementar efectivo disponible en turno
  - Permitir adjuntar comprobante en Google Drive
  - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 55. Crear vista de gestión de caja
  - Crear archivo Cash.html
  - Mostrar estado del turno actual (abierto/cerrado)
  - Implementar botón "Abrir Turno" con modal
  - Implementar botón "Cerrar Turno" con modal de arqueo
  - Mostrar resumen del turno: ventas, cobros, egresos, efectivo disponible
  - _Requisitos: 11.1, 11.3_


- [x] 56. Crear formulario de registro de egresos
  - Crear modal en Cash.html
  - Implementar campos: Monto, Concepto, Categoría
  - Permitir adjuntar foto/PDF de comprobante
  - Validar monto y requerir autorización si excede umbral
  - Ejecutar recordExpense() al confirmar
  - _Requisitos: 12.1, 12.5_

- [x] 57. Implementar ReportService para reportes
  - Crear archivo ReportService.gs
  - Implementar getSalesReport(filters) con agregaciones
  - Implementar getInventoryReport(warehouseId) con stock y valor
  - Implementar getAccountsReceivableReport(filters) con cartera
  - Implementar getTopClientsReport(limit) ordenando por monto
  - _Requisitos: 15.1, 16.1, 17.1_

- [x] 58. Crear vista de reportes de ventas
  - Crear archivo SalesReport.html
  - Implementar filtros: fecha inicio/fin, tienda, vendedor, tipo
  - Mostrar métricas: cantidad ventas, monto total, ticket promedio
  - Mostrar tabla de productos más vendidos
  - Implementar gráfico de tendencias con Chart.js
  - Permitir exportar a Excel
  - _Requisitos: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 59. Crear vista de reportes de inventario
  - Crear archivo InventoryReport.html
  - Mostrar stock actual por almacén con DataTables
  - Resaltar productos con stock bajo
  - Mostrar valor total del inventario
  - Implementar filtros por almacén y categoría
  - Mostrar productos sin movimiento en período
  - _Requisitos: 16.1, 16.2, 16.3, 16.4, 16.5_


- [x] 60. Crear vista de reportes de cuentas por cobrar
  - Crear archivo ARReport.html
  - Mostrar métricas: total por cobrar, vencido, por vencer, al día
  - Mostrar antigüedad de saldos (0-30, 31-60, 61-90, >90 días)
  - Mostrar top clientes con mayor deuda
  - Calcular índice de morosidad
  - Implementar filtros por tienda y fecha
  - _Requisitos: 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 61. Checkpoint - Verificar caja y reportes
  - Verificar apertura y cierre de turnos
  - Verificar registro de egresos con autorización
  - Verificar reportes muestran datos correctos
  - Verificar cálculos de métricas son precisos
  - Preguntar al usuario si hay dudas o ajustes necesarios

### Milestone 6: Facturación y Hardening

- [x] 62. Implementar InvoiceService para facturación electrónica
  - Crear archivo InvoiceService.gs
  - Implementar generateInvoice(saleId) con datos fiscales completos
  - Generar PDF de factura con formato oficial
  - Almacenar PDF en Google Drive
  - Registrar factura con número correlativo
  - _Requisitos: 13.1, 13.3_

- [x] 63. Implementar envío de facturas por email
  - Implementar sendInvoiceByEmail(invoiceId, recipientEmail) en InvoiceService
  - Obtener PDF desde Google Drive
  - Construir email HTML con formato profesional
  - Adjuntar PDF usando GmailApp
  - Registrar envío con fecha y estado
  - Manejar errores y permitir reintento
  - _Requisitos: 13.4, 13.5, 14.1, 14.2, 14.3, 14.4, 14.5_


- [ ]* 64. Escribir property tests para facturación
  - **Propiedad 33: Completitud de Datos en Facturas**
  - **Valida: Requisitos 13.1**
  - **Propiedad 34: Adjunto de PDF en Envío de Facturas**
  - **Valida: Requisitos 13.4, 14.3**

- [x] 65. Integrar API de facturación electrónica (mock inicial)
  - Crear función callInvoiceAPI(invoiceData) en InvoiceService
  - Implementar versión mock que simula respuesta de API
  - Documentar estructura de request/response
  - Preparar para integración real posterior
  - _Requisitos: 13.2_

- [x] 66. Crear vista de gestión de facturas
  - Crear archivo InvoiceList.html
  - Mostrar listado de facturas con DataTables
  - Implementar filtros por fecha, cliente, estado
  - Agregar botones: Ver PDF, Reenviar por email
  - Mostrar estado de envío
  - _Requisitos: 13.5_

- [x] 67. Integrar facturación con POS
  - Agregar botón "Facturar" en vista de venta confirmada
  - Solicitar datos fiscales del cliente si no existen
  - Generar factura automáticamente
  - Enviar por email al cliente
  - Mostrar confirmación de envío
  - _Requisitos: 13.1, 13.4_


- [x] 68. Optimizar rendimiento con caché
  - Implementar caché de productos con TTL 5 minutos
  - Implementar caché de usuarios con TTL 10 minutos
  - Implementar caché de parámetros con TTL 15 minutos
  - Invalidar caché al modificar datos
  - _Requisitos: 29.1, 29.2, 29.3, 29.4_

- [x] 69. Implementar paginación en todos los listados
  - Revisar todas las vistas con DataTables
  - Configurar paginación para listados > 100 registros
  - Configurar tamaños de página: 25, 50, 100
  - Mantener filtros y ordenamiento entre páginas
  - _Requisitos: 28.1, 28.2, 28.3, 28.4, 28.5_

- [x] 70. Implementar auditoría completa
  - Revisar que todas las operaciones críticas llaman a AuditRepository.log()
  - Verificar auditoría de: ventas, pagos, movimientos, cambios de precio, egresos, cierres
  - Implementar vista de consulta de log de auditoría
  - Implementar filtros por fecha, usuario, operación, entidad
  - _Requisitos: 18.1, 18.2, 18.3, 18.5_

- [ ]* 71. Escribir property tests para auditoría
  - **Propiedad 36: Trazabilidad de Auditoría**
  - **Valida: Requisitos 1.4, 3.4, 18.1, 18.2, 23.5, 24.5, 25.5**
  - **Propiedad 37: Inmutabilidad del Log de Auditoría**
  - **Valida: Requisitos 18.5**


- [x] 72. Implementar manejo robusto de errores
  - Crear clases de error personalizadas (BusinessError, SystemError)
  - Implementar try-catch en todos los servicios
  - Retornar respuestas JSON estructuradas con códigos de error
  - Implementar logging de errores
  - Mostrar mensajes de error amigables en UI
  - _Requisitos: 30.4_

- [ ]* 73. Escribir property tests para validaciones
  - **Propiedad 44: Validación de Datos de Entrada**
  - **Valida: Requisitos 30.1, 30.3, 30.4**

- [x] 74. Realizar testing exhaustivo de flujos completos
  - [x] 74.1 Escribir unit tests para flujo de venta contado completo
    - Test: Agregar productos, aplicar descuento, confirmar venta, verificar stock
    - _Requisitos: 6.1, 6.3, 25.4_
  
  - [x] 74.2 Escribir unit tests para flujo de venta crédito completo
    - Test: Crear venta crédito, verificar plan, verificar cuotas, verificar cupo
    - _Requisitos: 7.1, 7.3, 7.4, 7.5_
  
  - [x] 74.3 Escribir unit tests para flujo de cobranza completo
    - Test: Registrar pago, verificar aplicación a cuotas, verificar recibo
    - _Requisitos: 9.2, 9.3, 9.4, 9.5_
  
  - [x] 74.4 Escribir unit tests para flujo de caja completo
    - Test: Abrir turno, registrar egreso, cerrar turno, verificar cálculos
    - _Requisitos: 11.1, 11.3, 11.4, 12.4_


- [x] 75. Crear documentación completa del sistema
  - [ ] 75.1 Escribir guía de instalación y configuración
    - Instrucciones paso a paso para crear proyecto Apps Script
    - Configuración de permisos de Google
    - Creación de allowlist inicial
    - Configuración de parámetros del sistema
    - _Requisitos: 27.1_
  
  - [ ] 75.2 Escribir guía de roles y permisos
    - Matriz de roles vs permisos
    - Guía de asignación de roles por tienda
    - Casos de uso por rol
    - _Requisitos: 2.1, 2.2_
  
  - [ ] 75.3 Escribir guía de operación
    - Flujos de trabajo principales (POS, cobranzas, caja)
    - Resolución de problemas comunes
    - Mantenimiento de datos
    - Backup y recuperación
  
  - [ ] 75.4 Escribir guía de publicación y despliegue
    - Despliegue como WebApp
    - Configuración de URL pública
    - Gestión de versiones
    - Rollback en caso de errores

- [ ] 76. Realizar pruebas de aceptación con usuarios
  - Preparar ambiente de staging con datos de prueba
  - Realizar sesiones de prueba con usuarios finales
  - Recopilar feedback y ajustar según necesidad
  - Validar que todos los flujos funcionan correctamente


- [ ] 77. Checkpoint final - Verificar sistema completo
  - Verificar que todos los módulos están integrados
  - Verificar que la facturación funciona correctamente
  - Verificar que el rendimiento es aceptable
  - Verificar que la documentación está completa
  - Realizar pruebas de carga básicas
  - Preguntar al usuario si está listo para producción

### Milestone 7: Mejoras de Comunicación y Catálogos

- [x] 78. Implementar normalización de respuestas del backend
  - Crear archivo ResponseNormalizer.gs
  - Implementar función safeResponse(data) que convierta Date a ISO strings
  - Implementar función wrapResponse(fn) que envuelva operaciones en try-catch
  - Modificar todas las funciones llamadas por google.script.run para usar wrapResponse
  - Asegurar que todas las respuestas tienen estructura {success, data/error}
  - _Requisitos: 31.1, 31.2, 31.3_

- [ ]* 79. Escribir property tests para normalización de respuestas
  - **Propiedad 45: Normalización de Respuestas Backend**
  - **Valida: Requisitos 31.1**
  - **Propiedad 46: Estructura de Respuesta de Operaciones Críticas**
  - **Valida: Requisitos 31.2, 31.3**

- [x] 80. Actualizar renderBasePage para inyectar variables globales
  - Modificar función renderBasePage en Main.gs
  - Inyectar template.scriptUrl = ScriptApp.getService().getUrl()
  - Inyectar template.userName = userData.name
  - Verificar que las variables están disponibles en todas las páginas
  - _Requisitos: 31.4_

- [x] 81. Crear tablas maestras de atributos
  - Crear hoja CAT_Lines con headers y formato
  - Crear hoja CAT_Categories con headers y formato
  - Crear hoja CAT_Brands con headers y formato
  - Crear hoja CAT_Sizes con headers y formato
  - Crear hoja CAT_Suppliers con headers y formato
  - Poblar con datos de ejemplo
  - _Requisitos: 32.1_

- [x] 82. Implementar repositorios para tablas maestras
  - [x] 82.1 Crear LineRepository para CAT_Lines
    - Heredar de BaseRepository
    - Implementar método findByCode(code)
    - _Requisitos: 32.2_
  
  - [x] 82.2 Crear CategoryRepository para CAT_Categories
    - Heredar de BaseRepository
    - Implementar método findByLine(lineId)
    - _Requisitos: 32.2_
  
  - [x] 82.3 Crear BrandRepository para CAT_Brands
    - Heredar de BaseRepository
    - Implementar método findByCode(code)
    - _Requisitos: 32.2_
  
  - [x] 82.4 Crear SizeRepository para CAT_Sizes
    - Heredar de BaseRepository
    - Implementar método findByCode(code)
    - Implementar método findAllOrdered() ordenando por campo order
    - _Requisitos: 32.2_
  
  - [x] 82.5 Crear SupplierRepository para CAT_Suppliers
    - Heredar de BaseRepository
    - Implementar método findByCode(code)
    - Implementar método search(query)
    - _Requisitos: 32.2_

- [x] 83. Actualizar ProductRepository para validar atributos
  - Modificar método create() para validar line_id, category_id, brand_id, size_id
  - Verificar que los IDs existen en tablas maestras antes de crear producto
  - Lanzar error descriptivo si algún atributo no es válido
  - _Requisitos: 32.3, 32.5_

- [ ]* 84. Escribir property tests para integridad referencial
  - **Propiedad 47: Integridad Referencial de Atributos**
  - **Valida: Requisitos 32.3, 32.5**

- [x] 85. Implementar BulkProductService para ingreso masivo
  - Crear archivo BulkProductService.gs
  - Implementar createBulkProducts(baseProduct, sizeDistribution, purchasePrice)
  - Implementar _parseSizeDistribution(distribution) para parsear "2S, 3M, 4L"
  - Implementar _generateBarcode(baseProduct, size, index) para códigos únicos
  - Validar que las tallas especificadas existen en CAT_Sizes
  - Asignar automáticamente entry_date (fecha actual) a cada variante
  - _Requisitos: 33.1, 33.2, 33.3, 33.4, 33.5_

- [ ]* 86. Escribir property tests para ingreso masivo
  - **Propiedad 48: Unicidad de Códigos de Barras en Ingreso Masivo**
  - **Valida: Requisitos 33.4**
  - **Propiedad 49: Consistencia de Distribución de Tallas**
  - **Valida: Requisitos 33.2**

- [ ] 87. Crear vista de ingreso masivo de productos
  - Crear archivo BulkProductForm.html
  - Implementar formulario con campos: producto base, distribución de tallas, precio de compra
  - Agregar ayuda visual para formato de distribución (ej: "2S, 3M, 4L")
  - Mostrar preview de productos que se crearán antes de confirmar
  - Ejecutar createBulkProducts() al confirmar
  - Mostrar resumen de productos creados con códigos de barras
  - _Requisitos: 33.1, 33.2_

- [ ] 88. Crear vistas CRUD para tablas maestras
  - [ ] 88.1 Crear LineList.html y LineForm.html para líneas
    - Listado con DataTables
    - Formulario de creación/edición
    - _Requisitos: 32.1, 32.2_
  
  - [ ] 88.2 Crear CategoryList.html y CategoryForm.html para categorías
    - Listado con DataTables y filtro por línea
    - Formulario con selector de línea
    - _Requisitos: 32.1, 32.2_
  
  - [ ] 88.3 Crear BrandList.html y BrandForm.html para marcas
    - Listado con DataTables
    - Formulario de creación/edición
    - _Requisitos: 32.1, 32.2_
  
  - [ ] 88.4 Crear SizeList.html y SizeForm.html para tallas
    - Listado con DataTables ordenado por campo order
    - Formulario con campo order para ordenamiento
    - _Requisitos: 32.1, 32.2_
  
  - [ ] 88.5 Crear SupplierList.html y SupplierForm.html para proveedores
    - Listado con DataTables
    - Formulario completo con todos los campos
    - _Requisitos: 32.1, 32.2_

- [ ] 89. Checkpoint - Verificar catálogos maestros
  - Verificar que se pueden crear y editar atributos maestros
  - Verificar que el ingreso masivo funciona correctamente
  - Verificar que los códigos de barras son únicos
  - Verificar que la validación de integridad referencial funciona
  - Preguntar al usuario si hay dudas o ajustes necesarios

### Milestone 8: Fidelización y Dashboard Interactivo

- [x] 90. Agregar campo birthday a CRM_Clients
  - Modificar hoja CRM_Clients para incluir columna birthday
  - Actualizar ClientRepository para manejar el campo birthday
  - Actualizar ClientForm.html para incluir selector de fecha de cumpleaños
  - _Requisitos: 35.1_

- [x] 91. Implementar detección de cumpleaños en POS
  - Modificar POSService o crear BirthdayService
  - Implementar checkBirthday(clientId) que compare fecha actual con birthday
  - Modificar vista POS.html para mostrar alerta visual si es cumpleaños
  - Usar Bootstrap alert con estilo destacado (ej: alert-success con icono)
  - _Requisitos: 35.1, 35.2_

- [ ]* 92. Escribir property tests para detección de cumpleaños
  - **Propiedad 51: Detección de Cumpleaños**
  - **Valida: Requisitos 35.1, 35.2**

- [x] 93. Implementar descuento automático de cumpleaños
  - Agregar parámetro BIRTHDAY_DISCOUNT_PERCENT en CFG_Params (15-20%)
  - Modificar POSService para aplicar descuento automático si es cumpleaños
  - Agregar botón "Aplicar Descuento Cumpleaños" en POS
  - Registrar en auditoría con motivo BIRTHDAY_DISCOUNT
  - _Requisitos: 35.3_

- [x] 94. Implementar registro de obsequios de cumpleaños
  - Agregar tipo de movimiento GIFT_BIRTHDAY en sistema
  - Modificar POSService para permitir ventas con precio 0 y motivo GIFT_BIRTHDAY
  - Decrementar stock pero no generar ingreso en caja
  - Registrar movimiento de inventario con motivo GIFT_BIRTHDAY
  - Auditar obsequios de cumpleaños
  - _Requisitos: 35.4, 35.5_

- [ ]* 95. Escribir property tests para obsequios
  - **Propiedad 52: Invariante de Stock en Obsequios**
  - **Valida: Requisitos 35.4, 35.5**

- [x] 96. Implementar cálculo de mercadería estancada en dashboard
  - Modificar getDashboardData() en ReportService o DashboardService
  - Calcular productos con entry_date > 180 días
  - Retornar conteo de productos estancados
  - _Requisitos: 34.1_

- [x] 97. Agregar tarjeta de mercadería estancada al dashboard
  - Modificar Dashboard.html para incluir nueva tarjeta
  - Mostrar conteo de productos estancados
  - Hacer la tarjeta clickeable (botón o enlace)
  - Agregar icono apropiado (ej: bi-clock-history)
  - _Requisitos: 34.2_

- [x] 98. Crear vista de mercadería estancada
  - Crear archivo StalledInventory.html
  - Mostrar productos con entry_date > 180 días
  - Incluir columnas: nombre, talla, días en inventario, precio compra, precio venta
  - Calcular días en inventario dinámicamente
  - Implementar acciones: aplicar descuento, transferir, marcar para liquidación
  - _Requisitos: 34.3, 34.4, 34.5_

- [ ]* 99. Escribir property tests para mercadería estancada
  - **Propiedad 50: Cálculo de Mercadería Estancada**
  - **Valida: Requisitos 34.1, 34.2**

- [x] 100. Hacer tarjetas del dashboard interactivas
  - Modificar Dashboard.html para convertir tarjetas en botones/enlaces
  - Implementar función MapsTo(modulo, filtros) para navegación
  - Tarjeta "Ventas" → navegar a ventas con filtro fecha actual
  - Tarjeta "Cobros" → navegar a cobranzas con filtro cuotas del día
  - Tarjeta "Stock" → navegar a inventario
  - Tarjeta "Mercadería Estancada" → navegar a vista de estancados
  - Agregar estilos CSS: cursor pointer, hover effects
  - _Requisitos: 37.1, 37.2, 37.3, 37.4, 37.5_

- [x] 101. Agregar enlaces de Proveedores y Compras al sidebar
  - Modificar Layout.html para incluir nuevos enlaces
  - Agregar enlace "Proveedores" con icono bi-truck
  - Agregar enlace "Compras" con icono bi-cart-plus
  - Organizar sidebar en secciones: Ventas, Inventario, Finanzas, Configuración
  - Mantener estado activo según página actual
  - _Requisitos: 36.1, 36.2, 36.3, 36.4, 36.5_

- [x] 102. Implementar manejo robusto de errores en DataTables
  - Revisar todos los archivos HTML con DataTables
  - Agregar parámetro error: function(xhr, error, thrown) {...} en configuración Ajax
  - En función error: limpiar tabla, mostrar mensaje amigable, registrar en console
  - Agregar botón "Reintentar" para recargar datos
  - Implementar función global handleDataTableError() reutilizable
  - _Requisitos: 38.1, 38.2, 38.3, 38.4, 38.5_

- [ ]* 103. Escribir property tests para manejo de errores
  - **Propiedad 53: Manejo de Errores en DataTables**
  - **Valida: Requisitos 38.1, 38.2**

- [x] 104. Checkpoint - Verificar fidelización y dashboard
  - Verificar que las alertas de cumpleaños funcionan
  - Verificar que los descuentos y obsequios se registran correctamente
  - Verificar que la mercadería estancada se calcula bien
  - Verificar que las tarjetas del dashboard son interactivas
  - Verificar que el manejo de errores en DataTables funciona
  - Preguntar al usuario si hay dudas o ajustes necesarios

## Notas

- Las tareas marcadas con `*` son opcionales (principalmente tests) y pueden omitirse para un MVP más rápido
- Cada tarea referencia los requisitos específicos que implementa para trazabilidad
- Los checkpoints aseguran validación incremental y permiten ajustes tempranos
- Los property tests validan propiedades universales con 100+ iteraciones
- Los unit tests validan ejemplos específicos y casos de borde
- La implementación sigue el patrón de capas: Presentation → Business Logic → Data Access → Persistence
- Se recomienda seguir el orden de los milestones para construcción incremental
- Cada milestone entrega funcionalidad completa y testeable
- Los nuevos milestones 7 y 8 agregan: comunicación segura, catálogos maestros, ingreso masivo, fidelización, dashboard interactivo y manejo robusto de errores
