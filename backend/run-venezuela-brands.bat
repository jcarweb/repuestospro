@echo off
echo ========================================
echo   MARCAS VENEZOLANAS - PIEZASYA
echo ========================================
echo.

echo 🚀 Iniciando proceso de carga de marcas venezolanas...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado o no está en el PATH
    echo    Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está disponible
    pause
    exit /b 1
)

echo ✅ Node.js y npm están disponibles
echo.

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
    echo.
)

REM Ejecutar el script de población de marcas
echo 🏷️  Ejecutando script de población de marcas venezolanas...
echo.

npm run seed:venezuela-brands

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error ejecutando el script de marcas
    echo    Verifica que MongoDB esté ejecutándose y que la conexión sea correcta
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Proceso completado exitosamente!
echo.

REM Preguntar si quiere ejecutar las pruebas
set /p run_tests="¿Deseas ejecutar las pruebas de verificación? (s/n): "
if /i "%run_tests%"=="s" (
    echo.
    echo 🧪 Ejecutando pruebas de verificación...
    echo    Asegúrate de que el servidor backend esté ejecutándose
    echo.
    node test-venezuela-brands.js
)

echo.
echo 🎉 ¡Proceso completado!
echo.
pause
