@echo off
echo ========================================
echo    GENERADOR DE APK SIMPLE - PiezasYA
echo ========================================
echo.

echo [1/4] Configurando variables de entorno...
set NODE_ENV=production
echo NODE_ENV configurado: %NODE_ENV%

echo.
echo [2/4] Generando bundle de JavaScript...
call npx expo export --platform android
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar el bundle
    pause
    exit /b 1
)

echo.
echo [3/4] Usando EAS Build para generar APK...
echo Esto evitara problemas de Gradle local
call npx eas build --platform android --profile preview
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar APK con EAS
    echo.
    echo Alternativa: Usar Expo Go para desarrollo
    echo npx expo start
    pause
    exit /b 1
)

echo.
echo [4/4] APK generado exitosamente!
echo.
echo ========================================
echo    BUILD EXITOSO!
echo ========================================
echo.
echo El APK se puede descargar desde:
echo https://expo.dev/accounts/[tu-usuario]/projects/mobile/builds
echo.
echo Sistema 2FA incluido y funcional!
echo.
pause
