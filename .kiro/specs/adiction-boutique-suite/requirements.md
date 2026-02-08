# Documento de Requisitos: Adiction Boutique Suite

## Introducción

Adiction Boutique Suite es un sistema integral de gestión para dos tiendas de ropa (Mujeres y Hombres) que incluye punto de venta (POS), gestión de inventario, crédito y cobranzas, caja y facturación electrónica. El sistema está construido 100% con Google Apps Script, utilizando Google Sheets como base de datos, Google Drive para almacenamiento de archivos y Gmail para envío de comprobantes.

## Glosario

- **Sistema**: Adiction Boutique Suite
- **Usuario**: Persona autenticada con cuenta Google que tiene acceso al sistema
- **Tienda**: Establecimiento físico (Adiction Boutique Mujeres o Adiction Boutique Hombres)
- **Almacén**: Depósito de inventario asociado a una tienda
- **Producto**: Artículo de ropa en el catálogo con código de barras, precio y stock
- **Venta**: Transacción de compra realizada en el POS (contado o crédito)
- **Cliente**: Persona registrada en el sistema con capacidad de compra a crédito
- **Plan_Crédito**: Esquema de pago en cuotas (1-6 cuotas sin interés)
- **Cuota**: Pago parcial programado dentro de un plan de crédito
- **Pago**: Registro de dinero recibido aplicado a cuotas pendientes
- **Turno_Caja**: Período de operación de caja con apertura y cierre
- **Factura_Electrónica**: Comprobante fiscal generado y enviado por email
- **Movimiento_Inventario**: Registro de entrada/salida de productos en almacén
- **Recibo**: Comprobante de pago entregado al cliente
- **Egreso**: Salida de dinero de caja por gastos operativos
- **RequestId**: Identificador único para garantizar idempotencia en operaciones críticas
- **Lock**: Mecanismo de bloqueo para prevenir condiciones de carrera
- **Rol**: Conjunto de permisos asignados a un usuario (Admin, Vendedor, Cajero, Cobrador)

## Requisitos

### Requisito 1: Autenticación y Control de Acceso

**User Story:** Como administrador del sistema, quiero que solo usuarios autorizados con cuentas Google específicas puedan acceder al sistema, para garantizar la seguridad y trazabilidad de las operaciones.

#### Criterios de Aceptación

1. WHEN un usuario intenta acceder al sistema, THE Sistema SHALL validar que su cuenta Google esté en la lista de usuarios permitidos (allowlist)
2. IF un usuario no está en la allowlist, THEN THE Sistema SHALL denegar el acceso y mostrar un mensaje de error
3. WHEN un usuario autorizado inicia sesión, THE Sistema SHALL cargar sus roles y permisos asociados
4. THE Sistema SHALL registrar cada intento de acceso (exitoso o fallido) en el log de auditoría
5. WHERE un usuario tiene múltiples roles, THE Sistema SHALL aplicar la unión de todos los permisos asociados

### Requisito 2: Gestión de Roles y Permisos

**User Story:** Como administrador, quiero asignar roles específicos a cada usuario por tienda, para controlar qué operaciones puede realizar cada persona.

#### Criterios de Aceptación

1. THE Sistema SHALL soportar los roles: Admin, Vendedor, Cajero y Cobrador
2. WHEN se asigna un rol a un usuario, THE Sistema SHALL asociarlo con una tienda específica (Mujeres o Hombres)
3. THE Sistema SHALL permitir que un usuario tenga diferentes roles en diferentes tiendas
4. WHEN un usuario intenta realizar una operación, THE Sistema SHALL verificar que tiene los permisos necesarios según su rol
5. IF un usuario no tiene permisos para una operación, THEN THE Sistema SHALL denegar la acción y registrar el intento en auditoría

### Requisito 3: Gestión de Catálogo de Productos

