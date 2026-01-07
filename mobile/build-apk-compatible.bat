@echo off
echo ========================================
echo    APK COMPATIBLE - PiezasYA Mobile
echo ========================================
echo.

echo [1/6] Configurando entorno...
set NODE_ENV=production
set GRADLE_OPTS=-Xmx2048m -Dfile.encoding=UTF-8
echo NODE_ENV: %NODE_ENV%

echo.
echo [2/6] Limpiando proyecto...
cd android
call gradlew clean --warning-mode none
if %errorlevel% neq 0 (
    echo ERROR: Fallo al limpiar el proyecto
    pause
    exit /b 1
)
cd ..

echo.
echo [3/6] Generando bundle de JavaScript...
call npx expo export --platform android --output-dir dist
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar el bundle
    pause
    exit /b 1
)

echo.
echo [4/6] Copiando bundle a la ubicacion correcta...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
powershell -Command "Copy-Item 'dist\_expo\static\js\android\index-*.hbc' 'android\app\src\main\assets\index.android.bundle'"
if %errorlevel% neq 0 (
    echo ERROR: Fallo al copiar el bundle
    pause
    exit /b 1
)

echo.
echo [5/6] Compilando APK con opciones compatibles...
cd android
call gradlew assembleRelease --no-daemon --no-build-cache --warning-mode none --stacktrace
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar APK release
    echo Intentando con debug...
    call gradlew assembleDebug --no-daemon --no-build-cache --warning-mode none --stacktrace
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al compilar APK
        cd ..
        pause
        exit /b 1
    )
)

cd ..
echo.
echo [6/6] Buscando APK generado...
for /r "android\app\build\outputs" %%f in (*.apk) do (
    echo APK encontrado: %%f
    echo.
    echo ========================================
    echo    BUILD EXITOSO!
    echo ========================================
    echo.
    echo El APK se encuentra en:
    echo %%f
    echo.
    echo Para instalar en tu dispositivo:
    echo adb install -r "%%f"
    echo.
    echo APK generado con el nuevo icono!
    echo.
    pause
    exit /b 0
)

echo ERROR: No se encontro el APK generado
pause
exit /b 1
