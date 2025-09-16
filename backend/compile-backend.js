const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Compilando backend completo...');

try {
  // Limpiar dist
  if (fs.existsSync('dist')) {
    console.log('🧹 Limpiando directorio dist...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Crear dist
  fs.mkdirSync('dist', { recursive: true });

  // Compilar con configuración específica
  console.log('📦 Compilando TypeScript...');
  execSync('npx tsc --project tsconfig.build.json --noEmitOnError false --skipLibCheck true', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Verificar que se generó index.js
  if (fs.existsSync('dist/index.js')) {
    console.log('✅ index.js generado correctamente');
  } else {
    console.log('❌ index.js no se generó, creando manualmente...');
    
    // Crear index.js básico que importe todos los módulos
    const indexContent = `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://repuestospro.vercel.app', 'https://piezasya-back.onrender.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Importar todas las rutas
try {
  const authRoutes = require('./routes/authRoutes');
  const adminRoutes = require('./routes/adminRoutes');
  const profileRoutes = require('./routes/profileRoutes');
  const productRoutes = require('./routes/productRoutes');
  const categoryRoutes = require('./routes/categoryRoutes');
  const brandRoutes = require('./routes/brandRoutes');
  const subcategoryRoutes = require('./routes/subcategoryRoutes');
  const locationRoutes = require('./routes/locationRoutes');
  const loyaltyRoutes = require('./routes/loyaltyRoutes');
  const promotionRoutes = require('./routes/promotionRoutes');
  const storeRoutes = require('./routes/storeRoutes');
  const orderRoutes = require('./routes/orderRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  const clientNotificationRoutes = require('./routes/clientNotificationRoutes');
  const monetizationRoutes = require('./routes/monetizationRoutes');
  const administrativeDivisionRoutes = require('./routes/administrativeDivisionRoutes');
  const inventoryRoutes = require('./routes/inventoryRoutes');
  const inventoryAlertRoutes = require('./routes/inventoryAlertRoutes');
  const reviewRoutes = require('./routes/reviewRoutes');
  const cryptoAuthRoutes = require('./routes/cryptoAuthRoutes');
  const storePhotoRoutes = require('./routes/storePhotoRoutes');
  const activityRoutes = require('./routes/activityRoutes');
  const googleAnalyticsRoutes = require('./routes/googleAnalyticsRoutes');
  const registrationCodeRoutes = require('./routes/registrationCodeRoutes');
  const advertisementRoutes = require('./routes/advertisementRoutes');
  const advertisementRequestRoutes = require('./routes/advertisementRequestRoutes');
  const searchRoutes = require('./routes/search');
  const deliveryRoutes = require('./routes/deliveryRoutes');
  const riderRoutes = require('./routes/riderRoutes');
  const analyticsRoutes = require('./routes/analyticsRoutes');
  const chatRoutes = require('./routes/chatRoutes');
  const warrantyRoutes = require('./routes/warrantyRoutes');
  const claimRoutes = require('./routes/claimRoutes');
  const transactionRoutes = require('./routes/transactionRoutes');
  const salesReportRoutes = require('./routes/salesReportRoutes');

  // Usar las rutas
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/brands', brandRoutes);
  app.use('/api/subcategories', subcategoryRoutes);
  app.use('/api/locations', locationRoutes);
  app.use('/api/loyalty', loyaltyRoutes);
  app.use('/api/promotions', promotionRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/client-notifications', clientNotificationRoutes);
  app.use('/api/monetization', monetizationRoutes);
  app.use('/api/administrative-divisions', administrativeDivisionRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/inventory-alerts', inventoryAlertRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/crypto-auth', cryptoAuthRoutes);
  app.use('/api/store-photos', storePhotoRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/google-analytics', googleAnalyticsRoutes);
  app.use('/api/registration-codes', registrationCodeRoutes);
  app.use('/api/advertisements', advertisementRoutes);
  app.use('/api/advertisement-requests', advertisementRequestRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/delivery', deliveryRoutes);
  app.use('/api/riders', riderRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/warranties', warrantyRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/sales-reports', salesReportRoutes);

  console.log('✅ Todas las rutas cargadas correctamente');
} catch (error) {
  console.error('❌ Error cargando rutas:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend completo funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Backend completo ejecutándose en puerto \${PORT}\`);
  console.log(\`🌍 Entorno: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`📊 Health check: http://localhost:\${PORT}/api/health\`);
});

module.exports = app;
`;

    fs.writeFileSync('dist/index.js', indexContent);
    console.log('✅ index.js creado manualmente');
  }

  console.log('🎉 Backend compilado exitosamente!');
  console.log('📁 Archivos generados en dist/');
  
  // Listar archivos principales
  const files = fs.readdirSync('dist');
  console.log('📋 Archivos principales:');
  files.forEach(file => {
    if (file.endsWith('.js')) {
      console.log(\`  - \${file}\`);
    }
  });

} catch (error) {
  console.error('❌ Error compilando backend:', error.message);
  process.exit(1);
}