**User Story:** Como vendedor, quiero mantener un catálogo actualizado de productos con códigos de barras, precios y descripciones, para facilitar las ventas y el control de inventario.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir crear productos con: código de barras, nombre, descripción, precio, categoría y estado (activo/inactivo)
2. WHEN se crea un producto, THE Sistema SHALL validar que el código de barras sea único
3. THE Sistema SHALL permitir buscar productos por código de barras, nombre o categoría
4. WHEN se actualiza el precio de un producto, THE Sistema SHALL registrar el cambio en auditoría
5. THE Sistema SHALL mantener el catálogo en caché para mejorar el rendimiento de consultas

### Requisito 4: Control de Inventario por Almacén

**User Story:** Como administrador, quiero controlar el stock de productos en cada almacén en tiempo real, para evitar ventas sin disponibilidad y mantener niveles óptimos de inventario.

#### Criterios de Aceptación

1. THE Sistema SHALL mantener el stock actual de cada producto por almacén
2. WHEN se realiza una venta, THE Sistema SHALL decrementar el stock del almacén correspondiente
3. WHEN el stock de un producto cae por debajo del nivel mínimo, THE Sistema SHALL generar una alerta
4. THE Sistema SHALL registrar cada movimiento de inventario con: fecha, tipo (entrada/salida/ajuste/transferencia), cantidad, usuario y motivo
5. WHEN se intenta vender un producto sin stock suficiente, THE Sistema SHALL rechazar la operación

### Requisito 5: Transferencias entre Almacenes

**User Story:** Como administrador, quiero transferir productos entre almacenes, para balancear el inventario según la demanda de cada tienda.

#### Criterios de Aceptación

1. WHEN se solicita una transferencia, THE Sistema SHALL validar que el almacén origen tenga stock suficiente
2. THE Sistema SHALL utilizar locks para garantizar atomicidad en la transferencia
3. WHEN se ejecuta una transferencia, THE Sistema SHALL decrementar el stock del almacén origen e incrementar el del destino
4. THE Sistema SHALL registrar dos movimientos de inventario: salida en origen y entrada en destino
5. THE Sistema SHALL vincular ambos movimientos con un identificador de transferencia común

### Requisito 6: Punto de Venta (POS) - Ventas al Contado

**User Story:** Como vendedor, quiero registrar ventas al contado de forma rápida y precisa, para procesar transacciones eficientemente.

#### Criterios de Aceptación

1. WHEN se agrega un producto al carrito, THE Sistema SHALL validar que existe stock disponible
2. THE Sistema SHALL permitir escanear códigos de barras usando la cámara del dispositivo móvil
3. WHEN se confirma una venta al contado, THE Sistema SHALL crear el registro de venta, decrementar stock y generar un ticket
4. THE Sistema SHALL utilizar un requestId para garantizar que cada venta se procese una sola vez (idempotencia)
5. THE Sistema SHALL aplicar locks durante la creación de la venta para prevenir condiciones de carrera

### Requisito 7: Punto de Venta (POS) - Ventas a Crédito

**User Story:** Como vendedor, quiero ofrecer ventas a crédito con planes de hasta 6 cuotas sin interés, para incrementar las ventas y fidelizar clientes.

#### Criterios de Aceptación

1. WHEN se selecciona venta a crédito, THE Sistema SHALL validar que el cliente tenga cupo disponible
2. THE Sistema SHALL permitir seleccionar un plan de 1 a 6 cuotas sin interés
3. WHEN se confirma una venta a crédito, THE Sistema SHALL crear la venta, el plan de crédito y las cuotas correspondientes
4. THE Sistema SHALL calcular el monto de cada cuota dividiendo el total entre el número de cuotas
5. THE Sistema SHALL decrementar el cupo disponible del cliente por el monto total de la venta

### Requisito 8: Gestión de Clientes

