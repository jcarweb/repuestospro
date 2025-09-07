@echo off
echo ========================================
echo   LIMPIANDO DATOS DE PERFIL ANTIGUOS
echo ========================================
echo.

echo 🧹 Limpiando datos de perfil mezclados...
echo.

echo 📱 Ejecutando script de limpieza...
node -e "
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function clearOldProfileData() {
  try {
    console.log('🧹 Limpiando datos de perfil antiguos...');
    
    // Limpiar datos de perfil con clave fija (sin diferenciación de usuario)
    await AsyncStorage.removeItem('profileData');
    console.log('✅ Datos de perfil antiguos eliminados');
    
    // Mostrar todas las claves que empiecen con 'profileData_'
    const keys = await AsyncStorage.getAllKeys();
    const profileKeys = keys.filter(key => key.startsWith('profileData_'));
    
    if (profileKeys.length > 0) {
      console.log('📋 Claves de perfil por usuario encontradas:');
      profileKeys.forEach(key => {
        console.log('   - ' + key);
      });
    } else {
      console.log('📋 No hay claves de perfil por usuario');
    }
    
    console.log('✅ Limpieza completada');
  } catch (error) {
    console.error('❌ Error limpiando datos:', error);
  }
}

clearOldProfileData();
"

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
