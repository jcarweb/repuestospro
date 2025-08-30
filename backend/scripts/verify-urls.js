require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('🔍 VERIFICACIÓN DE URLs DE GOOGLE OAUTH\n');

// Obtener configuración actual
const currentConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  frontendURL: process.env.FRONTEND_URL
};

console.log('📋 Configuración actual:');
console.log(`Client ID: ${currentConfig.clientID}`);
console.log(`Callback URL: ${currentConfig.callbackURL}`);
console.log(`Frontend URL: ${currentConfig.frontendURL}`);

console.log('\n🔗 URLs que DEBEN estar en Google Cloud Console:');
console.log('1. http://localhost:5000/api/auth/google/callback');
console.log('2. http://localhost:3000/google-callback');

console.log('\n⚠️  VERIFICACIÓN CRÍTICA:');
console.log('1. Ve a Google Cloud Console');
console.log('2. APIs & Services > Credentials');
console.log('3. Edita tu OAuth 2.0 Client ID');
console.log('4. En "Authorized redirect URIs" verifica que tengas:');
console.log('   - http://localhost:5000/api/auth/google/callback');
console.log('   - http://localhost:3000/google-callback');
console.log('5. NO debe haber espacios, barras extra, o URLs similares');

console.log('\n🚨 PROBLEMAS COMUNES:');
console.log('- URLs con espacios al final');
console.log('- URLs con barras al final');
console.log('- Múltiples URLs similares');
console.log('- URLs con puertos incorrectos');
console.log('- URLs sin http://');

console.log('\n⏰ TIEMPO DE PROPAGACIÓN:');
console.log('- Google puede tardar 5-15 minutos en propagar cambios');
console.log('- Si acabas de hacer cambios, espera al menos 10 minutos');
console.log('- Prueba en modo incógnito después de esperar');

console.log('\n🧪 PRUEBA DESPUÉS DE VERIFICAR:');
console.log('1. Limpia caché del navegador (Ctrl+Shift+Delete)');
console.log('2. Ve a http://localhost:3000');
console.log('3. Haz clic en "Iniciar sesión con Google"');
console.log('4. Deberías ir a Google sin errores');
