# 🚀 Instrucciones de Puesta en Marcha - Adiction Boutique Suite

## ✅ Estado Actual del Sistema

El sistema **Adiction Boutique Suite** ha sido completamente desarrollado y desplegado en Google Apps Script con estructura optimizada. Todos los archivos están organizados correctamente y listos para funcionar.

### 📋 Información del Proyecto

- **Proyecto creado**: ✅ Completado
- **Archivos subidos**: ✅ 31 archivos desplegados (estructura optimizada)
- **Archivos HTML**: ✅ Sin prefijos de carpeta (acceso directo)
- **URL del proyecto**: https://script.google.com/d/1CrN7sUiCMrPMaszFuFwBG5Gh8g29pKJvtKE7ffIp26fheEVWGBb8lgth/edit

### 📁 Estructura Optimizada

**Archivos de Lógica (.gs):**
- ✅ `appsscript.json` - Configuración del proyecto
- ✅ `Const.gs` - Constantes del sistema
- ✅ `Errors.gs` - Manejo de errores
- ✅ `Util.gs` - Utilidades generales
- ✅ `Repo.gs` - Repositorio de datos
- ✅ `Services.gs` - Servicios principales
- ✅ `CreditService.gs` - Servicio de créditos
- ✅ `Code.gs` - Controladores principales
- ✅ `Setup.gs` - Configuración automática

**Archivos de Interfaz (.html):**
- ✅ `index.html` - Página principal
- ✅ `POS.html` - Punto de venta
- ✅ `ClientList.html` - Lista de clientes
- ✅ `ClientForm.html` - Formulario de clientes
- ✅ `ClientDetail.html` - Detalle de cliente
- ✅ `ProductList.html` - Lista de productos
- ✅ `ProductForm.html` - Formulario de productos
- ✅ `StockView.html` - Vista de inventario
- ✅ `MovementList.html` - Movimientos de inventario
- ✅ `TransferForm.html` - Transferencias
- ✅ `Collections.html` - Cobranzas
- ✅ `Cash.html` - Gestión de caja
- ✅ `SalesReport.html` - Reporte de ventas
- ✅ `InventoryReport.html` - Reporte de inventario
- ✅ `ARReport.html` - Cuentas por cobrar
- ✅ `AuditLog.html` - Log de auditoría
- ✅ `BarcodeScanner.html` - Escáner de códigos
- ✅ `InvoiceList.html` - Lista de facturas

**Archivos de Pruebas (.gs):**
- ✅ `Test_CreditService.gs` - Pruebas de créditos
- ✅ `Test_GenerateReceipt.gs` - Pruebas de recibos
- ✅ `Test_POSService_Credit.gs` - Pruebas de POS
- ✅ `Test_Util.gs` - Pruebas de utilidades

## 🎯 Pasos para Poner en Funcionamiento

### Paso 1: Crear Google Spreadsheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"Adiction Boutique Suite - Base de Datos"**

### Paso 2: Vincular el Script

1. En la hoja de cálculo, ve a **Extensiones** → **Apps Script**
2. Se abrirá el editor de Apps Script
3. Borra el código por defecto
4. Ve a la URL del proyecto: https://script.google.com/d/1CrN7sUiCMrPMaszFuFwBG5Gh8g29pKJvtKE7ffIp26fheEVWGBb8lgth/edit
5. Copia todo el código de cada archivo (.gs) y pégalo en el editor vinculado a tu hoja

### Paso 3: Configuración Automática Completa

1. En el editor de Apps Script vinculado a tu hoja
2. Selecciona la función **`setupCompleteSystem`** del menú desplegable
3. Haz clic en **Ejecutar** (▶️)
4. **Autoriza los permisos** cuando se solicite
5. Confirma la configuración cuando aparezca el diálogo
6. Espera a que termine (puede tomar 1-2 minutos)

### Paso 4: Verificar la Configuración

Después de ejecutar `setupCompleteSystem()`, verifica que se crearon:

#### 📊 Hojas Creadas (14 total):
- ✅ **CFG_Users** - 4 usuarios de ejemplo
- ✅ **CFG_Params** - 10 parámetros del sistema
- ✅ **CAT_Products** - 15 productos de ropa
- ✅ **INV_Stock** - 17 registros de stock
- ✅ **INV_Movements** - Movimientos de inventario
- ✅ **CRM_Clients** - 8 clientes de ejemplo
- ✅ **POS_Sales** - Ventas
- ✅ **POS_SaleItems** - Items de venta
- ✅ **CRD_Plans** - Planes de crédito
- ✅ **CRD_Installments** - Cuotas
- ✅ **CRD_Payments** - Pagos
- ✅ **CASH_Shifts** - Turnos de caja
- ✅ **CASH_Expenses** - Egresos
- ✅ **AUD_Log** - Log de auditoría (protegido)

