@echo off
echo ========================================
echo    CORRIGIENDO ICONOS DE EXPO
echo ========================================

echo.
echo [1/3] Reemplazando importaciones de @expo/vector-icons...
findstr /s /m "@expo/vector-icons" src\*.* > temp_files.txt

for /f %%i in (temp_files.txt) do (
    echo Corrigiendo: %%i
    powershell -Command "(Get-Content '%%i') -replace 'import \{ Ionicons \} from ''@expo/vector-icons'';', 'import Icon from ''react-native-vector-icons/Ionicons'';' | Set-Content '%%i'"
    powershell -Command "(Get-Content '%%i') -replace 'import \{ MaterialIcons \} from ''@expo/vector-icons'';', 'import Icon from ''react-native-vector-icons/MaterialIcons'';' | Set-Content '%%i'"
    powershell -Command "(Get-Content '%%i') -replace 'import \{ FontAwesome \} from ''@expo/vector-icons'';', 'import Icon from ''react-native-vector-icons/FontAwesome'';' | Set-Content '%%i'"
)

echo.
echo [2/3] Reemplazando referencias a Ionicons...
for /f %%i in (temp_files.txt) do (
    echo Reemplazando Ionicons en: %%i
    powershell -Command "(Get-Content '%%i') -replace 'Ionicons', 'Icon' | Set-Content '%%i'"
)

echo.
echo [3/3] Limpiando archivos temporales...
del temp_files.txt

echo.
echo ✅ Corrección completada!
echo.
echo Ahora puedes generar el bundle con:
echo npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
