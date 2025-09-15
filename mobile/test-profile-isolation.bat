@echo off
echo ========================================
echo   PROBANDO AISLAMIENTO DE PERFILES
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📱 EDITPROFILESCREEN:
echo    ✓ Clave única por usuario: profileData_{user.id}
echo    ✓ Validación de usuario logueado
echo    ✓ Logs específicos por usuario
echo.
echo 📱 PROFILESCREEN:
echo    ✓ Clave única por usuario: profileData_{user.id}
echo    ✓ Validación de usuario logueado
echo    ✓ Logs específicos por usuario
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN CON USUARIO ADMIN:
echo    - Login: somoselson@gmail.com / 123456Aa@
echo    - Ve a Perfil → Editar Perfil
echo    - Modifica algunos datos (nombre, teléfono, dirección)
echo    - Guarda los cambios
echo    - ✅ Debe guardar datos específicos del admin
echo.
echo 2. LOGIN CON USUARIO CLIENTE:
echo    - Cierra sesión
echo    - Login con otro usuario (ej: cliente@test.com)
echo    - Ve a Perfil → Editar Perfil
echo    - ✅ Debe mostrar datos vacíos o del cliente
echo    - ✅ NO debe mostrar datos del admin
echo    - Modifica datos del cliente
echo    - Guarda los cambios
echo.
echo 3. VERIFICAR AISLAMIENTO:
echo    - Cambia entre usuarios
echo    - ✅ Cada usuario debe ver solo sus datos
echo    - ✅ No debe haber mezcla de datos
echo.
echo 4. VERIFICAR LOGS:
echo    - Revisa la consola
echo    - ✅ Debe mostrar "Datos del perfil cargados para usuario {id}"
echo    - ✅ Debe mostrar claves únicas por usuario
echo.

cd mobile
npx expo start --clear
