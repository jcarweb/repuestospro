@echo off
echo ========================================
echo    GENERADOR DE APK MINIMAL - PiezasYA
echo ========================================
echo.

echo [1/5] Configurando entorno...
set NODE_ENV=production
echo NODE_ENV: %NODE_ENV%

echo.
echo [2/5] Generando bundle...
call npx expo export --platform android --output-dir dist
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar bundle
    pause
    exit /b 1
)

echo.
echo [3/5] Preparando archivos Android...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
for %%f in (dist\static\js\android\index-*.hbc) do (
    copy "%%f" "android\app\src\main\assets\index.android.bundle" >nul
    echo Bundle copiado
)

echo.
echo [4/5] Compilando APK (modo simple)...
cd android
call gradlew.bat assembleDebug --offline --no-daemon
if %errorlevel% neq 0 (
    echo ERROR: Fallo en compilacion offline
    echo Intentando sin offline...
    call gradlew.bat assembleDebug --no-daemon
    if %errorlevel% neq 0 (
        echo ERROR: Fallo en compilacion
        cd ..
        pause
        exit /b 1
    )
)

cd ..
echo.
echo [5/5] Verificando APK...
for /r "android\app\build\outputs" %%f in (*.apk) do (
    echo.
    echo ========================================
    echo    APK GENERADO EXITOSAMENTE!
    echo ========================================
    echo.
    echo Ubicacion: %%f
    echo.
    echo Para instalar:
    echo adb install -r "%%f"
    echo.
    echo Sistema 2FA incluido!
    echo.
    pause
    exit /b 0
)

echo ERROR: APK no encontrado
pause
exit /b 1
