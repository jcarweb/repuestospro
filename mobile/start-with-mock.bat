@echo off
echo 🔧 INICIANDO APP CON SERVICIO MOCK
echo ===================================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔧 Configurando servicio mock...
echo.
echo 💡 IMPORTANTE: La app ahora usa un servicio simulado
echo    - No hay conexión real al backend
echo    - Todas las funciones están simuladas
echo    - El login funcionará con cualquier email/password
echo    - No habrá errores de conexión
echo.
echo 📋 INSTRUCCIONES:
echo    1. Abre la app móvil
echo    2. Ve a la pantalla de login
echo    3. Ingresa cualquier email y password
echo    4. El login será exitoso (simulado)
echo    5. Podrás acceder al ecommerce

echo.
npx expo start --clear --localhost

echo.
echo ✅ App iniciada con servicio mock.
pause
