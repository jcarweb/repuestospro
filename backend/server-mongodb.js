const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Importar rutas (comentadas temporalmente por incompatibilidad TypeScript/JavaScript)
// const productRoutes = require('./src/routes/productRoutes');
// const storeRoutes = require('./src/routes/storeRoutes');

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

// Esquema simple de Store para MongoDB
const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String, default: 'Venezuela' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  logo: { type: String },
  banner: { type: String },
  isActive: { type: Boolean, default: true },
  isMainStore: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  businessHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  settings: {
    currency: { type: String, default: 'VES' },
    taxRate: { type: Number, default: 0 },
    deliveryRadius: { type: Number, default: 10 },
    minimumOrder: { type: Number, default: 0 },
    autoAcceptOrders: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

const Store = mongoose.model('Store', storeSchema);

// Middleware básico
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.110:3000', 'http://192.168.0.110:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usar las rutas (comentadas temporalmente para usar rutas mock)
// app.use('/api/products', productRoutes);
// app.use('/api', storeRoutes);

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
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Ruta de health sin /api para compatibilidad
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    server: 'server-mongodb.js',
    features: ['pagination', 'filters', 'users-management']
  });
});

// Ruta de perfil que usa MongoDB real
app.get('/api/profile', async (req, res) => {
  console.log('📋 Solicitud de perfil recibida');
  try {
    // Buscar usuario admin por defecto o crear uno si no existe
    let user = await User.findOne({ role: 'admin' });
    
    if (!user) {
      // Crear usuario admin por defecto
      user = new User({
        name: 'Usuario Admin',
        email: 'admin@example.com',
        phone: '+584121234567',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        theme: 'light',
        language: 'es'
      });
      await user.save();
      console.log('✅ Usuario admin creado por defecto');
    }
    
    res.json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        pin: user.pin,
        fingerprintEnabled: user.fingerprintEnabled,
        twoFactorEnabled: user.twoFactorEnabled,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        marketingEmails: user.marketingEmails,
        theme: user.theme,
        language: user.language,
        profileVisibility: user.profileVisibility,
        showEmail: user.showEmail,
        showPhone: user.showPhone,
        pushEnabled: user.pushEnabled,
        pushToken: user.pushToken,
        points: user.points,
        loyaltyLevel: user.loyaltyLevel,
        location: user.location,
        locationEnabled: user.locationEnabled,
        lastLocationUpdate: user.lastLocationUpdate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener todos los usuarios (solo para administradores) con paginación
app.get('/api/users', async (req, res) => {
  console.log('👥 [MONGODB SERVER] Solicitud de lista de usuarios recibida');
  try {
    // Obtener parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log('📊 Parámetros de paginación:', { page, limit, skip });
    console.log('📊 Query params:', req.query);
    
    // Filtros opcionales
    const hasId = req.query.hasId === 'true';
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';
    
    // Construir filtros
    let filters = {};
    
    // Filtrar solo usuarios con ID válido si se solicita
    if (hasId) {
      filters._id = { $exists: true, $ne: null };
    }
    
    // Filtro de búsqueda por nombre o email
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filtro por rol
    if (role) {
      filters.role = role;
    }
    
    // Filtro por estado
    if (status === 'active') {
      filters.isActive = true;
    } else if (status === 'inactive') {
      filters.isActive = false;
    }
    
    // Obtener total de usuarios que coinciden con los filtros
    const totalUsers = await User.countDocuments(filters);
    
    // Obtener usuarios con paginación
    const users = await User.find(filters, {
      password: 0, // Excluir password por seguridad
      pin: 0, // Excluir PIN por seguridad
      pushToken: 0 // Excluir push token por privacidad
    })
    .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente
    .skip(skip)
    .limit(limit);
    
    // Transformar los datos para la respuesta
    const usersData = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      fingerprintEnabled: user.fingerprintEnabled,
      twoFactorEnabled: user.twoFactorEnabled,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      marketingEmails: user.marketingEmails,
      theme: user.theme,
      language: user.language,
      profileVisibility: user.profileVisibility,
      showEmail: user.showEmail,
      showPhone: user.showPhone,
      pushEnabled: user.pushEnabled,
      points: user.points,
      loyaltyLevel: user.loyaltyLevel,
      location: user.location,
      locationEnabled: user.locationEnabled,
      lastLocationUpdate: user.lastLocationUpdate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    // Calcular información de paginación
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    console.log(`✅ Se encontraron ${usersData.length} usuarios (página ${page}/${totalPages})`);
    res.json({
      success: true,
      data: usersData,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor al obtener usuarios' 
    });
  }
});

// Ruta para actualizar estado de usuario (activar/desactivar)
app.put('/api/users/:id/status', async (req, res) => {
  console.log('🔄 Solicitud de cambio de estado de usuario recibida');
  const { id } = req.params;
  const { isActive } = req.body;
  
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true, select: '-password -pin -pushToken' }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    console.log(`✅ Estado del usuario ${user.name} actualizado a ${isActive ? 'activo' : 'inactivo'}`);
    res.json({
      success: true,
      data: user,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    console.error('❌ Error actualizando estado del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar estado del usuario'
    });
  }
});

// Ruta para eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
  console.log('🗑️ Solicitud de eliminación de usuario recibida');
  const { id } = req.params;
  
  try {
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    console.log(`✅ Usuario ${user.name} eliminado exitosamente`);
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar usuario'
    });
  }
});

