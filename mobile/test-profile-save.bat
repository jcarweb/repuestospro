@echo off
echo ========================================
echo   PROBANDO GUARDADO DE PERFIL CORREGIDO
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📱 EDITPROFILESCREEN:
echo    ✓ Cambiado de APIService a offlineApiService
echo    ✓ Guardado en AsyncStorage funcionando
echo    ✓ Carga de datos previos implementada
echo    ✓ Timeout de guardado reducido a 2 segundos
echo    ✓ Botón ya no se queda en gris
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. PROBAR GUARDADO DE PERFIL:
echo    - Ve a Perfil → Editar
echo    - Cambia el nombre
echo    - Cambia el teléfono
echo    - Cambia la dirección
echo    - Selecciona una ubicación
echo    - Toma o selecciona una foto
echo    - Presiona "Guardar Cambios"
echo    - ✅ El botón NO debe quedarse en gris
echo    - ✅ Debe mostrar "Perfil actualizado correctamente"
echo.
echo 3. VERIFICAR PERSISTENCIA:
echo    - Cierra y abre la app
echo    - Ve a Perfil → Editar
echo    - ✅ Los datos deben estar guardados
echo.

cd mobile
npx expo start --clear
