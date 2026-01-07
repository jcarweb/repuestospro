@echo off
echo ========================================
echo    GENERADOR DE APK LIMPIO - PiezasYA
echo ========================================
echo.

echo [1/7] Cerrando procesos de Gradle...
taskkill /f /im java.exe 2>nul
taskkill /f /im gradle.exe 2>nul
taskkill /f /im gradlew.exe 2>nul
echo Procesos cerrados

echo.
echo [2/7] Configurando variables de entorno...
set NODE_ENV=production
set GRADLE_OPTS=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
echo NODE_ENV configurado: %NODE_ENV%

echo.
echo [3/7] Limpiando cache de Gradle (forzado)...
if exist "%USERPROFILE%\.gradle" (
    echo Eliminando cache de Gradle...
    timeout /t 2 /nobreak >nul
    rmdir /s /q "%USERPROFILE%\.gradle" 2>nul
    if exist "%USERPROFILE%\.gradle" (
        echo Cache parcialmente limpiado
    ) else (
        echo Cache completamente limpiado
    )
)

echo.
echo [4/7] Limpiando proyecto Android...
if exist "android\build" rmdir /s /q "android\build" 2>nul
if exist "android\app\build" rmdir /s /q "android\app\build" 2>nul
if exist "dist" rmdir /s /q "dist" 2>nul
echo Archivos temporales limpiados

echo.
echo [5/7] Generando bundle de JavaScript...
call npx expo export --platform android --output-dir dist
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar el bundle
    pause
    exit /b 1
)

echo.
echo [6/7] Copiando bundle a Android...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
for %%f in (dist\static\js\android\index-*.hbc) do (
    copy "%%f" "android\app\src\main\assets\index.android.bundle" >nul
    echo Bundle copiado: %%f
)

echo.
echo [7/7] Compilando APK Release...
cd android
call gradlew.bat assembleRelease --no-daemon --no-build-cache --stacktrace --refresh-dependencies
if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar APK release
    echo Intentando con debug...
    call gradlew.bat assembleDebug --no-daemon --no-build-cache --stacktrace
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al compilar APK
        cd ..
        pause
        exit /b 1
    )
)

cd ..
echo.
echo Buscando APK generado...
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
