@echo off
echo 🔧 SOLUCIONANDO PROBLEMA DE CONEXIÓN
echo =====================================

echo.
echo 📱 Verificando estado del backend...
curl -s http://192.168.0.110:3001/api/health > nul
if %errorlevel% equ 0 (
    echo ✅ Backend funcionando correctamente
) else (
    echo ❌ Backend no accesible
    echo 💡 Asegúrate de que el backend esté ejecutándose
    pause
    exit /b 1
)

echo.
echo 🧹 Limpiando cache de la app móvil...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔄 Reiniciando con configuración de red optimizada...
npx expo start --clear --localhost

echo.
echo ✅ App iniciada con configuración optimizada
echo 📋 Si persiste el problema:
echo    1. Verifica que estés en la misma red WiFi
echo    2. Desactiva temporalmente el firewall
echo    3. Prueba con datos móviles
pause
