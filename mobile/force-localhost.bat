@echo off
echo 🔧 FORZANDO CONEXIÓN LOCALHOST
echo ===============================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔄 Configurando para localhost...
echo.
echo 💡 IMPORTANTE: Esta configuración usa localhost
echo    Asegúrate de que el backend esté en localhost:3001
echo.
echo 📋 INSTRUCCIONES:
echo    1. Abre la app móvil
echo    2. Ve a la pantalla de login
echo    3. Toca "🔧 Diagnóstico de Red"
echo    4. Ejecuta "Probar Conexiones"
echo    5. Si funciona, prueba hacer login

echo.
npx expo start --clear --localhost

echo.
echo ✅ App iniciada con configuración localhost.
pause
