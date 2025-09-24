@echo off
echo ========================================
echo    GENERADOR DE APK RAPIDO - PiezasYA
echo ========================================
echo.

echo [1/4] Verificando bundle existente...
if exist "dist\_expo\static\js\android\index-*.hbc" (
    echo Bundle encontrado, usando existente
    goto :copy_bundle
)

echo [2/4] Generando bundle...
call npx expo export --platform android --output-dir dist
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar bundle
    pause
    exit /b 1
)

:copy_bundle
echo [3/4] Copiando bundle a Android...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
for %%f in (dist\_expo\static\js\android\index-*.hbc) do (
    copy "%%f" "android\app\src\main\assets\index.android.bundle" /Y >nul
    echo Bundle copiado: %%f
)

echo [4/4] Compilando APK...
cd android
call gradlew.bat assembleDebug --no-daemon --stacktrace
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar APK
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo    APK GENERADO EXITOSAMENTE!
echo ========================================
echo.
for /r "android\app\build\outputs" %%f in (*.apk) do (
    echo APK: %%f
    echo.
    echo Para instalar: adb install -r "%%f"
    echo Sistema 2FA incluido!
    pause
    exit /b 0
)

echo ERROR: APK no encontrado
pause
exit /b 1
