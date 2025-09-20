@echo off
echo ========================================
echo    PIEZASYA MOBILE - INICIO CON RED
echo ========================================
echo.

echo Configurando variables de entorno para desarrollo local...
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
set EXPO_USE_DEV_SERVER=1
set EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
set REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

echo.
echo Variables configuradas:
echo - EXPO_DEVTOOLS_LISTEN_ADDRESS: %EXPO_DEVTOOLS_LISTEN_ADDRESS%
echo - EXPO_USE_DEV_SERVER: %EXPO_USE_DEV_SERVER%
echo - REACT_NATIVE_PACKAGER_HOSTNAME: %REACT_NATIVE_PACKAGER_HOSTNAME%
echo.

echo Limpiando cache de Expo...
npx expo start --clear

echo.
echo ========================================
echo    APP INICIADA CON CONFIGURACION DE RED
echo ========================================
echo.
echo Instrucciones:
echo 1. La app se abrirá en tu dispositivo
echo 2. Si hay problemas de red, usa el componente NetworkStatus
echo 3. El backend debe estar corriendo en: http://localhost:5000
echo 4. Para desarrollo en red local, usa la IP de tu computadora
echo.
pause
