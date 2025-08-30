const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Verificando variables de entorno de Google OAuth...\n');

// Verificar variables específicas
const vars = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GOOGLE_CALLBACK_URL': process.env.GOOGLE_CALLBACK_URL,
  'FRONTEND_URL': process.env.FRONTEND_URL
};

Object.entries(vars).forEach(([key, value]) => {
  if (value) {
    if (key.includes('SECRET')) {
      console.log(`✅ ${key}: ***CONFIGURADO***`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: NO CONFIGURADO`);
  }
});

console.log('\n📋 URLs que debes configurar en Google Cloud Console:');
console.log('1. Ve a https://console.cloud.google.com/');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a APIs & Services > Credentials');
console.log('4. Encuentra tu OAuth 2.0 Client ID');
console.log('5. En "Authorized redirect URIs" agrega:');
console.log('   - http://localhost:5000/api/auth/google/callback');
console.log('   - http://localhost:3000/google-callback');

console.log('\n🔗 URL de callback actual:');
console.log(`- Backend: ${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'}`);
console.log(`- Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/google-callback`);
