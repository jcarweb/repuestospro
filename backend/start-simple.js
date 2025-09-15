const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta de perfil mock para testing
app.get('/api/profile', (req, res) => {
  res.json({
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
    points: 0,
    loyaltyLevel: 'bronze',
    locationEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Ruta de autenticación mock
app.post('/api/auth/login', (req, res) => {
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

// Servir archivos estáticos si existen
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend iniciado en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌐 Red: http://192.168.0.110:${PORT}`);
  console.log('✅ Backend funcionando correctamente');
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor...');
  process.exit(0);
});
