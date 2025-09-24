const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ignorar IPv6 y interfaces no físicos
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return '127.0.0.1'; // Fallback a localhost
}

const localIP = getLocalIP();
console.log('\n🌐 INFORMACIÓN DE RED LOCAL');
console.log('=============================');
console.log(`📍 IP Local: ${localIP}`);
console.log(`🔌 Puerto Backend: 5000`);
console.log(`🔌 Puerto Metro: 8081`);
console.log('\n📱 Para conectar la app móvil:');
console.log(`   • Backend API: http://${localIP}:5000/api`);
console.log(`   • Metro Bundler: exp://${localIP}:8081`);
console.log('\n🔧 Para agregar a redes conocidas:');
console.log(`   '${localIP}': 'http://${localIP}:5000/api',`);
console.log('=============================\n');

module.exports = { getLocalIP };
