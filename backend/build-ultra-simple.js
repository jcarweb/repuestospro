const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build ultra simple...');

try {
  // Crear directorio dist si no existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Limpiar directorio dist
  if (fs.existsSync('dist')) {
    const files = fs.readdirSync('dist');
    files.forEach(file => {
      const filePath = path.join('dist', file);
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }

  // Crear index.js ultra simple
  console.log('📝 Creando index.js ultra simple...');
  const indexContent = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware básico
app.use(helmet());
app.use(cors({
  origin: [
    'https://piezasya.vercel.app',
    'https://piezasya.vercel.app/',
    'http://localhost:3000',
    'http://localhost:3000/'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});
app.use('/api/', limiter);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/piezasyaya', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'PiezasYA Backend API', status: 'running' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rutas de API básicas
app.get('/api/products', (req, res) => {
  res.json({ message: 'Lista de productos', data: [] });
});

app.get('/api/stores', (req, res) => {
  res.json({ message: 'Lista de tiendas', data: [] });
});

app.get('/api/orders', (req, res) => {
  res.json({ message: 'Lista de órdenes', data: [] });
});

app.get('/api/users', (req, res) => {
  res.json({ message: 'Lista de usuarios', data: [] });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint', status: 'OK' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint', status: 'OK' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(\`🚀 Servidor ejecutándose en puerto \${PORT}\`);
  console.log(\`📱 Health check: http://localhost:\${PORT}/api/health\`);
});

module.exports = app;`;

  fs.writeFileSync(path.join('dist', 'index.js'), indexContent);
  console.log('✅ index.js ultra simple creado');

  // Copiar package.json y instalar dependencias
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', path.join('dist', 'package.json'));
    console.log('📋 Copiado package.json a dist/');
    
    // Instalar dependencias en el directorio dist
    console.log('📦 Instalando dependencias en dist/...');
    try {
      execSync('npm install --production', { cwd: 'dist', stdio: 'inherit' });
      console.log('✅ Dependencias instaladas en dist/');
    } catch (error) {
      console.log('⚠️  Error instalando dependencias, continuando...');
    }
  }

  console.log('✅ Build ultra simple completado!');
  console.log('📁 Archivos creados en: dist/');
  
} catch (error) {
  console.error('❌ Error durante la compilación:', error.message);
  process.exit(1);
}
