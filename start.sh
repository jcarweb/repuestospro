#!/bin/bash

echo "========================================"
echo "   RepuestosPro - Ecommerce"
echo "========================================"
echo

echo "🔧 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

node --version

echo
echo "📦 Instalando dependencias..."
npm run install:all
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo
echo "🚀 Iniciando servidores..."
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo
echo "Presiona Ctrl+C para detener los servidores"
echo

npm run dev 