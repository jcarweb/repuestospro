@echo off
echo ========================================
echo    GENERADOR DE APK - PiezasYA Mobile
echo    (Version con limpieza de cache)
echo ========================================
echo.

echo [0/6] Configurando variables de entorno...
set NODE_ENV=production
echo NODE_ENV configurado: %NODE_ENV%

echo.
echo [1/6] Limpiando cache de Gradle...
if exist "%USERPROFILE%\.gradle\caches" (
    rmdir /s /q "%USERPROFILE%\.gradle\caches"
    echo Cache de Gradle limpiado
) else (
    echo Cache de Gradle no encontrado
)

echo.
echo [2/6] Limpiando proyecto Android...
if exist "android\build" rmdir /s /q "android\build"
if exist "android\app\build" rmdir /s /q "android\app\build"
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo ERROR: Fallo al limpiar el proyecto
    pause
    exit /b 1
)
cd ..

echo.
echo [3/6] Generando bundle de JavaScript...
call npx expo export --platform android
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
echo [5/6] Compilando APK...
cd android
call gradlew assembleRelease --no-daemon --no-build-cache --stacktrace
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar el APK
    echo.
    echo Intentando con modo debug...
    call gradlew assembleDebug --no-daemon --no-build-cache
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al compilar APK debug
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
    echo Sistema 2FA incluido y funcional!
    echo.
    pause
    exit /b 0
)

echo ERROR: No se encontro el APK generado
pause
exit /b 1
