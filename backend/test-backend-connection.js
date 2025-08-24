const express = require('express');
const cors = require('cors');

const app = express();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba para auth
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de autenticación funcionando',
    timestamp: new Date().toISOString()
  });
});

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba iniciado en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('✅ Server listening');
});
