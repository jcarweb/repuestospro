@echo off
echo ========================================
echo   PROBANDO SEGURIDAD COMPLETA
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 🔐 2FA HABILITADO PARA PRUEBAS:
echo    ✓ 2FA ya no está deshabilitado
echo    ✓ Verificación de twoFactorEnabled en AsyncStorage
echo    ✓ Flujo completo de 2FA funcional
echo    ✓ Login con verificación de código
echo.
echo 📊 HISTORIAL DE SEGURIDAD IMPLEMENTADO:
echo    ✓ Eventos de seguridad de ejemplo
echo    ✓ Login, 2FA, cambio de contraseña
echo    ✓ Actividad sospechosa
echo    ✓ Información de dispositivo y ubicación
echo    ✓ Timestamps realistas
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN INICIAL (SIN 2FA):
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo    - ✅ Debe hacer login directo
echo.
echo 2. CONFIGURAR 2FA:
echo    - Ve a Configuración → Seguridad
echo    - Configura 2FA
echo    - Copia el código secreto
echo    - Verifica con código de 6 dígitos
echo    - ✅ Debe completar configuración
echo.
echo 3. PROBAR LOGIN CON 2FA:
echo    - Cierra sesión
echo    - Haz login nuevamente
echo    - ✅ Debe pedir código 2FA
echo    - Ingresa código de 6 dígitos
echo    - ✅ Debe hacer login exitoso
echo.
echo 4. PROBAR HISTORIAL DE SEGURIDAD:
echo    - Ve a Configuración → Seguridad
echo    - Presiona "Historial de Seguridad"
echo    - ✅ Debe mostrar eventos de seguridad
echo    - ✅ Debe mostrar logins, 2FA, etc.
echo.

cd mobile
npx expo start --clear
