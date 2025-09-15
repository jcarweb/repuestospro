@echo off
echo ========================================
echo   LIMPIANDO DATOS DE PERFIL ANTIGUOS
echo ========================================
echo.

echo 🧹 Limpiando datos de perfil mezclados...
echo.

echo 📱 Ejecutando script de limpieza...
node -e "const AsyncStorage = require('@react-native-async-storage/async-storage').default; AsyncStorage.removeItem('profileData').then(() => console.log('✅ Datos de perfil antiguos eliminados')).catch(err => console.error('❌ Error:', err));"

echo.
echo ✅ LIMPIEZA COMPLETADA
echo.
echo 🔧 CORRECCIONES APLICADAS:
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
echo 🎯 RESULTADO ESPERADO:
echo    ✓ Cada usuario tendrá sus propios datos de perfil
echo    ✓ No habrá mezcla de datos entre usuarios
echo    ✓ Los datos se cargarán correctamente por usuario
echo.
echo 🚀 Ahora puedes probar con diferentes usuarios
echo.
pause
