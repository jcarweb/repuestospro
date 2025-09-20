@echo off
echo ========================================
echo    GENERANDO BUNDLE MANUAL
echo ========================================

echo.
echo [1/3] Verificando directorio assets...
if not exist android\app\src\main\assets (
    mkdir android\app\src\main\assets
    echo ✅ Directorio assets creado
) else (
    echo ✅ Directorio assets ya existe
)

echo.
echo [2/3] Generando bundle JavaScript...
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

echo.
echo [3/3] Verificando resultado...
if exist android\app\src\main\assets\index.android.bundle (
    echo ✅ Bundle generado exitosamente
    dir android\app\src\main\assets\index.android.bundle
) else (
    echo ❌ Error: No se pudo generar el bundle
)

echo.
echo Para construir el APK:
echo cd android && gradlew assembleDebug --no-daemon
