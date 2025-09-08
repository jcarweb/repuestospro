const { spawn } = require('child_process');
const path = require('path');

// Configuración de red específica
const NETWORK_CONFIG = {
  host: '192.168.0.110',
  port: 5000
};

console.log('🚀 Iniciando backend con IP específica...');
console.log(`📍 Host: ${NETWORK_CONFIG.host}`);
console.log(`🔌 Puerto: ${NETWORK_CONFIG.port}`);

// Establecer variables de entorno
process.env.HOST = NETWORK_CONFIG.host;
process.env.PORT = NETWORK_CONFIG.port;
process.env.NODE_ENV = 'development';

// Iniciar el servidor
const serverProcess = spawn('node', ['server-mongodb.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: NETWORK_CONFIG.host,
    PORT: NETWORK_CONFIG.port,
    NODE_ENV: 'development'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Error iniciando el servidor:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🔄 Servidor cerrado con código: ${code}`);
  process.exit(code);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  serverProcess.kill('SIGTERM');
});
