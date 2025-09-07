@echo off
echo 🚨 MODO OFFLINE FORZADO - SIN ACTUALIZACIONES
echo ==============================================

echo.
echo 📱 Deteniendo TODOS los procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul
taskkill /f /im metro.exe 2>nul

echo.
echo 🧹 LIMPIEZA NUCLEAR...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .metro-cache rmdir /s /q .metro-cache
if exist .expo-shared rmdir /s /q .expo-shared

echo.
echo 🔧 Configurando variables de entorno OFFLINE...
set EXPO_NO_UPDATE_CHECK=1
set EXPO_NO_TELEMETRY=1
set EXPO_NO_ANALYTICS=1
set EXPO_OFFLINE=1
set EXPO_NO_DOTENV=1

echo.
echo 📦 Iniciando en modo OFFLINE PURO...
echo.
echo 💡 MODO OFFLINE ACTIVADO:
echo    ✅ Sin actualizaciones remotas
echo    ✅ Sin telemetría
echo    ✅ Sin analytics
echo    ✅ Sin conexión a servidores Expo
echo    ✅ Usuario: "Usuario PiezasYA"
echo    ✅ Servicio offline activado
echo.
echo 📋 INSTRUCCIONES:
echo    1. Abre la app móvil
echo    2. Ve a la pantalla de login
echo    3. Ingresa cualquier email y password
echo    4. El login será exitoso
echo    5. NO habrá errores de actualización
echo    6. NO habrá errores de conexión

echo.
npx expo start --clear --localhost --offline --no-dev --minify

echo.
echo ✅ App iniciada en MODO OFFLINE FORZADO.
pause
