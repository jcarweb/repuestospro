@echo off
echo 🧹 LIMPIEZA COMPLETA Y REINICIO DE LA APP MÓVIL
echo ================================================

echo.
echo 📱 Deteniendo procesos existentes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🗑️ Limpiando cache de Expo...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🗑️ Limpiando cache de Metro...
npx expo start --clear --reset-cache

echo.
echo ✅ Limpieza completada. La app debería iniciar correctamente.
echo.
echo 📋 Si persisten problemas, ejecuta: nuclear-reset.bat
pause
