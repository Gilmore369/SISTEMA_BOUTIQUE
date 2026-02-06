# 🚀 Instrucciones - Nuevo Proyecto Apps Script

## ✅ Proyecto Actualizado

El sistema **Adiction Boutique Suite** ha sido migrado exitosamente al nuevo proyecto de Apps Script.

### 📋 Información del Nuevo Proyecto

- **Script ID**: `1c_k3vHcO2Dm7v3D_0N5v1kDvM_iCostNFUSUWjJyCtsPKe2mdMMWPcY-`
- **URL del proyecto**: https://script.google.com/d/1c_k3vHcO2Dm7v3D_0N5v1kDvM_iCostNFUSUWjJyCtsPKe2mdMMWPcY-/edit
- **Archivos subidos**: ✅ 31 archivos desplegados correctamente
- **Estado**: ✅ Listo para configuración

### 📁 Archivos Migrados (31 total)

#### **Archivos de Configuración (1)**
- ✅ `appsscript.json` - Configuración del proyecto

#### **Archivos de Lógica Principal (8)**
- ✅ `Const.gs` - Constantes del sistema
- ✅ `Errors.gs` - Manejo de errores
- ✅ `Util.gs` - Utilidades generales
- ✅ `Repo.gs` - Repositorios de datos
- ✅ `Services.gs` - Servicios principales
- ✅ `CreditService.gs` - Servicio de créditos
- ✅ `Code.gs` - Controladores principales
- ✅ `Setup.gs` - Configuración automática

#### **Archivos de Interfaz (18)**
- ✅ `index.html` - Página principal
- ✅ `POS.html` - Punto de venta
- ✅ `ClientList.html` - Lista de clientes
- ✅ `ClientForm.html` - Formulario de clientes
- ✅ `ClientDetail.html` - Detalle de cliente
- ✅ `ProductList.html` - Lista de productos
- ✅ `ProductForm.html` - Formulario de productos
- ✅ `StockView.html` - Vista de inventario
- ✅ `MovementList.html` - Movimientos
- ✅ `TransferForm.html` - Transferencias
- ✅ `Collections.html` - Cobranzas
- ✅ `Cash.html` - Gestión de caja
- ✅ `SalesReport.html` - Reporte de ventas
- ✅ `InventoryReport.html` - Reporte de inventario
- ✅ `ARReport.html` - Cuentas por cobrar
- ✅ `AuditLog.html` - Log de auditoría
- ✅ `BarcodeScanner.html` - Escáner
- ✅ `InvoiceList.html` - Lista de facturas

#### **Archivos de Pruebas (4)**
- ✅ `Test_CreditService.gs` - Pruebas de créditos
- ✅ `Test_GenerateReceipt.gs` - Pruebas de recibos
- ✅ `Test_POSService_Credit.gs` - Pruebas de POS
- ✅ `Test_Util.gs` - Pruebas de utilidades

## 🎯 Configuración del Sistema

### **Método Recomendado: Configuración Rápida** ⭐

**Ejecuta esta función desde el nuevo proyecto:**

1. **Abre el nuevo proyecto**: 
   https://script.google.com/d/1c_k3vHcO2Dm7v3D_0N5v1kDvM_iCostNFUSUWjJyCtsPKe2mdMMWPcY-/edit

2. **Selecciona la función**: `setupSystemQuick`

3. **Ejecuta la función**:
   - Haz clic en el botón "Ejecutar" (▶️)
   - Autoriza los permisos cuando se solicite
   - Espera a que termine la ejecución

4. **Revisa el log de ejecución**:
   ```
   === CONFIGURACIÓN RÁPIDA - NUEVA HOJA DE CÁLCULO ===
   ✓ Nueva hoja de cálculo creada: Adiction Boutique Suite - Base de Datos
   📊 URL: https://docs.google.com/spreadsheets/d/NUEVO_ID/edit
   ✓ 14 hojas creadas con formato y validaciones
   ✓ Datos de ejemplo poblados
   🎉 Sistema configurado exitosamente
   ```

5. **Abre tu sistema**:
   - Copia la URL del log
   - Ábrela en una nueva pestaña
   - ¡Tu sistema está listo para usar!

### **Funciones Disponibles**

