@echo off
echo 🔐 PROBANDO LOGIN CON SEGURIDAD AVANZADA
echo ==========================================

echo.
echo 📱 Deteniendo procesos...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo 🧹 Limpiando cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🔧 Configurando datos de prueba...
echo.
echo 💡 INSTRUCCIONES DE PRUEBA:
echo.
echo 1. LOGIN TRADICIONAL:
echo    - Email: admin@piezasyaya.com
echo    - Password: cualquier password
echo    - Esto guardará las credenciales para PIN/biometría
echo.
echo 2. LOGIN CON PIN:
echo    - Configura un PIN en Configuración > Seguridad
echo    - Usa el botón "PIN" en el login
echo    - Ingresa tu PIN de 4 dígitos
echo.
echo 3. LOGIN CON BIOMETRÍA:
echo    - Configura biometría en Configuración > Seguridad
echo    - Usa el botón "Huella" en el login
echo    - Verifica tu huella dactilar
echo.
echo 4. LOGIN CON 2FA:
echo    - Configura 2FA en Configuración > Seguridad
echo    - Después del login normal, ingresa código 2FA
echo    - Códigos de prueba: 123456, 000000, BACKUP
echo.
echo 5. HISTORIAL DE SEGURIDAD:
echo    - Ve a Configuración > Seguridad > Historial
echo    - Revisa todos los eventos de login
echo.
echo 6. ESTADO DE ENCRIPTACIÓN:
echo    - Ve a Configuración > Seguridad > Estado de Encriptación
echo    - Verifica que los datos estén encriptados
echo.

echo.
npx expo start --clear --localhost

echo.
echo ✅ App iniciada con funcionalidades de seguridad completas.
pause
