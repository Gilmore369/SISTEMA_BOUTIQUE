# IDE Dev Rules (Apps Script WebApp + Bootstrap) — Auto-repair, Low-Tokens, Clean

## Objetivo
Construir la Web App (Apps Script + Sheets/Drive + Gmail + Bootstrap/DataTables) con **código limpio**, **validaciones estrictas**, **autorreparación** ante errores y **mínimo consumo de tokens**.  
**Regla de oro:** cambios pequeños, verificables y sin “re-escribir todo”.

---

## 1) Modo de trabajo (para ahorrar tokens)
1. **Iterar por PRs pequeños** (máx. 150–250 líneas netas por iteración).
2. **No reimprimir archivos completos**:  
   - Si un archivo ya existe, entregar **solo diffs** (bloques “ANTES/ DESPUÉS” o “insertar en línea X-Y”).
3. **Una causa por commit**: cada cambio corrige *un* bug o agrega *una* feature concreta.
4. **No inventar dependencias**: todo debe correr en Apps Script + HTML Service.
5. **Evitar duplicación**: si una función existe, reúsala; no crear “helpers” redundantes.

**Formato de salida requerido por el IDE (siempre):**
- `CHANGELOG` (3–8 bullets)
- `FILES_CHANGED` (lista corta)
- `DIFFS` (solo fragmentos necesarios)
- `TESTS_RUN` (qué se probó y resultado)
- `NEXT` (1–3 siguientes pasos)

---

## 2) Estructura mínima (pocos archivos, pero modular)
**Máximo 10 archivos GAS + 3 UI**. No crear más sin necesidad.

### Backend (GAS)
1. `Code.gs`  
   - `doGet`, `doPost`, router, envelope, CORS (si aplica), handler errors.
2. `Const.gs`  
   - nombres de sheets, roles, acciones, límites, keys.
3. `Repo.gs`  
   - acceso a Sheets: read/write batch, índices simples, paginación.
4. `Services.gs`  
   - lógica por módulos: POS, Crédito, Caja, Inventario, Clientes (en secciones).
5. `DriveGmail.gs`  
   - Drive upload/getFile + Gmail send.
6. `Validate.gs`  
   - validaciones y sanitización, schema check.
7. `Audit.gs`  
   - auditoría de acciones críticas.
8. `Util.gs`  
   - helpers: id, fechas, dinero, safeJson, locks.

> **Regla:** si se quiere crear un archivo nuevo, primero intentar meterlo en `Services.gs` o `Util.gs`.

### Frontend (UI)
1. `ui/index.html` (layout Bootstrap, sidebar/topbar, placeholders)
2. `ui/app.js` (router UI + fetch wrapper + DataTables init)
3. `ui/app.css` (min, solo overrides)

---

## 3) Contrato API (inmutable para evitar retrabajo)
### Envelope estándar
```json
{ "ok": true, "data": null, "error": null }
o

json
Copiar código
{ "ok": false, "data": null, "error": { "code":"", "message":"", "details":null } }
Reglas de endpoints
Todos los POST reciben JSON con: action, payload, requestId.

Validar siempre:

action permitido

payload con schema

permisos por rol + scope tienda

idempotencia por requestId en operaciones críticas (venta/pago/ajuste)

4) Autorreparación (cómo diagnosticar y corregir sin gastar tokens)
Protocolo de error (obligatorio)
Cuando algo falla, el IDE debe responder con esta plantilla (sin historia larga):

Síntoma: qué no funciona (1 línea).

Causa probable: 1–2 hipótesis.

Confirmación: qué log/validación confirma (1 paso).

Fix mínimo: parche de 10–40 líneas.

Prueba: cómo validar (1–3 pasos).

Política de reparación
Primero: corregir validación / rutas / tipos antes que refactor.

No “optimizar” si no se pidió.

No mover archivos salvo necesidad.

Si hay 2 soluciones, elegir la más corta y segura.

5) Validación estricta (sin librerías externas)
Validación de entrada (backend)
Rechazar si:

falta action

payload no es objeto

strings con longitud excesiva (definir límites)

números fuera de rango

fechas inválidas

Sanitizar:

trim strings

normalizar DNI/teléfono

convertir dinero a Number con 2 decimales

Validación de negocio (ejemplos)
POS:

no stock negativo (salvo ADMIN)

total = suma(items) - descuentos

Crédito:

cuotas 1..6

suma cuotas = total (ajuste último centavo)

Caja:

no registrar pagos si caja no está “OPEN” (según rol/política)

6) Concurrencia e integridad
Locks
Usar LockService.getScriptLock() para:

crear venta

registrar pago

ajustar stock

Timeout: 20–30s. Si no se obtiene lock -> error controlado.

Idempotencia
Tabla/Sheet REQ_Log (o en AUD_Log) para requestId:

si existe requestId -> devolver resultado anterior

si no existe -> procesar y guardar

7) Rendimiento (Apps Script friendly)
Lecturas por rango en bloque, nunca por celda.

Cache:

CacheService para catálogo productos (5–15 min).

Paginación real:

UI DataTables pide page, pageSize, search, sort.

Máximos:

pageSize default 25, max 100.

maxLoopItems 500.

8) UI Bootstrap + Tablas modernas (sin exceso)
Reglas UI
No SPA compleja. Un solo index.html con secciones.

DataTables:

server-side style (paginación desde backend)

acciones por fila con dropdown

Estados:

loading skeleton

empty states

toast de éxito/error

Wrapper fetch (obligatorio)
1 sola función api(action, payload):

agrega requestId

maneja ok/error

muestra toast

9) Drive + Gmail (factura electrónica)
Drive
Subidas:

DNI, gastos, PDFs/XML de factura

Guardar siempre:

fileId, mimeType, name, createdAt

Gmail
Envío:

GmailApp.sendEmail(to, subject, plain, {htmlBody, attachments})

Plantilla HTML simple (no inline gigantes).

Loggear envíos en AUD_Log con: saleId, destinatario, fileIds.

10) Testing mínimo (pero siempre)
Antes de declarar “OK”, ejecutar:

Smoke API: /auth/me

Productos: búsqueda por barcode

Venta contado: crea sale + descuenta stock

Venta crédito: crea plan + cuotas

Pago: aplica a cuota vencida

Email (si hay PDF): envía 1 correo de prueba a correo interno

Registrar TESTS_RUN en cada salida.

11) Reglas para NO inflar tokens
No repetir especificaciones ya escritas.

No listar todos los campos en cada respuesta.

No escribir “tutoriales” largos: solo pasos concretos.

Si el usuario pide “arregla X”, responder solo con:

fix + test + next.

12) Checklist “Definition of Done”
 Roles y scope por tienda funcionando

 POS contado + crédito estable (locks + idempotencia)

 Stock consistente (sin negativos no autorizados)

 Cuotas correctas (1..6, suma exacta)

 Caja por turno (open/close + arqueo)

 Drive adjuntos OK (DNI, gastos, facturas)

 Gmail envío OK (adjuntos + log)

 Tablas Bootstrap/DataTables modernas y responsive

 Auditoría completa en acciones críticas

13) Cómo debe pedir el IDE la siguiente iteración
Siempre terminar con:

“Necesito estos 3 datos” (solo si es imprescindible)
o si no:

“Siguiente iteración: M1 Router+Auth+Seed”.

Prohibido: pedir confirmación repetida, replanificar todo, crear 20 archivos, o reescribir el proyecto completo.