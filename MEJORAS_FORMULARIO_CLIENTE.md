# Mejoras al Formulario de Cliente

## Cambios Solicitados

### 1. Agregar Campos al Formulario
- ✅ Link de Google Maps (opcional)
- ✅ Latitud (opcional)
- ✅ Longitud (opcional)
- ✅ Foto del cliente (opcional, editable después)

### 2. Funcionalidad de Edición
- ✅ Poder editar clientes existentes
- ✅ Actualizar todos los datos incluyendo foto

### 3. Tabla de Clientes
- ⚠️ NO se muestra porque jQuery no está disponible
- ✅ Debe mostrar todos los clientes con opción de editar

---

## Archivos a Modificar

### 1. Base de Datos (CFG_Clients)
Agregar columnas:
- `google_maps_link` (texto, opcional)
- `latitude` (número, opcional)
- `longitude` (número, opcional)
- `photo_url` (texto, opcional - URL de Google Drive)

### 2. ClientList.html
- ✅ Remover jQuery duplicado (YA HECHO)
- ✅ Agregar modal con campos nuevos (YA HECHO)
- ✅ Agregar función para editar cliente
- ✅ Cargar datos en el modal al editar

### 3. ClientForm.html
- ✅ Agregar campos de Google Maps
- ✅ Agregar campo de foto
- ✅ Permitir edición de cliente existente

### 4. Code.gs
- ✅ Actualizar `createClientQuick()` para incluir nuevos campos
- ✅ Crear `updateClient()` para editar clientes
- ✅ Crear `uploadClientPhoto()` para subir fotos

---

## Implementación

### Paso 1: Actualizar Modal en ClientList.html

El modal debe incluir:
```html
<div class="row">
  <div class="col-md-12 mb-3">
    <label for="clientGoogleMaps" class="form-label">
      <i class="bi bi-geo-alt"></i> Link de Google Maps (opcional)
    </label>
    <input type="url" class="form-control" id="clientGoogleMaps" 
           placeholder="https://maps.google.com/...">
    <small class="text-muted">Pega el link de Google Maps de la ubicación del cliente</small>
  </div>
</div>

<div class="row">
  <div class="col-md-6 mb-3">
    <label for="clientLatitude" class="form-label">Latitud (opcional)</label>
    <input type="number" class="form-control" id="clientLatitude" 
           step="0.000001" placeholder="-12.046374">
  </div>
  <div class="col-md-6 mb-3">
    <label for="clientLongitude" class="form-label">Longitud (opcional)</label>
    <input type="number" class="form-control" id="clientLongitude" 
           step="0.000001" placeholder="-77.042793">
  </div>
</div>

<div class="mb-3">
  <label for="clientPhoto" class="form-label">
    <i class="bi bi-camera"></i> Foto del Cliente (opcional)
  </label>
  <input type="file" class="form-control" id="clientPhoto" 
         accept="image/*">
  <small class="text-muted">Formatos: JPG, PNG. Máximo 5MB</small>
  <div id="photoPreview" class="mt-2" style="display: none;">
    <img id="photoPreviewImg" src="" alt="Preview" 
         style="max-width: 200px; max-height: 200px; border-radius: 8px;">
  </div>
</div>
```

### Paso 2: Función para Extraer Coordenadas de Google Maps

```javascript
function extractCoordinatesFromMapsLink(mapsLink) {
  if (!mapsLink) return { lat: null, lng: null };
  
  // Extraer coordenadas de diferentes formatos de Google Maps
  // Formato 1: https://maps.google.com/?q=-12.046374,-77.042793
  // Formato 2: https://www.google.com/maps/@-12.046374,-77.042793,15z
  // Formato 3: https://www.google.com/maps/place/@-12.046374,-77.042793
  
  const patterns = [
    /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = mapsLink.match(pattern);
    if (match) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
  }
  
  return { lat: null, lng: null };
}
```

### Paso 3: Actualizar saveQuickClient()

```javascript
function saveQuickClient() {
  const mapsLink = $('#clientGoogleMaps').val().trim();
  const coords = extractCoordinatesFromMapsLink(mapsLink);
  
  const clientData = {
    name: $('#clientName').val().trim(),
    dni: $('#clientDNI').val().trim(),
    phone: $('#clientPhone').val().trim(),
    email: $('#clientEmail').val().trim(),
    address: $('#clientAddress').val().trim(),
    birthday: $('#clientBirthday').val(),
    credit_limit: parseFloat($('#clientCreditLimit').val()) || 0,
    google_maps_link: mapsLink,
    latitude: coords.lat || parseFloat($('#clientLatitude').val()) || null,
    longitude: coords.lng || parseFloat($('#clientLongitude').val()) || null
  };
  
  // Validaciones...
  
  // Si hay foto, subirla primero
  const photoFile = $('#clientPhoto')[0].files[0];
  if (photoFile) {
    uploadClientPhoto(photoFile, function(photoUrl) {
      clientData.photo_url = photoUrl;
      saveClientToServer(clientData);
    });
  } else {
    saveClientToServer(clientData);
  }
}
```

