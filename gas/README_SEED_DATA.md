# Instrucciones para Poblar Datos de Ejemplo

## Función seedData()

La función `seedData()` en el archivo `Setup.gs` inserta datos de ejemplo en las hojas del sistema Adiction Boutique Suite.

### Datos que se insertan:

#### 1. **CFG_Users** - 4 usuarios con diferentes roles:
- **María González** (admin@adictionboutique.com) - Admin en ambas tiendas
- **Ana Rodríguez** (vendedor.mujeres@adictionboutique.com) - Vendedor en tienda Mujeres
- **Carlos Pérez** (vendedor.hombres@adictionboutique.com) - Vendedor y Cajero en tienda Hombres
- **Luis Martínez** (cobrador@adictionboutique.com) - Cobrador en ambas tiendas

#### 2. **CFG_Params** - 10 parámetros del sistema:
- Nivel mínimo de stock para alertas: 10 unidades
- Descuento máximo sin autorización: $100
- Egreso máximo sin autorización: $500
- Días de gracia para cuotas: 3 días
- Configuración de caché y límites de crédito

#### 3. **CAT_Products** - 15 productos de ropa:
- **Ropa de Mujer**: Blusas, pantalones, vestidos, faldas, chaquetas, shorts, leggings, blazers, tops
- **Ropa de Hombre**: Camisas, pantalones, polos, suéteres, bermudas
- Precios desde $49.90 hasta $249.90
- Todos los productos con códigos de barras únicos

#### 4. **INV_Stock** - 17 registros de stock inicial:
- Stock distribuido entre almacén de Mujeres y Hombres
- Cantidades realistas (entre 8 y 45 unidades por producto)
- Algunos productos disponibles en ambos almacenes

#### 5. **CRM_Clients** - 8 clientes de ejemplo:
- Clientes con DNI, nombre, teléfono, email y dirección
- Límites de crédito entre $2,000 y $3,500
- Direcciones en diferentes distritos de Lima
- Coordenadas de geolocalización incluidas

### Cómo ejecutar:

1. Abre el proyecto de Google Apps Script
2. Abre el archivo `Setup.gs`
3. Selecciona la función `seedData` en el menú desplegable
4. Haz clic en el botón "Ejecutar" (▶️)
5. Autoriza los permisos si es la primera vez
6. Espera el mensaje de confirmación

### Notas importantes:

- **Ejecutar después de setupSheets()**: Primero debes crear las hojas con `setupSheets()` antes de poblar los datos
- **Datos realistas**: Los datos son ficticios pero realistas para una tienda de ropa
- **Idempotencia**: Puedes ejecutar la función múltiples veces, agregará nuevos registros cada vez
- **Personalización**: Puedes modificar los datos en el código según tus necesidades

### Verificación:

Después de ejecutar `seedData()`, verifica que:
- ✅ CFG_Users tiene 4 usuarios
- ✅ CFG_Params tiene 10 parámetros
- ✅ CAT_Products tiene 15 productos
- ✅ INV_Stock tiene 17 registros
- ✅ CRM_Clients tiene 8 clientes

### Próximos pasos:

Una vez que tengas los datos de ejemplo, puedes:
1. Probar el sistema con datos realistas
2. Modificar los datos según tus necesidades
3. Agregar más productos, clientes o usuarios
4. Comenzar a implementar los servicios y la interfaz de usuario
