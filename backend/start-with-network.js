#!/usr/bin/env node

/**
 * Script de inicio del servidor con configuración de red automática
 * Este script detecta automáticamente la IP de la red y configura el servidor
 */

const express = require('express');
const { startServerWithNetwork, getLocalIP, printNetworkInfo } = require('./config/network');

// Crear la aplicación Express
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración básica de la aplicación
app.set('trust proxy', true);

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
});

// Ruta raíz
app.get('/', (req, res) => {
  const localIP = getLocalIP();
  const port = process.env.PORT || 5000;
  
  res.json({
    message: '🚀 Servidor PiezasYA funcionando correctamente',
    timestamp: new Date().toISOString(),
    server: {
      name: 'PiezasYA Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    network: {
      localIP,
      port,
      accessURLs: [
        `http://localhost:${port}`,
        `http://${localIP}:${port}`,
      ],
      instructions: {
        mobile: `Para la app móvil, usa: http://${localIP}:${port}/api`,
        web: `Para desarrollo web, usa: http://localhost:${port}`,
        network: `Para acceso desde la red: http://${localIP}:${port}`,
      }
    },
    endpoints: {
      health: '/api/health',
      networkInfo: '/api/network-info',
      api: '/api/*',
    }
  });
});

// Ruta de estado del servidor
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      '/',
      '/status',
      '/api/health',
      '/api/network-info',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// Función principal de inicio
async function main() {
  try {
    console.log('🚀 Iniciando servidor PiezasYA con configuración de red automática...');
    
    // Obtener puerto desde variables de entorno o usar 5000 por defecto
    const port = process.env.PORT || 5000;
    
    // Iniciar servidor con configuración de red
    const server = await startServerWithNetwork(app, port);
    
    // Información adicional
    console.log('\n📋 INFORMACIÓN ADICIONAL');
    console.log('==========================');
    console.log('🔧 Variables de entorno:');
    console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   • PORT: ${port}`);
    console.log(`   • CORS_ORIGINS: ${process.env.CORS_ORIGINS || 'No configurado'}`);
    
    console.log('\n📱 Para desarrollo móvil:');
    console.log('   • La app móvil detectará automáticamente la IP');
    console.log('   • No necesitas cambiar configuraciones manualmente');
    console.log('   • El servidor escucha en todas las interfaces (0.0.0.0)');
    
    console.log('\n🌐 Para desarrollo web:');
    console.log('   • Usa localhost para desarrollo local');
    console.log('   • Usa la IP de red para acceso desde otros dispositivos');
    
    console.log('\n✅ Servidor listo para recibir conexiones!');
    console.log('==========================\n');
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Ejecutar función principal
if (require.main === module) {
  main();
}

module.exports = { app, main };
