const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware básico
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.110:3000', 'http://192.168.0.110:3001'],
  credentials: true
}));
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ruta simple para obtener productos
app.get('/api/products', async (req, res) => {
  console.log('📦 Solicitud de productos recibida');
  try {
    const mockProducts = [
      {
        _id: '1',
        name: 'Filtro de Aceite Motor',
        description: 'Filtro de aceite para motor de vehículo',
        price: 25.50,
        category: 'Filtros',
        brand: 'Bosch',
        sku: 'FIL-001',
        stock: 50,
        isActive: true,
        isFeatured: false,
        images: ['https://via.placeholder.com/150'],
        tags: ['filtro', 'aceite', 'motor'],
        store: {
          _id: 'store1',
          name: 'Repuestos Central',
          city: 'Caracas'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Pastillas de Freno Delanteras',
        description: 'Pastillas de freno para sistema delantero',
        price: 45.00,
        category: 'Frenos',
        brand: 'Brembo',
        sku: 'PAS-002',
        stock: 30,
        isActive: true,
        isFeatured: true,
        images: ['https://via.placeholder.com/150'],
        tags: ['frenos', 'pastillas', 'delantero'],
        store: {
          _id: 'store1',
          name: 'Repuestos Central',
          city: 'Caracas'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: mockProducts,
      total: mockProducts.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener productos'
    });
  }
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor backend iniciado exitosamente');
  console.log(`🔗 URL Local: http://localhost:${PORT}`);
  console.log(`🌐 URL Red: http://192.168.0.110:${PORT}`);
  console.log(`📊 Puerto: ${PORT}`);
  console.log('✅ Backend funcionando correctamente');
  console.log('📋 Endpoints disponibles:');
  console.log('   - GET  /api/health');
  console.log('   - GET  /api/products');
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});
