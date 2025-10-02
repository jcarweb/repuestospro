@echo off
echo 🚀 Iniciando migración de Expo a React Native puro...
echo.

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

REM Verificar que npm esté disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está disponible. Por favor verifica tu instalación de Node.js
    pause
    exit /b 1
)

echo ✅ Node.js y npm están disponibles
echo.

REM Verificar que el directorio mobile existe
if not exist "mobile" (
    echo ❌ Directorio 'mobile' no encontrado. Asegúrate de estar en la raíz del proyecto.
    pause
    exit /b 1
)

echo ✅ Directorio mobile encontrado
echo.

REM Crear directorio de scripts si no existe
if not exist "scripts" mkdir scripts

REM Ejecutar script de migración
echo 📦 Ejecutando script de migración...
node scripts/migrate-to-react-native.js

if %errorlevel% neq 0 (
    echo ❌ Error durante la migración
    pause
    exit /b 1
)

echo.
echo 🎉 ¡Migración completada exitosamente!
echo.
echo 📋 Próximos pasos:
echo 1. cd mobile-rn
echo 2. npm install
echo 3. npx react-native run-android (para Android)
echo 4. npx react-native run-ios (para iOS)
echo.
echo 📖 Para más información, consulta:
echo - MOBILE_STRATEGY.md
echo - scripts/setup-android-studio.md
echo - scripts/setup-ios-xcode.md
echo.
pause
