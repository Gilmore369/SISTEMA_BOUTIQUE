# 📤 Guía Visual: Cómo Subir Archivos a Apps Script

## 🎯 Objetivo
Subir 3 archivos corregidos desde tu computadora a Google Apps Script para que los cambios se apliquen en tu aplicación web.

---

## 📁 ARCHIVOS A SUBIR

```
✅ gas/Util.gs          → Corrige error de lock
✅ gas/POS.html         → Elimina jQuery duplicado
✅ gas/ClientList.html  → Elimina jQuery duplicado + agrega modal
```

---

## 🚀 PASO A PASO

### PASO 1: Abrir el Editor de Apps Script

1. **Abre tu Google Spreadsheet** (Adiction Boutique)
2. En el menú superior, click en **Extensiones**
3. Click en **Apps Script**

```
┌─────────────────────────────────────┐
│ Archivo  Editar  Ver  Insertar     │
│ Formato  Datos  Herramientas       │
│ Extensiones  Ayuda                 │  ← Click aquí
│   ├─ Apps Script                   │  ← Luego aquí
│   ├─ Complementos                  │
│   └─ Macros                        │
└─────────────────────────────────────┘
```

Se abrirá una nueva pestaña con el editor de Apps Script.

---

### PASO 2: Subir Util.gs

#### 2.1 Localizar el archivo en Apps Script
En la barra lateral izquierda, busca y click en **Util.gs**

```
┌─────────────────┐
│ Archivos        │
│ ├─ Code.gs      │
│ ├─ Util.gs      │ ← Click aquí
│ ├─ Repo.gs      │
│ ├─ Services.gs  │
│ └─ ...          │
└─────────────────┘
```

#### 2.2 Abrir el archivo local
1. Abre tu explorador de archivos (Windows Explorer)
2. Navega a la carpeta de tu proyecto
3. Entra a la carpeta `gas`
4. Busca el archivo `Util.gs`
5. Click derecho → **Abrir con** → **Bloc de notas** (o tu editor favorito)

#### 2.3 Copiar contenido
1. En el Bloc de notas, presiona **Ctrl+A** (seleccionar todo)
2. Presiona **Ctrl+C** (copiar)

#### 2.4 Pegar en Apps Script
1. Vuelve a la pestaña de Apps Script
2. En el editor de `Util.gs`, presiona **Ctrl+A** (seleccionar todo)
3. Presiona **Ctrl+V** (pegar) - esto reemplaza todo el contenido
4. Presiona **Ctrl+S** (guardar) o click en el icono de diskette 💾

**Verás un mensaje**: "Guardado"

---

### PASO 3: Subir POS.html

#### 3.1 Localizar el archivo en Apps Script
En la barra lateral izquierda, busca y click en **POS.html**

```
┌─────────────────┐
│ Archivos        │
│ ├─ index.html   │
│ ├─ POS.html     │ ← Click aquí
│ ├─ ClientList...│
│ └─ ...          │
└─────────────────┘
```

#### 3.2 Abrir el archivo local
1. En tu explorador de archivos, busca `gas/POS.html`
2. Click derecho → **Abrir con** → **Bloc de notas**

#### 3.3 Copiar y pegar
1. **Ctrl+A** → **Ctrl+C** (copiar todo)
2. Vuelve a Apps Script
3. **Ctrl+A** → **Ctrl+V** (reemplazar todo)
4. **Ctrl+S** (guardar)

**Verás**: "Guardado"

---

### PASO 4: Subir ClientList.html

#### 4.1 Localizar el archivo en Apps Script
En la barra lateral izquierda, busca y click en **ClientList.html**

```
┌─────────────────┐
│ Archivos        │
│ ├─ ClientList...│ ← Click aquí
│ ├─ ClientForm...│
│ └─ ...          │
└─────────────────┘
```

#### 4.2 Abrir el archivo local
1. En tu explorador de archivos, busca `gas/ClientList.html`
2. Click derecho → **Abrir con** → **Bloc de notas**

#### 4.3 Copiar y pegar
1. **Ctrl+A** → **Ctrl+C** (copiar todo)
2. Vuelve a Apps Script
3. **Ctrl+A** → **Ctrl+V** (reemplazar todo)
4. **Ctrl+S** (guardar)

**Verás**: "Guardado"

---

### PASO 5: Crear Nuevo Deployment

**⚠️ IMPORTANTE**: NO edites el deployment existente. Crea uno NUEVO.

#### 5.1 Click en Deploy
En la esquina superior derecha, click en **Deploy** → **New deployment**

```
┌──────────────────────────────────┐
│  ⚙️ Proyecto  ▶️ Ejecutar  🚀 Deploy │ ← Click aquí
│                    ├─ New deployment │ ← Luego aquí
│                    └─ Manage deploy...│
└──────────────────────────────────┘
```

#### 5.2 Configurar deployment
Se abrirá un modal. Configura así:

1. **Select type**: Click en el icono de engranaje ⚙️ → **Web app**

2. **Description**: Escribe:
   ```
   Fix jQuery errors and lock - v1.4
   ```

