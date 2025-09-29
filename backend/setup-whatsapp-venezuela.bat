@echo off
echo 🇻🇪 Configurando WhatsApp para Venezuela - PiezasYA
echo ================================================
echo.

echo 📦 Instalando dependencias de WhatsApp...
call npm install @whiskeysockets/baileys @hapi/boom pino puppeteer twilio
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo 🔨 Compilando proyecto...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error compilando proyecto
    pause
    exit /b 1
)

echo.
echo ⚙️ Configurando variables de entorno...
echo WHATSAPP_METHOD=simple >> .env
echo WHATSAPP_WEB_ENABLED=true >> .env
echo.

echo ✅ Configuración completada!
echo.
echo 📋 Próximos pasos:
echo    1. Ejecutar: npm start
echo    2. Escanear el código QR con WhatsApp
echo    3. ¡Listo para usar!
echo.
echo 🧪 Para probar WhatsApp:
echo    node test-whatsapp.js
echo.
echo 📚 Documentación completa:
echo    Ver archivo WHATSAPP_SETUP.md
echo.
pause
