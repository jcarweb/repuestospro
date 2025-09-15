@echo off
echo 🔧 INICIANDO APP LIMPIA SIN NOTIFICACIONES
echo ===========================================

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
echo 📦 Reinstalando dependencias sin notificaciones...
npm install

echo.
echo 🔧 Configurando app limpia...
echo.
echo 💡 IMPORTANTE: La app ahora está configurada para:
echo    - Usar servicio offline (sin conexión real)
echo    - Usuario: "Usuario PiezasYA" (no "Usuario Offline")
echo    - Sin notificaciones push
echo    - Sin errores de conexión
echo.
echo 📋 INSTRUCCIONES:
echo    1. Abre la app móvil
echo    2. Ve a la pantalla de login
echo    3. Ingresa cualquier email y password
echo    4. El login será exitoso
echo    5. Verás "Usuario PiezasYA" en lugar de "Usuario Offline"

echo.
npx expo start --clear --localhost

echo.
echo ✅ App iniciada en modo limpio.
pause