### Paso 5: Configurar la Interfaz Web

1. En el editor de Apps Script, ve a **Implementar** → **Nueva implementación**
2. Selecciona tipo: **Aplicación web**
3. Configuración:
   - **Descripción**: "Adiction Boutique Suite v1.0"
   - **Ejecutar como**: "Yo"
   - **Quién tiene acceso**: "Cualquier persona"
4. Haz clic en **Implementar**
5. **Copia la URL** de la aplicación web
6. Guarda esta URL - será la interfaz principal del sistema

## 🔧 Configuración Inicial del Sistema

### Usuarios del Sistema (Ya configurados)

Los siguientes usuarios están preconfigurados:

1. **María González** - Admin
   - Email: admin@adictionboutique.com
   - Rol: Administrador en ambas tiendas

2. **Ana Rodríguez** - Vendedor Mujeres
   - Email: vendedor.mujeres@adictionboutique.com
   - Rol: Vendedor en tienda Mujeres

3. **Carlos Pérez** - Vendedor/Cajero Hombres
   - Email: vendedor.hombres@adictionboutique.com
   - Rol: Vendedor y Cajero en tienda Hombres

4. **Luis Martínez** - Cobrador
   - Email: cobrador@adictionboutique.com
   - Rol: Cobrador en ambas tiendas

### Parámetros del Sistema (Ya configurados)

- ✅ Nivel mínimo de stock: 10 unidades
- ✅ Descuento máximo sin autorización: $100
- ✅ Egreso máximo sin autorización: $500
- ✅ Días de gracia para cuotas: 3 días
- ✅ Límites de crédito configurados

## 🎮 Cómo Usar el Sistema

### Acceso Principal

1. **URL de la aplicación web**: (La que obtuviste en el Paso 5)
2. **Autenticación**: Usa cualquiera de los emails de usuario configurados
3. **Interfaz principal**: Sistema completo de punto de venta

### Funcionalidades Disponibles

#### 🛍️ Punto de Venta (POS)
- Ventas en efectivo y crédito
- Búsqueda de productos por código de barras
- Cálculo automático de totales y descuentos
- Generación de recibos

#### 👥 Gestión de Clientes
- Registro de nuevos clientes
- Consulta de historial crediticio
- Gestión de límites de crédito

#### 📦 Inventario
- Control de stock por almacén
- Movimientos de entrada/salida
- Transferencias entre almacenes
- Alertas de stock mínimo

#### 💰 Cobranzas
- Gestión de cuotas pendientes
- Registro de pagos
- Reportes de cuentas por cobrar

#### 💵 Caja
- Apertura y cierre de turnos
- Control de egresos
- Arqueo de caja

#### 📊 Reportes
- Ventas por período
- Inventario actual
- Cuentas por cobrar
- Auditoría completa

## 🔒 Seguridad y Permisos

### Autenticación
- ✅ Sistema de roles implementado
- ✅ Validación de permisos por función
- ✅ Log de auditoría automático

### Protección de Datos
- ✅ Hoja de auditoría protegida
- ✅ Validaciones de entrada
- ✅ Control de acceso por usuario

## 🆘 Solución de Problemas

### Si no se crean las hojas:
1. Verifica que tienes permisos de edición en la hoja de cálculo
2. Ejecuta primero `setupSheets()` y luego `seedData()` por separado
3. Revisa el log de ejecución: **Ver** → **Registros de ejecución**

### Si la aplicación web no funciona:
1. Verifica que la implementación esté activa
2. Asegúrate de que los permisos estén configurados correctamente
3. Prueba accediendo desde una ventana de incógnito

### Si hay errores de autenticación:
1. Verifica que el email esté en la hoja CFG_Users
2. Asegúrate de que el usuario esté marcado como activo
3. Revisa los roles asignados

## 📞 Soporte

Para cualquier problema o duda:

1. **Revisa los logs**: En Apps Script → Ver → Registros de ejecución
2. **Verifica los datos**: Revisa que las hojas tengan los datos correctos
3. **Prueba paso a paso**: Ejecuta las funciones individualmente para identificar problemas

## 🎉 ¡Sistema Listo!

Una vez completados todos los pasos, tendrás un sistema completo de punto de venta funcionando con:

- ✅ Base de datos en Google Sheets
- ✅ Lógica de negocio en Apps Script
- ✅ Interfaz web responsive
- ✅ Datos de ejemplo para pruebas
- ✅ Sistema de seguridad implementado
- ✅ Reportes y auditoría

**¡El sistema Adiction Boutique Suite está listo para usar!** 🚀