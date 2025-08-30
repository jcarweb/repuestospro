const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🧪 Probando configuración de Google OAuth...\n');

// Verificar configuración
const config = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  frontendURL: process.env.FRONTEND_URL
};

console.log('📋 Configuración actual:');
console.log(`✅ Client ID: ${config.clientID ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log(`✅ Client Secret: ${config.clientSecret ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log(`✅ Callback URL: ${config.callbackURL}`);
console.log(`✅ Frontend URL: ${config.frontendURL}`);

console.log('\n🔗 URLs de prueba:');
console.log(`1. Backend callback: ${config.callbackURL}`);
console.log(`2. Frontend callback: ${config.frontendURL}/google-callback`);

console.log('\n📝 Pasos para solucionar redirect_uri_mismatch:');
console.log('1. Ve a https://console.cloud.google.com/');
console.log('2. APIs & Services > Credentials');
console.log('3. Edita tu OAuth 2.0 Client ID');
console.log('4. En "Authorized redirect URIs" agrega:');
console.log(`   - ${config.callbackURL}`);
console.log(`   - ${config.frontendURL}/google-callback`);
console.log('5. Guarda los cambios');
console.log('6. Espera 2-3 minutos');
console.log('7. Prueba el login nuevamente');

console.log('\n⚠️  IMPORTANTE:');
console.log('- Las URLs deben coincidir EXACTAMENTE');
console.log('- Incluye http:// o https://');
console.log('- No agregues espacios extra');
console.log('- Reinicia el servidor después de cambios');
