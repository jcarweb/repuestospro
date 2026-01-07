import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// import compression from 'compression'; // Removido temporalmente por problemas de tipos
import path from 'path';
import { createServer } from 'http';
import DatabaseService from './config/database';
import config from './config/env';
import passport from './config/passport';
// import PerformanceConfig from './config/performance';
// import MonitoringConfig from './config/monitoring';
import session from 'express-session';
import { ChatService } from './services/ChatService';
import { ChatController } from './controllers/ChatController';
import createChatRoutes from './routes/chatRoutes';
import createWarrantyRoutes from './routes/warrantyRoutes';
import createClaimRoutes from './routes/claimRoutes';
import { createTransactionRoutes } from './routes/transactionRoutes';
import { createOrderRoutes } from './routes/orderRoutes';
import { createSalesReportRoutes } from './routes/salesReportRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import deliveryWalletRoutes from './routes/deliveryWalletRoutes';
import deliveryOrderRoutes from './routes/deliveryOrderRoutes';
import adminDeliveryRoutes from './routes/adminDeliveryRoutes';
import logisticFundRoutes from './routes/logisticFundRoutes';
import adminLogisticRoutes from './routes/adminLogisticRoutes';
import simulationRoutes from './routes/simulationRoutes';
import riderRoutes from './routes/riderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import walletRoutes from './routes/walletRoutes';
import adminWalletRoutes from './routes/adminWalletRoutes';
import rechargeRoutes from './routes/rechargeRoutes';
import { WebhookController } from './controllers/webhookController';
// Importar rutas
import productRoutes from './routes/productRoutes';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import brandRoutes from './routes/brandRoutes';
import subcategoryRoutes from './routes/subcategoryRoutes';
import locationRoutes from './routes/locationRoutes';
import loyaltyRoutes from './routes/loyaltyRoutes';
import googleAnalyticsRoutes from './routes/googleAnalyticsRoutes';
import registrationCodeRoutes from './routes/registrationCodeRoutes';
import promotionRoutes from './routes/promotionRoutes';
import advertisementRoutes from './routes/advertisementRoutes';
import advertisementRequestRoutes from './routes/advertisementRequestRoutes';
import searchRoutes from './routes/search';
import adminRoutes from './routes/adminRoutes';
import storeRoutes from './routes/storeRoutes';
import activityRoutes from './routes/activityRoutes';
import profileRoutes from './routes/profileRoutes';
import notificationRoutes from './routes/notificationRoutes';
import clientNotificationRoutes from './routes/clientNotificationRoutes';
import monetizationRoutes from './routes/monetizationRoutes';
import administrativeDivisionRoutes from './routes/administrativeDivisionRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import inventoryAlertRoutes from './routes/inventoryAlertRoutes';
import reviewRoutes from './routes/reviewRoutes';
import cryptoAuthRoutes from './routes/cryptoAuthRoutes';
import storePhotoRoutes from './routes/storePhotoRoutes';
import masterRoutes from './routes/masterRoutes';
import healthRoutes from './routes/healthRoutes';
import quotationRoutes from './routes/quotationRoutes';
import quotationConfigRoutes from './routes/quotationConfigRoutes';
import advancedSearchRoutes from './routes/advancedSearchRoutes';
import userManagementRoutes from './routes/userManagementRoutes';
// import mobileRoutes from './routes/mobileRoutes';
// Importaciones problemáticas removidas - se crearán las rutas directamente
// import whatsappTestRoutes from './routes/whatsappTestRoutes';
import { enrichmentWorker } from './services/enrichmentWorker';
import autoUpdateService from './services/autoUpdateService';
// import { initializeWhatsAppForVenezuela } from './scripts/initWhatsApp';
const app = express();
// Configurar rate limiting optimizado (más permisivo)
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS * 2, // Duplicar el límite
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true, // Retornar rate limit info en headers
  legacyHeaders: false, // Deshabilitar headers legacy
  skip: (req) => {
    // Saltar rate limiting para health checks y rutas de perfil
    return req.path === '/health' || 
           req.path === '/api/health' ||
           req.path.startsWith('/api/profile') ||
           req.path.startsWith('/api/auth/profile');
  }
});

// Rate limiter específico para rutas de perfil (muy permisivo)
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Aumentado a 1000 requests por 15 minutos para perfil
  message: {
    success: false,
    message: 'Demasiadas solicitudes de perfil desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Aumentado para desarrollo - 100 intentos de login por 15 minutos
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar requests exitosos
});
// Configurar sesiones para Passport
app.use(session({
  secret: config.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Cambiar a true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));
// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());
// Middleware de compresión (debe ir antes de otros middlewares) - DESHABILITADO
// app.use(compression({
//   level: 6, // Nivel de compresión balanceado
//   threshold: 1024, // Comprimir archivos > 1KB
//   filter: (req: express.Request, res: express.Response) => {
//     // No comprimir si el cliente no lo soporta
//     if (req.headers['x-no-compression']) {
//       return false;
//     }
//     return compression.filter(req, res);
//   }
// }));

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitar CSP para desarrollo
  crossOriginEmbedderPolicy: false
}));

