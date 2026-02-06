@echo off
echo ========================================
echo VERIFICACION DE CAMBIOS APLICADOS
echo ========================================
echo.

echo [1/4] Verificando index.html...
findstr /C:"window.SCRIPT_URL" gas\index.html >nul
if %errorlevel%==0 (
    echo [OK] window.SCRIPT_URL encontrado en index.html
) else (
    echo [ERROR] window.SCRIPT_URL NO encontrado en index.html
)

findstr /C:"window.navigateTo" gas\index.html >nul
if %errorlevel%==0 (
    echo [OK] window.navigateTo encontrado en index.html
) else (
    echo [ERROR] window.navigateTo NO encontrado en index.html
)
echo.

echo [2/4] Verificando ClientList.html...
findstr /C:"typeof SCRIPT_URL" gas\ClientList.html >nul
if %errorlevel%==0 (
    echo [OK] Verificacion de SCRIPT_URL encontrada en ClientList.html
) else (
    echo [ERROR] Verificacion NO encontrada en ClientList.html
)
echo.

echo [3/4] Verificando Collections.html...
findstr /C:"typeof SCRIPT_URL" gas\Collections.html >nul
if %errorlevel%==0 (
    echo [OK] Verificacion de SCRIPT_URL encontrada en Collections.html
) else (
    echo [ERROR] Verificacion NO encontrada en Collections.html
)
echo.

echo [4/4] Verificando InventoryReport.html...
findstr /C:"typeof SCRIPT_URL" gas\InventoryReport.html >nul
if %errorlevel%==0 (
    echo [OK] Verificacion de SCRIPT_URL encontrada en InventoryReport.html
) else (
    echo [ERROR] Verificacion NO encontrada en InventoryReport.html
)
echo.

echo ========================================
echo VERIFICACION COMPLETA
echo ========================================
echo.
echo Si todos los checks muestran [OK], los cambios estan aplicados.
echo.
echo SIGUIENTE PASO:
echo 1. Ejecutar: npx @google/clasp push
echo 2. Ir a: https://script.google.com
echo 3. Crear nueva version en "Implementar" ^> "Administrar implementaciones"
echo.
pause
