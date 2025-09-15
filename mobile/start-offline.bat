@echo off
echo 🔧 INICIANDO APP COMPLETAMENTE OFFLINE
echo =======================================

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
echo 🔧 Configurando modo completamente offline...
echo.
echo 💡 IMPORTANTE: La app ahora está en modo OFFLINE
echo    - NO hay conexión de red
echo    - TODAS las funciones están simuladas
echo    - NO habrá errores de conexión
echo    - Login funciona con cualquier credencial
echo.
echo 📋 INSTRUCCIONES:
echo    1. Abre la app móvil
echo    2. Ve a la pantalla de login
echo    3. Ingresa CUALQUIER email y password
echo    4. El login será exitoso (offline)
echo    5. Accederás al ecommerce sin errores

echo.
npx expo start --clear --localhost --offline

echo.
echo ✅ App iniciada en modo completamente offline.
pause
