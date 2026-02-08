# Adiction Boutique Suite

Sistema de gestión para boutique con inventario, ventas, créditos y cobranzas.

## 🚀 Despliegue Rápido

1. Abre https://script.google.com
2. Crea **Nueva implementación** → **Aplicación web**
3. Ejecutar como: **Yo** | Acceso: **Cualquier persona**
4. Copia la URL que termina en `/exec`
5. Prueba en modo incógnito con: `admin / admin123`

## 📖 Documentación

- **LEEME.md** - Instrucciones de despliegue
- **DATABASE_STRUCTURE.md** - Estructura de la base de datos

## 👥 Usuarios

```
admin / admin123
gian / gian123
vendedor / vendedor123
```

## 📁 Estructura

```
gas/
├── Code.gs              # Punto de entrada principal
├── index.html           # Layout principal
├── Services.gs          # Servicios de negocio
├── Repo.gs              # Repositorios de datos
├── Const.gs             # Constantes
├── Errors.gs            # Manejo de errores
├── Util.gs              # Utilidades
└── [módulos].html       # Vistas de cada módulo
```

## ✨ Características

- ✅ Login con usuario/contraseña (funciona en incógnito)
- ✅ Gestión de inventario
- ✅ Punto de venta (POS)
- ✅ Gestión de clientes
- ✅ Créditos y cobranzas
- ✅ Reportes y dashboard
- ✅ Ingreso masivo de productos

---

**Versión:** 3.0
**Estado:** ✅ Funcional
