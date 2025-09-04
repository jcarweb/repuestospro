#!/bin/bash

echo "🔌 Iniciando PiezasYA en Modo Offline"
echo "====================================="
echo ""
echo "✅ Modo offline activado"
echo "✅ Datos mock disponibles"
echo "✅ Sin dependencia del backend"
echo ""
echo "🚀 Iniciando aplicación..."
echo ""

cd "$(dirname "$0")"
npx expo start --clear