3. **Execute as**: Selecciona **Me (tu email)**

4. **Who has access**: Selecciona **Anyone**

5. Click en **Deploy** (botón azul)

#### 5.3 Autorizar (si te lo pide)
Si es la primera vez o cambió algo, te pedirá autorización:

1. Click en **Authorize access**
2. Selecciona tu cuenta de Google
3. Click en **Advanced** (Avanzado)
4. Click en **Go to [nombre del proyecto] (unsafe)**
5. Click en **Allow** (Permitir)

#### 5.4 Copiar la nueva URL
Aparecerá un modal con la URL del deployment:

```
┌─────────────────────────────────────────┐
│ Deployment successfully created         │
│                                         │
│ Web app                                 │
│ URL: https://script.google.com/macros/  │
│      s/AKfycby.../exec                  │ ← Copia esta URL
│                                         │
│ [Copy]  [Done]                          │
└─────────────────────────────────────────┘
```

**Click en Copy** para copiar la URL.

**⚠️ IMPORTANTE**: La URL debe terminar en `/exec` (NO en `/dev`)

---

### PASO 6: Probar la Nueva Versión

#### 6.1 Abrir en modo incógnito
1. Presiona **Ctrl+Shift+N** (Chrome) o **Ctrl+Shift+P** (Firefox)
2. Pega la URL que copiaste
3. Presiona **Enter**

#### 6.2 Iniciar sesión
1. Email: `gianpepex@gmail.com`
2. Contraseña: `gian123`
3. Click en **Iniciar Sesión**
4. Click en **Continuar al Dashboard**

#### 6.3 Abrir Console
1. Presiona **F12** (abre Developer Tools)
2. Click en la pestaña **Console**

#### 6.4 Ir a Punto de Venta
1. En el menú lateral, click en **Punto de Venta**
2. **Observa el Console**

**✅ SI FUNCIONÓ**: No verás estos errores:
- ❌ "jQuery no está disponible para POS"
- ❌ "jQuery no está disponible para ClientList"

**❌ SI SIGUE FALLANDO**: Verás los mismos errores
- Significa que no se subieron bien los archivos
- O estás usando la URL antigua

#### 6.5 Probar venta
1. Busca un producto (ej: "blusa")
2. Agrégalo al carrito
3. Click en **Confirmar Venta**
4. **Debe mostrar**: "¡Venta registrada exitosamente!"
5. **Debe preguntar**: "¿Desea imprimir el ticket?"

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada item cuando lo completes:

```
[ ] 1. Abrí el editor de Apps Script
[ ] 2. Subí Util.gs (copiar/pegar/guardar)
[ ] 3. Subí POS.html (copiar/pegar/guardar)
[ ] 4. Subí ClientList.html (copiar/pegar/guardar)
[ ] 5. Creé NUEVO deployment (no edité el existente)
[ ] 6. Copié la URL nueva (termina en /exec)
[ ] 7. Abrí la URL en modo incógnito
[ ] 8. Inicié sesión correctamente
[ ] 9. Abrí el Console (F12)
[ ] 10. Verifiqué que NO hay errores de jQuery
[ ] 11. Probé registrar una venta
[ ] 12. La venta se completó exitosamente
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Problema 1: "No encuentro el archivo en Apps Script"
**Solución**: 
- Verifica que estás en el proyecto correcto
- Busca en la lista de archivos (scroll down)
- Si no existe, créalo: Click en **+** → **HTML** o **Script**

### Problema 2: "Sigue mostrando errores de jQuery"
**Solución**:
- Verifica que usaste la URL NUEVA (no la antigua)
- Limpia caché: Ctrl+Shift+R
- Cierra y abre nueva ventana incógnito
- Verifica que guardaste los 3 archivos

### Problema 3: "No me deja crear deployment"
**Solución**:
- Verifica que guardaste todos los archivos (Ctrl+S)
- Cierra el modal y vuelve a intentar
- Verifica que tienes permisos de editor en el spreadsheet

### Problema 4: "La venta se queda en 'Procesando...'"
**Solución**:
- Esto significa que jQuery sigue duplicado
- Verifica que subiste POS.html correctamente
- Abre POS.html en Apps Script y busca "jQuery 3.7.1"
- Si lo encuentras, significa que no se pegó bien el archivo

---

## 📞 ¿NECESITAS MÁS AYUDA?

Si después de seguir todos los pasos sigues teniendo problemas:

1. **Toma screenshot** del error en el Console
2. **Copia la URL** que estás usando
3. **Dime en qué paso te quedaste**
4. **Copia el mensaje de error completo**

¡Estoy aquí para ayudarte! 🚀

---

## 🎉 ¿FUNCIONÓ?

Si todo funcionó correctamente:
- ✅ No hay errores de jQuery en Console
- ✅ Las ventas se registran correctamente
- ✅ El sistema pregunta si quieres imprimir ticket
- ✅ El carrito se limpia después de la venta

**¡Felicidades!** Ahora podemos continuar con Task 12: Mejoras al formulario de cliente.