**User Story:** Como vendedor, quiero registrar y mantener información completa de clientes, para gestionar créditos y personalizar el servicio.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir crear clientes con: nombre, DNI, teléfono, dirección, email, cupo de crédito y foto del DNI
2. WHEN se registra un cliente, THE Sistema SHALL validar que el DNI sea único
3. THE Sistema SHALL permitir capturar la geolocalización del domicilio del cliente
4. THE Sistema SHALL almacenar la foto del DNI en Google Drive y guardar el enlace en el registro del cliente
5. THE Sistema SHALL mostrar el historial completo de compras y pagos del cliente

### Requisito 9: Cobranzas y Gestión de Cuotas

**User Story:** Como cobrador, quiero visualizar y gestionar las cuotas pendientes de pago, para realizar cobranzas efectivas y mantener la cartera sana.

#### Criterios de Aceptación

1. THE Sistema SHALL mostrar bandejas de cobranza: vencidas, por vencer hoy, por vencer esta semana
2. WHEN se registra un pago, THE Sistema SHALL aplicarlo a las cuotas más antiguas vencidas primero (oldest_due_first)
3. THE Sistema SHALL permitir pagos parciales que cubran una o más cuotas
4. WHEN se completa el pago de una cuota, THE Sistema SHALL actualizar su estado a "Pagada"
5. THE Sistema SHALL generar un recibo por cada pago registrado

### Requisito 10: Recibos de Pago

**User Story:** Como cajero, quiero generar recibos de pago automáticos, para entregar comprobantes a los clientes y mantener registro de las transacciones.

#### Criterios de Aceptación

1. WHEN se registra un pago, THE Sistema SHALL generar un recibo con: número correlativo, fecha, cliente, monto, cuotas pagadas y saldo pendiente
2. THE Sistema SHALL almacenar el recibo en formato PDF en Google Drive
3. THE Sistema SHALL permitir imprimir o enviar el recibo por email al cliente
4. THE Sistema SHALL vincular el recibo con el registro de pago en la base de datos
5. THE Sistema SHALL permitir consultar y reimprimir recibos históricos

### Requisito 11: Gestión de Caja y Turnos

**User Story:** Como cajero, quiero abrir y cerrar turnos de caja con arqueo, para controlar el efectivo y cuadrar las operaciones del día.

#### Criterios de Aceptación

1. WHEN se abre un turno, THE Sistema SHALL registrar: fecha/hora, usuario, monto inicial y tienda
2. THE Sistema SHALL permitir un solo turno abierto por tienda simultáneamente
3. WHEN se cierra un turno, THE Sistema SHALL calcular: ventas contado, cobros, egresos, monto esperado y monto real
4. THE Sistema SHALL calcular la diferencia (faltante/sobrante) entre monto esperado y real
5. THE Sistema SHALL registrar el cierre con firma digital del cajero y supervisor

### Requisito 12: Registro de Egresos

**User Story:** Como cajero, quiero registrar egresos de caja con comprobantes, para controlar gastos operativos y mantener el flujo de efectivo.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir registrar egresos con: fecha, monto, concepto, categoría y comprobante
2. WHEN se registra un egreso, THE Sistema SHALL validar que existe un turno de caja abierto
3. THE Sistema SHALL permitir adjuntar foto o PDF del comprobante almacenándolo en Google Drive
4. THE Sistema SHALL decrementar el efectivo disponible en el turno actual
5. THE Sistema SHALL requerir autorización de supervisor para egresos mayores a un monto configurado

### Requisito 13: Facturación Electrónica

**User Story:** Como cajero, quiero generar y enviar facturas electrónicas por email, para cumplir con obligaciones fiscales y entregar comprobantes a los clientes.

#### Criterios de Aceptación

1. WHEN se solicita facturar una venta, THE Sistema SHALL generar una factura electrónica con todos los datos fiscales requeridos
2. THE Sistema SHALL permitir integración con API de facturación electrónica o registro manual
3. WHEN se genera una factura, THE Sistema SHALL almacenar el PDF en Google Drive
4. THE Sistema SHALL enviar la factura por email al cliente usando GmailApp con el PDF adjunto
5. THE Sistema SHALL registrar el envío de la factura con fecha, destinatario y estado

