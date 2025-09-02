#!/usr/bin/env node

/**
 * Script de inicio del servidor con IP específica
 * Para cuando la detección automática no funciona
 */

const express = require('express');
const { startServerWithNetwork } = require('./config/network');

// IP específica para tu red actual
const SPECIFIC_IP = '192.168.150.104';
const PORT = process.env.PORT || 3001; // Cambiado a 3001 para evitar conflictos

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
  res.json({
    message: '🚀 Servidor PiezasYA funcionando correctamente',
    timestamp: new Date().toISOString(),
    server: {
      name: 'PiezasYA Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    network: {
      localIP: SPECIFIC_IP,
      port: PORT,
      accessURLs: [
        `http://localhost:${PORT}`,
        `http://${SPECIFIC_IP}:${PORT}`,
      ],
      instructions: {
        mobile: `Para la app móvil, usa: http://${SPECIFIC_IP}:${PORT}/api`,
        web: `Para desarrollo web, usa: http://localhost:${PORT}`,
        network: `Para acceso desde la red: http://${SPECIFIC_IP}:${PORT}`,
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

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    network: {
      localIP: SPECIFIC_IP,
      port: PORT,
      serverTime: new Date().toISOString(),
    }
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
    console.log('🚀 Iniciando servidor PiezasYA con IP específica...');
    console.log(`📍 IP Configurada: ${SPECIFIC_IP}`);
    console.log(`🔌 Puerto: ${PORT}`);
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor iniciado en puerto ${PORT}`);
      console.log('\n🌐 INFORMACIÓN DE RED');
      console.log('=====================');
      console.log(`📍 IP Local: ${SPECIFIC_IP}`);
      console.log(`🔌 Puerto: ${PORT}`);
      console.log(`🌍 URLs de acceso:`);
      console.log(`   • Local: http://localhost:${PORT}`);
      console.log(`   • Red: http://${SPECIFIC_IP}:${PORT}`);
      console.log(`   • API: http://${SPECIFIC_IP}:${PORT}/api`);
      console.log('\n📱 Para la app móvil:');
      console.log(`   • Usa: http://${SPECIFIC_IP}:${PORT}/api`);
      console.log(`   • O escanea automáticamente desde la app`);
      console.log('=====================\n');
    });
    
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

// Ejecutar función principal
main();
