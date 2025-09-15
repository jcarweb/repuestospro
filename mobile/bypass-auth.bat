@echo off
echo 🚨 BYPASS TEMPORAL DE AUTENTICACIÓN
echo ====================================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔄 Configurando bypass temporal...
echo.
echo 💡 IMPORTANTE: Esta configuración permite acceso sin autenticación
echo    Es solo para testing y desarrollo
echo.
echo 📋 INSTRUCCIONES:
echo    1. La app iniciará directamente en el ecommerce
echo    2. No habrá pantalla de login
echo    3. Podrás navegar por la app
echo    4. Esto es temporal hasta que el backend funcione

echo.
npx expo start --clear --localhost

echo.
echo ✅ App iniciada con bypass temporal.
pause
