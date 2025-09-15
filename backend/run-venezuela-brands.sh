#!/bin/bash

echo "========================================"
echo "   MARCAS VENEZOLANAS - PIEZASYA"
echo "========================================"
echo

echo "🚀 Iniciando proceso de carga de marcas venezolanas..."
echo

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado o no está en el PATH"
    echo "   Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está disponible"
    exit 1
fi

echo "✅ Node.js y npm están disponibles"
echo

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias"
        exit 1
    fi
    echo "✅ Dependencias instaladas"
    echo
fi

# Ejecutar el script de población de marcas
echo "🏷️  Ejecutando script de población de marcas venezolanas..."
echo

npm run seed:venezuela-brands

if [ $? -ne 0 ]; then
    echo
    echo "❌ Error ejecutando el script de marcas"
    echo "   Verifica que MongoDB esté ejecutándose y que la conexión sea correcta"
    echo
    exit 1
fi

echo
echo "✅ Proceso completado exitosamente!"
echo

# Preguntar si quiere ejecutar las pruebas
read -p "¿Deseas ejecutar las pruebas de verificación? (s/n): " run_tests
if [[ $run_tests == "s" || $run_tests == "S" ]]; then
    echo
    echo "🧪 Ejecutando pruebas de verificación..."
    echo "   Asegúrate de que el servidor backend esté ejecutándose"
    echo
    node test-venezuela-brands.js
fi

echo
echo "🎉 ¡Proceso completado!"
echo
