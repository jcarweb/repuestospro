import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { createServer } from 'http';
import DatabaseService from './config/database';
import config from './config/env';
import passport from './config/passport';
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
import riderRoutes from './routes/riderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

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
import monetizationRoutes from './routes/monetizationRoutes';
import administrativeDivisionRoutes from './routes/administrativeDivisionRoutes';
import inventoryRoutes from './routes/inventoryRoutes';

const app = express();

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

// Rate limiter específico para rutas de perfil (más permisivo)
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // 500 requests por 15 minutos para perfil
  message: {
    success: false,
    message: 'Demasiadas solicitudes de perfil desde esta IP, intenta de nuevo más tarde.'
  }
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

// Middleware de seguridad
app.use(helmet());

// Configurar CORS
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// Middleware de logging
app.use(morgan('combined'));

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



// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
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
app.use('/api', storeRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/profile', profileLimiter, profileRoutes); // Rate limiter específico para perfil
app.use('/api/notifications', notificationRoutes);
app.use('/api/monetization', monetizationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/warranties', createWarrantyRoutes());
app.use('/api/claims', createClaimRoutes());
app.use('/api/transactions', createTransactionRoutes());
app.use('/api/orders', createOrderRoutes());
app.use('/api/sales-reports', createSalesReportRoutes());
app.use('/api/delivery', deliveryRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Variables globales para chat
let chatService: ChatService;
let chatController: ChatController;

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
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
    
    server.listen(availablePort, () => {
      console.log(`🚀 Servidor iniciado en puerto ${availablePort}`);
      console.log(`📊 Ambiente: ${config.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${availablePort}`);
      console.log(`💬 WebSocket Chat habilitado`);
      console.log('✅ Server listening');
      
      // Si el puerto cambió, mostrar advertencia
      if (availablePort !== Number(config.PORT)) {
        console.log(`⚠️  Puerto ${config.PORT} estaba ocupado, usando puerto ${availablePort}`);
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
    
    // Conectar a la base de datos
    const dbService = DatabaseService.getInstance();
    await dbService.connectToDatabase();
    
    // Iniciar servidor
    const server = await startServer();

    // Manejo de señales de terminación
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando aplicación...`);
      
      server.close(async () => {
        console.log('✅ Servidor HTTP cerrado');
        
        try {
          await dbService.disconnectFromDatabase();
          console.log('✅ Base de datos desconectada');
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