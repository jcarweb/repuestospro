@echo off
echo 💥 RESETEO NUCLEAR DE LA APP MÓVIL
echo ===================================

echo.
echo 📱 Deteniendo TODOS los procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul
taskkill /f /im npm.exe 2>nul

echo.
echo 🗑️ Eliminando cache completo...
if exist .expo rmdir /s /q .expo
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 🗑️ Limpiando cache de npm...
npm cache clean --force

echo.
echo 📦 Reinstalando dependencias...
npm install

echo.
echo 🚀 Iniciando con reset completo...
npx expo start --clear --reset-cache

echo.
echo ✅ Reseteo nuclear completado.
echo 📋 La app debería funcionar perfectamente ahora.
pause