### Requisito 14: Envío de Comprobantes por Email

**User Story:** Como sistema, quiero enviar comprobantes (facturas, recibos) por email de forma automática, para entregar documentación a los clientes sin intervención manual.

#### Criterios de Aceptación

1. WHEN se envía un comprobante, THE Sistema SHALL obtener el archivo PDF desde Google Drive
2. THE Sistema SHALL construir un email HTML con formato profesional incluyendo logo y datos de la tienda
3. THE Sistema SHALL adjuntar el PDF al email usando GmailApp
4. WHEN el envío es exitoso, THE Sistema SHALL registrar la fecha y hora de envío
5. IF el envío falla, THEN THE Sistema SHALL registrar el error y permitir reintento manual

### Requisito 15: Reportes de Ventas

**User Story:** Como administrador, quiero consultar reportes de ventas por período, tienda y vendedor, para analizar el desempeño del negocio.

#### Criterios de Aceptación

1. THE Sistema SHALL generar reportes de ventas con filtros por: fecha inicio/fin, tienda, vendedor y tipo de venta (contado/crédito)
2. THE Sistema SHALL mostrar: cantidad de ventas, monto total, ticket promedio y productos más vendidos
3. THE Sistema SHALL permitir exportar los reportes a formato Excel
4. THE Sistema SHALL calcular comparativas con períodos anteriores (variación porcentual)
5. THE Sistema SHALL mostrar gráficos visuales de tendencias de ventas

### Requisito 16: Reportes de Inventario

**User Story:** Como administrador, quiero consultar reportes de inventario y movimientos, para controlar el stock y detectar irregularidades.

#### Criterios de Aceptación

1. THE Sistema SHALL generar reportes de stock actual por almacén con: producto, cantidad, valor y estado de alerta
2. THE Sistema SHALL mostrar movimientos de inventario con filtros por: fecha, almacén, tipo de movimiento y producto
3. THE Sistema SHALL calcular el valor total del inventario por almacén
4. THE Sistema SHALL identificar productos sin movimiento en un período configurable
5. THE Sistema SHALL mostrar productos con stock por debajo del nivel mínimo

### Requisito 17: Reportes de Cuentas por Cobrar

**User Story:** Como administrador, quiero consultar el estado de las cuentas por cobrar, para evaluar la salud financiera y tomar decisiones de crédito.

#### Criterios de Aceptación

1. THE Sistema SHALL generar reportes de cartera con: total por cobrar, vencido, por vencer y al día
2. THE Sistema SHALL mostrar antigüedad de saldos: 0-30 días, 31-60 días, 61-90 días, más de 90 días
3. THE Sistema SHALL listar los top clientes con mayor deuda
4. THE Sistema SHALL calcular el índice de morosidad (vencido / total cartera)
5. THE Sistema SHALL permitir filtrar por tienda y rango de fechas

### Requisito 18: Auditoría y Trazabilidad

**User Story:** Como administrador, quiero que todas las operaciones críticas queden registradas en un log de auditoría, para garantizar trazabilidad y detectar irregularidades.

#### Criterios de Aceptación

1. THE Sistema SHALL registrar en auditoría: fecha/hora, usuario, operación, entidad afectada, valores anteriores y nuevos
2. THE Sistema SHALL auditar operaciones críticas: ventas, pagos, movimientos de inventario, cambios de precios, egresos y cierres de caja
3. THE Sistema SHALL permitir consultar el log de auditoría con filtros por: fecha, usuario, operación y entidad
4. THE Sistema SHALL mantener el log de auditoría por tiempo indefinido
5. THE Sistema SHALL proteger el log contra modificaciones (solo inserción)

### Requisito 19: Concurrencia y Consistencia de Datos

**User Story:** Como sistema, quiero garantizar la consistencia de datos en operaciones concurrentes, para evitar condiciones de carrera y corrupción de datos.

#### Criterios de Aceptación

