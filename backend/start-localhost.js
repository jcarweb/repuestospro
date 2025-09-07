const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor PiezasYA en localhost...');
console.log('📍 IP: localhost');
console.log('🔌 Puerto: 3001');
console.log('');

// Iniciar el servidor con ts-node
const server = spawn('npx', ['ts-node', '--transpile-only', './src/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Error iniciando servidor:', error);
});

server.on('close', (code) => {
  console.log(`\n🎯 Servidor detenido con código: ${code}`);
});

// Manejar cierre del proceso
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.kill('SIGINT');
  process.exit(0);
});

console.log('✅ Servidor iniciado en localhost:3001');
console.log('🌍 URLs de acceso:');
console.log('   • Local: http://localhost:3001');
console.log('   • API: http://localhost:3001/api');
console.log('');
console.log('📱 Para la app móvil:');
console.log('   • Usa: http://localhost:3001/api');
console.log('');
console.log('🌐 Para el frontend web:');
console.log('   • Usa: http://localhost:3001/api');
console.log('');
console.log('=====================');