#### **setupSystemQuick()** ⭐ RECOMENDADO
- **Descripción**: Crea automáticamente una nueva hoja de cálculo y la configura completamente
- **Uso**: Sin parámetros, ejecución directa
- **Resultado**: Sistema completo listo para usar

#### **setupSystemNoUI(url)**
- **Descripción**: Configura una hoja de cálculo existente
- **Uso**: `setupSystemNoUI("https://docs.google.com/spreadsheets/d/TU_ID/edit")`
- **Resultado**: Configura la hoja especificada

#### **setupCompleteSystem()**
- **Descripción**: Configuración tradicional con interfaz de usuario
- **Uso**: Solo funciona en scripts vinculados a hojas de cálculo
- **Resultado**: Configuración con diálogos de confirmación

## 🔧 Características del Sistema

### **Base de Datos (14 Hojas)**
1. **CFG_Users** - 4 usuarios con diferentes roles
2. **CFG_Params** - 10 parámetros del sistema
3. **CAT_Products** - 15 productos de ropa
4. **INV_Stock** - 17 registros de stock inicial
5. **INV_Movements** - Movimientos de inventario
6. **CRM_Clients** - 8 clientes de ejemplo
7. **POS_Sales** - Ventas
8. **POS_SaleItems** - Items de venta
9. **CRD_Plans** - Planes de crédito
10. **CRD_Installments** - Cuotas
11. **CRD_Payments** - Pagos
12. **CASH_Shifts** - Turnos de caja
13. **CASH_Expenses** - Egresos
14. **AUD_Log** - Log de auditoría (protegido)

### **Funcionalidades Implementadas**
- ✅ **Autenticación y autorización** por roles
- ✅ **Punto de venta** (efectivo y crédito)
- ✅ **Gestión de inventario** con alertas
- ✅ **Sistema de créditos** y cobranzas
- ✅ **Gestión de caja** y egresos
- ✅ **Reportes completos** de ventas e inventario
- ✅ **Auditoría automática** de operaciones
- ✅ **Interfaz web responsive**

### **Datos de Ejemplo Incluidos**

#### **Usuarios del Sistema**
- **María González** - Admin (admin@adictionboutique.com)
- **Ana Rodríguez** - Vendedor Mujeres (vendedor.mujeres@adictionboutique.com)
- **Carlos Pérez** - Vendedor/Cajero Hombres (vendedor.hombres@adictionboutique.com)
- **Luis Martínez** - Cobrador (cobrador@adictionboutique.com)

#### **Productos de Ejemplo**
- 15 productos de ropa (blusas, pantalones, vestidos, camisas, etc.)
- Precios desde $49.90 hasta $249.90
- Códigos de barras únicos
- Stock distribuido entre almacenes

#### **Clientes de Ejemplo**
- 8 clientes con límites de crédito ($2,000 - $3,500)
- Datos completos (DNI, teléfono, email, dirección)
- Coordenadas de geolocalización

## 🚀 Próximos Pasos

### **1. Configurar el Sistema**
```javascript
// Ejecutar en el nuevo proyecto
setupSystemQuick()
```

### **2. Implementar Aplicación Web**
1. En el proyecto Apps Script: **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Ejecutar como: **"Yo"**
4. Quién tiene acceso: **"Cualquier persona"**
5. Hacer clic en **Implementar**
6. Copiar la URL de la aplicación web

### **3. Comenzar a Usar**
- Acceder con cualquiera de los emails de usuario configurados
- Explorar todas las funcionalidades del sistema
- Personalizar según las necesidades específicas

## ✅ **Sistema Listo**

El **Adiction Boutique Suite** está ahora:
- ✅ **Migrado al nuevo proyecto** Apps Script
- ✅ **Todos los archivos subidos** correctamente
- ✅ **Funciones de configuración** actualizadas
- ✅ **Listo para configuración automática**

**URL del nuevo proyecto**: https://script.google.com/d/1c_k3vHcO2Dm7v3D_0N5v1kDvM_iCostNFUSUWjJyCtsPKe2mdMMWPcY-/edit

**¡Ejecuta `setupSystemQuick()` para tener tu sistema funcionando en menos de 2 minutos!** 🚀