1. WHEN se ejecuta una operación crítica (venta, pago, transferencia), THE Sistema SHALL adquirir un lock usando LockService
2. THE Sistema SHALL liberar el lock automáticamente al finalizar la operación o después de un timeout
3. IF no se puede adquirir un lock, THEN THE Sistema SHALL reintentar hasta 3 veces con espera exponencial
4. IF no se puede adquirir el lock después de los reintentos, THEN THE Sistema SHALL rechazar la operación con mensaje de error
5. THE Sistema SHALL utilizar locks con alcance apropiado (documento o script) según la operación

### Requisito 20: Idempotencia en Operaciones Críticas

**User Story:** Como sistema, quiero garantizar que operaciones críticas no se ejecuten múltiples veces por error, para evitar duplicación de ventas, pagos o movimientos.

#### Criterios de Aceptación

1. WHEN se inicia una operación crítica, THE Sistema SHALL generar o recibir un requestId único
2. THE Sistema SHALL validar que el requestId no haya sido procesado previamente
3. IF el requestId ya fue procesado, THEN THE Sistema SHALL retornar el resultado de la operación original sin ejecutarla nuevamente
4. THE Sistema SHALL almacenar el requestId y resultado de operaciones críticas por al menos 24 horas
5. THE Sistema SHALL aplicar idempotencia a: creación de ventas, registro de pagos, movimientos de inventario y transferencias

### Requisito 21: Interfaz de Usuario Responsive

**User Story:** Como usuario, quiero una interfaz moderna y responsive que funcione en laptops y dispositivos móviles, para operar el sistema desde cualquier dispositivo.

#### Criterios de Aceptación

1. THE Sistema SHALL utilizar Bootstrap 5 para el diseño de la interfaz
2. THE Sistema SHALL adaptar la interfaz automáticamente a diferentes tamaños de pantalla (desktop, tablet, móvil)
3. THE Sistema SHALL utilizar DataTables para listados con paginación, búsqueda y ordenamiento
4. THE Sistema SHALL utilizar Bootstrap Icons para iconografía consistente
5. THE Sistema SHALL seguir un estilo visual similar a Laravel AdminLTE con sidebar y topbar

### Requisito 22: Escaneo de Códigos de Barras con Cámara

**User Story:** Como vendedor, quiero escanear códigos de barras usando la cámara de mi dispositivo móvil, para agilizar el proceso de venta sin necesidad de escáner dedicado.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir activar la cámara del dispositivo para escanear códigos de barras
2. WHEN se detecta un código de barras válido, THE Sistema SHALL buscar el producto automáticamente
3. THE Sistema SHALL agregar el producto al carrito si se encuentra en el catálogo
4. IF el código no corresponde a ningún producto, THEN THE Sistema SHALL mostrar un mensaje de error
5. THE Sistema SHALL funcionar en navegadores móviles modernos (Chrome, Safari)

### Requisito 23: Anulación de Ventas

**User Story:** Como supervisor, quiero anular ventas con justificación, para corregir errores y mantener la integridad de los registros.

#### Criterios de Aceptación

1. WHEN se solicita anular una venta, THE Sistema SHALL validar que el usuario tiene permisos de supervisor
2. THE Sistema SHALL requerir un motivo de anulación obligatorio
3. WHEN se anula una venta, THE Sistema SHALL revertir el movimiento de inventario incrementando el stock
4. IF la venta fue a crédito, THEN THE Sistema SHALL cancelar el plan de crédito y restaurar el cupo del cliente
5. THE Sistema SHALL registrar la anulación en auditoría con usuario, fecha y motivo

### Requisito 24: Reprogramación de Cuotas

**User Story:** Como cobrador, quiero reprogramar cuotas vencidas con autorización, para ofrecer facilidades de pago a clientes con dificultades temporales.

#### Criterios de Aceptación

