@echo off
echo ========================================
echo   PROBANDO PERSISTENCIA DE GPS
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📍 PERSISTENCIA DE GPS EN EDICIÓN:
echo    ✓ Validación mejorada de coordenadas
echo    ✓ Logs detallados para debugging
echo    ✓ Recarga automática con useFocusEffect
echo    ✓ LocationPicker actualiza con initialLocation
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. CONFIGURAR UBICACIÓN GPS:
echo    - Ve a Perfil → Editar
echo    - En la sección de ubicación, presiona "Ubicación Actual"
echo    - O selecciona una ubicación predefinida
echo    - Guarda los cambios
echo.
echo 3. VERIFICAR PERSISTENCIA:
echo    - Regresa a la pantalla de Perfil
echo    - ✅ Debe mostrar la ubicación en la información
echo.
echo 4. VERIFICAR EN EDICIÓN:
echo    - Ve a Perfil → Editar
echo    - ✅ La ubicación GPS debe aparecer en el mapa
echo    - ✅ Las coordenadas deben estar cargadas
echo.
echo 5. VERIFICAR ENTRE SESIONES:
echo    - Cierra y abre la app
echo    - Ve a Perfil → Editar
echo    - ✅ La ubicación GPS debe estar cargada
echo.

cd mobile
npx expo start --clear
