# Archivos HTML con jQuery Duplicado

Todos estos archivos incluyen jQuery, Bootstrap y DataTables al final, lo cual causa conflictos porque `index.html` ya los incluye.

## Lista de Archivos a Arreglar:

1. ✅ gas/POS.html - YA ARREGLADO
2. ✅ gas/ClientList.html - YA ARREGLADO
3. ⚠️ gas/MovementList.html
4. ⚠️ gas/ProductList.html
5. ⚠️ gas/Settings.html
6. ⚠️ gas/StockView.html
7. ⚠️ gas/TransferForm.html
8. ⚠️ gas/SalesReport.html
9. ⚠️ gas/ProductForm.html
10. ⚠️ gas/InventoryReport.html
11. ⚠️ gas/Collections.html
12. ⚠️ gas/ClientForm.html
13. ⚠️ gas/ClientDetail.html
14. ⚠️ gas/BarcodeScanner.html
15. ⚠️ gas/ARReport.html

## Solución:

Remover estas líneas de TODOS los archivos:

```html
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- DataTables JS -->
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
```

Porque `index.html` ya incluye todos estos scripts en el orden correcto.

## Prioridad:

Los archivos más críticos son los que el usuario usa frecuentemente:
1. POS.html ✅
2. ClientList.html ✅
3. ProductList.html
4. Collections.html
5. ClientForm.html

El resto se puede arreglar después si es necesario.