1. WHEN se solicita reprogramar cuotas, THE Sistema SHALL validar que el usuario tiene permisos de supervisor
2. THE Sistema SHALL permitir modificar las fechas de vencimiento de cuotas pendientes
3. THE Sistema SHALL requerir un motivo de reprogramación obligatorio
4. WHEN se reprograma una cuota, THE Sistema SHALL actualizar su fecha de vencimiento y estado
5. THE Sistema SHALL registrar la reprogramación en auditoría con usuario, fecha, motivo y valores anteriores/nuevos

### Requisito 25: Descuentos en Ventas

**User Story:** Como vendedor, quiero aplicar descuentos a ventas con autorización, para ofrecer promociones y cerrar ventas estratégicas.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir aplicar descuentos por monto fijo o porcentaje
2. WHEN el descuento supera un umbral configurado, THE Sistema SHALL requerir autorización de supervisor
3. THE Sistema SHALL registrar el descuento aplicado en el detalle de la venta
4. THE Sistema SHALL calcular el total de la venta después de aplicar el descuento
5. THE Sistema SHALL registrar en auditoría los descuentos aplicados con usuario autorizador

### Requisito 26: Configuración de Parámetros del Sistema

**User Story:** Como administrador, quiero configurar parámetros del sistema centralizadamente, para adaptar el comportamiento sin modificar código.

#### Criterios de Aceptación

1. THE Sistema SHALL mantener parámetros configurables en una hoja dedicada (CFG_Params)
2. THE Sistema SHALL permitir configurar: niveles mínimos de stock, umbral de descuentos, monto máximo de egresos sin autorización, días de gracia para cuotas
3. WHEN se modifica un parámetro, THE Sistema SHALL aplicar el cambio inmediatamente sin reinicio
4. THE Sistema SHALL validar que los valores de parámetros estén en rangos permitidos
5. THE Sistema SHALL registrar cambios de parámetros en auditoría

### Requisito 27: Datos de Ejemplo y Plantilla

**User Story:** Como implementador, quiero una plantilla de Google Sheets con estructura completa y datos de ejemplo, para facilitar la instalación y pruebas del sistema.

#### Criterios de Aceptación

1. THE Sistema SHALL incluir una plantilla de Google Sheets con todas las hojas necesarias
2. THE Sistema SHALL incluir datos de ejemplo: usuarios, productos, clientes, ventas y pagos
3. THE Sistema SHALL incluir fórmulas y validaciones de datos en las celdas apropiadas
4. THE Sistema SHALL incluir formato condicional para resaltar alertas y estados
5. THE Sistema SHALL incluir instrucciones de configuración inicial en una hoja dedicada

### Requisito 28: Paginación en Listados

**User Story:** Como usuario, quiero que los listados grandes se paginen automáticamente, para mejorar el rendimiento y la experiencia de uso.

#### Criterios de Aceptación

1. THE Sistema SHALL paginar listados que superen 100 registros
2. THE Sistema SHALL permitir configurar el tamaño de página (25, 50, 100 registros)
3. THE Sistema SHALL mostrar controles de navegación entre páginas
4. THE Sistema SHALL mantener filtros y ordenamiento al cambiar de página
5. THE Sistema SHALL mostrar el total de registros y la página actual

### Requisito 29: Caché de Catálogos

**User Story:** Como sistema, quiero mantener catálogos frecuentemente consultados en caché, para reducir lecturas a Google Sheets y mejorar el rendimiento.

#### Criterios de Aceptación

1. THE Sistema SHALL cachear el catálogo de productos con tiempo de vida de 5 minutos
2. THE Sistema SHALL cachear la lista de usuarios y roles con tiempo de vida de 10 minutos
3. WHEN se modifica un catálogo, THE Sistema SHALL invalidar el caché correspondiente
4. THE Sistema SHALL utilizar CacheService de Apps Script para almacenar cachés
5. THE Sistema SHALL implementar fallback a lectura directa si el caché no está disponible

### Requisito 30: Validación de Datos sin Librerías Externas

**User Story:** Como desarrollador, quiero validar datos de entrada usando solo código nativo de Apps Script, para evitar dependencias externas y simplificar el mantenimiento.