### Paso 4: Función para Subir Foto

```javascript
function uploadClientPhoto(file, callback) {
  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('La foto es muy grande. Máximo 5MB.');
    return;
  }
  
  // Leer archivo como base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Data = e.target.result.split(',')[1];
    
    // Subir a Google Drive
    google.script.run
      .withSuccessHandler(function(response) {
        if (response.success) {
          callback(response.data.url);
        } else {
          alert('Error al subir foto: ' + response.error);
        }
      })
      .withFailureHandler(function(error) {
        alert('Error al subir foto: ' + error.message);
      })
      .uploadClientPhoto(base64Data, file.name, file.type);
  };
  reader.readAsDataURL(file);
}
```

### Paso 5: Función en Code.gs para Subir Foto

```javascript
function uploadClientPhoto(base64Data, fileName, mimeType) {
  return wrapResponse(function() {
    // Crear carpeta "Clientes" si no existe
    const folders = DriveApp.getFoldersByName('Clientes');
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder('Clientes');
    }
    
    // Decodificar base64
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      fileName
    );
    
    // Subir archivo
    const file = folder.createFile(blob);
    
    // Hacer público (opcional)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      url: file.getUrl(),
      id: file.getId()
    };
  });
}
```

### Paso 6: Función para Editar Cliente

```javascript
function editClientModal(clientId) {
  // Obtener datos del cliente
  google.script.run
    .withSuccessHandler(function(response) {
      if (response.success) {
        const client = response.data;
        
        // Llenar el modal con los datos
        $('#clientName').val(client.name);
        $('#clientDNI').val(client.dni);
        $('#clientPhone').val(client.phone);
        $('#clientEmail').val(client.email || '');
        $('#clientAddress').val(client.address || '');
        $('#clientBirthday').val(client.birthday || '');
        $('#clientCreditLimit').val(client.credit_limit || 0);
        $('#clientGoogleMaps').val(client.google_maps_link || '');
        $('#clientLatitude').val(client.latitude || '');
        $('#clientLongitude').val(client.longitude || '');
        
        // Mostrar foto si existe
        if (client.photo_url) {
          $('#photoPreview').show();
          $('#photoPreviewImg').attr('src', client.photo_url);
        }
        
        // Cambiar título del modal
        $('#newClientModalLabel').html('<i class="bi bi-pencil"></i> Editar Cliente');
        
        // Cambiar botón de guardar
        $('#newClientModal .btn-primary')
          .attr('onclick', `updateClient('${clientId}')`)
          .html('<i class="bi bi-save"></i> Actualizar Cliente');
        
        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('newClientModal'));
        modal.show();
      } else {
        alert('Error al cargar cliente: ' + response.error);
      }
    })
    .withFailureHandler(function(error) {
      alert('Error al cargar cliente: ' + error.message);
    })
    .getClientById(clientId);
}
```

---

## IMPORTANTE

**ANTES DE IMPLEMENTAR ESTOS CAMBIOS, DEBES:**

1. ✅ **SUBIR LOS ARCHIVOS ACTUALES** (Util.gs, POS.html, ClientList.html)
2. ✅ **VERIFICAR QUE FUNCIONA** (sin error de jQuery)
3. ✅ **LUEGO** implementar estos cambios adicionales

**SI NO SUBES LOS ARCHIVOS PRIMERO, NADA FUNCIONARÁ.**

---

## Orden de Implementación

1. **PRIMERO**: Subir archivos actuales y verificar que funciona
2. **SEGUNDO**: Agregar campos al modal (Google Maps, foto)
3. **TERCERO**: Implementar función de subir foto
4. **CUARTO**: Implementar función de editar cliente
5. **QUINTO**: Probar todo

---

## Próximos Pasos

¿Quieres que implemente estos cambios ahora, o prefieres primero subir los archivos actuales y verificar que funciona?

**Recomendación**: Primero sube los archivos actuales, verifica que la tabla de clientes se muestra correctamente, y luego implementamos los campos adicionales.
