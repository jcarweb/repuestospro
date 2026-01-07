@echo off
echo ========================================
echo    DEPLOY A PRODUCCION - PiezasYA
echo ========================================
echo.

set ERROR_COUNT=0

echo [PASO 1/6] Verificando credenciales...
call scripts\check-credentials.bat
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Verificacion de credenciales fallo
    echo No se puede continuar con el deploy
    pause
    exit /b 1
)

echo.
echo [PASO 2/6] Verificando estado de Git...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No se encontro Git o no es un repositorio Git
    pause
    exit /b 1
)

echo [OK] Git esta disponible
git status --short

echo.
echo [PASO 3/6] Preparando cambios para commit...
echo.
echo Archivos modificados:
git status --short

echo.
set /p CONFIRM="Deseas continuar con el commit? (S/N): "
if /i not "%CONFIRM%"=="S" (
    echo Deploy cancelado por el usuario
    pause
    exit /b 0
)

echo.
echo [PASO 4/6] Haciendo commit de los cambios...
set /p COMMIT_MSG="Ingresa el mensaje del commit: "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG="Deploy: Optimizaciones de rendimiento y mejoras"
)

git add .
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo ERROR: Fallo al hacer commit
    pause
    exit /b 1
)

echo.
echo [PASO 5/6] Subiendo cambios a Git...
set /p PUSH_CONFIRM="Deseas subir los cambios a Git ahora? (S/N): "
if /i "%PUSH_CONFIRM%"=="S" (
    echo Subiendo a Git...
    git push
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al subir cambios a Git
        echo Puedes intentar manualmente con: git push
        pause
        exit /b 1
    )
    echo [OK] Cambios subidos a Git exitosamente
) else (
    echo [INFO] Cambios commitados pero no subidos
    echo Puedes subirlos manualmente con: git push
)

echo.
echo [PASO 6/6] Preparando build del APK...
set /p BUILD_APK="Deseas construir el APK ahora? (S/N): "
if /i "%BUILD_APK%"=="S" (
    echo.
    echo Construyendo APK...
    cd mobile
    call build-apk.bat
    cd ..
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al construir el APK
        pause
        exit /b 1
    )
) else (
    echo [INFO] Build del APK omitido
    echo Puedes construirlo manualmente con: cd mobile ^&^& build-apk.bat
)

echo.
echo ========================================
echo    DEPLOY COMPLETADO
echo ========================================
echo.
echo Resumen:
echo - Credenciales verificadas: OK
echo - Cambios commitados: OK
if /i "%PUSH_CONFIRM%"=="S" (
    echo - Cambios subidos a Git: OK
)
if /i "%BUILD_APK%"=="S" (
    echo - APK construido: OK
)
echo.
echo NOTA: Render se actualizara automaticamente cuando detecte
echo       los cambios en el repositorio Git
echo.
echo Para verificar el deploy en Render:
echo 1. Ve a https://dashboard.render.com
echo 2. Revisa el estado del servicio "piezasyaya-backend"
echo 3. Verifica los logs del deploy
echo.
pause