#### Criterios de Aceptación

1. THE Sistema SHALL validar todos los datos de entrada antes de procesarlos
2. THE Sistema SHALL implementar validaciones usando funciones nativas de JavaScript
3. THE Sistema SHALL validar: tipos de datos, rangos numéricos, formatos de fecha, longitudes de texto y valores requeridos
4. WHEN una validación falla, THE Sistema SHALL retornar mensajes de error descriptivos
5. THE Sistema SHALL NO utilizar librerías de validación externas

### Requisito 31: Comunicación Segura Backend-Frontend

**User Story:** Como desarrollador, quiero garantizar que la comunicación entre el backend (Apps Script) y el frontend (HTML) sea robusta y maneje errores correctamente, para evitar fallos silenciosos y pérdida de datos.

#### Criterios de Aceptación

1. THE Sistema SHALL normalizar todas las respuestas del backend convirtiendo objetos Date a strings ISO y manejando valores nulos
2. WHEN una función del backend es llamada por google.script.run, THE Sistema SHALL envolver la ejecución en try-catch y retornar un objeto estructurado {success: true/false, data/error}
3. THE Sistema SHALL garantizar que ninguna función llamada por google.script.run falle sin retornar un objeto de respuesta
4. WHEN se renderiza una página base, THE Sistema SHALL inyectar variables globales: scriptUrl y userName
5. THE Sistema SHALL proporcionar una función global safeResponse(data) para normalización consistente de datos

### Requisito 32: Gestión de Atributos y Proveedores

**User Story:** Como administrador, quiero gestionar catálogos maestros de líneas, categorías, marcas, tallas y proveedores, para mantener datos consistentes y facilitar el ingreso de productos.

#### Criterios de Aceptación

1. THE Sistema SHALL mantener tablas maestras para: CAT_Lines, CAT_Categories, CAT_Brands, CAT_Sizes y CAT_Suppliers
2. THE Sistema SHALL proporcionar repositorios para cada tabla maestra con operaciones CRUD
3. WHEN se crea un producto, THE Sistema SHALL validar que los atributos (línea, categoría, marca, talla) existen en las tablas maestras
4. THE Sistema SHALL permitir consultar y filtrar productos por cualquier atributo maestro
5. THE Sistema SHALL mantener integridad referencial entre productos y tablas maestras

### Requisito 33: Ingreso Masivo de Productos

**User Story:** Como administrador, quiero ingresar productos masivamente con distribución de tallas, para agilizar la carga de inventario de nuevas colecciones.

#### Criterios de Aceptación

1. THE Sistema SHALL proporcionar una función createBulkProducts que reciba: producto base, distribución de tallas y precio de compra
2. WHEN se especifica una distribución de tallas (ej: "2S, 3M, 4L"), THE Sistema SHALL crear una fila en CAT_Products por cada variante de talla
3. WHEN se crea cada variante, THE Sistema SHALL asignar automáticamente: purchase_price, entry_date (fecha actual) y un SKU/código único
4. THE Sistema SHALL generar códigos de barras únicos para cada variante y almacenarlos en la columna barcode
5. THE Sistema SHALL validar que la distribución de tallas especificada corresponde a tallas existentes en CAT_Sizes

### Requisito 34: Alertas de Mercadería Estancada

**User Story:** Como administrador, quiero identificar productos con más de 6 meses en inventario, para tomar decisiones de liquidación o promoción.

#### Criterios de Aceptación

1. WHEN se consulta el dashboard, THE Sistema SHALL calcular productos cuya entry_date sea mayor a 180 días
2. THE Sistema SHALL mostrar una tarjeta "Mercadería Estancada" en el dashboard con el conteo de productos
3. WHEN se hace clic en la tarjeta, THE Sistema SHALL navegar a una vista filtrada mostrando solo productos estancados
4. THE Sistema SHALL mostrar para cada producto estancado: nombre, talla, días en inventario, precio de compra y precio de venta
5. THE Sistema SHALL permitir aplicar acciones masivas a productos estancados (descuentos, transferencias)

