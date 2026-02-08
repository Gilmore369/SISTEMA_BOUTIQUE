/**
 * Repo.gs - Capa de Acceso a Datos (Repositorios)
 * Adiction Boutique Suite
 * 
 * Este archivo contiene la clase BaseRepository y repositorios específicos
 * para acceder a las hojas de Google Sheets como base de datos.
 * 
 * REGLAS:
 * - Lectura/escritura por rangos (batch operations), nunca por celda
 * - Manejo robusto de errores
 * - Sin duplicación de código
 * - Código limpio y mantenible
 */

// ============================================================================
// CLASE BASE: BaseRepository
// ============================================================================

/**
 * BaseRepository - Clase base para todos los repositorios
 * 
 * Proporciona operaciones CRUD genéricas para cualquier hoja de Google Sheets.
 * Todos los repositorios específicos deben heredar de esta clase.
 * 
 * Características:
 * - Operaciones batch (lectura/escritura por rangos)
 * - Conversión automática entre filas y objetos
 * - Manejo robusto de errores
 * - Caché opcional de headers
 * 
 * @class
 */
class BaseRepository {
  /**
   * Constructor
   * 
   * @param {string} sheetName - Nombre de la hoja de Google Sheets
   * @throws {Error} Si la hoja no existe o no se puede acceder
   */
  constructor(sheetName) {
    if (!sheetName) {
      throw new Error('El nombre de la hoja es requerido');
    }
    
    try {
      // Obtener el spreadsheet activo (para scripts vinculados)
      this.ss = SpreadsheetApp.getActiveSpreadsheet();
      
      // Obtener la hoja específica
      this.sheet = this.ss.getSheetByName(sheetName);
      
      if (!this.sheet) {
        throw new Error('La hoja "' + sheetName + '" no existe en el spreadsheet');
      }
      
      this.sheetName = sheetName;
      
      // Caché de headers (se carga bajo demanda)
      this._headersCache = null;
      
    } catch (error) {
      Logger.log('Error en constructor de BaseRepository: ' + error.message);
      throw new Error('Error al acceder a la hoja "' + sheetName + '": ' + error.message);
    }
  }
  
  // ==========================================================================
  // OPERACIONES CRUD
  // ==========================================================================
  
