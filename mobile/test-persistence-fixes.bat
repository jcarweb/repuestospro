@echo off
echo ========================================
echo   PROBANDO CORRECCIONES DE PERSISTENCIA
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📱 PERSISTENCIA DE UBICACIÓN GPS:
echo    ✓ Validación mejorada de coordenadas
echo    ✓ Guardado correcto de latitud/longitud
echo    ✓ Carga de ubicación al abrir pantalla
echo.
echo 🖼️ VISUALIZACIÓN DE FOTO DE PERFIL:
echo    ✓ Carga de foto desde AsyncStorage
echo    ✓ Mostrar foto en pantalla de perfil
echo    ✓ Icono placeholder cuando no hay foto
echo    ✓ Recarga automática al regresar de edición
echo.
echo 📊 INFORMACIÓN ADICIONAL:
echo    ✓ Teléfono guardado y mostrado
echo    ✓ Dirección guardada y mostrada
echo    ✓ Ubicación GPS mostrada en perfil
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. PROBAR PERSISTENCIA COMPLETA:
echo    - Ve a Perfil → Editar
echo    - Cambia el nombre
echo    - Cambia el teléfono
echo    - Cambia la dirección
echo    - Selecciona ubicación GPS (Ubicación Actual)
echo    - Toma o selecciona una foto
echo    - Guarda los cambios
echo.
echo 3. VERIFICAR PERSISTENCIA:
echo    - Regresa a la pantalla de Perfil
echo    - ✅ Debe mostrar la foto
echo    - ✅ Debe mostrar teléfono y dirección
echo    - ✅ Debe mostrar ubicación GPS
echo.
echo 4. VERIFICAR PERSISTENCIA ENTRE SESIONES:
echo    - Cierra y abre la app
echo    - Ve a Perfil
echo    - ✅ Todo debe estar guardado
echo.

cd mobile
npx expo start --clear
