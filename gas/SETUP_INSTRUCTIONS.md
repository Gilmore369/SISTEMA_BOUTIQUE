# Instrucciones de Configuración - Setup.gs

## Descripción

El archivo `Setup.gs` contiene un script de configuración automática que crea todas las hojas necesarias para el sistema Adiction Boutique Suite con sus headers, formato y validaciones de datos.

## Hojas Creadas (14 total)

1. **CFG_Users** - Usuarios y roles del sistema
2. **CFG_Params** - Parámetros de configuración
3. **CAT_Products** - Catálogo de productos
4. **INV_Stock** - Stock por almacén
5. **INV_Movements** - Movimientos de inventario
6. **CRM_Clients** - Clientes
7. **POS_Sales** - Ventas
8. **POS_SaleItems** - Items de venta
9. **CRD_Plans** - Planes de crédito
10. **CRD_Installments** - Cuotas
11. **CRD_Payments** - Pagos
12. **CASH_Shifts** - Turnos de caja
13. **CASH_Expenses** - Egresos
14. **AUD_Log** - Log de auditoría

## Cómo Usar

### Paso 1: Abrir el Editor de Apps Script

1. Abre tu Google Spreadsheet
2. Ve a **Extensiones** > **Apps Script**
3. Copia el contenido del archivo `Setup.gs` en el editor

### Paso 2: Ejecutar la Función

1. En el editor de Apps Script, selecciona la función `setupSheets` del menú desplegable
2. Haz clic en el botón **Ejecutar** (▶️)
3. La primera vez, se te pedirá autorizar los permisos necesarios
4. Acepta los permisos para que el script pueda modificar tu hoja de cálculo

### Paso 3: Verificar

Una vez completada la ejecución:
- Verás un mensaje de confirmación: "✅ Configuración completada!"
- Todas las 14 hojas estarán creadas con sus headers formateados
- Los headers tendrán fondo azul (#4285F4) y texto blanco en negrita
- Las columnas tendrán anchos apropiados para su contenido
- Las validaciones de datos estarán configuradas

## Características Implementadas

### Formato de Headers
- **Negrita**: Todos los headers están en negrita
- **Color de fondo**: Azul (#4285F4)
- **Color de texto**: Blanco (#FFFFFF)
- **Alineación**: Centrado horizontal y vertical
- **Fila congelada**: La primera fila está congelada para facilitar el scroll

### Validaciones de Datos

#### CFG_Users
- Columna `active`: Checkbox (TRUE/FALSE)

#### CFG_Params
- Columna `type`: Lista desplegable (NUMBER, STRING, BOOLEAN, JSON)

#### CAT_Products
- Columna `price`: Formato de moneda ($#,##0.00)
- Columna `active`: Checkbox (TRUE/FALSE)

#### INV_Stock
- Columna `quantity`: Formato condicional (rojo si < 10)

#### INV_Movements
- Columna `type`: Lista desplegable (ENTRADA, SALIDA, AJUSTE, TRANSFERENCIA_OUT, TRANSFERENCIA_IN)

#### CRM_Clients
- Columnas `credit_limit` y `credit_used`: Formato de moneda
- Columna `active`: Checkbox (TRUE/FALSE)

#### POS_Sales
- Columnas `subtotal`, `discount`, `total`: Formato de moneda
- Columna `sale_type`: Lista desplegable (CONTADO, CREDITO)
- Columna `payment_status`: Lista desplegable (PAID, PENDING, PARTIAL)
- Columna `voided`: Checkbox (TRUE/FALSE)

#### POS_SaleItems
- Columnas `unit_price` y `subtotal`: Formato de moneda

#### CRD_Plans
- Columnas `total_amount` y `installment_amount`: Formato de moneda
- Columna `status`: Lista desplegable (ACTIVE, COMPLETED, CANCELLED)

#### CRD_Installments
- Columnas `amount` y `paid_amount`: Formato de moneda
- Columna `status`: Lista desplegable (PENDING, PARTIAL, PAID, OVERDUE)
- Formato condicional:
  - OVERDUE: Fondo rojo (#F4CCCC)
  - PAID: Fondo verde (#D9EAD3)

#### CRD_Payments
- Columna `amount`: Formato de moneda

#### CASH_Shifts
- Columnas `opening_amount`, `closing_amount`, `expected_amount`, `difference`: Formato de moneda
- Formato condicional en `difference`:
  - Negativo: Fondo rojo (#F4CCCC)
  - Positivo: Fondo amarillo (#FFF2CC)

#### CASH_Expenses
- Columna `amount`: Formato de moneda

#### AUD_Log
- **Protección**: Hoja protegida con advertencia (solo lectura)
- Esto garantiza la inmutabilidad del log de auditoría

## Anchos de Columnas

Cada hoja tiene anchos de columna optimizados para su contenido:
- IDs: 200px
- Emails: 250px
- Nombres: 200px
- Descripciones: 300-400px
- Montos: 100-120px
- Fechas: 150px
- URLs: 250px

## Notas Importantes

### Si las Hojas Ya Existen
- El script **limpiará** las hojas existentes antes de recrearlas
- Esto significa que **perderás todos los datos** en esas hojas
- Asegúrate de hacer un backup antes de ejecutar el script si ya tienes datos

### Protección del Log de Auditoría
- La hoja `AUD_Log` está protegida contra modificaciones
- Solo se permite la inserción de nuevos registros
- Esto garantiza la integridad del log de auditoría

### Personalización
Si necesitas modificar el formato o las validaciones:
1. Edita las funciones correspondientes en `Setup.gs`
2. Vuelve a ejecutar `setupSheets()`
3. Las hojas se recrearán con los nuevos ajustes

## Requisitos Validados

Este script valida los siguientes requisitos del sistema:
- **Requisito 27.1**: Plantilla de Google Sheets con estructura completa
- **Requisito 27.2**: Fórmulas y validaciones de datos en celdas apropiadas

## Próximos Pasos

Después de ejecutar este script:
1. Ejecuta el script de datos de ejemplo (Tarea 4) para poblar las hojas
2. Configura los parámetros del sistema en `CFG_Params`
3. Agrega los usuarios autorizados en `CFG_Users`
4. Comienza a usar el sistema

## Soporte

Si encuentras algún problema durante la configuración:
1. Verifica que tienes permisos de edición en la hoja de cálculo
2. Revisa el log de ejecución en Apps Script (Ver > Registros)
3. Asegúrate de haber autorizado todos los permisos necesarios
