@echo off
echo ========================================
echo    DESARROLLO CON EXPO GO - PiezasYA
echo ========================================
echo.

echo [1/3] Configurando variables de entorno...
set NODE_ENV=development
echo NODE_ENV configurado: %NODE_ENV%

echo.
echo [2/3] Iniciando servidor de desarrollo...
echo.
echo INSTRUCCIONES:
echo 1. Instala Expo Go en tu telefono
echo 2. Escanea el codigo QR que aparecera
echo 3. La app se cargara en tu telefono
echo 4. Sistema 2FA completamente funcional
echo.

call npx expo start
if %errorlevel% neq 0 (
    echo ERROR: Fallo al iniciar Expo
    pause
    exit /b 1
)

echo.
echo ========================================
echo    DESARROLLO INICIADO!
echo ========================================
echo.
echo Sistema 2FA disponible en Expo Go
echo.
pause
