require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('🔍 DEBUG: Configuración de Google OAuth\n');

// Mostrar todas las variables de entorno relacionadas con Google
const googleVars = {
  'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
  'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
  'GOOGLE_CALLBACK_URL': process.env.GOOGLE_CALLBACK_URL,
  'FRONTEND_URL': process.env.FRONTEND_URL,
  'CORS_ORIGIN': process.env.CORS_ORIGIN
};

console.log('📋 Variables de entorno:');
Object.entries(googleVars).forEach(([key, value]) => {
  if (value) {
    if (key.includes('SECRET')) {
      console.log(`✅ ${key}: ***CONFIGURADO***`);
    } else {
      console.log(`✅ ${key}: "${value}"`);
    }
  } else {
    console.log(`❌ ${key}: NO CONFIGURADO`);
  }
});

console.log('\n🔗 URLs que DEBEN estar en Google Cloud Console:');
console.log('1. http://localhost:5000/api/auth/google/callback');
console.log('2. http://localhost:3000/google-callback');

console.log('\n⚠️  INSTRUCCIONES EXACTAS:');
console.log('1. Ve a: https://console.cloud.google.com/');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a: APIs & Services > Credentials');
console.log('4. Busca el Client ID: 85298102499-7mjibl5gtsd7depd3eppkgnhfl4as84v.apps.googleusercontent.com');
console.log('5. Haz clic en EDITAR (ícono de lápiz)');
console.log('6. En "Authorized redirect URIs" ELIMINA todas las URLs existentes');
console.log('7. Agrega SOLO estas dos URLs:');
console.log('   - http://localhost:5000/api/auth/google/callback');
console.log('   - http://localhost:3000/google-callback');
console.log('8. Haz clic en SAVE');
console.log('9. Espera 5 minutos');
console.log('10. Reinicia tu servidor backend');
console.log('11. Prueba el login nuevamente');

console.log('\n🚨 PROBLEMAS COMUNES:');
console.log('- URLs con espacios extra al final');
console.log('- URLs sin http://');
console.log('- URLs con puertos incorrectos');
console.log('- Múltiples URLs similares');
console.log('- Caché del navegador');
console.log('- Servidor no reiniciado');