  /**
   * findAll - Obtiene todos los registros de la hoja
   * 
   * Lee todos los datos de la hoja en una sola operación batch
   * y los convierte en un array de objetos.
   * 
   * OPTIMIZACIÓN: Solo lee hasta la última fila con datos reales,
   * ignorando filas vacías creadas por el setup inicial.
   * 
   * @returns {Array<Object>} Array de objetos con los registros
   * @throws {Error} Si hay error al leer los datos
   */
  findAll() {
    try {
      // Verificar si la hoja tiene datos
      const lastRow = this.sheet.getLastRow();
      if (lastRow <= 1) {
        // Solo headers o hoja vacía
        return [];
      }
      
      // OPTIMIZACIÓN: Leer solo hasta la última fila con datos
      // En lugar de usar getDataRange() que lee todas las filas (incluso vacías),
      // usamos getRange() con el número exacto de filas con datos
      const lastColumn = this.sheet.getLastColumn();
      const dataRange = this.sheet.getRange(1, 1, lastRow, lastColumn);
      const data = dataRange.getValues();
      
      // Primera fila son los headers
      const headers = data[0];
      
      // Convertir cada fila (excepto headers) en objeto
      // OPTIMIZACIÓN: Filtrar filas completamente vacías
      const records = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        // Verificar si la fila tiene al menos un valor no vacío
        let hasData = false;
        for (let j = 0; j < row.length; j++) {
          if (row[j] !== '' && row[j] !== null && row[j] !== undefined) {
            hasData = true;
            break;
          }
        }
        
        // Solo agregar filas con datos
        if (hasData) {
          const obj = this._rowToObject(row, headers);
          records.push(obj);
        }
      }
      
      return records;
      
    } catch (error) {
      Logger.log('Error en findAll de ' + this.sheetName + ': ' + error.message);
      throw new Error('Error al obtener registros de ' + this.sheetName + ': ' + error.message);
    }
  }
  
  /**
   * findById - Busca un registro por su ID
   * 
   * @param {string} id - ID del registro a buscar
   * @returns {Object|null} Objeto con el registro o null si no se encuentra
   * @throws {Error} Si hay error al buscar
   */
  findById(id) {
    try {
      if (!id) {
        return null;
      }
      
      // Obtener todos los registros y buscar por ID
      const records = this.findAll();
      
      // Buscar el registro con el ID especificado
      for (let i = 0; i < records.length; i++) {
        if (records[i].id === id) {
          return records[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findById de ' + this.sheetName + ': ' + error.message);
      throw new Error('Error al buscar registro en ' + this.sheetName + ': ' + error.message);
    }
  }
  
  /**
   * create - Crea un nuevo registro
   * 
   * Agrega una nueva fila al final de la hoja con los datos del objeto.
   * 
   * @param {Object} obj - Objeto con los datos del registro
   * @returns {Object} El objeto creado (mismo que se pasó)
   * @throws {Error} Si hay error al crear el registro
   */
  create(obj) {
    try {
      if (!obj || typeof obj !== 'object') {
        throw new Error('El objeto a crear es inválido');
      }
      
      // Convertir objeto a fila
      const row = this._objectToRow(obj);
      
      // Agregar fila al final de la hoja
      this.sheet.appendRow(row);
      
      return obj;
      
    } catch (error) {
      Logger.log('Error en create de ' + this.sheetName + ': ' + error.message);
      throw new Error('Error al crear registro en ' + this.sheetName + ': ' + error.message);
    }
  }
  
  /**
   * update - Actualiza un registro existente por ID
   * 
   * Busca el registro por ID y actualiza sus valores.
   * 
   * @param {string} id - ID del registro a actualizar
   * @param {Object} obj - Objeto con los nuevos datos
   * @returns {Object|null} El objeto actualizado o null si no se encontró
   * @throws {Error} Si hay error al actualizar
   */
  update(id, obj) {
    try {
      if (!id) {
        throw new Error('El ID es requerido para actualizar');
      }
      
      if (!obj || typeof obj !== 'object') {
        throw new Error('El objeto a actualizar es inválido');
      }
      
      // Leer todos los datos
      const dataRange = this.sheet.getDataRange();
      const data = dataRange.getValues();
      const headers = data[0];
      
      // Buscar la fila con el ID especificado
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        const rowObj = this._rowToObject(data[i], headers);
        if (rowObj.id === id) {
          rowIndex = i;
          break;
        }
      }
      
      // Si no se encontró, retornar null
      if (rowIndex === -1) {
        Logger.log('Registro con ID ' + id + ' no encontrado en ' + this.sheetName);
        return null;
      }
      
      // Convertir objeto a fila
      const row = this._objectToRow(obj);
      
      // Actualizar la fila (rowIndex + 1 porque las filas empiezan en 1, no en 0)
      const range = this.sheet.getRange(rowIndex + 1, 1, 1, row.length);
      range.setValues([row]);
      
      return obj;
      
    } catch (error) {
      Logger.log('Error en update de ' + this.sheetName + ': ' + error.message);
      throw new Error('Error al actualizar registro en ' + this.sheetName + ': ' + error.message);
    }
  }
  
  /**
   * delete - Elimina un registro por ID
   * 
   * Busca el registro por ID y elimina la fila completa.
   * 
   * @param {string} id - ID del registro a eliminar
   * @returns {boolean} true si se eliminó, false si no se encontró
   * @throws {Error} Si hay error al eliminar
   */
  delete(id) {
    try {
      if (!id) {
        throw new Error('El ID es requerido para eliminar');
      }
      
      // Leer todos los datos
      const dataRange = this.sheet.getDataRange();
      const data = dataRange.getValues();
      const headers = data[0];
      
      // Buscar la fila con el ID especificado
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        const rowObj = this._rowToObject(data[i], headers);
        if (rowObj.id === id) {
          rowIndex = i;
          break;
        }
      }
      
      // Si no se encontró, retornar false
      if (rowIndex === -1) {
        Logger.log('Registro con ID ' + id + ' no encontrado en ' + this.sheetName);
        return false;
      }
      
      // Eliminar la fila (rowIndex + 1 porque las filas empiezan en 1, no en 0)
      this.sheet.deleteRow(rowIndex + 1);
      
      return true;
      
    } catch (error) {
      Logger.log('Error en delete de ' + this.sheetName + ': ' + error.message);
      throw new Error('Error al eliminar registro en ' + this.sheetName + ': ' + error.message);
    }
  }
  
  // ==========================================================================
  // MÉTODOS AUXILIARES
  // ==========================================================================
  
  /**
   * _rowToObject - Convierte una fila (array) en un objeto
   * 
   * Mapea cada valor de la fila a una propiedad del objeto
   * usando los headers como nombres de propiedades.
   * 
   * @private
   * @param {Array} row - Array con los valores de la fila
   * @param {Array} headers - Array con los nombres de las columnas
   * @returns {Object} Objeto con las propiedades mapeadas
   */
  _rowToObject(row, headers) {
    const obj = {};
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = row[i];
      
      // Convertir valores vacíos a null
      obj[header] = (value === '' || value === undefined) ? null : value;
    }
    
    return obj;
  }
  
  /**
   * _objectToRow - Convierte un objeto en una fila (array)
   * 
   * Extrae los valores del objeto en el orden de los headers
   * para crear un array que se puede escribir en la hoja.
   * 
   * @private
   * @param {Object} obj - Objeto con los datos
   * @returns {Array} Array con los valores en el orden de los headers
   */
  _objectToRow(obj) {
    // Obtener headers de la hoja
    const headers = this._getHeaders();
    
    // Crear array con los valores en el orden de los headers
    const row = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = obj[header];
      
      // Convertir null/undefined a string vacío para Google Sheets
      row.push(value === null || value === undefined ? '' : value);
    }
    
    return row;
  }
  
  /**
   * _getHeaders - Obtiene los headers de la hoja (con caché)
   * 
   * Lee la primera fila de la hoja que contiene los nombres de las columnas.
   * Usa caché para evitar lecturas repetidas.
   * 
   * @private
   * @returns {Array<string>} Array con los nombres de las columnas
   */
  _getHeaders() {
    // Si ya están en caché, retornarlos
    if (this._headersCache) {
      return this._headersCache;
    }
    
    // Leer primera fila (headers)
    const lastColumn = this.sheet.getLastColumn();
    if (lastColumn === 0) {
      throw new Error('La hoja ' + this.sheetName + ' no tiene columnas');
    }
    
    const headerRange = this.sheet.getRange(1, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    
    // Guardar en caché
    this._headersCache = headers;
    
    return headers;
  }
  
  /**
   * _clearHeadersCache - Limpia el caché de headers
   * 
   * Útil cuando se modifica la estructura de la hoja.
   * 
   * @private
   */
  _clearHeadersCache() {
    this._headersCache = null;
  }
  
  // ==========================================================================
  // MÉTODOS DE UTILIDAD
  // ==========================================================================
  
  /**
   * count - Cuenta el número de registros en la hoja
   * 
   * @returns {number} Número de registros (sin contar headers)
   */
  count() {
    try {
      const lastRow = this.sheet.getLastRow();
      // Restar 1 por la fila de headers
      return Math.max(0, lastRow - 1);
    } catch (error) {
      Logger.log('Error en count de ' + this.sheetName + ': ' + error.message);
      return 0;
    }
  }
  
  /**
   * exists - Verifica si existe un registro con el ID especificado
   * 
   * @param {string} id - ID a verificar
   * @returns {boolean} true si existe, false si no
   */
  exists(id) {
    try {
      return this.findById(id) !== null;
    } catch (error) {
      Logger.log('Error en exists de ' + this.sheetName + ': ' + error.message);
      return false;
    }
  }
  
  /**
   * clear - Elimina todos los registros (mantiene headers)
   * 
   * PRECAUCIÓN: Esta operación no se puede deshacer.
   * 
   * @returns {number} Número de registros eliminados
   */
  clear() {
    try {
      const lastRow = this.sheet.getLastRow();
      
      // Si solo hay headers o está vacía, no hacer nada
      if (lastRow <= 1) {
        return 0;
      }
      
      // Eliminar todas las filas excepto headers
      const numRowsToDelete = lastRow - 1;
      this.sheet.deleteRows(2, numRowsToDelete);
      
      return numRowsToDelete;
      
    } catch (error) {
      Logger.log('Error en clear de ' + this.sheetName + ': ' + error.message);
      throw new Error('Error al limpiar registros de ' + this.sheetName + ': ' + error.message);
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * testBaseRepository - Prueba las operaciones básicas del BaseRepository
 * 
 * Ejecutar desde el editor de Apps Script para probar.
 * Requiere que exista la hoja CFG_Users con datos de ejemplo.
 */
function testBaseRepository() {
  Logger.log('=== Iniciando pruebas de BaseRepository ===');
  
  try {
    // Crear instancia del repositorio
    Logger.log('1. Creando instancia de BaseRepository para CFG_Users...');
    const repo = new BaseRepository(SHEETS.CFG_USERS);
    Logger.log('✓ Instancia creada correctamente');
    
    // Probar count
    Logger.log('\n2. Probando count()...');
    const count = repo.count();
    Logger.log('✓ Número de registros: ' + count);
    
    // Probar findAll
    Logger.log('\n3. Probando findAll()...');
    const allRecords = repo.findAll();
    Logger.log('✓ Registros obtenidos: ' + allRecords.length);
    if (allRecords.length > 0) {
      Logger.log('Primer registro: ' + JSON.stringify(allRecords[0]));
    }
    
    // Probar findById (si hay registros)
    if (allRecords.length > 0) {
      Logger.log('\n4. Probando findById()...');
      const firstId = allRecords[0].id;
      const record = repo.findById(firstId);
      if (record) {
        Logger.log('✓ Registro encontrado: ' + JSON.stringify(record));
      } else {
        Logger.log('✗ Registro no encontrado');
      }
    }
    
    // Probar exists
    if (allRecords.length > 0) {
      Logger.log('\n5. Probando exists()...');
      const firstId = allRecords[0].id;
      const exists = repo.exists(firstId);
      Logger.log('✓ Existe: ' + exists);
    }
    
    Logger.log('\n=== Pruebas completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testBaseRepositoryCRUD - Prueba operaciones CRUD completas
 * 
 * PRECAUCIÓN: Esta prueba crea, modifica y elimina registros.
 * Solo ejecutar en un ambiente de prueba.
 */
function testBaseRepositoryCRUD() {
  Logger.log('=== Iniciando pruebas CRUD de BaseRepository ===');
  
  try {
    const repo = new BaseRepository(SHEETS.CFG_USERS);
    
    // Crear un registro de prueba
    Logger.log('\n1. Probando create()...');
    const testId = 'test-' + new Date().getTime();
    const testRecord = {
      id: testId,
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      roles: '["Vendedor"]',
      stores: '["Mujeres"]',
      active: true,
      created_at: new Date()
    };
    
    const created = repo.create(testRecord);
    Logger.log('✓ Registro creado: ' + JSON.stringify(created));
    
    // Verificar que se creó
    Logger.log('\n2. Verificando que el registro existe...');
    const found = repo.findById(testId);
    if (found) {
      Logger.log('✓ Registro encontrado después de crear');
    } else {
      Logger.log('✗ Registro NO encontrado después de crear');
    }
    
    // Actualizar el registro
    Logger.log('\n3. Probando update()...');
    testRecord.name = 'Usuario de Prueba ACTUALIZADO';
    const updated = repo.update(testId, testRecord);
    if (updated) {
      Logger.log('✓ Registro actualizado: ' + JSON.stringify(updated));
    } else {
      Logger.log('✗ No se pudo actualizar el registro');
    }
    
    // Verificar la actualización
    Logger.log('\n4. Verificando la actualización...');
    const foundAfterUpdate = repo.findById(testId);
    if (foundAfterUpdate && foundAfterUpdate.name === 'Usuario de Prueba ACTUALIZADO') {
      Logger.log('✓ Actualización verificada correctamente');
    } else {
      Logger.log('✗ La actualización no se reflejó correctamente');
    }
    
    // Eliminar el registro
    Logger.log('\n5. Probando delete()...');
    const deleted = repo.delete(testId);
    if (deleted) {
      Logger.log('✓ Registro eliminado correctamente');
    } else {
      Logger.log('✗ No se pudo eliminar el registro');
    }
    
    // Verificar que se eliminó
    Logger.log('\n6. Verificando que el registro fue eliminado...');
    const foundAfterDelete = repo.findById(testId);
    if (!foundAfterDelete) {
      Logger.log('✓ Registro eliminado correctamente (no se encuentra)');
    } else {
      Logger.log('✗ El registro aún existe después de eliminar');
    }
    
    Logger.log('\n=== Pruebas CRUD completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas CRUD: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

// ============================================================================
// REPOSITORIOS ESPECÍFICOS
// ============================================================================

/**
 * UserRepository - Repositorio para CFG_Users
 * 
 * Gestiona el acceso a la hoja de usuarios del sistema.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class UserRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CFG_USERS);
  }
  
  /**
   * findByEmail - Busca un usuario por su email
   * 
   * @param {string} email - Email del usuario a buscar
   * @returns {Object|null} Usuario encontrado o null
   * @throws {Error} Si hay error al buscar
   */
  findByEmail(email) {
    try {
      if (!email) {
        return null;
      }
      
      // Normalizar email (lowercase, trim)
      const normalizedEmail = email.toLowerCase().trim();
      
      // Obtener todos los usuarios
      const users = this.findAll();
      
      // Buscar por email
      for (let i = 0; i < users.length; i++) {
        const userEmail = users[i].email;
        if (userEmail && userEmail.toLowerCase().trim() === normalizedEmail) {
          return users[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByEmail de UserRepository: ' + error.message);
      throw new Error('Error al buscar usuario por email: ' + error.message);
    }
  }
}

/**
 * ProductRepository - Repositorio para CAT_Products
 * 
 * Gestiona el acceso a la hoja de productos del catálogo.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class ProductRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CAT_PRODUCTS);
  }
  
  /**
   * findAll - Obtiene todos los productos con caché
   * 
   * Override del método base para agregar caché de productos.
   * NOTA: El caché se deshabilita si hay demasiados productos (>500)
   * para evitar el error "Argument too large"
   * 
   * Requisitos: 29.1, 29.2
   * 
   * @returns {Array<Object>} Array de productos
   */
  findAll() {
    try {
      // Intentar obtener del caché primero
      const cacheKey = 'products_all';
      const cached = CacheManager.get(cacheKey);
      
      if (cached !== null && Array.isArray(cached)) {
        Logger.log('findAll (ProductRepository): retornando desde caché (' + cached.length + ' productos)');
        return cached;
      }
      
      // Si no está en caché, obtener de la base de datos
      const products = BaseRepository.prototype.findAll.call(this);
      
      // Solo cachear si hay menos de 500 productos (límite de 100KB del caché)
      if (products.length < 500) {
        // Guardar en caché por 5 minutos (TTL definido en LIMITS.CACHE_TTL_PRODUCTS)
        CacheManager.put(cacheKey, products, LIMITS.CACHE_TTL_PRODUCTS);
        Logger.log('findAll (ProductRepository): obtenido de BD y guardado en caché (' + products.length + ' productos)');
      } else {
        Logger.log('findAll (ProductRepository): obtenido de BD sin caché (' + products.length + ' productos - demasiados para cachear)');
      }
      
      return products;
      
    } catch (error) {
      Logger.log('Error en findAll de ProductRepository: ' + error.message);
      // En caso de error, intentar obtener directamente de BD sin caché
      return BaseRepository.prototype.findAll.call(this);
    }
  }
  
  /**
   * create - Crea un producto e invalida el caché
   * 
   * Override del método base para invalidar caché al crear.
   * ACTUALIZADO: Valida integridad referencial de atributos maestros
   * 
   * Requisitos: 29.3, 32.3, 32.5
   * 
   * @param {Object} obj - Objeto producto a crear
   * @returns {Object} Producto creado
   * @throws {Error} Si algún atributo no es válido
   */
  create(obj) {
    // Validar integridad referencial de atributos maestros
    this._validateAttributes(obj);
    
    const result = BaseRepository.prototype.create.call(this, obj);
    
    // Invalidar caché de productos
    CacheManager.invalidate('products_all');
    Logger.log('create (ProductRepository): caché invalidado');
    
    return result;
  }
  
  /**
   * _validateAttributes - Valida que los atributos maestros existen
   * 
   * Verifica que line_id, category_id, brand_id y size_id existen
   * en sus respectivas tablas maestras antes de crear/actualizar producto.
   * 
   * Requisitos: 32.3, 32.5
   * 
   * @param {Object} obj - Objeto producto a validar
   * @throws {Error} Si algún atributo no es válido
   * @private
   */
  _validateAttributes(obj) {
    try {
      // Validar line_id si está presente
      if (obj.line_id) {
        const lineRepo = new LineRepository();
        const line = lineRepo.findById(obj.line_id);
        
        if (!line) {
          throw new Error('La línea con ID "' + obj.line_id + '" no existe');
        }
        
        if (!line.active) {
          throw new Error('La línea "' + line.name + '" no está activa');
        }
      }
      
      // Validar category_id si está presente
      if (obj.category_id) {
        const categoryRepo = new CategoryRepository();
        const category = categoryRepo.findById(obj.category_id);
        
        if (!category) {
          throw new Error('La categoría con ID "' + obj.category_id + '" no existe');
        }
        
        if (!category.active) {
          throw new Error('La categoría "' + category.name + '" no está activa');
        }
        
        // Validar que la categoría pertenece a la línea especificada
        if (obj.line_id && category.line_id !== obj.line_id) {
          throw new Error('La categoría "' + category.name + '" no pertenece a la línea especificada');
        }
      }
      
      // Validar brand_id si está presente
      if (obj.brand_id) {
        const brandRepo = new BrandRepository();
        const brand = brandRepo.findById(obj.brand_id);
        
        if (!brand) {
          throw new Error('La marca con ID "' + obj.brand_id + '" no existe');
        }
        
        if (!brand.active) {
          throw new Error('La marca "' + brand.name + '" no está activa');
        }
      }
      
      // Validar size_id si está presente
      if (obj.size_id) {
        const sizeRepo = new SizeRepository();
        const size = sizeRepo.findById(obj.size_id);
        
        if (!size) {
          throw new Error('La talla con ID "' + obj.size_id + '" no existe');
        }
        
        if (!size.active) {
          throw new Error('La talla "' + size.name + '" no está activa');
        }
      }
      
      Logger.log('_validateAttributes: Todos los atributos son válidos');
      
    } catch (error) {
      Logger.log('Error en _validateAttributes: ' + error.message);
      throw error;
    }
  }
  
  /**
   * update - Actualiza un producto e invalida el caché
   * 
   * Override del método base para invalidar caché al actualizar.
   * ACTUALIZADO: Valida integridad referencial de atributos maestros
   * 
   * Requisitos: 29.3, 32.3, 32.5
   * 
   * @param {string} id - ID del producto
   * @param {Object} obj - Objeto producto con datos actualizados
   * @returns {Object} Producto actualizado
   * @throws {Error} Si algún atributo no es válido
   */
  update(id, obj) {
    // Validar integridad referencial de atributos maestros
    this._validateAttributes(obj);
    
    const result = BaseRepository.prototype.update.call(this, id, obj);
    
    // Invalidar caché de productos
    CacheManager.invalidate('products_all');
    Logger.log('update (ProductRepository): caché invalidado');
    
    return result;
  }
  
  /**
   * findByBarcode - Busca un producto por su código de barras
   * 
   * @param {string} barcode - Código de barras del producto
   * @returns {Object|null} Producto encontrado o null
   * @throws {Error} Si hay error al buscar
   */
  findByBarcode(barcode) {
    try {
      if (!barcode) {
        return null;
      }
      
      // Normalizar barcode (trim)
      const normalizedBarcode = String(barcode).trim();
      
      // Obtener todos los productos (usa caché automáticamente)
      const products = this.findAll();
      
      // Buscar por barcode
      for (let i = 0; i < products.length; i++) {
        const productBarcode = products[i].barcode;
        if (productBarcode && String(productBarcode).trim() === normalizedBarcode) {
          return products[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByBarcode de ProductRepository: ' + error.message);
      throw new Error('Error al buscar producto por código de barras: ' + error.message);
    }
  }
  
  /**
   * search - Busca productos por nombre o categoría
   * 
   * Realiza una búsqueda case-insensitive en los campos name y category.
   * Retorna todos los productos que contengan el término de búsqueda.
   * 
   * @param {string} query - Término de búsqueda
   * @returns {Array<Object>} Array de productos que coinciden con la búsqueda
   * @throws {Error} Si hay error al buscar
   */
  search(query) {
    try {
      if (!query) {
        return [];
      }
      
      // Normalizar query (lowercase, trim)
      const normalizedQuery = query.toLowerCase().trim();
      
      // Si el query está vacío después de normalizar, retornar vacío
      if (normalizedQuery === '') {
        return [];
      }
      
      // Obtener todos los productos (usa caché automáticamente)
      const products = this.findAll();
      
      // Filtrar productos que coincidan en nombre o categoría
      const results = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Buscar en nombre
        const name = product.name ? String(product.name).toLowerCase() : '';
        const nameMatch = name.indexOf(normalizedQuery) !== -1;
        
        // Buscar en categoría
        const category = product.category ? String(product.category).toLowerCase() : '';
        const categoryMatch = category.indexOf(normalizedQuery) !== -1;
        
        // Si coincide en nombre o categoría, agregar a resultados
        if (nameMatch || categoryMatch) {
          results.push(product);
        }
      }
      
      return results;
      
    } catch (error) {
      Logger.log('Error en search de ProductRepository: ' + error.message);
      throw new Error('Error al buscar productos: ' + error.message);
    }
  }
}

/**
 * StockRepository - Repositorio para INV_Stock
 * 
 * Gestiona el acceso a la hoja de stock de inventario.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class StockRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.INV_STOCK);
  }
  
  /**
   * findByWarehouseAndProduct - Busca stock por almacén y producto
   * 
   * @param {string} warehouseId - ID del almacén
   * @param {string} productId - ID del producto
   * @returns {Object|null} Registro de stock encontrado o null
   * @throws {Error} Si hay error al buscar
   */
  findByWarehouseAndProduct(warehouseId, productId) {
    try {
      if (!warehouseId || !productId) {
        return null;
      }
      
      // Obtener todos los registros de stock
      const stockRecords = this.findAll();
      
      // Buscar por warehouseId y productId
      for (let i = 0; i < stockRecords.length; i++) {
        const record = stockRecords[i];
        if (record.warehouse_id === warehouseId && record.product_id === productId) {
          return record;
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByWarehouseAndProduct de StockRepository: ' + error.message);
      throw new Error('Error al buscar stock: ' + error.message);
    }
  }
  
  /**
   * updateQuantity - Actualiza la cantidad de stock (incremento/decremento)
   * 
   * Aplica un delta (positivo o negativo) a la cantidad actual de stock.
   * Si el registro no existe, lo crea con la cantidad inicial igual al delta.
   * 
   * @param {string} warehouseId - ID del almacén
   * @param {string} productId - ID del producto
   * @param {number} delta - Cantidad a incrementar (positivo) o decrementar (negativo)
   * @returns {Object} Registro de stock actualizado
   * @throws {Error} Si hay error al actualizar o si el delta resulta en stock negativo
   */
  updateQuantity(warehouseId, productId, delta) {
    try {
      // Validar parámetros
      if (!warehouseId || !productId) {
        throw new Error('warehouseId y productId son requeridos');
      }
      
      if (typeof delta !== 'number' || isNaN(delta)) {
        throw new Error('delta debe ser un número válido');
      }
      
      // Buscar registro existente
      const existingRecord = this.findByWarehouseAndProduct(warehouseId, productId);
      
      if (existingRecord) {
        // Actualizar cantidad existente
        const currentQuantity = Number(existingRecord.quantity) || 0;
        const newQuantity = currentQuantity + delta;
        
        // Validar que no quede negativo
        if (newQuantity < 0) {
          throw new Error('La operación resultaría en stock negativo (actual: ' + currentQuantity + ', delta: ' + delta + ')');
        }
        
        // Actualizar registro
        existingRecord.quantity = newQuantity;
        existingRecord.last_updated = new Date();
        
        this.update(existingRecord.id, existingRecord);
        
        return existingRecord;
        
      } else {
        // Crear nuevo registro
        // Si el delta es negativo y no existe registro, es un error
        if (delta < 0) {
          throw new Error('No se puede decrementar stock de un producto sin registro previo');
        }
        
        // Crear nuevo registro con la cantidad inicial
        const newRecord = {
          id: 'stock-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
          warehouse_id: warehouseId,
          product_id: productId,
          quantity: delta,
          last_updated: new Date()
        };
        
        this.create(newRecord);
        
        return newRecord;
      }
      
    } catch (error) {
      Logger.log('Error en updateQuantity de StockRepository: ' + error.message);
      throw new Error('Error al actualizar cantidad de stock: ' + error.message);
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA PARA REPOSITORIOS ESPECÍFICOS
// ============================================================================

/**
 * testUserRepository - Prueba el UserRepository
 */
function testUserRepository() {
  Logger.log('=== Iniciando pruebas de UserRepository ===');
  
  try {
    const repo = new UserRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const users = repo.findAll();
    Logger.log('✓ Usuarios encontrados: ' + users.length);
    
    // Probar findByEmail (si hay usuarios)
    if (users.length > 0) {
      Logger.log('\n2. Probando findByEmail()...');
      const firstEmail = users[0].email;
      Logger.log('Buscando email: ' + firstEmail);
      
      const user = repo.findByEmail(firstEmail);
      if (user) {
        Logger.log('✓ Usuario encontrado: ' + JSON.stringify(user));
      } else {
        Logger.log('✗ Usuario no encontrado');
      }
      
      // Probar con email en mayúsculas (debe funcionar por normalización)
      Logger.log('\n3. Probando findByEmail() con mayúsculas...');
      const userUpper = repo.findByEmail(firstEmail.toUpperCase());
      if (userUpper) {
        Logger.log('✓ Usuario encontrado (normalización funcionó)');
      } else {
        Logger.log('✗ Usuario no encontrado');
      }
    }
    
    Logger.log('\n=== Pruebas de UserRepository completadas ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
  }
}

/**
 * testProductRepository - Prueba el ProductRepository
 */
function testProductRepository() {
  Logger.log('=== Iniciando pruebas de ProductRepository ===');
  
  try {
    const repo = new ProductRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const products = repo.findAll();
    Logger.log('✓ Productos encontrados: ' + products.length);
    
    // Probar findByBarcode (si hay productos)
    if (products.length > 0) {
      Logger.log('\n2. Probando findByBarcode()...');
      const firstBarcode = products[0].barcode;
      Logger.log('Buscando barcode: ' + firstBarcode);
      
      const product = repo.findByBarcode(firstBarcode);
      if (product) {
        Logger.log('✓ Producto encontrado: ' + JSON.stringify(product));
      } else {
        Logger.log('✗ Producto no encontrado');
      }
    }
    
    // Probar search
    if (products.length > 0) {
      Logger.log('\n3. Probando search()...');
      const firstProduct = products[0];
      
      // Buscar por parte del nombre
      if (firstProduct.name) {
        const searchTerm = firstProduct.name.substring(0, 5);
        Logger.log('Buscando: ' + searchTerm);
        
        const results = repo.search(searchTerm);
        Logger.log('✓ Resultados encontrados: ' + results.length);
      }
      
      // Buscar por categoría
      if (firstProduct.category) {
        Logger.log('\n4. Probando search() por categoría...');
        const results = repo.search(firstProduct.category);
        Logger.log('✓ Resultados encontrados: ' + results.length);
      }
    }
    
    Logger.log('\n=== Pruebas de ProductRepository completadas ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
  }
}

/**
 * testStockRepository - Prueba el StockRepository
 */
function testStockRepository() {
  Logger.log('=== Iniciando pruebas de StockRepository ===');
  
  try {
    const repo = new StockRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const stockRecords = repo.findAll();
    Logger.log('✓ Registros de stock encontrados: ' + stockRecords.length);
    
    // Probar findByWarehouseAndProduct (si hay registros)
    if (stockRecords.length > 0) {
      Logger.log('\n2. Probando findByWarehouseAndProduct()...');
      const firstRecord = stockRecords[0];
      Logger.log('Buscando warehouse: ' + firstRecord.warehouse_id + ', product: ' + firstRecord.product_id);
      
      const record = repo.findByWarehouseAndProduct(firstRecord.warehouse_id, firstRecord.product_id);
      if (record) {
        Logger.log('✓ Registro encontrado: ' + JSON.stringify(record));
      } else {
        Logger.log('✗ Registro no encontrado');
      }
    }
    
    // Probar updateQuantity (solo lectura, no modificar datos reales)
    Logger.log('\n3. Información sobre updateQuantity()...');
    Logger.log('updateQuantity() permite incrementar o decrementar stock');
    Logger.log('Ejemplo: updateQuantity("warehouse1", "product1", 10) incrementa en 10');
    Logger.log('Ejemplo: updateQuantity("warehouse1", "product1", -5) decrementa en 5');
    Logger.log('NOTA: No se ejecuta en esta prueba para no modificar datos reales');
    
    Logger.log('\n=== Pruebas de StockRepository completadas ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
  }
}

/**
 * MovementRepository - Repositorio para INV_Movements
 * 
 * Gestiona el acceso a la hoja de movimientos de inventario.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class MovementRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.INV_MOVEMENTS);
  }
  
  /**
   * findByWarehouse - Busca movimientos por almacén con filtros opcionales
   * 
   * @param {string} warehouseId - ID del almacén
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.type - Tipo de movimiento (ENTRADA, SALIDA, AJUSTE, TRANSFERENCIA_OUT, TRANSFERENCIA_IN)
   * @param {Date} filters.startDate - Fecha de inicio
   * @param {Date} filters.endDate - Fecha de fin
   * @param {string} filters.productId - ID del producto
   * @returns {Array<Object>} Array de movimientos que coinciden con los filtros
   * @throws {Error} Si hay error al buscar
   */
  findByWarehouse(warehouseId, filters) {
    try {
      if (!warehouseId) {
        return [];
      }
      
      // Obtener todos los movimientos
      const movements = this.findAll();
      
      // Filtrar por almacén
      let results = movements.filter(function(movement) {
        return movement.warehouse_id === warehouseId;
      });
      
      // Aplicar filtros adicionales si se proporcionan
      if (filters) {
        // Filtrar por tipo
        if (filters.type) {
          results = results.filter(function(movement) {
            return movement.type === filters.type;
          });
        }
        
        // Filtrar por producto
        if (filters.productId) {
          results = results.filter(function(movement) {
            return movement.product_id === filters.productId;
          });
        }
        
        // Filtrar por rango de fechas
        if (filters.startDate || filters.endDate) {
          results = results.filter(function(movement) {
            if (!movement.created_at) {
              return false;
            }
            
            const movementDate = new Date(movement.created_at);
            
            // Verificar fecha de inicio
            if (filters.startDate) {
              const startDate = new Date(filters.startDate);
              if (movementDate < startDate) {
                return false;
              }
            }
            
            // Verificar fecha de fin
            if (filters.endDate) {
              const endDate = new Date(filters.endDate);
              if (movementDate > endDate) {
                return false;
              }
            }
            
            return true;
          });
        }
      }
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByWarehouse de MovementRepository: ' + error.message);
      throw new Error('Error al buscar movimientos por almacén: ' + error.message);
    }
  }
  
  /**
   * findByProduct - Busca movimientos por producto
   * 
   * @param {string} productId - ID del producto
   * @returns {Array<Object>} Array de movimientos del producto
   * @throws {Error} Si hay error al buscar
   */
  findByProduct(productId) {
    try {
      if (!productId) {
        return [];
      }
      
      // Obtener todos los movimientos
      const movements = this.findAll();
      
      // Filtrar por producto
      const results = movements.filter(function(movement) {
        return movement.product_id === productId;
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByProduct de MovementRepository: ' + error.message);
      throw new Error('Error al buscar movimientos por producto: ' + error.message);
    }
  }
}

/**
 * ClientRepository - Repositorio para CRM_Clients
 * 
 * Gestiona el acceso a la hoja de clientes.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class ClientRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CRM_CLIENTS);
  }
  
  /**
   * findByDNI - Busca un cliente por su DNI
   * 
   * @param {string} dni - DNI del cliente a buscar
   * @returns {Object|null} Cliente encontrado o null
   * @throws {Error} Si hay error al buscar
   */
  findByDNI(dni) {
    try {
      if (!dni) {
        return null;
      }
      
      // Normalizar DNI (trim)
      const normalizedDNI = String(dni).trim();
      
      // Obtener todos los clientes
      const clients = this.findAll();
      
      // Buscar por DNI
      for (let i = 0; i < clients.length; i++) {
        const clientDNI = clients[i].dni;
        if (clientDNI && String(clientDNI).trim() === normalizedDNI) {
          return clients[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByDNI de ClientRepository: ' + error.message);
      throw new Error('Error al buscar cliente por DNI: ' + error.message);
    }
  }
  
  /**
   * search - Busca clientes por nombre, DNI o teléfono
   * 
   * Realiza una búsqueda case-insensitive en los campos name, dni y phone.
   * Retorna todos los clientes que contengan el término de búsqueda.
   * 
   * @param {string} query - Término de búsqueda
   * @returns {Array<Object>} Array de clientes que coinciden con la búsqueda
   * @throws {Error} Si hay error al buscar
   */
  search(query) {
    try {
      if (!query) {
        return [];
      }
      
      // Normalizar query (lowercase, trim)
      const normalizedQuery = query.toLowerCase().trim();
      
      // Si el query está vacío después de normalizar, retornar vacío
      if (normalizedQuery === '') {
        return [];
      }
      
      // Obtener todos los clientes
      const clients = this.findAll();
      
      // Filtrar clientes que coincidan en nombre, DNI o teléfono
      const results = [];
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        
        // Buscar en nombre
        const name = client.name ? String(client.name).toLowerCase() : '';
        const nameMatch = name.indexOf(normalizedQuery) !== -1;
        
        // Buscar en DNI
        const dni = client.dni ? String(client.dni).toLowerCase() : '';
        const dniMatch = dni.indexOf(normalizedQuery) !== -1;
        
        // Buscar en teléfono
        const phone = client.phone ? String(client.phone).toLowerCase() : '';
        const phoneMatch = phone.indexOf(normalizedQuery) !== -1;
        
        // Si coincide en nombre, DNI o teléfono, agregar a resultados
        if (nameMatch || dniMatch || phoneMatch) {
          results.push(client);
        }
      }
      
      return results;
      
    } catch (error) {
      Logger.log('Error en search de ClientRepository: ' + error.message);
      throw new Error('Error al buscar clientes: ' + error.message);
    }
  }
}

/**
 * AuditRepository - Repositorio para AUD_Log
 * 
 * Gestiona el acceso a la hoja de log de auditoría.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * IMPORTANTE: Este repositorio solo permite inserción (create) y lectura (find).
 * No se permite actualizar o eliminar registros de auditoría (inmutabilidad).
 * 
 * @class
 * @extends BaseRepository
 */
class AuditRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.AUD_LOG);
  }
  
  /**
   * log - Registra una operación en el log de auditoría
   * 
   * Este es el método principal para crear entradas de auditoría.
   * Genera automáticamente el ID y timestamp.
   * 
   * @param {string} operation - Nombre de la operación (ej: "CREATE_SALE", "UPDATE_PRICE")
   * @param {string} entityType - Tipo de entidad afectada (ej: "SALE", "PRODUCT")
   * @param {string} entityId - ID de la entidad afectada
   * @param {Object} oldValues - Valores anteriores (objeto que se convertirá a JSON)
   * @param {Object} newValues - Valores nuevos (objeto que se convertirá a JSON)
   * @param {string} userId - ID del usuario que ejecutó la operación
   * @returns {Object} Registro de auditoría creado
   * @throws {Error} Si hay error al registrar
   */
  log(operation, entityType, entityId, oldValues, newValues, userId) {
    try {
      // Validar parámetros requeridos
      if (!operation) {
        throw new Error('operation es requerido');
      }
      if (!entityType) {
        throw new Error('entityType es requerido');
      }
      if (!entityId) {
        throw new Error('entityId es requerido');
      }
      if (!userId) {
        throw new Error('userId es requerido');
      }
      
      // Crear registro de auditoría
      const auditRecord = {
        id: 'audit-' + new Date().getTime() + '-' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        user_id: userId,
        operation: operation,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues ? JSON.stringify(oldValues) : '',
        new_values: newValues ? JSON.stringify(newValues) : '',
        ip_address: '' // Apps Script no tiene acceso directo a IP del cliente
      };
      
      // Insertar registro
      this.create(auditRecord);
      
      return auditRecord;
      
    } catch (error) {
      Logger.log('Error en log de AuditRepository: ' + error.message);
      throw new Error('Error al registrar auditoría: ' + error.message);
    }
  }
  
  /**
   * findByFilters - Busca registros de auditoría con filtros
   * 
   * @param {Object} filters - Filtros de búsqueda
   * @param {Date} filters.startDate - Fecha de inicio
   * @param {Date} filters.endDate - Fecha de fin
   * @param {string} filters.userId - ID del usuario
   * @param {string} filters.operation - Nombre de la operación
   * @param {string} filters.entityType - Tipo de entidad
   * @param {string} filters.entityId - ID de la entidad
   * @returns {Array<Object>} Array de registros de auditoría que coinciden con los filtros
   * @throws {Error} Si hay error al buscar
   */
  findByFilters(filters) {
    try {
      if (!filters) {
        return this.findAll();
      }
      
      // Obtener todos los registros
      let results = this.findAll();
      
      // Filtrar por usuario
      if (filters.userId) {
        results = results.filter(function(record) {
          return record.user_id === filters.userId;
        });
      }
      
      // Filtrar por operación
      if (filters.operation) {
        results = results.filter(function(record) {
          return record.operation === filters.operation;
        });
      }
      
      // Filtrar por tipo de entidad
      if (filters.entityType) {
        results = results.filter(function(record) {
          return record.entity_type === filters.entityType;
        });
      }
      
      // Filtrar por ID de entidad
      if (filters.entityId) {
        results = results.filter(function(record) {
          return record.entity_id === filters.entityId;
        });
      }
      
      // Filtrar por rango de fechas
      if (filters.startDate || filters.endDate) {
        results = results.filter(function(record) {
          if (!record.timestamp) {
            return false;
          }
          
          const recordDate = new Date(record.timestamp);
          
          // Verificar fecha de inicio
          if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            if (recordDate < startDate) {
              return false;
            }
          }
          
          // Verificar fecha de fin
          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            if (recordDate > endDate) {
              return false;
            }
          }
          
          return true;
        });
      }
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByFilters de AuditRepository: ' + error.message);
      throw new Error('Error al buscar registros de auditoría: ' + error.message);
    }
  }
  
  /**
   * update - DESHABILITADO: No se permite actualizar registros de auditoría
   * 
   * @throws {Error} Siempre lanza error (inmutabilidad del log)
   */
  update(id, obj) {
    throw new Error('No se permite actualizar registros de auditoría (inmutabilidad)');
  }
  
  /**
   * delete - DESHABILITADO: No se permite eliminar registros de auditoría
   * 
   * @throws {Error} Siempre lanza error (inmutabilidad del log)
   */
  delete(id) {
    throw new Error('No se permite eliminar registros de auditoría (inmutabilidad)');
  }
}

/**
 * SaleRepository - Repositorio para POS_Sales
 * 
 * Gestiona el acceso a la hoja de ventas del punto de venta.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class SaleRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.POS_SALES);
  }
  
  /**
   * findByStore - Busca ventas por tienda con filtros opcionales
   * 
   * @param {string} storeId - ID de la tienda
   * @param {Object} filters - Filtros opcionales
   * @param {Date} filters.startDate - Fecha de inicio
   * @param {Date} filters.endDate - Fecha de fin
   * @param {string} filters.saleType - Tipo de venta (CONTADO, CREDITO)
   * @param {string} filters.paymentStatus - Estado de pago (PAID, PENDING, PARTIAL)
   * @param {string} filters.userId - ID del vendedor
   * @returns {Array<Object>} Array de ventas que coinciden con los filtros
   * @throws {Error} Si hay error al buscar
   */
  findByStore(storeId, filters) {
    try {
      if (!storeId) {
        return [];
      }
      
      // Obtener todas las ventas
      const sales = this.findAll();
      
      // Filtrar por tienda
      let results = sales.filter(function(sale) {
        return sale.store_id === storeId;
      });
      
      // Aplicar filtros adicionales si se proporcionan
      if (filters) {
        // Filtrar por tipo de venta
        if (filters.saleType) {
          results = results.filter(function(sale) {
            return sale.sale_type === filters.saleType;
          });
        }
        
        // Filtrar por estado de pago
        if (filters.paymentStatus) {
          results = results.filter(function(sale) {
            return sale.payment_status === filters.paymentStatus;
          });
        }
        
        // Filtrar por vendedor
        if (filters.userId) {
          results = results.filter(function(sale) {
            return sale.user_id === filters.userId;
          });
        }
        
        // Filtrar por rango de fechas
        if (filters.startDate || filters.endDate) {
          results = results.filter(function(sale) {
            if (!sale.created_at) {
              return false;
            }
            
            const saleDate = new Date(sale.created_at);
            
            // Verificar fecha de inicio
            if (filters.startDate) {
              const startDate = new Date(filters.startDate);
              if (saleDate < startDate) {
                return false;
              }
            }
            
            // Verificar fecha de fin
            if (filters.endDate) {
              const endDate = new Date(filters.endDate);
              if (saleDate > endDate) {
                return false;
              }
            }
            
            return true;
          });
        }
      }
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByStore de SaleRepository: ' + error.message);
      throw new Error('Error al buscar ventas por tienda: ' + error.message);
    }
  }
  
  /**
   * findByDateRange - Busca ventas en un rango de fechas
   * 
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {Array<Object>} Array de ventas en el rango de fechas
   * @throws {Error} Si hay error al buscar
   */
  findByDateRange(startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new Error('startDate y endDate son requeridos');
      }
      
      // Obtener todas las ventas
      const sales = this.findAll();
      
      // Filtrar por rango de fechas
      const results = sales.filter(function(sale) {
        if (!sale.created_at) {
          return false;
        }
        
        const saleDate = new Date(sale.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return saleDate >= start && saleDate <= end;
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByDateRange de SaleRepository: ' + error.message);
      throw new Error('Error al buscar ventas por rango de fechas: ' + error.message);
    }
  }
}

/**
 * SaleItemRepository - Repositorio para POS_SaleItems
 * 
 * Gestiona el acceso a la hoja de items de venta.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class SaleItemRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.POS_SALE_ITEMS);
  }
  
  /**
   * findBySale - Busca todos los items de una venta específica
   * 
   * @param {string} saleId - ID de la venta
   * @returns {Array<Object>} Array de items de la venta
   * @throws {Error} Si hay error al buscar
   */
  findBySale(saleId) {
    try {
      if (!saleId) {
        return [];
      }
      
      // Obtener todos los items
      const items = this.findAll();
      
      // Filtrar por sale_id
      const results = items.filter(function(item) {
        return item.sale_id === saleId;
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findBySale de SaleItemRepository: ' + error.message);
      throw new Error('Error al buscar items de venta: ' + error.message);
    }
  }
}

/**
 * CreditPlanRepository - Repositorio para CRD_Plans
 * 
 * Gestiona el acceso a la hoja de planes de crédito.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class CreditPlanRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CRD_PLANS);
  }
  
  /**
   * findByClient - Busca todos los planes de crédito de un cliente
   * 
   * Retorna todos los planes de crédito asociados a un cliente específico,
   * ordenados por fecha de creación (más recientes primero).
   * 
   * @param {string} clientId - ID del cliente
   * @returns {Array<Object>} Array de planes de crédito del cliente
   * @throws {Error} Si hay error al buscar
   */
  findByClient(clientId) {
    try {
      if (!clientId) {
        return [];
      }
      
      // Obtener todos los planes
      const plans = this.findAll();
      
      // Filtrar por client_id
      const results = plans.filter(function(plan) {
        return plan.client_id === clientId;
      });
      
      // Ordenar por fecha de creación (más recientes primero)
      results.sort(function(a, b) {
        if (!a.created_at || !b.created_at) {
          return 0;
        }
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Orden descendente
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByClient de CreditPlanRepository: ' + error.message);
      throw new Error('Error al buscar planes de crédito por cliente: ' + error.message);
    }
  }
  
  /**
   * findBySale - Busca el plan de crédito asociado a una venta
   * 
   * Retorna el plan de crédito vinculado a una venta específica.
   * Una venta a crédito debe tener exactamente un plan de crédito asociado.
   * 
   * @param {string} saleId - ID de la venta
   * @returns {Object|null} Plan de crédito encontrado o null si no existe
   * @throws {Error} Si hay error al buscar
   */
  findBySale(saleId) {
    try {
      if (!saleId) {
        return null;
      }
      
      // Obtener todos los planes
      const plans = this.findAll();
      
      // Buscar por sale_id
      for (let i = 0; i < plans.length; i++) {
        if (plans[i].sale_id === saleId) {
          return plans[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findBySale de CreditPlanRepository: ' + error.message);
      throw new Error('Error al buscar plan de crédito por venta: ' + error.message);
    }
  }
}

/**
 * testCreditPlanRepository - Prueba el CreditPlanRepository
 */
function testCreditPlanRepository() {
  Logger.log('=== Iniciando pruebas de CreditPlanRepository ===');
  
  try {
    const repo = new CreditPlanRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const plans = repo.findAll();
    Logger.log('✓ Planes de crédito encontrados: ' + plans.length);
    
    if (plans.length > 0) {
      Logger.log('Primer plan: ' + JSON.stringify(plans[0]));
    }
    
    // Probar findByClient (si hay planes)
    if (plans.length > 0) {
      Logger.log('\n2. Probando findByClient()...');
      const firstClientId = plans[0].client_id;
      Logger.log('Buscando planes del cliente: ' + firstClientId);
      
      const clientPlans = repo.findByClient(firstClientId);
      Logger.log('✓ Planes encontrados para el cliente: ' + clientPlans.length);
      
      if (clientPlans.length > 0) {
        Logger.log('Primer plan del cliente: ' + JSON.stringify(clientPlans[0]));
        
        // Verificar ordenamiento (más recientes primero)
        if (clientPlans.length > 1) {
          const date1 = new Date(clientPlans[0].created_at);
          const date2 = new Date(clientPlans[1].created_at);
          if (date1 >= date2) {
            Logger.log('✓ Ordenamiento correcto (más recientes primero)');
          } else {
            Logger.log('✗ Ordenamiento incorrecto');
          }
        }
      }
    }
    
    // Probar findBySale (si hay planes)
    if (plans.length > 0) {
      Logger.log('\n3. Probando findBySale()...');
      const firstSaleId = plans[0].sale_id;
      Logger.log('Buscando plan de la venta: ' + firstSaleId);
      
      const salePlan = repo.findBySale(firstSaleId);
      if (salePlan) {
        Logger.log('✓ Plan encontrado para la venta: ' + JSON.stringify(salePlan));
      } else {
        Logger.log('✗ Plan no encontrado para la venta');
      }
    }
    
    // Probar con valores nulos/vacíos
    Logger.log('\n4. Probando con valores nulos/vacíos...');
    const emptyClientPlans = repo.findByClient(null);
    Logger.log('✓ findByClient(null) retorna array vacío: ' + (emptyClientPlans.length === 0));
    
    const emptySalePlan = repo.findBySale(null);
    Logger.log('✓ findBySale(null) retorna null: ' + (emptySalePlan === null));
    
    // Probar con IDs inexistentes
    Logger.log('\n5. Probando con IDs inexistentes...');
    const nonExistentClientPlans = repo.findByClient('client-nonexistent-12345');
    Logger.log('✓ findByClient(ID inexistente) retorna array vacío: ' + (nonExistentClientPlans.length === 0));
    
    const nonExistentSalePlan = repo.findBySale('sale-nonexistent-12345');
    Logger.log('✓ findBySale(ID inexistente) retorna null: ' + (nonExistentSalePlan === null));
    
    Logger.log('\n=== Pruebas de CreditPlanRepository completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * InstallmentRepository - Repositorio para CRD_Installments
 * 
 * Gestiona el acceso a la hoja de cuotas de crédito.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class InstallmentRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CRD_INSTALLMENTS);
  }
  
  /**
   * findByPlan - Busca todas las cuotas de un plan de crédito
   * 
   * Retorna todas las cuotas asociadas a un plan de crédito específico,
   * ordenadas por número de cuota (ascendente).
   * 
   * @param {string} planId - ID del plan de crédito
   * @returns {Array<Object>} Array de cuotas del plan
   * @throws {Error} Si hay error al buscar
   */
  findByPlan(planId) {
    try {
      if (!planId) {
        return [];
      }
      
      // Obtener todas las cuotas
      const installments = this.findAll();
      
      // Filtrar por plan_id
      const results = installments.filter(function(installment) {
        return installment.plan_id === planId;
      });
      
      // Ordenar por número de cuota (ascendente)
      results.sort(function(a, b) {
        const numA = Number(a.installment_number) || 0;
        const numB = Number(b.installment_number) || 0;
        return numA - numB;
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByPlan de InstallmentRepository: ' + error.message);
      throw new Error('Error al buscar cuotas por plan: ' + error.message);
    }
  }
  
  /**
   * findOverdue - Busca cuotas vencidas de un cliente
   * 
   * Retorna todas las cuotas vencidas (fecha de vencimiento anterior a hoy)
   * que no han sido pagadas completamente, para un cliente específico.
   * Las cuotas se ordenan por fecha de vencimiento (más antiguas primero).
   * 
   * @param {string} clientId - ID del cliente
   * @returns {Array<Object>} Array de cuotas vencidas del cliente
   * @throws {Error} Si hay error al buscar
   */
  findOverdue(clientId) {
    try {
      if (!clientId) {
        return [];
      }
      
      // Obtener fecha actual (sin hora para comparación)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obtener todas las cuotas
      const installments = this.findAll();
      
      // Obtener todos los planes de crédito para filtrar por cliente
      const planRepo = new CreditPlanRepository();
      const clientPlans = planRepo.findByClient(clientId);
      
      // Crear un set de IDs de planes del cliente para búsqueda rápida
      const clientPlanIds = {};
      for (let i = 0; i < clientPlans.length; i++) {
        clientPlanIds[clientPlans[i].id] = true;
      }
      
      // Filtrar cuotas vencidas del cliente
      const results = [];
      for (let i = 0; i < installments.length; i++) {
        const installment = installments[i];
        
        // Verificar que la cuota pertenece a un plan del cliente
        if (!clientPlanIds[installment.plan_id]) {
          continue;
        }
        
        // Verificar que no está completamente pagada
        const status = installment.status;
        if (status === INSTALLMENT_STATUS.PAID) {
          continue;
        }
        
        // Verificar que está vencida
        if (!installment.due_date) {
          continue;
        }
        
        const dueDate = new Date(installment.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          results.push(installment);
        }
      }
      
      // Ordenar por fecha de vencimiento (más antiguas primero - oldest_due_first)
      results.sort(function(a, b) {
        if (!a.due_date || !b.due_date) {
          return 0;
        }
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dateA - dateB; // Orden ascendente
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findOverdue de InstallmentRepository: ' + error.message);
      throw new Error('Error al buscar cuotas vencidas: ' + error.message);
    }
  }
  
  /**
   * findDueToday - Busca cuotas que vencen hoy
   * 
   * Retorna todas las cuotas cuya fecha de vencimiento es hoy
   * y que no han sido pagadas completamente.
   * Las cuotas se ordenan por plan_id.
   * 
   * @returns {Array<Object>} Array de cuotas que vencen hoy
   * @throws {Error} Si hay error al buscar
   */
  findDueToday() {
    try {
      // Obtener fecha actual (sin hora para comparación)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obtener todas las cuotas
      const installments = this.findAll();
      
      // Filtrar cuotas que vencen hoy
      const results = [];
      for (let i = 0; i < installments.length; i++) {
        const installment = installments[i];
        
        // Verificar que no está completamente pagada
        const status = installment.status;
        if (status === INSTALLMENT_STATUS.PAID) {
          continue;
        }
        
        // Verificar que vence hoy
        if (!installment.due_date) {
          continue;
        }
        
        const dueDate = new Date(installment.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate.getTime() === today.getTime()) {
          results.push(installment);
        }
      }
      
      // Ordenar por plan_id para agrupar cuotas del mismo plan
      results.sort(function(a, b) {
        if (a.plan_id < b.plan_id) return -1;
        if (a.plan_id > b.plan_id) return 1;
        return 0;
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findDueToday de InstallmentRepository: ' + error.message);
      throw new Error('Error al buscar cuotas que vencen hoy: ' + error.message);
    }
  }
  
  /**
   * findDueThisWeek - Busca cuotas que vencen esta semana
   * 
   * Retorna todas las cuotas cuya fecha de vencimiento está entre hoy
   * y dentro de los próximos 7 días, y que no han sido pagadas completamente.
   * Las cuotas se ordenan por fecha de vencimiento (más próximas primero).
   * 
   * @returns {Array<Object>} Array de cuotas que vencen esta semana
   * @throws {Error} Si hay error al buscar
   */
  findDueThisWeek() {
    try {
      // Obtener fecha actual (sin hora para comparación)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calcular fecha límite (hoy + 7 días)
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      // Obtener todas las cuotas
      const installments = this.findAll();
      
      // Filtrar cuotas que vencen esta semana
      const results = [];
      for (let i = 0; i < installments.length; i++) {
        const installment = installments[i];
        
        // Verificar que no está completamente pagada
        const status = installment.status;
        if (status === INSTALLMENT_STATUS.PAID) {
          continue;
        }
        
        // Verificar que vence esta semana
        if (!installment.due_date) {
          continue;
        }
        
        const dueDate = new Date(installment.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        // Debe estar entre hoy (inclusive) y dentro de 7 días (inclusive)
        if (dueDate >= today && dueDate <= weekEnd) {
          results.push(installment);
        }
      }
      
      // Ordenar por fecha de vencimiento (más próximas primero)
      results.sort(function(a, b) {
        if (!a.due_date || !b.due_date) {
          return 0;
        }
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dateA - dateB; // Orden ascendente
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findDueThisWeek de InstallmentRepository: ' + error.message);
      throw new Error('Error al buscar cuotas que vencen esta semana: ' + error.message);
    }
  }
}

/**
 * testInstallmentRepository - Prueba el InstallmentRepository
 */
function testInstallmentRepository() {
  Logger.log('=== Iniciando pruebas de InstallmentRepository ===');
  
  try {
    const repo = new InstallmentRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const installments = repo.findAll();
    Logger.log('✓ Cuotas encontradas: ' + installments.length);
    
    if (installments.length > 0) {
      Logger.log('Primera cuota: ' + JSON.stringify(installments[0]));
    }
    
    // Probar findByPlan (si hay cuotas)
    if (installments.length > 0) {
      Logger.log('\n2. Probando findByPlan()...');
      const firstPlanId = installments[0].plan_id;
      Logger.log('Buscando cuotas del plan: ' + firstPlanId);
      
      const planInstallments = repo.findByPlan(firstPlanId);
      Logger.log('✓ Cuotas encontradas para el plan: ' + planInstallments.length);
      
      if (planInstallments.length > 0) {
        Logger.log('Primera cuota del plan: ' + JSON.stringify(planInstallments[0]));
        
        // Verificar ordenamiento por número de cuota
        if (planInstallments.length > 1) {
          const num1 = Number(planInstallments[0].installment_number);
          const num2 = Number(planInstallments[1].installment_number);
          if (num1 <= num2) {
            Logger.log('✓ Ordenamiento correcto (por número de cuota ascendente)');
          } else {
            Logger.log('✗ Ordenamiento incorrecto');
          }
        }
      }
    }
    
    // Probar findDueToday
    Logger.log('\n3. Probando findDueToday()...');
    const dueToday = repo.findDueToday();
    Logger.log('✓ Cuotas que vencen hoy: ' + dueToday.length);
    if (dueToday.length > 0) {
      Logger.log('Primera cuota que vence hoy: ' + JSON.stringify(dueToday[0]));
    }
    
    // Probar findDueThisWeek
    Logger.log('\n4. Probando findDueThisWeek()...');
    const dueThisWeek = repo.findDueThisWeek();
    Logger.log('✓ Cuotas que vencen esta semana: ' + dueThisWeek.length);
    if (dueThisWeek.length > 0) {
      Logger.log('Primera cuota que vence esta semana: ' + JSON.stringify(dueThisWeek[0]));
      
      // Verificar ordenamiento por fecha de vencimiento
      if (dueThisWeek.length > 1) {
        const date1 = new Date(dueThisWeek[0].due_date);
        const date2 = new Date(dueThisWeek[1].due_date);
        if (date1 <= date2) {
          Logger.log('✓ Ordenamiento correcto (por fecha de vencimiento ascendente)');
        } else {
          Logger.log('✗ Ordenamiento incorrecto');
        }
      }
    }
    
    // Probar findOverdue (si hay planes)
    const planRepo = new CreditPlanRepository();
    const plans = planRepo.findAll();
    if (plans.length > 0) {
      Logger.log('\n5. Probando findOverdue()...');
      const firstClientId = plans[0].client_id;
      Logger.log('Buscando cuotas vencidas del cliente: ' + firstClientId);
      
      const overdueInstallments = repo.findOverdue(firstClientId);
      Logger.log('✓ Cuotas vencidas encontradas: ' + overdueInstallments.length);
      
      if (overdueInstallments.length > 0) {
        Logger.log('Primera cuota vencida: ' + JSON.stringify(overdueInstallments[0]));
        
        // Verificar ordenamiento (más antiguas primero)
        if (overdueInstallments.length > 1) {
          const date1 = new Date(overdueInstallments[0].due_date);
          const date2 = new Date(overdueInstallments[1].due_date);
          if (date1 <= date2) {
            Logger.log('✓ Ordenamiento correcto (más antiguas primero - oldest_due_first)');
          } else {
            Logger.log('✗ Ordenamiento incorrecto');
          }
        }
      }
    }
    
    // Probar con valores nulos/vacíos
    Logger.log('\n6. Probando con valores nulos/vacíos...');
    const emptyPlanInstallments = repo.findByPlan(null);
    Logger.log('✓ findByPlan(null) retorna array vacío: ' + (emptyPlanInstallments.length === 0));
    
    const emptyOverdue = repo.findOverdue(null);
    Logger.log('✓ findOverdue(null) retorna array vacío: ' + (emptyOverdue.length === 0));
    
    // Probar con IDs inexistentes
    Logger.log('\n7. Probando con IDs inexistentes...');
    const nonExistentPlanInstallments = repo.findByPlan('plan-nonexistent-12345');
    Logger.log('✓ findByPlan(ID inexistente) retorna array vacío: ' + (nonExistentPlanInstallments.length === 0));
    
    const nonExistentOverdue = repo.findOverdue('client-nonexistent-12345');
    Logger.log('✓ findOverdue(ID inexistente) retorna array vacío: ' + (nonExistentOverdue.length === 0));
    
    Logger.log('\n=== Pruebas de InstallmentRepository completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * PaymentRepository - Repositorio para CRD_Payments
 * 
 * Gestiona el acceso a la hoja de pagos de crédito.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class PaymentRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CRD_PAYMENTS);
  }
  
  /**
   * findByClient - Busca todos los pagos de un cliente
   * 
   * Retorna todos los pagos realizados por un cliente específico,
   * ordenados por fecha de pago (más recientes primero).
   * 
   * @param {string} clientId - ID del cliente
   * @returns {Array<Object>} Array de pagos del cliente
   * @throws {Error} Si hay error al buscar
   */
  findByClient(clientId) {
    try {
      if (!clientId) {
        return [];
      }
      
      // Obtener todos los pagos
      const payments = this.findAll();
      
      // Filtrar por client_id
      const results = payments.filter(function(payment) {
        return payment.client_id === clientId;
      });
      
      // Ordenar por fecha de pago (más recientes primero)
      results.sort(function(a, b) {
        if (!a.payment_date || !b.payment_date) {
          return 0;
        }
        const dateA = new Date(a.payment_date);
        const dateB = new Date(b.payment_date);
        return dateB - dateA; // Orden descendente
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByClient de PaymentRepository: ' + error.message);
      throw new Error('Error al buscar pagos por cliente: ' + error.message);
    }
  }
}

/**
 * testPaymentRepository - Prueba el PaymentRepository
 */
function testPaymentRepository() {
  Logger.log('=== Iniciando pruebas de PaymentRepository ===');
  
  try {
    const repo = new PaymentRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const payments = repo.findAll();
    Logger.log('✓ Pagos encontrados: ' + payments.length);
    
    if (payments.length > 0) {
      Logger.log('Primer pago: ' + JSON.stringify(payments[0]));
    }
    
    // Probar findByClient (si hay pagos)
    if (payments.length > 0) {
      Logger.log('\n2. Probando findByClient()...');
      const firstClientId = payments[0].client_id;
      Logger.log('Buscando pagos del cliente: ' + firstClientId);
      
      const clientPayments = repo.findByClient(firstClientId);
      Logger.log('✓ Pagos encontrados para el cliente: ' + clientPayments.length);
      
      if (clientPayments.length > 0) {
        Logger.log('Primer pago del cliente: ' + JSON.stringify(clientPayments[0]));
        
        // Verificar ordenamiento (más recientes primero)
        if (clientPayments.length > 1) {
          const date1 = new Date(clientPayments[0].payment_date);
          const date2 = new Date(clientPayments[1].payment_date);
          if (date1 >= date2) {
            Logger.log('✓ Ordenamiento correcto (más recientes primero)');
          } else {
            Logger.log('✗ Ordenamiento incorrecto');
          }
        }
      }
    }
    
    // Probar con valores nulos/vacíos
    Logger.log('\n3. Probando con valores nulos/vacíos...');
    const emptyClientPayments = repo.findByClient(null);
    Logger.log('✓ findByClient(null) retorna array vacío: ' + (emptyClientPayments.length === 0));
    
    // Probar con IDs inexistentes
    Logger.log('\n4. Probando con IDs inexistentes...');
    const nonExistentClientPayments = repo.findByClient('client-nonexistent-12345');
    Logger.log('✓ findByClient(ID inexistente) retorna array vacío: ' + (nonExistentClientPayments.length === 0));
    
    Logger.log('\n=== Pruebas de PaymentRepository completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testAllRepositories - Ejecuta todas las pruebas de repositorios
 */
function testAllRepositories() {
  Logger.log('╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  PRUEBAS DE REPOSITORIOS - ADICTION BOUTIQUE SUITE        ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
  
  testUserRepository();
  Logger.log('\n' + '─'.repeat(60) + '\n');
  
  testProductRepository();
  Logger.log('\n' + '─'.repeat(60) + '\n');
  
  testStockRepository();
  
  Logger.log('\n╔════════════════════════════════════════════════════════════╗');
  Logger.log('║  TODAS LAS PRUEBAS COMPLETADAS                            ║');
  Logger.log('╚════════════════════════════════════════════════════════════╝');
}

/**
 * ShiftRepository - Repositorio para CASH_Shifts
 * 
 * Gestiona el acceso a la hoja de turnos de caja.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class ShiftRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CASH_SHIFTS);
  }
  
  /**
   * findOpenByStore - Busca el turno abierto de una tienda
   * 
   * Retorna el turno de caja que está actualmente abierto en una tienda específica.
   * Solo puede haber un turno abierto por tienda a la vez.
   * Un turno está abierto si tiene opening_at pero no tiene closing_at.
   * 
   * @param {string} storeId - ID de la tienda
   * @returns {Object|null} Turno abierto encontrado o null si no hay ninguno
   * @throws {Error} Si hay error al buscar
   */
  findOpenByStore(storeId) {
    try {
      if (!storeId) {
        return null;
      }
      
      // Obtener todos los turnos
      const shifts = this.findAll();
      
      // Buscar turno abierto de la tienda
      // Un turno está abierto si tiene opening_at pero no tiene closing_at
      for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i];
        
        // Verificar que es de la tienda correcta
        if (shift.store_id !== storeId) {
          continue;
        }
        
        // Verificar que tiene fecha de apertura
        if (!shift.opening_at) {
          continue;
        }
        
        // Verificar que NO tiene fecha de cierre (está abierto)
        if (!shift.closing_at || shift.closing_at === '' || shift.closing_at === null) {
          return shift;
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findOpenByStore de ShiftRepository: ' + error.message);
      throw new Error('Error al buscar turno abierto por tienda: ' + error.message);
    }
  }
  
  /**
   * findByDateRange - Busca turnos en un rango de fechas
   * 
   * Retorna todos los turnos cuya fecha de apertura esté dentro del rango especificado,
   * ordenados por fecha de apertura (más recientes primero).
   * 
   * @param {Date} startDate - Fecha de inicio del rango
   * @param {Date} endDate - Fecha de fin del rango
   * @returns {Array<Object>} Array de turnos en el rango de fechas
   * @throws {Error} Si hay error al buscar
   */
  findByDateRange(startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new Error('startDate y endDate son requeridos');
      }
      
      // Obtener todos los turnos
      const shifts = this.findAll();
      
      // Filtrar por rango de fechas
      const results = shifts.filter(function(shift) {
        if (!shift.opening_at) {
          return false;
        }
        
        const shiftDate = new Date(shift.opening_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return shiftDate >= start && shiftDate <= end;
      });
      
      // Ordenar por fecha de apertura (más recientes primero)
      results.sort(function(a, b) {
        if (!a.opening_at || !b.opening_at) {
          return 0;
        }
        const dateA = new Date(a.opening_at);
        const dateB = new Date(b.opening_at);
        return dateB - dateA; // Orden descendente
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByDateRange de ShiftRepository: ' + error.message);
      throw new Error('Error al buscar turnos por rango de fechas: ' + error.message);
    }
  }
}

/**
 * ExpenseRepository - Repositorio para CASH_Expenses
 * 
 * Gestiona el acceso a la hoja de egresos de caja.
 * Hereda todas las operaciones CRUD de BaseRepository.
 * 
 * @class
 * @extends BaseRepository
 */
class ExpenseRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super(SHEETS.CASH_EXPENSES);
  }
  
  /**
   * findByShift - Busca todos los egresos de un turno de caja
   * 
   * Retorna todos los egresos registrados durante un turno de caja específico,
   * ordenados por fecha de creación (más recientes primero).
   * 
   * @param {string} shiftId - ID del turno de caja
   * @returns {Array<Object>} Array de egresos del turno
   * @throws {Error} Si hay error al buscar
   */
  findByShift(shiftId) {
    try {
      if (!shiftId) {
        return [];
      }
      
      // Obtener todos los egresos
      const expenses = this.findAll();
      
      // Filtrar por shift_id
      const results = expenses.filter(function(expense) {
        return expense.shift_id === shiftId;
      });
      
      // Ordenar por fecha de creación (más recientes primero)
      results.sort(function(a, b) {
        if (!a.created_at || !b.created_at) {
          return 0;
        }
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Orden descendente
      });
      
      return results;
      
    } catch (error) {
      Logger.log('Error en findByShift de ExpenseRepository: ' + error.message);
      throw new Error('Error al buscar egresos por turno: ' + error.message);
    }
  }
}

/**
 * testShiftRepository - Prueba el ShiftRepository
 */
function testShiftRepository() {
  Logger.log('=== Iniciando pruebas de ShiftRepository ===');
  
  try {
    const repo = new ShiftRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const shifts = repo.findAll();
    Logger.log('✓ Turnos encontrados: ' + shifts.length);
    
    if (shifts.length > 0) {
      Logger.log('Primer turno: ' + JSON.stringify(shifts[0]));
    }
    
    // Probar findOpenByStore (si hay turnos)
    if (shifts.length > 0) {
      Logger.log('\n2. Probando findOpenByStore()...');
      const firstStoreId = shifts[0].store_id;
      Logger.log('Buscando turno abierto de la tienda: ' + firstStoreId);
      
      const openShift = repo.findOpenByStore(firstStoreId);
      if (openShift) {
        Logger.log('✓ Turno abierto encontrado: ' + JSON.stringify(openShift));
      } else {
        Logger.log('✓ No hay turno abierto para esta tienda (esperado si todos están cerrados)');
      }
    }
    
    // Probar findByDateRange (si hay turnos)
    if (shifts.length > 0) {
      Logger.log('\n3. Probando findByDateRange()...');
      
      // Usar un rango amplio para capturar todos los turnos
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-12-31');
      
      const rangeShifts = repo.findByDateRange(startDate, endDate);
      Logger.log('✓ Turnos encontrados en el rango: ' + rangeShifts.length);
      
      if (rangeShifts.length > 1) {
        // Verificar ordenamiento (más recientes primero)
        const date1 = new Date(rangeShifts[0].opening_at);
        const date2 = new Date(rangeShifts[1].opening_at);
        if (date1 >= date2) {
          Logger.log('✓ Ordenamiento correcto (más recientes primero)');
        } else {
          Logger.log('✗ Ordenamiento incorrecto');
        }
      }
    }
    
    // Probar con valores nulos/vacíos
    Logger.log('\n4. Probando con valores nulos/vacíos...');
    const emptyOpenShift = repo.findOpenByStore(null);
    Logger.log('✓ findOpenByStore(null) retorna null: ' + (emptyOpenShift === null));
    
    // Probar con IDs inexistentes
    Logger.log('\n5. Probando con IDs inexistentes...');
    const nonExistentOpenShift = repo.findOpenByStore('store-nonexistent-12345');
    Logger.log('✓ findOpenByStore(ID inexistente) retorna null: ' + (nonExistentOpenShift === null));
    
    Logger.log('\n=== Pruebas de ShiftRepository completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}

/**
 * testExpenseRepository - Prueba el ExpenseRepository
 */
function testExpenseRepository() {
  Logger.log('=== Iniciando pruebas de ExpenseRepository ===');
  
  try {
    const repo = new ExpenseRepository();
    
    // Probar findAll
    Logger.log('\n1. Probando findAll()...');
    const expenses = repo.findAll();
    Logger.log('✓ Egresos encontrados: ' + expenses.length);
    
    if (expenses.length > 0) {
      Logger.log('Primer egreso: ' + JSON.stringify(expenses[0]));
    }
    
    // Probar findByShift (si hay egresos)
    if (expenses.length > 0) {
      Logger.log('\n2. Probando findByShift()...');
      const firstShiftId = expenses[0].shift_id;
      Logger.log('Buscando egresos del turno: ' + firstShiftId);
      
      const shiftExpenses = repo.findByShift(firstShiftId);
      Logger.log('✓ Egresos encontrados para el turno: ' + shiftExpenses.length);
      
      if (shiftExpenses.length > 0) {
        Logger.log('Primer egreso del turno: ' + JSON.stringify(shiftExpenses[0]));
        
        // Verificar ordenamiento (más recientes primero)
        if (shiftExpenses.length > 1) {
          const date1 = new Date(shiftExpenses[0].created_at);
          const date2 = new Date(shiftExpenses[1].created_at);
          if (date1 >= date2) {
            Logger.log('✓ Ordenamiento correcto (más recientes primero)');
          } else {
            Logger.log('✗ Ordenamiento incorrecto');
          }
        }
      }
    }
    
    // Probar con valores nulos/vacíos
    Logger.log('\n3. Probando con valores nulos/vacíos...');
    const emptyShiftExpenses = repo.findByShift(null);
    Logger.log('✓ findByShift(null) retorna array vacío: ' + (emptyShiftExpenses.length === 0));
    
    // Probar con IDs inexistentes
    Logger.log('\n4. Probando con IDs inexistentes...');
    const nonExistentShiftExpenses = repo.findByShift('shift-nonexistent-12345');
    Logger.log('✓ findByShift(ID inexistente) retorna array vacío: ' + (nonExistentShiftExpenses.length === 0));
    
    Logger.log('\n=== Pruebas de ExpenseRepository completadas exitosamente ===');
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
  }
}


// ============================================================================
// REPOSITORIOS PARA TABLAS MAESTRAS
// ============================================================================

/**
 * LineRepository - Repositorio para CAT_Lines
 * 
 * Gestiona las líneas de producto (Dama, Caballero, Niños, etc.)
 * 
 * Requisitos: 32.2
 * 
 * @class
 * @extends BaseRepository
 */
class LineRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super('CAT_Lines');
  }
  
  /**
   * findByCode - Busca una línea por su código
   * 
   * @param {string} code - Código de la línea (ej: 'DAMA')
   * @returns {Object|null} Línea encontrada o null
   */
  findByCode(code) {
    try {
      if (!code) {
        return null;
      }
      
      const lines = this.findAll();
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].code === code) {
          return lines[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByCode de LineRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findActive - Obtiene todas las líneas activas
   * 
   * @returns {Array<Object>} Array de líneas activas
   */
  findActive() {
    try {
      const lines = this.findAll();
      
      return lines.filter(function(line) {
        return line.active === true || line.active === 'TRUE';
      });
      
    } catch (error) {
      Logger.log('Error en findActive de LineRepository: ' + error.message);
      throw error;
    }
  }
}

/**
 * CategoryRepository - Repositorio para CAT_Categories
 * 
 * Gestiona las categorías de producto (Blusas, Pantalones, etc.)
 * 
 * Requisitos: 32.2
 * 
 * @class
 * @extends BaseRepository
 */
class CategoryRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super('CAT_Categories');
  }
  
  /**
   * findByCode - Busca una categoría por su código
   * 
   * @param {string} code - Código de la categoría
   * @returns {Object|null} Categoría encontrada o null
   */
  findByCode(code) {
    try {
      if (!code) {
        return null;
      }
      
      const categories = this.findAll();
      
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].code === code) {
          return categories[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByCode de CategoryRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findByLine - Obtiene todas las categorías de una línea
   * 
   * @param {string} lineId - ID de la línea
   * @returns {Array<Object>} Array de categorías de la línea
   */
  findByLine(lineId) {
    try {
      if (!lineId) {
        return [];
      }
      
      const categories = this.findAll();
      
      return categories.filter(function(category) {
        return category.line_id === lineId;
      });
      
    } catch (error) {
      Logger.log('Error en findByLine de CategoryRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findActive - Obtiene todas las categorías activas
   * 
   * @returns {Array<Object>} Array de categorías activas
   */
  findActive() {
    try {
      const categories = this.findAll();
      
      return categories.filter(function(category) {
        return category.active === true || category.active === 'TRUE';
      });
      
    } catch (error) {
      Logger.log('Error en findActive de CategoryRepository: ' + error.message);
      throw error;
    }
  }
}

/**
 * BrandRepository - Repositorio para CAT_Brands
 * 
 * Gestiona las marcas de producto (Adiction, Zara, H&M, etc.)
 * 
 * Requisitos: 32.2
 * 
 * @class
 * @extends BaseRepository
 */
class BrandRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super('CAT_Brands');
  }
  
  /**
   * findByCode - Busca una marca por su código
   * 
   * @param {string} code - Código de la marca
   * @returns {Object|null} Marca encontrada o null
   */
  findByCode(code) {
    try {
      if (!code) {
        return null;
      }
      
      const brands = this.findAll();
      
      for (let i = 0; i < brands.length; i++) {
        if (brands[i].code === code) {
          return brands[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByCode de BrandRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findActive - Obtiene todas las marcas activas
   * 
   * @returns {Array<Object>} Array de marcas activas
   */
  findActive() {
    try {
      const brands = this.findAll();
      
      return brands.filter(function(brand) {
        return brand.active === true || brand.active === 'TRUE';
      });
      
    } catch (error) {
      Logger.log('Error en findActive de BrandRepository: ' + error.message);
      throw error;
    }
  }
}

/**
 * SizeRepository - Repositorio para CAT_Sizes
 * 
 * Gestiona las tallas de producto (XS, S, M, L, XL, etc.)
 * 
 * Requisitos: 32.2
 * 
 * @class
 * @extends BaseRepository
 */
class SizeRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super('CAT_Sizes');
  }
  
  /**
   * findByCode - Busca una talla por su código
   * 
   * @param {string} code - Código de la talla (ej: 'S', 'M', 'L')
   * @returns {Object|null} Talla encontrada o null
   */
  findByCode(code) {
    try {
      if (!code) {
        return null;
      }
      
      const sizes = this.findAll();
      
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i].code === code) {
          return sizes[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByCode de SizeRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findAllOrdered - Obtiene todas las tallas ordenadas por el campo order
   * 
   * @returns {Array<Object>} Array de tallas ordenadas
   */
  findAllOrdered() {
    try {
      const sizes = this.findAll();
      
      // Ordenar por el campo order
      sizes.sort(function(a, b) {
        const orderA = parseInt(a.order) || 0;
        const orderB = parseInt(b.order) || 0;
        return orderA - orderB;
      });
      
      return sizes;
      
    } catch (error) {
      Logger.log('Error en findAllOrdered de SizeRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findActive - Obtiene todas las tallas activas ordenadas
   * 
   * @returns {Array<Object>} Array de tallas activas ordenadas
   */
  findActive() {
    try {
      const sizes = this.findAllOrdered();
      
      return sizes.filter(function(size) {
        return size.active === true || size.active === 'TRUE';
      });
      
    } catch (error) {
      Logger.log('Error en findActive de SizeRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findByCategory - Obtiene tallas filtradas por categoría
   * 
   * Retorna solo las tallas activas que pertenecen a la categoría especificada,
   * ordenadas por sort_order.
   * 
   * @param {string} categoryId - ID de la categoría
   * @returns {Array<Object>} Array de tallas de la categoría ordenadas
   */
  findByCategory(categoryId) {
    try {
      if (!categoryId) {
        return [];
      }
      
      const sizes = this.findAll();
      
      // Filtrar por categoría y activas
      const filtered = sizes.filter(function(size) {
        const isActive = size.active === true || size.active === 'TRUE';
        const matchesCategory = size.category_id === categoryId;
        return isActive && matchesCategory;
      });
      
      // Ordenar por sort_order
      filtered.sort(function(a, b) {
        const orderA = parseInt(a.sort_order) || 0;
        const orderB = parseInt(b.sort_order) || 0;
        return orderA - orderB;
      });
      
      return filtered;
      
    } catch (error) {
      Logger.log('Error en findByCategory de SizeRepository: ' + error.message);
      throw error;
    }
  }
}

/**
 * SupplierRepository - Repositorio para CAT_Suppliers
 * 
 * Gestiona los proveedores de producto
 * 
 * Requisitos: 32.2
 * 
 * @class
 * @extends BaseRepository
 */
class SupplierRepository extends BaseRepository {
  /**
   * Constructor
   */
  constructor() {
    super('CAT_Suppliers');
  }
  
  /**
   * findByCode - Busca un proveedor por su código
   * 
   * @param {string} code - Código del proveedor
   * @returns {Object|null} Proveedor encontrado o null
   */
  findByCode(code) {
    try {
      if (!code) {
        return null;
      }
      
      const suppliers = this.findAll();
      
      for (let i = 0; i < suppliers.length; i++) {
        if (suppliers[i].code === code) {
          return suppliers[i];
        }
      }
      
      return null;
      
    } catch (error) {
      Logger.log('Error en findByCode de SupplierRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * search - Busca proveedores por nombre o código
   * 
   * @param {string} query - Texto a buscar
   * @returns {Array<Object>} Array de proveedores que coinciden
   */
  search(query) {
    try {
      if (!query || query.trim() === '') {
        return [];
      }
      
      const suppliers = this.findAll();
      const searchTerm = query.toLowerCase().trim();
      
      return suppliers.filter(function(supplier) {
        const code = (supplier.code || '').toLowerCase();
        const name = (supplier.name || '').toLowerCase();
        const contactName = (supplier.contact_name || '').toLowerCase();
        
        return code.indexOf(searchTerm) !== -1 || 
               name.indexOf(searchTerm) !== -1 ||
               contactName.indexOf(searchTerm) !== -1;
      });
      
    } catch (error) {
      Logger.log('Error en search de SupplierRepository: ' + error.message);
      throw error;
    }
  }
  
  /**
   * findActive - Obtiene todos los proveedores activos
   * 
   * @returns {Array<Object>} Array de proveedores activos
   */
  findActive() {
    try {
      const suppliers = this.findAll();
      
      return suppliers.filter(function(supplier) {
        return supplier.active === true || supplier.active === 'TRUE';
      });
      
    } catch (error) {
      Logger.log('Error en findActive de SupplierRepository: ' + error.message);
      throw error;
    }
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA PARA REPOSITORIOS MAESTROS
// ============================================================================

/**
 * testMasterRepositories - Prueba todos los repositorios maestros
 */
function testMasterRepositories() {
  Logger.log('=== Iniciando pruebas de repositorios maestros ===');
  
  try {
    // Test LineRepository
    Logger.log('\n1. Probando LineRepository...');
    const lineRepo = new LineRepository();
    const lines = lineRepo.findAll();
    Logger.log('✓ Líneas encontradas: ' + lines.length);
    
    if (lines.length > 0) {
      const firstLine = lines[0];
      Logger.log('  Primera línea: ' + firstLine.name + ' (' + firstLine.code + ')');
      
      const lineByCode = lineRepo.findByCode(firstLine.code);
      if (lineByCode) {
        Logger.log('✓ findByCode funciona correctamente');
      }
    }
    
    // Test CategoryRepository
    Logger.log('\n2. Probando CategoryRepository...');
    const categoryRepo = new CategoryRepository();
    const categories = categoryRepo.findAll();
    Logger.log('✓ Categorías encontradas: ' + categories.length);
    
    if (categories.length > 0 && lines.length > 0) {
      const categoriesByLine = categoryRepo.findByLine(lines[0].id);
      Logger.log('✓ Categorías de línea "' + lines[0].name + '": ' + categoriesByLine.length);
    }
    
    // Test BrandRepository
    Logger.log('\n3. Probando BrandRepository...');
    const brandRepo = new BrandRepository();
    const brands = brandRepo.findAll();
    Logger.log('✓ Marcas encontradas: ' + brands.length);
    
    // Test SizeRepository
    Logger.log('\n4. Probando SizeRepository...');
    const sizeRepo = new SizeRepository();
    const sizes = sizeRepo.findAllOrdered();
    Logger.log('✓ Tallas encontradas (ordenadas): ' + sizes.length);
    
    if (sizes.length > 0) {
      Logger.log('  Orden de tallas:');
      for (let i = 0; i < Math.min(5, sizes.length); i++) {
        Logger.log('    ' + (i + 1) + '. ' + sizes[i].code + ' - ' + sizes[i].name);
      }
    }
    
    // Test SupplierRepository
    Logger.log('\n5. Probando SupplierRepository...');
    const supplierRepo = new SupplierRepository();
    const suppliers = supplierRepo.findAll();
    Logger.log('✓ Proveedores encontrados: ' + suppliers.length);
    
    if (suppliers.length > 0) {
      const searchResults = supplierRepo.search('Gamarra');
      Logger.log('✓ Búsqueda "Gamarra": ' + searchResults.length + ' resultados');
    }
    
    Logger.log('\n=== Pruebas de repositorios maestros completadas exitosamente ===');
    
    return {
      success: true,
      message: 'Todos los repositorios funcionan correctamente'
    };
    
  } catch (error) {
    Logger.log('\n✗ Error en las pruebas: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}
