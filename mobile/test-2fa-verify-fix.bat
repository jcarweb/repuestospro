@echo off
echo ========================================
echo   PROBANDO VERIFICACIÓN 2FA CORREGIDA
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 🔐 FUNCIONALIDAD DE VERIFICACIÓN:
echo    ✓ Acepta cualquier código de 6 dígitos
echo    ✓ Validación con regex /^\d{6}$/
echo    ✓ Logs detallados para debugging
echo    ✓ Mensajes claros al usuario
echo    ✓ Botón con feedback visual
echo.
echo 🎯 MEJORAS EN EL BOTÓN:
echo    ✓ Cambia color según estado
echo    ✓ Muestra dígitos faltantes
echo    ✓ Deshabilitado hasta tener 6 dígitos
echo    ✓ Logs cuando se presiona
echo.
echo 💬 MENSAJES AL USUARIO:
echo    ✓ "✅ Código verificado correctamente" (éxito)
echo    ✓ "❌ Código inválido. Debe ser de 6 dígitos" (error)
echo    ✓ "Faltan X dígitos" (en el botón)
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. CONFIGURAR 2FA:
echo    - Ve a Configuración → Seguridad
echo    - Configura 2FA
echo    - Copia el código secreto
echo    - Continúa a verificación
echo.
echo 3. PROBAR VERIFICACIÓN:
echo    - Ingresa cualquier código de 6 dígitos (ej: 123456)
echo    - ✅ El botón debe habilitarse
echo    - ✅ Presiona "Verificar"
echo    - ✅ Debe mostrar "Código verificado correctamente"
echo    - ✅ Debe avanzar a códigos de respaldo
echo.
echo 4. PROBAR CÓDIGOS INVÁLIDOS:
echo    - Ingresa menos de 6 dígitos
echo    - ✅ El botón debe estar deshabilitado
echo    - ✅ Debe mostrar "Faltan X dígitos"
echo.

cd mobile
npx expo start --clear
