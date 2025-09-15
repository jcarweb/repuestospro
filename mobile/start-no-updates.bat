@echo off
echo 🔧 INICIANDO APP SIN ACTUALIZACIONES REMOTAS
echo =============================================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpiando cache completo...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .metro-cache rmdir /s /q .metro-cache

echo.
echo 🔧 Configurando variables de entorno...
set EXPO_NO_UPDATE_CHECK=1
set EXPO_NO_TELEMETRY=1
set EXPO_NO_ANALYTICS=1

echo.
echo 📦 Iniciando Expo sin actualizaciones...
echo.
echo 💡 CONFIGURACIÓN:
echo    - Actualizaciones remotas: DESHABILITADAS
echo    - Telemetría: DESHABILITADA
echo    - Analytics: DESHABILITADO
echo    - Modo offline: ACTIVADO
echo    - Usuario: "Usuario PiezasYA"
echo.
echo 📋 INSTRUCCIONES:
echo    1. Abre la app móvil
echo    2. Ve a la pantalla de login
echo    3. Ingresa cualquier email y password
echo    4. El login será exitoso
echo    5. No habrá errores de actualización

echo.
npx expo start --clear --localhost --no-dev --minify

echo.
echo ✅ App iniciada sin actualizaciones remotas.
pause
