const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Conectar a MongoDB real
const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestos-pro';
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.log('⚠️ Continuando con datos mock...');
  }
};

// Inicializar conexión a MongoDB
connectToMongoDB();

// Esquema simple de Usuario para MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['admin', 'client', 'delivery', 'store_manager'], default: 'client' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  pin: { type: String },
  fingerprintEnabled: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  marketingEmails: { type: Boolean, default: false },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, enum: ['es', 'en', 'pt'], default: 'es' },
  profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'private' },
  showEmail: { type: Boolean, default: false },
  showPhone: { type: Boolean, default: false },
  pushEnabled: { type: Boolean, default: false },
  pushToken: { type: String },
  points: { type: Number, default: 0 },
  loyaltyLevel: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  locationEnabled: { type: Boolean, default: false },
  lastLocationUpdate: { type: Date }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
  phone: String,
  avatar: String,
  role: { type: String, enum: ['admin', 'client', 'delivery', 'store_manager'], default: 'client' },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  pin: String,
  fingerprintEnabled: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  marketingEmails: { type: Boolean, default: false },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, enum: ['es', 'en', 'pt'], default: 'es' },
  profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'private' },
  showEmail: { type: Boolean, default: false },
  showPhone: { type: Boolean, default: false },
  pushEnabled: { type: Boolean, default: false },
  pushToken: String,
  points: { type: Number, default: 0 },
  loyaltyLevel: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  locationEnabled: { type: Boolean, default: false },
  lastLocationUpdate: Date,
  password: String, // En producción debería estar hasheado
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware básico
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.110:3000', 'http://192.168.0.110:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ruta de perfil mock para testing
app.get('/api/profile', (req, res) => {
  console.log('📋 Solicitud de perfil recibida');
  res.json({
    data: {
      _id: '1',
      name: 'Usuario Admin',
      email: 'admin@example.com',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      avatar: null,
      phone: '+584121234567',
      pin: null,
      fingerprintEnabled: false,
      twoFactorEnabled: false,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      theme: 'light',
      language: 'es',
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      pushEnabled: false,
      pushToken: null,
      points: 0,
      loyaltyLevel: 'bronze',
      location: null,
      locationEnabled: false,
      lastLocationUpdate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Ruta de autenticación mock
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Solicitud de login recibida');
  res.json({
    token: 'mock-token-123',
    user: {
      _id: '1',
      name: 'Usuario Admin',
      email: 'admin@example.com',
      role: 'admin'
    }
  });
});

// Ruta para verificar token
app.get('/api/auth/verify', (req, res) => {
  console.log('🔍 Verificación de token recibida');
  res.json({
    valid: true,
    user: {
      _id: '1',
      name: 'Usuario Admin',
      email: 'admin@example.com',
      role: 'admin'
    }
  });
});

// Ruta para store photos (sistema de enriquecimiento)
app.get('/api/store-photos', (req, res) => {
  console.log('📸 Solicitud de fotos de locales recibida');
  res.json({
    data: [
      {
        _id: '1',
        name: 'Repuestos El Motor',
        phone: '+584121234567',
        imageUrl: 'https://via.placeholder.com/300x200',
        lat: 10.4806,
        lng: -66.9036,
        ocrText: 'REPUESTOS EL MOTOR - Especialistas en repuestos para motores',
        metrics: {
          mercadoLibre: {
            found: true,
            results: [
              { title: 'Repuestos Motor', price: 25.99, currency_id: 'USD' }
            ],
            searchTerm: 'repuestos motor',
            lastUpdated: '2024-01-20T15:30:00Z'
          },
          duckduckgo: {
            found: true,
            results: { title: 'Repuestos El Motor - Caracas' },
            searchTerm: 'repuestos el motor caracas',
            lastUpdated: '2024-01-20T15:30:00Z'
          }
        },
        status: 'enriched',
        uploadedBy: {
          _id: '1',
          name: 'Juan Pérez',
          email: 'juan@example.com'
        },
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      }
    ],
    total: 1
  });
});

// Ruta para subir store photos
app.post('/api/store-photos', (req, res) => {
  console.log('📤 Solicitud de subida de foto recibida');
  res.json({
    success: true,
    data: {
      _id: '2',
      name: req.body.name || 'Nuevo Local',
      phone: req.body.phone,
      imageUrl: 'https://via.placeholder.com/300x200',
      lat: parseFloat(req.body.lat) || 0,
      lng: parseFloat(req.body.lng) || 0,
      status: 'pending',
      uploadedBy: {
        _id: '1',
        name: 'Usuario Admin',
        email: 'admin@example.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Ruta para ejecutar enriquecimiento
app.post('/api/admin/enrichment/run', (req, res) => {
  console.log('🔄 Solicitud de enriquecimiento recibida');
  res.json({
    success: true,
    message: 'Proceso de enriquecimiento iniciado',
    processed: 1
  });
});

// Ruta para actualizar preferencias del perfil
app.put('/api/profile', (req, res) => {
  console.log('📝 Solicitud de actualización de perfil recibida');
  console.log('Datos recibidos:', req.body);
  res.json({
    success: true,
    data: {
      _id: '1',
      name: req.body.name || 'Usuario Admin',
      email: req.body.email || 'admin@example.com',
      phone: req.body.phone || '+584121234567',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      avatar: null,
      pin: null,
      fingerprintEnabled: false,
      twoFactorEnabled: false,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      theme: req.body.theme || 'light',
      language: req.body.language || 'es',
      profileVisibility: 'private',
      showEmail: false,
      showPhone: false,
      pushEnabled: false,
      pushToken: null,
      points: 0,
      loyaltyLevel: 'bronze',
      location: null,
      locationEnabled: false,
      lastLocationUpdate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Ruta para actualizar preferencias específicas
app.put('/api/profile/preferences', (req, res) => {
  console.log('⚙️ Solicitud de actualización de preferencias recibida');
  console.log('Preferencias recibidas:', req.body);
  res.json({
    success: true,
    data: {
      theme: req.body.theme || 'light',
      language: req.body.language || 'es',
      emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : true,
      pushNotifications: req.body.pushNotifications !== undefined ? req.body.pushNotifications : true,
      marketingEmails: req.body.marketingEmails !== undefined ? req.body.marketingEmails : false
    }
  });
});

// Ruta para actualizar tema
app.put('/api/profile/theme', (req, res) => {
  console.log('🎨 Solicitud de actualización de tema recibida');
  console.log('Tema recibido:', req.body);
  res.json({
    success: true,
    data: {
      theme: req.body.theme || 'light'
    }
  });
});

// Ruta para actualizar idioma
app.put('/api/profile/language', (req, res) => {
  console.log('🌐 Solicitud de actualización de idioma recibida');
  console.log('Idioma recibido:', req.body);
  res.json({
    success: true,
    data: {
      language: req.body.language || 'es'
    }
  });
});

// Ruta para actualizar configuración de privacidad
app.put('/api/profile/privacy', (req, res) => {
  console.log('🔒 Solicitud de actualización de privacidad recibida');
  console.log('Configuración recibida:', req.body);
  res.json({
    success: true,
    data: {
      profileVisibility: req.body.profileVisibility || 'private',
      showEmail: req.body.showEmail !== undefined ? req.body.showEmail : false,
      showPhone: req.body.showPhone !== undefined ? req.body.showPhone : false
    }
  });
});

// Ruta para actualizar notificaciones
app.put('/api/profile/notifications', (req, res) => {
  console.log('🔔 Solicitud de actualización de notificaciones recibida');
  console.log('Notificaciones recibidas:', req.body);
  res.json({
    success: true,
    data: {
      emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : true,
      pushNotifications: req.body.pushNotifications !== undefined ? req.body.pushNotifications : true,
      marketingEmails: req.body.marketingEmails !== undefined ? req.body.marketingEmails : false
    }
  });
});

// Ruta para subir avatar
app.post('/api/profile/avatar', (req, res) => {
  console.log('📸 Solicitud de subida de avatar recibida');
  res.json({
    success: true,
    data: {
      avatar: 'https://via.placeholder.com/150x150/007AFF/FFFFFF?text=Admin'
    }
  });
});

// Ruta para eliminar avatar
app.delete('/api/profile/avatar', (req, res) => {
  console.log('🗑️ Solicitud de eliminación de avatar recibida');
  res.json({
    success: true,
    data: {
      avatar: null
    }
  });
});

// Ruta para cambiar contraseña
app.put('/api/profile/password', (req, res) => {
  console.log('🔑 Solicitud de cambio de contraseña recibida');
  res.json({
    success: true,
    message: 'Contraseña actualizada exitosamente'
  });
});

// Ruta para configurar PIN
app.put('/api/profile/pin', (req, res) => {
  console.log('🔢 Solicitud de configuración de PIN recibida');
  res.json({
    success: true,
    message: 'PIN configurado exitosamente'
  });
});

// Ruta para configurar huella dactilar
app.put('/api/profile/fingerprint', (req, res) => {
  console.log('👆 Solicitud de configuración de huella dactilar recibida');
  res.json({
    success: true,
    message: 'Huella dactilar configurada exitosamente'
  });
});

// Ruta para configurar autenticación de dos factores
app.put('/api/profile/two-factor', (req, res) => {
  console.log('🔐 Solicitud de configuración de 2FA recibida');
  res.json({
    success: true,
    message: 'Autenticación de dos factores configurada exitosamente'
  });
});

// Ruta para obtener historial de actividades
app.get('/api/profile/activities', (req, res) => {
  console.log('📊 Solicitud de historial de actividades recibida');
  res.json({
    data: [
      {
        _id: '1',
        action: 'profile_updated',
        description: 'Perfil actualizado',
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0...'
      },
      {
        _id: '2',
        action: 'login',
        description: 'Inicio de sesión exitoso',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0...'
      }
    ],
    total: 2
  });
});

// Servir archivos estáticos si existen
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
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
  console.log('   - GET  /api/profile');
  console.log('   - PUT  /api/profile');
  console.log('   - PUT  /api/profile/preferences');
  console.log('   - PUT  /api/profile/theme');
  console.log('   - PUT  /api/profile/language');
  console.log('   - PUT  /api/profile/privacy');
  console.log('   - PUT  /api/profile/notifications');
  console.log('   - POST /api/profile/avatar');
  console.log('   - DELETE /api/profile/avatar');
  console.log('   - PUT  /api/profile/password');
  console.log('   - PUT  /api/profile/pin');
  console.log('   - PUT  /api/profile/fingerprint');
  console.log('   - PUT  /api/profile/two-factor');
  console.log('   - GET  /api/profile/activities');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/auth/verify');
  console.log('   - GET  /api/store-photos');
  console.log('   - POST /api/store-photos');
  console.log('   - POST /api/admin/enrichment/run');
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

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});
