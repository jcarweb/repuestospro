#!/bin/bash

echo "🚀 Iniciando migración de Expo a React Native puro..."
echo

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi

# Verificar que npm esté disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible. Por favor verifica tu instalación de Node.js"
    exit 1
fi

echo "✅ Node.js y npm están disponibles"
echo

# Verificar que el directorio mobile existe
if [ ! -d "mobile" ]; then
    echo "❌ Directorio 'mobile' no encontrado. Asegúrate de estar en la raíz del proyecto."
    exit 1
fi

echo "✅ Directorio mobile encontrado"
echo

# Crear directorio de scripts si no existe
mkdir -p scripts

# Hacer el script de migración ejecutable
chmod +x scripts/migrate-to-react-native.js

# Ejecutar script de migración
echo "📦 Ejecutando script de migración..."
node scripts/migrate-to-react-native.js

if [ $? -ne 0 ]; then
    echo "❌ Error durante la migración"
    exit 1
fi

echo
echo "🎉 ¡Migración completada exitosamente!"
echo
echo "📋 Próximos pasos:"
echo "1. cd mobile-rn"
echo "2. npm install"
echo "3. npx react-native run-android (para Android)"
echo "4. npx react-native run-ios (para iOS)"
echo
echo "📖 Para más información, consulta:"
echo "- MOBILE_STRATEGY.md"
echo "- scripts/setup-android-studio.md"
echo "- scripts/setup-ios-xcode.md"
echo
