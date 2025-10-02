@echo off
echo ========================================
echo    GENERADOR DE APK - PiezasYA Mobile
echo ========================================
echo.

echo [1/5] Limpiando proyecto...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo ERROR: Fallo al limpiar el proyecto
    pause
    exit /b 1
)
cd ..

echo.
echo [2/5] Generando bundle de JavaScript...
call npx expo export --platform android
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar el bundle
    pause
    exit /b 1
)

echo.
echo [3/5] Copiando bundle a la ubicacion correcta...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
powershell -Command "Copy-Item 'dist\_expo\static\js\android\index-*.hbc' 'android\app\src\main\assets\index.android.bundle'"
if %errorlevel% neq 0 (
    echo ERROR: Fallo al copiar el bundle
    pause
    exit /b 1
)

echo.
echo [4/5] Compilando APK...
cd android
call gradlew assembleRelease --no-daemon --no-build-cache
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar el APK
    pause
    exit /b 1
)

cd ..
echo.
echo [5/5] Buscando APK generado...
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
    pause
    exit /b 0
)

echo ERROR: No se encontro el APK generado
pause
exit /b 1
