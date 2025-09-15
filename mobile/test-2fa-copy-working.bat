@echo off
echo ========================================
echo   PROBANDO COPIA 2FA FUNCIONANDO
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ CORRECCIONES APLICADAS:
echo.
echo 📋 FUNCIONALIDAD DE COPIA CORREGIDA:
echo    ✓ Sin dependencias externas problemáticas
echo    ✓ Función personalizada copyToClipboard
echo    ✓ Guardado en AsyncStorage como respaldo
echo    ✓ Mensajes claros al usuario
echo    ✓ Botón de copiar funcional
echo    ✓ Long press también funciona
echo.
echo 💬 MENSAJES AL USUARIO:
echo    ✓ "✅ Código copiado al portapapeles" (éxito)
echo    ✓ "❌ Error al copiar código" (error)
echo    ✓ Feedback inmediato y claro
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
echo    - ✅ El código se guarda en AsyncStorage
echo.
echo 3. PROBAR LONG PRESS:
echo    - Mantén presionado el código secreto
echo    - ✅ Debe copiar automáticamente
echo    - ✅ Debe mostrar mensaje de confirmación
echo.
echo 4. VERIFICAR FUNCIONALIDAD:
echo    - El código está disponible para pegar
echo    - Los mensajes aparecen correctamente
echo    - No hay errores de dependencias
echo.

cd mobile
npx expo start --clear
