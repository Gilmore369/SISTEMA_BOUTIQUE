# Instrucciones de Despliegue - v1.6

## 📋 Pre-requisitos
- ✅ Archivos ya modificados y guardados
- ✅ Sin errores de sintaxis (verificado)
- ✅ Cambios documentados

---

## 🚀 Paso 1: Subir Archivos a Apps Script

```bash
npx clasp push
```

**Resultado esperado:**
```
└─ gas/Services.gs
└─ gas/CreditService.gs
└─ gas/Repo.gs
└─ ... (otros archivos)
Pushed 39 files.
```

---

## 🎯 Paso 2: Crear Nuevo Deployment

```bash
npx clasp deploy -d "Refactorización Profesional - v1.6"
```

**Resultado esperado:**
```
Created version @88.
- AKfycby... @88 - Refactorización Profesional - v1.6
```

**IMPORTANTE**: 
- La URL debe terminar en `/exec` (NO `/dev`)
- Copia la URL del deployment para probar

---

## 🧪 Paso 3: Testing Básico

### **3.1 Login**
1. Abre la URL del deployment en navegador
2. Login con: `gianpepex@gmail.com` / `gian123`
3. Verifica que carga el dashboard ✅

### **3.2 Crear Venta al Contado**
1. Ir a "Punto de Venta"
2. Buscar producto
3. Agregar al carrito
4. Completar venta
5. Verificar que se crea correctamente ✅
6. Verificar que el stock se decrementa ✅

### **3.3 Crear Venta a Crédito**
1. Ir a "Punto de Venta"
2. Seleccionar cliente
3. Cambiar a "Crédito"
4. Seleccionar número de cuotas
5. Completar venta
6. Verificar que se crea el plan de crédito ✅
7. Verificar que se crean las cuotas ✅

### **3.4 Buscar Cliente (Performance)**
1. Ir a "Clientes"
2. Buscar un cliente (primera vez) - Medir tiempo
3. Buscar el mismo cliente (segunda vez) - Medir tiempo
4. Verificar que la segunda búsqueda es más rápida ✅

---

## 📝 Paso 4: Commit a GitHub

```bash
git add .
git commit -m "Refactorización profesional: Locks + Caché - v1.6

- Agregado LockManager a reserveStock, releaseStock
- Agregado LockManager + IdempotencyManager a createCreditPlan
- Agregado LockManager a rescheduleInstallment
- Agregado CacheService a ClientRepository
- Mejoras de concurrencia y performance
- Sin cambios en UI ni arquitectura"

git push origin main
```

---

## ✅ Verificación Final

### **Checklist:**
- [ ] `npx clasp push` ejecutado sin errores
- [ ] Nuevo deployment creado (@88 o superior)
- [ ] URL termina en `/exec`
- [ ] Login funciona correctamente
- [ ] Venta al contado funciona
- [ ] Venta a crédito funciona
- [ ] Búsqueda de clientes más rápida
- [ ] Commit a GitHub realizado

---

## 🐛 Troubleshooting

### **Error: "No se pudo adquirir el lock"**
- **Causa**: Operación simultánea en progreso
- **Solución**: Esperar 30 segundos y reintentar

### **Error: "Argument too large"**
- **Causa**: Demasiados clientes para cachear (>500)
- **Solución**: El sistema automáticamente no cachea si hay >500

### **Error: "requestId ya procesado"**
- **Causa**: Idempotencia funcionando correctamente
- **Solución**: Esto es esperado, retorna el resultado anterior

---

## 📊 Métricas de Éxito

### **Performance:**
- Primera búsqueda de cliente: ~200-500ms
- Segunda búsqueda (caché): ~5-20ms
- **Mejora**: 10x-100x más rápido ✅

### **Concurrencia:**
- 2 ventas simultáneas del mismo producto
- Stock se decrementa correctamente
- No hay stock negativo ✅

### **Idempotencia:**
- Crear venta a crédito 2 veces con mismo requestId
- Solo se crea 1 plan de crédito
- Retorna el mismo resultado ✅

---

## 🎉 Deployment Exitoso

Si todos los checks están ✅, el deployment fue exitoso.

**Versión desplegada**: v1.6  
**Fecha**: 2026-02-08  
**Estado**: ✅ PRODUCCIÓN

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs en Apps Script (Ver → Registros)
2. Verifica que la URL termina en `/exec`
3. Prueba con usuario de prueba: `gianpepex@gmail.com` / `gian123`
