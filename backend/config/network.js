const os = require('os');
const dns = require('dns');
const { promisify } = require('util');

// Configuración de red para el backend
const NETWORK_CONFIG = {
  // Puerto por defecto
  DEFAULT_PORT: process.env.PORT || 5000,
  
  // Rangos de IPs locales para escanear
  LOCAL_RANGES: [
    '192.168.1',
    '192.168.0', 
    '192.168.31',
    '10.0.0',
    '10.0.1',
    '172.16.0',
    '172.20.10',
    '172.24.0',
  ],
  
  // Timeouts
  SCAN_TIMEOUT: 5000,
  CONNECTION_TIMEOUT: 3000,
};

// Función para obtener la IP local del servidor
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

// Función para obtener la IP pública (si es posible)
async function getPublicIP() {
  try {
    // Intentar obtener IP pública usando servicios externos
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.log('No se pudo obtener IP pública:', error.message);
    return null;
  }
}

// Función para escanear la red local
async function scanLocalNetwork() {
  const localIP = getLocalIP();
  const baseIP = localIP.split('.').slice(0, 3).join('.');
  
  console.log(`IP local detectada: ${localIP}`);
  console.log(`Escaneando red: ${baseIP}.*`);
  
  const availableIPs = [];
  
  // Escanear solo el rango de la IP local
  for (let i = 1; i <= 254; i++) {
    const testIP = `${baseIP}.${i}`;
    
    try {
      // Test simple de conectividad
      const isReachable = await testIPReachability(testIP);
      if (isReachable) {
        availableIPs.push(testIP);
      }
    } catch (error) {
      // Ignorar errores de IPs no alcanzables
    }
  }
  
  return availableIPs;
}

// Función para testear si una IP es alcanzable
async function testIPReachability(ip) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, NETWORK_CONFIG.CONNECTION_TIMEOUT);
    
    // Usar DNS lookup como test simple
    dns.lookup(ip, (err) => {
      clearTimeout(timeout);
      resolve(!err);
    });
  });
}

// Función para generar URLs de acceso
function generateAccessURLs(port = NETWORK_CONFIG.DEFAULT_PORT) {
  const localIP = getLocalIP();
  const urls = [];
  
  // Agregar IP local
  urls.push(`http://${localIP}:${port}`);
  
  // Agregar localhost
  urls.push(`http://localhost:${port}`);
  
  // Agregar 0.0.0.0 (para acceso desde cualquier interfaz)
  urls.push(`http://0.0.0.0:${port}`);
  
  return urls;
}

// Función para obtener información completa de la red
async function getNetworkInfo() {
  const localIP = getLocalIP();
  const publicIP = await getPublicIP();
  const accessURLs = generateAccessURLs();
  
  return {
    localIP,
    publicIP,
    accessURLs,
    port: NETWORK_CONFIG.DEFAULT_PORT,
    timestamp: new Date().toISOString(),
  };
}

// Función para configurar CORS dinámicamente
function getCORSOrigins() {
  const origins = [
    'http://localhost:3000', // React dev server
    'http://localhost:8081', // Metro bundler
    'http://localhost:19006', // Expo dev server
    'exp://localhost:19000', // Expo Go
  ];
  
  // Agregar IPs locales
  const localIP = getLocalIP();
  if (localIP !== '127.0.0.1') {
    origins.push(`http://${localIP}:3000`);
    origins.push(`http://${localIP}:8081`);
    origins.push(`http://${localIP}:19006`);
    origins.push(`exp://${localIP}:19000`);
  }
  
  // Agregar desde variables de entorno
  if (process.env.CORS_ORIGINS) {
    origins.push(...process.env.CORS_ORIGINS.split(','));
  }
  
  return origins;
}

// Función para imprimir información de red en consola
function printNetworkInfo() {
  console.log('\n🌐 INFORMACIÓN DE RED DEL SERVIDOR');
  console.log('=====================================');
  
  const localIP = getLocalIP();
  const port = NETWORK_CONFIG.DEFAULT_PORT;
  
  console.log(`📍 IP Local: ${localIP}`);
  console.log(`🔌 Puerto: ${port}`);
  console.log(`🌍 URLs de acceso:`);
  console.log(`   • Local: http://localhost:${port}`);
  console.log(`   • Red: http://${localIP}:${port}`);
  console.log(`   • Cualquier interfaz: http://0.0.0.0:${port}`);
  
  // Mostrar instrucciones para dispositivos móviles
  console.log('\n📱 Para dispositivos móviles:');
  console.log(`   • Asegúrate de estar en la misma red WiFi`);
  console.log(`   • Usa la IP: http://${localIP}:${port}`);
  console.log(`   • O escanea automáticamente desde la app móvil`);
  
  console.log('\n🔧 Configuración CORS:');
  getCORSOrigins().forEach(origin => {
    console.log(`   • ${origin}`);
  });
  
  console.log('=====================================\n');
}

// Función para configurar el servidor con opciones de red
function configureServer(app, port = NETWORK_CONFIG.DEFAULT_PORT) {
  // Configurar CORS dinámicamente
  const corsOrigins = getCORSOrigins();
  
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    if (origin && corsOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  // Endpoint de salud para testing de red
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString(),
      network: {
        localIP: getLocalIP(),
        port: port,
        serverTime: new Date().toISOString(),
      }
    });
  });
  
  // Endpoint para obtener información de red
  app.get('/api/network-info', async (req, res) => {
    try {
      const networkInfo = await getNetworkInfo();
      res.json({
        success: true,
        data: networkInfo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error obteniendo información de red'
      });
    }
  });
  
  return app;
}

// Función para iniciar el servidor con configuración de red
async function startServerWithNetwork(app, port = NETWORK_CONFIG.DEFAULT_PORT) {
  try {
    // Configurar el servidor
    const configuredApp = configureServer(app, port);
    
    // Iniciar el servidor
    const server = configuredApp.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Servidor iniciado en puerto ${port}`);
      printNetworkInfo();
    });
    
    // Manejar cierre graceful
    process.on('SIGTERM', () => {
      console.log('🛑 Cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });
    
    return server;
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    throw error;
  }
}

module.exports = {
  getLocalIP,
  getPublicIP,
  scanLocalNetwork,
  generateAccessURLs,
  getNetworkInfo,
  getCORSOrigins,
  printNetworkInfo,
  configureServer,
  startServerWithNetwork,
  NETWORK_CONFIG,
};
