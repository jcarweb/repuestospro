@echo off
echo ========================================
echo    GENERADOR DE APK - PiezasYA Mobile
echo    (Version con limpieza previa)
echo ========================================
echo.

echo [PRE-BUILD] Limpiando cache y archivos temporales...
cd android
if exist "app\.cxx" (
    echo Limpiando .cxx...
    rd /s /q app\.cxx 2>nul
)
if exist "app\build" (
    echo Limpiando build anterior...
    rd /s /q app\build 2>nul
)
cd ..

echo.
echo [1/5] Limpiando proyecto con Gradle...
cd android
call gradlew clean --no-daemon --no-build-cache
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Gradle clean tuvo problemas, pero continuamos...
    echo Esto puede ser normal si es la primera vez
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
if exist "dist\_expo\static\js\android\index-*.hbc" (
    for %%f in (dist\_expo\static\js\android\index-*.hbc) do (
        copy "%%f" "android\app\src\main\assets\index.android.bundle" >nul
        echo [OK] Bundle copiado: %%f
        goto :bundle_copied
    )
    :bundle_copied
) else (
    echo ERROR: No se encontro el bundle generado
    pause
    exit /b 1
)

echo.
echo [4/5] Compilando APK (esto puede tardar varios minutos)...
cd android
call gradlew assembleRelease --no-daemon --no-build-cache --stacktrace
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo al compilar el APK
    echo.
    echo Posibles soluciones:
    echo 1. Ejecuta: fix-build-errors.bat
    echo 2. Verifica que Android SDK este instalado correctamente
    echo 3. Verifica que Java JDK este en el PATH
    echo.
    pause
    exit /b 1
)

cd ..
echo.
echo [5/5] Buscando APK generado...
set APK_FOUND=0
for /r "android\app\build\outputs\apk\release" %%f in (*.apk) do (
    echo.
    echo ========================================
    echo    BUILD EXITOSO!
    echo ========================================
    echo.
    echo APK encontrado: %%f
    echo.
    echo Tamaño del archivo:
    dir "%%f" | findstr /C:"%%f"
    echo.
    echo Para instalar en tu dispositivo:
    echo   adb install -r "%%f"
    echo.
    set APK_FOUND=1
    pause
    exit /b 0
)

if %APK_FOUND%==0 (
    echo ERROR: No se encontro el APK generado
    echo.
    echo Busca manualmente en:
    echo   android\app\build\outputs\apk\release\
    echo.
    pause
    exit /b 1
)

