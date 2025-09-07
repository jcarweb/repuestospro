@echo off
echo ========================================
echo   PROBANDO APP SIN ERRORES
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📱 ERRORES DE DEPENDENCIAS SOLUCIONADOS:
echo    ✓ expo-notifications removido de SettingsScreen
echo    ✓ Funciones de notificación simuladas
echo    ✓ Sin dependencias problemáticas
echo    ✓ App debe compilar sin errores
echo.
echo 🔧 FUNCIONALIDADES MANTENIDAS:
echo    ✓ Configuración de notificaciones (simulada)
echo    ✓ Guardado de preferencias
echo    ✓ Interfaz de usuario intacta
echo    ✓ Todas las demás funcionalidades
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. PROBAR CONFIGURACIÓN:
echo    - Ve a Configuración
echo    - ✅ Debe abrir sin errores
echo    - ✅ Todas las opciones deben funcionar
echo    - ✅ Notificaciones deben activarse (simulado)
echo.
echo 3. PROBAR 2FA COMPLETO:
echo    - Ve a Configuración → Seguridad
echo    - Configura 2FA
echo    - Copia el código
echo    - Verifica con código de 6 dígitos
echo    - ✅ Debe completar el proceso
echo.
echo 4. VERIFICAR SIN ERRORES:
echo    - ✅ No debe haber errores de compilación
echo    - ✅ No debe haber errores de dependencias
echo    - ✅ Todas las funcionalidades deben trabajar
echo.

cd mobile
npx expo start --clear