// Ruta para crear usuarios de prueba (solo para desarrollo)
app.post('/api/users/seed', async (req, res) => {
  console.log('🌱 Creando usuarios de prueba...');
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await User.countDocuments();
    if (existingUsers > 1) { // Más de 1 porque ya existe el admin por defecto
      return res.json({
        success: true,
        message: 'Ya existen usuarios en la base de datos',
        count: existingUsers
      });
    }

    // Crear usuarios de prueba
    const testUsers = [
      {
        name: 'María García',
        email: 'maria@example.com',
        phone: '+584121234567',
        role: 'client',
        isEmailVerified: true,
        isActive: true,
        points: 150,
        loyaltyLevel: 'silver',
        theme: 'light',
        language: 'es'
      },
      {
        name: 'Carlos López',
        email: 'carlos@example.com',
        phone: '+584121234568',
        role: 'delivery',
        isEmailVerified: true,
        isActive: true,
        points: 75,
        loyaltyLevel: 'bronze',
        theme: 'dark',
        language: 'es'
      },
      {
        name: 'Ana Rodríguez',
        email: 'ana@example.com',
        phone: '+584121234569',
        role: 'store_manager',
        isEmailVerified: true,
        isActive: false,
        points: 300,
        loyaltyLevel: 'gold',
        theme: 'light',
        language: 'en'
      },
      {
        name: 'Pedro Martínez',
        email: 'pedro@example.com',
        phone: '+584121234570',
        role: 'client',
        isEmailVerified: false,
        isActive: true,
        points: 25,
        loyaltyLevel: 'bronze',
        theme: 'dark',
        language: 'pt'
      }
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ Se crearon ${createdUsers.length} usuarios de prueba`);
    
    res.json({
      success: true,
      message: `Se crearon ${createdUsers.length} usuarios de prueba`,
      data: createdUsers.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear usuarios de prueba'
    });
  }
});

// Ruta para actualizar perfil en MongoDB
app.put('/api/profile', async (req, res) => {
  console.log('📝 Solicitud de actualización de perfil recibida');
  console.log('Datos recibidos:', req.body);
  
  try {
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Actualizar campos permitidos
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.theme) user.theme = req.body.theme;
    if (req.body.language) user.language = req.body.language;
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        pin: user.pin,
        fingerprintEnabled: user.fingerprintEnabled,
        twoFactorEnabled: user.twoFactorEnabled,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        marketingEmails: user.marketingEmails,
        theme: user.theme,
        language: user.language,
        profileVisibility: user.profileVisibility,
        showEmail: user.showEmail,
        showPhone: user.showPhone,
        pushEnabled: user.pushEnabled,
        pushToken: user.pushToken,
        points: user.points,
        loyaltyLevel: user.loyaltyLevel,
        location: user.location,
        locationEnabled: user.locationEnabled,
        lastLocationUpdate: user.lastLocationUpdate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar preferencias específicas
app.put('/api/profile/preferences', async (req, res) => {
  console.log('⚙️ Solicitud de actualización de preferencias recibida');
  console.log('Preferencias recibidas:', req.body);
  
  try {
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (req.body.theme) user.theme = req.body.theme;
    if (req.body.language) user.language = req.body.language;
    if (req.body.emailNotifications !== undefined) user.emailNotifications = req.body.emailNotifications;
    if (req.body.pushNotifications !== undefined) user.pushNotifications = req.body.pushNotifications;
    if (req.body.marketingEmails !== undefined) user.marketingEmails = req.body.marketingEmails;
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        theme: user.theme,
        language: user.language,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        marketingEmails: user.marketingEmails
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar tema
app.put('/api/profile/theme', async (req, res) => {
  console.log('🎨 Solicitud de actualización de tema recibida');
  console.log('Tema recibido:', req.body);
  
  try {
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (req.body.theme) {
      user.theme = req.body.theme;
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando tema:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para actualizar idioma
app.put('/api/profile/language', async (req, res) => {
  console.log('🌐 Solicitud de actualización de idioma recibida');
  console.log('Idioma recibido:', req.body);
  
  try {
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (req.body.language) {
      user.language = req.body.language;
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        language: user.language
      }
    });
  } catch (error) {
    console.error('❌ Error actualizando idioma:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de autenticación mock
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Solicitud de login recibida');
  console.log('Email recibido:', req.body.email);
  
  res.json({
    success: true,
    data: {
      user: {
        _id: '1',
        name: 'Usuario Admin',
        email: 'admin@example.com',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        phone: '+584121234567',
        avatar: null,
        theme: 'light',
        language: 'es',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      token: 'mock-token-123'
    },
    message: 'Login exitoso'
  });
});

// Ruta para verificar token
app.get('/api/auth/verify', (req, res) => {
  console.log('🔍 Verificación de token recibida');
  res.json({
    success: true,
    data: {
      user: {
        _id: '1',
        name: 'Usuario Admin',
        email: 'admin@example.com',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        phone: '+584121234567',
        avatar: null,
        theme: 'light',
        language: 'es',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    message: 'Token válido'
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

// ===== ENDPOINTS DE PRODUCTOS =====

// Obtener todos los productos
app.get('/api/products', async (req, res) => {
  console.log('📦 Solicitud de productos recibida');
  try {
    const { page = 1, limit = 20, search, category, storeId, status } = req.query;
    
    // Datos mock más completos
    let mockProducts = [
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
        images: ['/uploads/products/filtro-aceite.jpg'],
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
        images: ['/uploads/products/pastillas-freno.jpg'],
        tags: ['frenos', 'pastillas', 'delantero'],
        store: {
          _id: 'store1',
          name: 'Repuestos Central',
          city: 'Caracas'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Bujía de Encendido',
        description: 'Bujía de encendido para motor',
        price: 15.75,
        category: 'Encendido',
        brand: 'NGK',
        sku: 'BUJ-003',
        stock: 100,
        isActive: true,
        isFeatured: false,
        images: ['/uploads/products/bujia-encendido.jpg'],
        tags: ['bujía', 'encendido', 'motor'],
        store: {
          _id: 'store2',
          name: 'Auto Parts Plus',
          city: 'Valencia'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        name: 'Aceite Motor 5W-30',
        description: 'Aceite sintético para motor',
        price: 35.00,
        category: 'Lubricantes',
        brand: 'Mobil',
        sku: 'ACE-004',
        stock: 25,
        isActive: true,
        isFeatured: true,
        images: ['/uploads/products/aceite-motor.jpg'],
        tags: ['aceite', 'motor', 'sintético'],
        store: {
          _id: 'store1',
          name: 'Repuestos Central',
          city: 'Caracas'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Aplicar filtros
    if (search) {
      mockProducts = mockProducts.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category && category !== 'all') {
      mockProducts = mockProducts.filter(p => p.category === category);
    }
    
    if (storeId && storeId !== 'all') {
      mockProducts = mockProducts.filter(p => p.store._id === storeId);
    }
    
    if (status && status !== 'all') {
      const isActive = status === 'active';
      mockProducts = mockProducts.filter(p => p.isActive === isActive);
    }

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = mockProducts.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedProducts,
      total: mockProducts.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(mockProducts.length / limit)
    });
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener productos'
    });
  }
});

// Obtener producto por ID
app.get('/api/products/:id', async (req, res) => {
  console.log(`📦 Solicitud de producto ${req.params.id} recibida`);
  try {
    const productId = req.params.id;
    
    // Buscar en datos mock
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
        images: ['/uploads/products/filtro-aceite.jpg'],
        tags: ['filtro', 'aceite', 'motor'],
        store: {
          _id: 'store1',
          name: 'Repuestos Central',
          city: 'Caracas'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    const product = mockProducts.find(p => p._id === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener producto'
    });
  }
});

// Crear nuevo producto
app.post('/api/products', async (req, res) => {
  console.log('📦 Solicitud de creación de producto recibida');
  try {
    const { name, description, price, category, brand, sku, stock, storeId, isFeatured } = req.body;
    
    // Validaciones básicas
    if (!name || !description || !price || !category || !sku || !storeId) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios'
      });
    }
    
    // Crear nuevo producto
    const newProduct = {
      _id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      category,
      brand: brand || '',
      sku,
      stock: parseInt(stock) || 0,
      isActive: true,
      isFeatured: isFeatured || false,
      images: [],
      tags: [],
      store: {
        _id: storeId,
        name: 'Tienda',
        city: 'Ciudad'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear producto'
    });
  }
});

// Actualizar producto
app.put('/api/products/:id', async (req, res) => {
  console.log(`📦 Solicitud de actualización de producto ${req.params.id} recibida`);
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // Simular actualización
    const updatedProduct = {
      _id: productId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedProduct,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar producto'
    });
  }
});

// Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
  console.log(`📦 Solicitud de eliminación de producto ${req.params.id} recibida`);
  try {
    const productId = req.params.id;
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
      productId
    });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar producto'
    });
  }
});

// Obtener categorías de productos
app.get('/api/products/categories', async (req, res) => {
  console.log('📂 Solicitud de categorías recibida');
  try {
    // Categorías basadas en los productos mock
    const categories = [
      'Filtros',
      'Frenos', 
      'Encendido',
      'Lubricantes'
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener categorías'
    });
  }
});

// Obtener marcas de productos
app.get('/api/products/brands', async (req, res) => {
  console.log('🏷️ Solicitud de marcas recibida');
  try {
    // Marcas basadas en los productos mock
    const brands = [
      'Bosch',
      'Brembo',
      'NGK',
      'Mobil'
    ];
    
    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    console.error('❌ Error obteniendo marcas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener marcas'
    });
  }
});

// Ruta simple para obtener tiendas (para testing)
app.get('/api/stores', async (req, res) => {
  console.log('🏪 [MONGODB SERVER] Solicitud de tiendas recibida');
  try {
    // Obtener parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    console.log('📊 Parámetros de paginación:', { page, limit, skip });
    console.log('📊 Query params:', req.query);
    
    // Filtros opcionales
    const search = req.query.search || '';
    const city = req.query.city || '';
    const state = req.query.state || '';
    const isActive = req.query.isActive;
    
    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (city && city !== 'all') {
      filters.city = { $regex: city, $options: 'i' };
    }
    
    if (state && state !== 'all') {
      filters.state = { $regex: state, $options: 'i' };
    }
    
    if (isActive !== undefined && isActive !== 'all') {
      filters.isActive = isActive === 'true';
    }
    
    console.log('🔍 Filtros aplicados:', filters);
    
    // Obtener total de tiendas
    const totalStores = await Store.countDocuments(filters);
    
    // Obtener tiendas con paginación
    const stores = await Store.find(filters)
      .populate('owner', 'name email')
      .populate('managers', 'name email')
      .select({
        name: 1,
        description: 1,
        address: 1,
        city: 1,
        state: 1,
        zipCode: 1,
        country: 1,
        phone: 1,
        email: 1,
        website: 1,
        logo: 1,
        banner: 1,
        isActive: 1,
        isMainStore: 1,
        owner: 1,
        managers: 1,
        coordinates: 1,
        businessHours: 1,
        settings: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calcular paginación
    const totalPages = Math.ceil(totalStores / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    console.log(`📊 Tiendas encontradas: ${stores.length} de ${totalStores} total`);
    
    res.json({
      success: true,
      data: {
        stores: stores,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          total: totalStores,
          limit: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo tiendas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener tiendas'
    });
  }
});

// Ruta para crear tiendas de prueba
app.post('/api/stores/seed', async (req, res) => {
  console.log('🌱 Creando tiendas de prueba...');
  try {
    // Verificar si ya existen tiendas
    const existingStores = await Store.countDocuments();
    if (existingStores > 0) {
      return res.json({
        success: true,
        message: `Ya existen ${existingStores} tiendas en la base de datos`
      });
    }

    // Obtener un usuario admin para ser propietario
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró un usuario admin para asignar como propietario'
      });
    }

    const sampleStores = [
      {
        name: 'Repuestos Central',
        description: 'Tienda principal de repuestos automotrices',
        address: 'Av. Principal 123',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+584121234567',
        email: 'info@repuestoscentral.com',
        isActive: true,
        isMainStore: true,
        owner: adminUser._id,
        coordinates: {
          latitude: 10.4806,
          longitude: -66.9036
        },
        businessHours: {
          monday: { open: '08:00', close: '18:00', isOpen: true },
          tuesday: { open: '08:00', close: '18:00', isOpen: true },
          wednesday: { open: '08:00', close: '18:00', isOpen: true },
          thursday: { open: '08:00', close: '18:00', isOpen: true },
          friday: { open: '08:00', close: '18:00', isOpen: true },
          saturday: { open: '08:00', close: '14:00', isOpen: true },
          sunday: { open: '09:00', close: '13:00', isOpen: false }
        }
      },
      {
        name: 'Auto Parts Plus',
        description: 'Sucursal de repuestos especializados',
        address: 'Calle Comercial 456',
        city: 'Valencia',
        state: 'Carabobo',
        zipCode: '2001',
        country: 'Venezuela',
        phone: '+584123456789',
        email: 'valencia@autopartsplus.com',
        isActive: true,
        isMainStore: false,
        owner: adminUser._id,
        coordinates: {
          latitude: 10.1621,
          longitude: -68.0077
        },
        businessHours: {
          monday: { open: '07:30', close: '17:30', isOpen: true },
          tuesday: { open: '07:30', close: '17:30', isOpen: true },
          wednesday: { open: '07:30', close: '17:30', isOpen: true },
          thursday: { open: '07:30', close: '17:30', isOpen: true },
          friday: { open: '07:30', close: '17:30', isOpen: true },
          saturday: { open: '08:00', close: '15:00', isOpen: true },
          sunday: { open: '09:00', close: '12:00', isOpen: false }
        }
      },
      {
        name: 'Repuestos del Este',
        description: 'Tienda especializada en repuestos importados',
        address: 'Av. Francisco de Miranda 789',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1060',
        country: 'Venezuela',
        phone: '+584124567890',
        email: 'este@repuestos.com',
        isActive: false,
        isMainStore: false,
        owner: adminUser._id,
        coordinates: {
          latitude: 10.4969,
          longitude: -66.8580
        },
        businessHours: {
          monday: { open: '09:00', close: '19:00', isOpen: true },
          tuesday: { open: '09:00', close: '19:00', isOpen: true },
          wednesday: { open: '09:00', close: '19:00', isOpen: true },
          thursday: { open: '09:00', close: '19:00', isOpen: true },
          friday: { open: '09:00', close: '19:00', isOpen: true },
          saturday: { open: '09:00', close: '16:00', isOpen: true },
          sunday: { open: '10:00', close: '14:00', isOpen: false }
        }
      }
    ];

    const createdStores = await Store.insertMany(sampleStores);
    
    console.log(`✅ Creadas ${createdStores.length} tiendas de prueba`);
    
    res.json({
      success: true,
      message: `Creadas ${createdStores.length} tiendas de prueba exitosamente`,
      stores: createdStores
    });
  } catch (error) {
    console.error('❌ Error creando tiendas de prueba:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear tiendas de prueba'
    });
  }
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
  console.log(`🗄️ MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
  console.log('📋 Endpoints disponibles:');
  console.log('   - GET  /api/health');
  console.log('   - GET  /api/profile (MongoDB)');
  console.log('   - PUT  /api/profile (MongoDB)');
  console.log('   - PUT  /api/profile/preferences (MongoDB)');
  console.log('   - PUT  /api/profile/theme (MongoDB)');
  console.log('   - PUT  /api/profile/language (MongoDB)');
  console.log('   - GET  /api/users (MongoDB) - Lista todos los usuarios');
  console.log('   - PUT  /api/users/:id/status (MongoDB) - Cambiar estado de usuario');
  console.log('   - DELETE /api/users/:id (MongoDB) - Eliminar usuario');
  console.log('   - POST /api/users/seed (MongoDB) - Crear usuarios de prueba');
  console.log('   - GET  /api/products - Lista productos con filtros');
  console.log('   - GET  /api/products/:id - Obtener producto por ID');
  console.log('   - POST /api/products - Crear producto');
  console.log('   - PUT  /api/products/:id - Actualizar producto');
  console.log('   - DELETE /api/products/:id - Eliminar producto');
  console.log('   - GET  /api/stores - Lista tiendas');
  console.log('   - POST /api/stores - Crear tienda');
  console.log('   - PUT  /api/stores/:id - Actualizar tienda');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/auth/verify');
  console.log('   - GET  /api/store-photos');
  console.log('   - POST /api/store-photos');
  console.log('   - POST /api/admin/enrichment/run');
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  mongoose.connection.close();
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  mongoose.connection.close();
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
