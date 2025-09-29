#!/bin/bash

echo "🇻🇪 Configurando WhatsApp para Venezuela - PiezasYA"
echo "================================================"
echo

echo "📦 Instalando dependencias de WhatsApp..."
npm install @whiskeysockets/baileys @hapi/boom pino puppeteer twilio
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo
echo "🔨 Compilando proyecto..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error compilando proyecto"
    exit 1
fi

echo
echo "⚙️ Configurando variables de entorno..."
echo "WHATSAPP_METHOD=simple" >> .env
echo "WHATSAPP_WEB_ENABLED=true" >> .env
echo

echo "✅ Configuración completada!"
echo
echo "📋 Próximos pasos:"
echo "   1. Ejecutar: npm start"
echo "   2. Escanear el código QR con WhatsApp"
echo "   3. ¡Listo para usar!"
echo
echo "🧪 Para probar WhatsApp:"
echo "   node test-whatsapp.js"
echo
echo "📚 Documentación completa:"
echo "   Ver archivo WHATSAPP_SETUP.md"
echo
