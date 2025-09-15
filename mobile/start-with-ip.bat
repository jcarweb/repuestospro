@echo off
echo ========================================
echo    PIEZASYA MOBILE - INICIO CON IP
echo ========================================
echo.

echo Configurando IP local: 192.168.150.104
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.150.104
set EXPO_DEVTOOLS_LISTEN_ADDRESS=192.168.150.104

echo.
echo Variables configuradas:
echo - REACT_NATIVE_PACKAGER_HOSTNAME: %REACT_NATIVE_PACKAGER_HOSTNAME%
echo - EXPO_DEVTOOLS_LISTEN_ADDRESS: %EXPO_DEVTOOLS_LISTEN_ADDRESS%
echo.

echo Iniciando Expo con configuración LAN...
npx expo start --lan

echo.
echo ========================================
echo    APP INICIADA - ESCANEA EL QR CODE
echo ========================================
echo.
echo Instrucciones:
echo 1. Escanea el QR code que aparece
echo 2. La app se conectará automáticamente
echo 3. Verifica el NetworkStatus en la pantalla
echo 4. Backend debe estar en: http://192.168.150.104:5000
echo.
pause
