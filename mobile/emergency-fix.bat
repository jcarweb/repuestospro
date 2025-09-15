@echo off
echo 🚨 SOLUCIÓN DE EMERGENCIA PARA APP MÓVIL
echo ========================================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpieza rápida de cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔄 Iniciando con configuración de emergencia...
echo.
echo 💡 INSTRUCCIONES IMPORTANTES:
echo    1. Cuando se abra la app, ve a la pantalla de login
echo    2. Toca "🔧 Diagnóstico de Red"
echo    3. Ejecuta "Probar Conexiones"
echo    4. Si hay problemas, toca "Reescanear Red"
echo    5. Prueba hacer login con credenciales válidas

echo.
npx expo start --clear --localhost

echo.
echo ✅ Solución de emergencia aplicada.
pause
