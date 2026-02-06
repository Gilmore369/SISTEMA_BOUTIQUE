# 🔧 TARJETA DE SOLUCIÓN RÁPIDA

## 🎯 PROBLEMA ACTUAL: Datos Ficticios

**Estado**: ✅ CÓDIGO CORREGIDO Y SUBIDO

---

## ⚡ SOLUCIÓN EN 4 PASOS

```
1. Apps Script → Ejecutar: createAllMissingSheets
2. Apps Script → Ejecutar: seedAllDataComplete  
3. Implementar → Nueva versión: "v1.4 - Datos ficticios"
4. Aplicación → Ctrl+F5 (recarga forzada)
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] Ejecuté `createAllMissingSheets` (crea hojas)
- [ ] Ejecuté `seedAllDataComplete` (llena datos)
- [ ] Creé nueva versión en Implementaciones
- [ ] Recargué la app con Ctrl+F5
- [ ] Veo datos en el Dashboard
- [ ] Veo cuotas en Cobranzas

---

## 🐛 ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| "Cannot read properties of null" | Hojas no existen | Ejecuta `createAllMissingSheets` |
| "SPREADSHEET_ID is not defined" | Código viejo | Ya corregido, ejecuta `clasp push` |
| "No veo datos" | Versión vieja | Crea nueva versión (Paso 3) |
| "Tablas vacías" | No ejecutaste seed | Ejecuta `seedAllDataComplete` |

---

## 📊 DATOS QUE SE CREAN

- 50 ventas (últimos 30 días)
- Planes de crédito + cuotas
- 100 movimientos de inventario
- Stock actualizado (30% bajo)
- Pagos registrados

---

## 🔄 PARA VOLVER A LLENAR

```javascript
// En Apps Script, ejecutar:
seedAllDataComplete()
// Limpia automáticamente y vuelve a llenar
```

---

## 📞 VERIFICACIÓN FINAL

Después de los 4 pasos, deberías ver:

✅ Dashboard con números reales  
✅ Cobranzas con cuotas vencidas  
✅ Reportes con datos  
✅ Stock bajo con productos  

---

**Última actualización**: 2026-02-06  
**Versión del sistema**: v1.4
