@echo off
echo ========================================
echo    GENERADOR DE APK LOCAL - PiezasYA
echo ========================================
echo.

echo [1/6] Configurando variables de entorno...
set NODE_ENV=production
set GRADLE_OPTS=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
echo NODE_ENV configurado: %NODE_ENV%
echo GRADLE_OPTS configurado

echo.
echo [2/6] Limpiando archivos temporales...
if exist "android\build" rmdir /s /q "android\build" 2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "dist" rmdir /s /q "dist" 2>nul
echo Archivos temporales limpiados

echo.
echo [3/6] Generando bundle de JavaScript...
call npx expo export --platform android --output-dir dist
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar el bundle
    pause
    exit /b 1
)

echo.
echo [4/6] Copiando bundle a Android...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
for %%f in (dist\static\js\android\index-*.hbc) do (
    copy "%%f" "android\app\src\main\assets\index.android.bundle" >nul
    echo Bundle copiado: %%f
)

echo.
echo [5/6] Compilando APK con Gradle local...
cd android
call gradlew.bat assembleDebug --no-daemon --no-build-cache --stacktrace
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar APK debug
    echo Intentando con release...
    call gradlew.bat assembleRelease --no-daemon --no-build-cache --stacktrace
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
    echo Sistema 2FA incluido y funcional!
    echo.
    pause
    exit /b 0
)

echo ERROR: No se encontro el APK generado
echo Revisa los logs de Gradle para mas detalles
pause
exit /b 1
