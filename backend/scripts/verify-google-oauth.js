const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔍 Verificando configuración de Google OAuth...\n');

// Verificar variables requeridas
const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NO CONFIGURADO`);
    allConfigured = false;
  } else {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***CONFIGURADO***' : value}`);
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

console.log('\n🔗 URLs de prueba:');
console.log(`- Backend callback: ${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'}`);
console.log(`- Frontend callback: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/google-callback`);

if (allConfigured) {
  console.log('\n✅ Configuración básica correcta');
  console.log('⚠️  Asegúrate de que las URLs estén configuradas en Google Cloud Console');
} else {
  console.log('\n❌ Faltan variables de configuración');
  console.log('Agrega las variables faltantes en tu archivo .env');
}

console.log('\n📝 Pasos para solucionar el error redirect_uri_mismatch:');
console.log('1. Verifica que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET estén correctos');
console.log('2. Asegúrate de que la URL de callback esté en Google Cloud Console');
console.log('3. La URL debe coincidir exactamente (incluyendo http/https)');
console.log('4. Si usas localhost, asegúrate de que sea http://localhost:5000');
console.log('5. Reinicia el servidor después de cambiar la configuración');