// Configurar CORS
app.use(cors({
  origin: true, // Permitir todos los orígenes en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de logging optimizado
if (config.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Middleware de tracing y monitoreo
// app.use(MonitoringConfig.createTracingMiddleware());
// Configurar archivos estáticos para uploads (ANTES del rate limiter)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    console.log('Sirviendo archivo estático:', filePath);
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));
// Aplicar rate limiting (DESPUÉS de archivos estáticos)
app.use(limiter);
// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de PiezasYA funcionando correctamente',
    version: '1.0.0',
    environment: config.NODE_ENV
  });
});
// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
// Ruta de salud para la API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: '1.0.0'
  });
});
// Ruta temporal para verificar y crear tipos de vehículos sin autenticación
app.get('/api/debug/vehicle-types', async (req, res) => {
  try {
    const VehicleType = require('./models/VehicleType').default;
    const vehicleTypes = await VehicleType.find().sort({ name: 1 });
    res.json({
      success: true,
      data: vehicleTypes,
      count: vehicleTypes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});
// Ruta temporal para obtener tiendas sin autenticación
app.get('/api/debug/stores', async (req, res) => {
  try {
    const Store = require('./models/Store').default;
    const stores = await Store.find({ isActive: true })
      .select('name city state coordinates')
      .sort({ name: 1 });
    res.json({
      success: true,
      data: stores,
      count: stores.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});
// Ruta temporal para crear tienda (SOLO PARA DESARROLLO)
app.post('/api/stores', async (req, res) => {
  try {
    console.log('🔧 Ruta temporal POST /api/stores - Datos recibidos:', req.body);
    
    // Verificar autenticación básica
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.substring(7);
    console.log('🔧 Token recibido:', token.substring(0, 20) + '...');

    // Decodificar el token para obtener el userId
    let userId;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1] || '', 'base64').toString());
        userId = payload.userId;
        console.log('🔧 UserId extraído del token:', userId);
      } else {
        throw new Error('Token malformado');
      }
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Importar modelos necesarios
    const Store = require('./models/Store').default;
    const User = require('./models/User').default;
    const State = require('./models/State').default;
    const Municipality = require('./models/Municipality').default;
    const Parish = require('./models/Parish').default;

    // Obtener divisiones administrativas por defecto
    const defaultState = await State.findOne({ name: { $regex: /distrito|capital/i } });
    const defaultMunicipality = await Municipality.findOne({ name: { $regex: /libertador/i } });
    const defaultParish = await Parish.findOne();

    console.log('🔧 Divisiones administrativas encontradas:');
    console.log('🔧 Estado:', defaultState?._id);
    console.log('🔧 Municipio:', defaultMunicipality?._id);
    console.log('🔧 Parroquia:', defaultParish?._id);

    // Crear la tienda real en la base de datos
    const storeData = {
      name: req.body.name || 'Tienda Temporal',
      description: req.body.description || '',
      address: req.body.address || '',
      city: req.body.city || '',
      state: req.body.state || '',
      zipCode: req.body.zipCode || '',
      country: req.body.country || 'Venezuela',
      phone: req.body.phone || '',
      email: req.body.email || '',
      website: req.body.website || '',
      coordinates: req.body.coordinates || { latitude: 0, longitude: 0 },
      stateRef: defaultState?._id,
      municipalityRef: defaultMunicipality?._id,
      parishRef: defaultParish?._id,
      businessHours: req.body.businessHours || {
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '08:00', close: '14:00', isOpen: true },
        sunday: { open: '08:00', close: '14:00', isOpen: false }
      },
      settings: req.body.settings || {
        currency: 'USD',
        taxRate: 16,
        deliveryRadius: 10,
        minimumOrder: 0,
        autoAcceptOrders: false
      },
      owner: userId,
      managers: [userId],
      isActive: true,
      isMainStore: false
    };

    console.log('🔧 Creando tienda en la base de datos...');
    const newStore = new Store(storeData);
    const savedStore = await newStore.save();
    console.log('🔧 Tienda guardada con ID:', savedStore._id);

    // Actualizar el usuario para incluir la tienda
    await User.findByIdAndUpdate(userId, {
      $push: { stores: savedStore._id }
    });
    console.log('🔧 Usuario actualizado con la nueva tienda');

    return res.status(201).json({
      success: true,
      message: 'Tienda creada exitosamente',
      data: savedStore
    });
  } catch (error) {
    console.error('❌ Error en ruta temporal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta temporal para obtener usuarios sin autenticación
app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User').default;
    // Obtener parámetros de filtro
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    // Construir filtros
    const filters: any = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filters.role = role;
    }
    if (status && status !== 'all') {
      if (status === 'active') {
        filters.isActive = true;
      } else if (status === 'inactive') {
        filters.isActive = false;
      }
    }
    // Construir ordenamiento
    const sortOptions: any = {};
    if (sortBy === 'name') {
      sortOptions.name = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'email') {
      sortOptions.email = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'createdAt') {
      sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'lastLogin') {
      sortOptions.lastLogin = sortOrder === 'desc' ? -1 : 1;
    }
    // Calcular paginación
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    // Ejecutar consulta
    const users = await User.find(filters)
      .select('name email phone role isActive isEmailVerified createdAt lastLogin')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    // Contar total para paginación
    const total = await User.countDocuments(filters);
    const totalPages = Math.ceil(total / limitNum);
    res.json({
      success: true,
      data: {
        users: users,
        pagination: {
          currentPage: pageNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum,
          total: total,
          totalPages: totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta temporal para actualizar usuarios sin autenticación (SOLO PARA DEBUG)
app.put('/api/debug/users/:id', async (req, res) => {
  try {
    const User = require('./models/User').default;
    const { id } = req.params;
    const updateData = req.body;
    
    // Solo permitir actualizar campos específicos por seguridad
    const allowedFields = ['avatar', 'twoFactorEnabled', 'name', 'email', 'loginAttempts', 'lockUntil'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    const user = await User.findByIdAndUpdate(id, filteredData, { new: true });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta de prueba de base de datos
app.get('/api/db-status', async (req, res) => {
  try {
    const dbService = DatabaseService.getInstance();
    const healthCheck = await dbService.healthCheck();
    res.json({
      success: true,
      connected: dbService.isConnectedToDatabase(),
      state: dbService.getConnectionState(),
      health: healthCheck
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando estado de la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Endpoint de prueba general
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0'
  });
});

// Endpoint de prueba para enriquecimiento
app.get('/api/test-enrichment', async (req, res) => {
  try {
    const { enrichmentWorker } = await import('./services/enrichmentWorker');
    const stats = await enrichmentWorker.getStats();
    
    res.json({
      success: true,
      message: 'Worker de enriquecimiento funcionando',
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en worker de enriquecimiento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/auth', authLimiter, authRoutes); // Aplicar rate limiting estricto a auth
app.use('/api', categoryRoutes);
app.use('/api', brandRoutes);
app.use('/api', subcategoryRoutes);
app.use('/api/locations', administrativeDivisionRoutes); // Rutas para divisiones administrativas (DEBE IR ANTES)
app.use('/api/location', locationRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/analytics', googleAnalyticsRoutes);
app.use('/api/registration-codes', registrationCodeRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/advertisement-requests', advertisementRequestRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/activities', activityRoutes);
// Ruta de perfil sin autenticación para admin (fallback)
app.get('/api/profile/admin', async (req, res) => {
  try {
    // Buscar usuario admin por defecto o crear uno si no existe
    const User = require('./models/User').default;
    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      // Crear usuario admin por defecto
      user = new User({
        name: 'Administrador PiezasYA',
        email: 'admin@piezasyaya.com',
        phone: '+584121234567',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        theme: 'light',
        language: 'es'
      });
      await user.save();
    }
    res.json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '/uploads/perfil/default-avatar.svg',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        pin: user.pin,
        fingerprintEnabled: user.fingerprintEnabled || false,
        twoFactorEnabled: user.twoFactorEnabled || false,
        emailNotifications: user.emailNotifications !== undefined ? user.emailNotifications : true,
        pushNotifications: user.pushNotifications !== undefined ? user.pushNotifications : true,
        marketingEmails: user.marketingEmails || false,
        theme: user.theme || 'light',
        language: user.language || 'es',
        profileVisibility: user.profileVisibility || 'private',
        showEmail: user.showEmail || false,
        showPhone: user.showPhone || false,
        pushEnabled: user.pushEnabled || false,
        pushToken: user.pushToken,
        points: user.points || 1000,
        loyaltyLevel: user.loyaltyLevel || 'platinum',
        location: user.location,
        locationEnabled: user.locationEnabled || false,
        lastLocationUpdate: user.lastLocationUpdate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
app.use('/api/profile', profileLimiter, profileRoutes); // Rate limiter específico para perfil
app.use('/api/notifications', notificationRoutes);
app.use('/api/client/notifications', clientNotificationRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-alerts', inventoryAlertRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/warranties', createWarrantyRoutes());
app.use('/api/claims', createClaimRoutes());
app.use('/api/transactions', createTransactionRoutes());
app.use('/api/orders', createOrderRoutes());
app.use('/api/sales-reports', createSalesReportRoutes());
app.use('/api/delivery', deliveryRoutes);
app.use('/api/delivery/wallet', deliveryWalletRoutes);
app.use('/api/delivery/orders', deliveryOrderRoutes);
app.use('/api/admin/delivery', adminDeliveryRoutes);
app.use('/api/logistic/fund', logisticFundRoutes);
app.use('/api/admin/logistic', adminLogisticRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin/wallet', adminWalletRoutes);
app.use('/api/recharge', rechargeRoutes);

// Webhooks para pagos
app.post('/api/webhooks/paypal', WebhookController.paypalWebhook);
app.post('/api/webhooks/stripe', WebhookController.stripeWebhook);
app.use('/api/crypto-auth', cryptoAuthRoutes);
app.use('/api/store-photos', storePhotoRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/quotation-config', quotationConfigRoutes);
app.use('/api/advanced-search', advancedSearchRoutes);
app.use('/api/admin/users', userManagementRoutes);

// Rutas optimizadas para móvil (DEBEN IR ANTES de las rutas generales)
// app.use('/api/mobile', mobileRoutes);

// Crear rutas directamente para evitar problemas de importación
const userManagementTestRoutes = Router();
userManagementTestRoutes.get('/test', (req, res) => {
  res.json({ message: 'User management test route working' });
});

const diagnosticRoutes = Router();
diagnosticRoutes.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/test/users', userManagementTestRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/health', healthRoutes);
// app.use('/api/whatsapp', whatsappTestRoutes);
// Variables globales para chat
let chatService: ChatService;
let chatController: ChatController;
// Middleware para manejar rutas no encontradas (catch-all)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});
// Middleware para manejar errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error del servidor:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: config.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});
// Función para verificar si un puerto está disponible
const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false);
    });
  });
};
// Función para encontrar un puerto disponible
const findAvailablePort = async (startPort: number): Promise<number> => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error('No se pudo encontrar un puerto disponible');
    }
  }
  return port;
};
// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar si el puerto configurado está disponible
    const availablePort = await findAvailablePort(Number(config.PORT));
    // Crear servidor HTTP
    const server = createServer(app);
    // Inicializar servicio de chat con WebSocket
    chatService = new ChatService(server);
    chatController = new ChatController(chatService);
    // Agregar rutas de chat
    app.use('/api/chat', createChatRoutes(chatController));
    server.listen(availablePort, '0.0.0.0', () => {
      console.log(`🚀 Servidor iniciado en puerto ${availablePort}`);
      console.log(`📊 Ambiente: ${config.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${availablePort}`);
      console.log(`🌐 Red: http://192.168.31.122:${availablePort}`);
      console.log(`💬 WebSocket Chat habilitado`);
      // Si el puerto cambió, mostrar advertencia
      if (availablePort !== Number(config.PORT)) {
      }
    });
    return server;
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    throw error;
  }
};
// Función para inicializar la aplicación con base de datos
const initializeApp = async () => {
  try {
    console.log('🚀 Iniciando aplicación con base de datos...');
    
    // Inicializar optimizaciones de rendimiento
    // PerformanceConfig.initialize();
    
    // Inicializar sistema de monitoreo
    // MonitoringConfig.initialize();
    
    // Conectar a la base de datos
    const dbService = DatabaseService.getInstance();
    await dbService.connectToDatabase();
    // Iniciar servidor
    const server = await startServer();
    // Iniciar worker de enriquecimiento
    await enrichmentWorker.startWorker();
    
    // Iniciar actualización automática de tasas de cambio
    console.log('💱 Iniciando actualización automática de tasas de cambio...');
    autoUpdateService.startAutoUpdate();
    
    // Inicializar WhatsApp para Venezuela (COMENTADO TEMPORALMENTE)
    // console.log('🇻🇪 Inicializando WhatsApp para Venezuela...');
    // try {
    //   await initializeWhatsAppForVenezuela();
    // } catch (error) {
    //   console.log('⚠️ WhatsApp no se pudo inicializar, pero el sistema funcionará con email');
    //   console.log('💡 Para configurar WhatsApp, revisa la documentación en WHATSAPP_SETUP.md');
    // }
    console.log('📧 WhatsApp deshabilitado temporalmente - Solo email disponible');
    // Manejo de señales de terminación
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando aplicación...`);
      server.close(async () => {
        try {
          // Detener worker de enriquecimiento
          enrichmentWorker.stopWorker();
          // Detener actualización automática
          autoUpdateService.stopAutoUpdate();
          await dbService.disconnectFromDatabase();
        } catch (error) {
          console.error('❌ Error desconectando base de datos:', error);
        }
        process.exit(0);
      });
    };
    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    process.exit(1);
  }
};
// Inicializar la aplicación
initializeApp();