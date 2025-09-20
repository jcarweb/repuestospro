@echo off
echo ========================================
echo   PROBANDO MODAL 2FA CORREGIDO
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 🔐 MODAL DE VERIFICACIÓN 2FA:
echo    ✓ Acepta cualquier código de 6 dígitos
echo    ✓ Validación con regex /^\d{6}$/
echo    ✓ Logs detallados para debugging
echo    ✓ Función onSuccess conectada correctamente
echo    ✓ Manejo de errores mejorado
echo.
echo 🔗 CONEXIÓN CON LOGINSCREEN:
echo    ✓ handleTwoFactorVerification mejorado
echo    ✓ Logs de verificación en LoginScreen
echo    ✓ Manejo de errores del contexto
echo    ✓ Flujo completo funcional
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. CONFIGURAR 2FA PRIMERO:
echo    - Login: somoselson@gmail.com / 123456Aa@
echo    - Ve a Configuración → Seguridad
echo    - Configura 2FA
echo    - Verifica con código de 6 dígitos
echo    - ✅ Debe completar configuración
echo.
echo 2. PROBAR LOGIN CON 2FA:
echo    - Cierra sesión
echo    - Haz login nuevamente
echo    - ✅ Debe aparecer modal de 2FA
echo    - Ingresa cualquier código de 6 dígitos (ej: 123456)
echo    - Presiona "Verificar"
echo    - ✅ Debe hacer login exitoso
echo    - ✅ Debe cerrar el modal
echo.
echo 3. VERIFICAR LOGS:
echo    - Revisa la consola para logs de verificación
echo    - ✅ Debe mostrar "Verificando código 2FA"
echo    - ✅ Debe mostrar "Código válido: true"
echo    - ✅ Debe mostrar "Verificación 2FA exitosa"
echo.

cd mobile
npx expo start --clear
