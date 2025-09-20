@echo off
echo ========================================
echo   PROBANDO FUNCIONALIDAD DE COPIA 2FA
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📋 FUNCIONALIDAD DE COPIA:
echo    ✓ Usando expo-clipboard (compatible con Expo)
echo    ✓ Función async/await para mejor manejo
echo    ✓ Mensajes claros con emojis
echo    ✓ Botón de copiar funcional
echo    ✓ Long press también copia
echo.
echo 💬 MENSAJES AL USUARIO:
echo    ✓ "✅ Código copiado al portapapeles" (éxito)
echo    ✓ "❌ Error al copiar código" (error)
echo    ✓ "ℹ️ Código seleccionado..." (info)
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo.
echo 2. PROBAR COPIA DE CÓDIGO 2FA:
echo    - Ve a Configuración → Seguridad
echo    - Configura 2FA
echo    - ✅ Presiona el botón "Copiar Código"
echo    - ✅ Debe mostrar "Código copiado al portapapeles"
echo    - ✅ El código debe estar en el portapapeles
echo.
echo 3. PROBAR LONG PRESS:
echo    - Mantén presionado el código secreto
echo    - ✅ Debe copiar automáticamente
echo    - ✅ Debe mostrar mensaje de confirmación
echo.
echo 4. VERIFICAR EN GOOGLE AUTHENTICATOR:
echo    - Abre Google Authenticator
echo    - Agrega cuenta manualmente
echo    - Pega el código copiado
echo    - ✅ Debe funcionar correctamente
echo.

cd mobile
npx expo start --clear
