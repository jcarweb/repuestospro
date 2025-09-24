const fs = require('fs');
const path = require('path');

console.log('🔄 Cambio de Backend - PiezasYA Mobile\n');

// Configuraciones disponibles
const backends = {
  '1': {
    id: 'local',
    name: 'Local Development',
    baseUrl: 'http://192.168.0.106:5000/api',
    description: 'Backend local en tu computadora'
  },
  '2': {
    id: 'render',
    name: 'Render Production',
    baseUrl: 'https://piezasya-back.onrender.com/api',
    description: 'Backend en producción (Render)'
  },
  '3': {
    id: 'localhost',
    name: 'Localhost',
    baseUrl: 'http://localhost:5000/api',
    description: 'Backend local (localhost)'
  }
};

console.log('📋 Backends disponibles:');
Object.entries(backends).forEach(([key, backend]) => {
  console.log(`   ${key}. ${backend.name}`);
  console.log(`      ${backend.description}`);
  console.log(`      URL: ${backend.baseUrl}\n`);
});

// Simular entrada del usuario (en un entorno real usarías readline)
const selectedBackend = process.argv[2] || '1';

if (!backends[selectedBackend]) {
  console.log('❌ Opción inválida. Usando Local Development por defecto.');
  process.exit(1);
}

const backend = backends[selectedBackend];

console.log(`✅ Backend seleccionado: ${backend.name}`);
console.log(`🔗 URL: ${backend.baseUrl}`);
console.log(`📝 Descripción: ${backend.description}\n`);

// Crear archivo de configuración
const configPath = path.join(__dirname, 'backend-config.json');
const config = {
  selectedBackend: backend.id,
  backend: backend,
  timestamp: new Date().toISOString()
};

try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('💾 Configuración guardada en:', configPath);
  console.log('\n📱 Para aplicar los cambios:');
  console.log('1. Reinicia la aplicación móvil');
  console.log('2. La app usará el backend seleccionado automáticamente');
  console.log('\n🔍 Verificación:');
  console.log('- Revisa los logs de la app para confirmar la URL del backend');
  console.log('- Las peticiones deberían ir a:', backend.baseUrl);
} catch (error) {
  console.error('❌ Error guardando configuración:', error.message);
  process.exit(1);
}
