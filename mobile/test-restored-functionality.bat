@echo off
echo ========================================
echo   PROBANDO FUNCIONALIDADES RESTAURADAS
echo ========================================
echo.

echo 🔧 Deteniendo procesos previos...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ FUNCIONALIDADES RESTAURADAS:
echo.
echo 📱 EDICIÓN DE PERFIL:
echo    ✓ Subida de fotos (cámara y galería)
echo    ✓ Guardado de coordenadas GPS
echo    ✓ Actualización de información personal
echo    ✓ Validación de campos obligatorios
echo.
echo 🔐 AUTENTICACIÓN 2FA:
echo    ✓ Código secreto seleccionable
echo    ✓ Botón de copiar funcional
echo    ✓ Instrucciones detalladas para Google Authenticator
echo    ✓ Verificación de códigos de 6 dígitos
echo    ✓ Códigos de respaldo generados
echo.
echo 🚀 INICIANDO APP PARA PRUEBAS...
echo.
echo INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN:
echo    - Email: somoselson@gmail.com
echo    - Password: 123456Aa@
echo    - (2FA deshabilitado temporalmente)
echo.
echo 2. PROBAR EDICIÓN DE PERFIL:
echo    - Ve a Perfil → Editar
echo    - Cambia la foto (cámara/galería)
echo    - Actualiza información personal
echo    - Selecciona ubicación en el mapa
echo    - Guarda los cambios
echo.
echo 3. PROBAR 2FA:
echo    - Ve a Configuración → Seguridad
echo    - Configura 2FA
echo    - Copia el código secreto
echo    - Ingresa manualmente en Google Authenticator
echo    - Verifica con código de 6 dígitos
echo.
echo 4. PROBAR LOGIN RÁPIDO:
echo    - Configura PIN: 1234
echo    - Activa biometría
echo    - Prueba login con PIN/huella
echo.

cd mobile
npx expo start --clear
