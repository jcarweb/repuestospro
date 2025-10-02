const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Conectar a MongoDB usando las credenciales del .env
const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en el archivo .env');
    }
    console.log('🔌 Conectando a MongoDB en la nube...');
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
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de salud
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor de desarrollo PiezasYA funcionando',
    version: '1.0.0-dev',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'development'
  });
});

// Rutas de autenticación básicas
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificación simple de contraseña (en producción usar bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar || '/uploads/perfil/default-avatar.svg'
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Crear nuevo usuario
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // En producción usar bcrypt
      phone: phone || '',
      role: 'client'
    });

    await newUser.save();

    // Generar token
    const token = Buffer.from(`${newUser._id}:${Date.now()}`).toString('base64');

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          avatar: newUser.avatar || '/uploads/perfil/default-avatar.svg'
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de perfil (sin autenticación para desarrollo)
app.get('/api/profile', async (req, res) => {
  try {
    // Buscar usuario admin por defecto o crear uno si no existe
    let user = await User.findOne({ role: 'admin' });
    
    if (!user) {
      // Crear usuario admin por defecto
      user = new User({
        name: 'Administrador PiezasYA',
        email: 'admin@piezasyaya.com',
        phone: '+584121234567',
        password: 'admin123',
        role: 'admin',
        isActive: true
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
        avatar: user.avatar || '/uploads/perfil/default-avatar.svg',
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// Ruta de productos mock
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: '1',
        name: 'Filtro de Aceite',
        price: 25.99,
        category: 'Filtros',
        brand: 'Fram',
        stock: 50
      },
      {
        _id: '2',
        name: 'Pastillas de Freno',
        price: 45.99,
        category: 'Frenos',
        brand: 'Brembo',
        stock: 30
      }
    ],
    count: 2
  });
});

// Ruta de categorías mock
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: '1', name: 'Filtros', description: 'Filtros para vehículos' },
      { _id: '2', name: 'Frenos', description: 'Sistema de frenos' },
      { _id: '3', name: 'Motor', description: 'Repuestos del motor' }
    ],
    count: 3
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejar errores
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de desarrollo iniciado en puerto ${PORT}`);
  console.log(`📊 Ambiente: development`);
  console.log(`🔗 URL Local: http://localhost:${PORT}`);
  console.log(`🌐 URL Red: http://192.168.0.106:${PORT}`);
  console.log(`✅ Server listening on 0.0.0.0:${PORT}`);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT. Cerrando servidor...');
  process.exit(0);
});