### Requisito 35: Módulo de Cumpleaños y Fidelización

**User Story:** Como vendedor, quiero identificar clientes que cumplen años y ofrecerles beneficios especiales, para fidelizar y mejorar la experiencia del cliente.

#### Criterios de Aceptación

1. WHEN se carga un cliente en el POS, THE Sistema SHALL verificar si la fecha actual coincide con su fecha de cumpleaños
2. IF es el cumpleaños del cliente, THEN THE Sistema SHALL mostrar una alerta visual destacada en el POS
3. THE Sistema SHALL permitir aplicar un descuento automático de cumpleaños (15-20% configurable)
4. THE Sistema SHALL permitir registrar una salida de inventario con motivo GIFT_BIRTHDAY y precio 0
5. WHEN se registra un obsequio de cumpleaños, THE Sistema SHALL decrementar el stock pero no generar ingreso en caja

### Requisito 36: Navegación Mejorada y Accesos Directos

**User Story:** Como usuario, quiero acceder rápidamente a módulos de proveedores y compras desde el sidebar, para mejorar la eficiencia de navegación.

#### Criterios de Aceptación

1. THE Sistema SHALL incluir en el sidebar enlaces a "Proveedores" y "Compras"
2. WHEN se hace clic en "Proveedores", THE Sistema SHALL mostrar el listado de proveedores con DataTables
3. WHEN se hace clic en "Compras", THE Sistema SHALL mostrar el módulo de registro de compras a proveedores
4. THE Sistema SHALL mantener el estado activo del menú según la página actual
5. THE Sistema SHALL organizar el sidebar en secciones lógicas (Ventas, Inventario, Finanzas, Configuración)

### Requisito 37: Dashboard Interactivo con Filtros

**User Story:** Como usuario, quiero que las tarjetas del dashboard sean interactivas y me lleven a vistas filtradas, para navegar rápidamente a información relevante.

#### Criterios de Aceptación

1. WHEN se hace clic en la tarjeta "Ventas", THE Sistema SHALL navegar al módulo de ventas con filtro de fecha actual
2. WHEN se hace clic en la tarjeta "Cobros", THE Sistema SHALL navegar al módulo de cobranzas con filtro de cuotas del día
3. WHEN se hace clic en la tarjeta "Stock", THE Sistema SHALL navegar al módulo de inventario
4. WHEN se hace clic en la tarjeta "Mercadería Estancada", THE Sistema SHALL navegar al inventario filtrado por productos > 180 días
5. THE Sistema SHALL implementar las tarjetas como botones o enlaces con cursor pointer y hover effects

### Requisito 38: Manejo Robusto de Errores en DataTables

**User Story:** Como usuario, quiero que las tablas manejen errores de servidor gracefully, para evitar mensajes de error confusos y mantener la interfaz funcional.

#### Criterios de Aceptación

1. WHEN una llamada Ajax de DataTables falla, THE Sistema SHALL limpiar la tabla en lugar de mostrar error genérico
2. THE Sistema SHALL mostrar un mensaje amigable al usuario indicando que no se pudieron cargar los datos
3. THE Sistema SHALL registrar el error en el log del navegador para debugging
4. THE Sistema SHALL proporcionar un botón "Reintentar" para volver a cargar los datos
5. THE Sistema SHALL configurar el parámetro error en todas las instancias de DataTables con manejo personalizado

## Notas Finales

Este documento define los requisitos funcionales del sistema Adiction Boutique Suite. Todos los requisitos están escritos siguiendo los patrones EARS y las reglas de calidad INCOSE para garantizar claridad, testabilidad y completitud. Los requisitos cubren los módulos principales: autenticación, inventario, POS, clientes, crédito, cobranzas, caja, facturación, reportes, comunicación segura, gestión de atributos, ingreso masivo, alertas de mercadería, fidelización y navegación mejorada.
