@echo off
echo 💥 RESETEO COMPLETO DE LA APP MÓVIL
echo ====================================

echo.
echo 📱 Deteniendo TODOS los procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul
taskkill /f /im npm.exe 2>nul
taskkill /f /im metro.exe 2>nul

echo.
echo 🗑️ Eliminando cache completo...
if exist .expo rmdir /s /q .expo
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .metro-cache rmdir /s /q .metro-cache

echo.
echo 🗑️ Limpiando cache de npm...
npm cache clean --force

echo.
echo 🗑️ Limpiando cache de Expo...
npx expo install --fix

echo.
echo 📦 Reinstalando dependencias...
npm install

echo.
echo 🧹 Limpiando datos de la app...
echo.
echo 💡 IMPORTANTE: Después de que inicie la app:
echo    1. Ve a la pantalla de login
echo    2. Toca "🔧 Diagnóstico de Red"
echo    3. Ejecuta "Probar Conexiones"
echo    4. Si hay problemas, toca "Reescanear Red"

echo.
echo 🚀 Iniciando con reset completo...
npx expo start --clear --reset-cache

echo.
echo ✅ Reseteo completo finalizado.
pause
