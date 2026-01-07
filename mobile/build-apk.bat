@echo off
echo ========================================
echo    GENERADOR DE APK - PiezasYA Mobile
echo ========================================
echo.

echo [1/5] Limpiando proyecto...
cd android
REM Limpiar directorios problemáticos primero
if exist "app\.cxx" (
    echo Limpiando .cxx...
    rd /s /q app\.cxx 2>nul
)
if exist "app\build" (
    echo Limpiando build anterior...
    rd /s /q app\build 2>nul
)
REM Intentar limpiar con Gradle, pero no fallar si hay problemas
call gradlew clean --no-daemon --no-build-cache 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Gradle clean tuvo problemas, pero continuamos...
    echo Esto puede ser normal si el cache esta corrupto
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
REM Buscar el bundle generado y copiarlo
set BUNDLE_COPIED=0
if exist "dist\_expo\static\js\android" (
    for %%f in ("dist\_expo\static\js\android\index-*.hbc") do (
        if exist "%%f" (
            copy "%%f" "android\app\src\main\assets\index.android.bundle" >nul
            echo [OK] Bundle copiado exitosamente: %%f
            set BUNDLE_COPIED=1
            goto :bundle_done
        )
    )
)
:bundle_done
if %BUNDLE_COPIED%==0 (
    echo ERROR: No se encontro el bundle generado en dist\_expo\static\js\android\
    echo Buscando archivos disponibles...
    dir "dist\_expo\static\js\android\" 2>nul
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
