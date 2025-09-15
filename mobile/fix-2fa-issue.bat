@echo off
echo 🔧 SOLUCIONANDO PROBLEMA DE 2FA
echo =================================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔐 CONFIGURACIÓN APLICADA:
echo.
echo ✅ 2FA DESHABILITADO para: somoselson@gmail.com
echo ✅ Login directo habilitado para esta cuenta
echo ✅ Credenciales se guardarán automáticamente
echo ✅ PIN y biometría funcionarán después del primer login
echo.
echo 📋 INSTRUCCIONES:
echo.
echo 1. INICIA LA APP:
echo    - Ejecuta: npx expo start --clear
echo.
echo 2. LOGIN CON LA CUENTA PROBLEMÁTICA:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo    - NO se pedirá código 2FA
echo.
echo 3. DESPUÉS DEL LOGIN:
echo    - Ve a Configuración ^> Seguridad
echo    - Configura PIN: 1234
echo    - Activa biometría
echo    - Ahora podrás usar login rápido
echo.
echo 4. LOGIN RÁPIDO:
echo    - Botón PIN: Ingresa 1234
echo    - Botón Huella: Verifica huella
echo    - Sin necesidad de email/password
echo.

echo.
echo 🚀 Iniciando app con solución aplicada...
npx expo start --clear --localhost

echo.
echo ✅ App iniciada. ¡Prueba el login con somoselson@gmail.com!
pause
