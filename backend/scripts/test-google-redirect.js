require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('🧪 SIMULACIÓN DE PETICIÓN GOOGLE OAUTH\n');

// Simular la petición que envía tu aplicación
const clientID = process.env.GOOGLE_CLIENT_ID;
const redirectURI = process.env.GOOGLE_CALLBACK_URL;
const scope = 'profile email';

console.log('📋 Parámetros de la petición:');
console.log(`Client ID: ${clientID}`);
console.log(`Redirect URI: ${redirectURI}`);
console.log(`Scope: ${scope}`);

console.log('\n🔗 URL que se está enviando a Google:');
const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${clientID}&` +
  `redirect_uri=${encodeURIComponent(redirectURI)}&` +
  `scope=${encodeURIComponent(scope)}&` +
  `response_type=code&` +
  `access_type=offline`;

console.log(googleAuthURL);

console.log('\n⚠️  VERIFICACIÓN CRÍTICA:');
console.log('1. La URL de redirección en tu .env es:', redirectURI);
console.log('2. Esta URL DEBE estar en Google Cloud Console');
console.log('3. Debe coincidir EXACTAMENTE (sin espacios, sin barras extra)');

console.log('\n🔍 PASOS PARA VERIFICAR:');
console.log('1. Ve a Google Cloud Console');
console.log('2. APIs & Services > Credentials');
console.log('3. Edita tu OAuth 2.0 Client ID');
console.log('4. En "Authorized redirect URIs" verifica:');
console.log(`   - ${redirectURI}`);
console.log('   - http://localhost:3000/google-callback');

console.log('\n🚨 SI EL ERROR PERSISTE:');
console.log('- Espera 15 minutos (Google puede tardar en propagar)');
console.log('- Verifica que no haya URLs duplicadas o similares');
console.log('- Asegúrate de que las URLs no tengan espacios extra');
console.log('- Prueba en modo incógnito después de esperar');

console.log('\n📞 DEBUGGING:');
console.log('- Revisa la consola del navegador (F12)');
console.log('- Verifica la pestaña Network en DevTools');
console.log('- Busca la petición a /api/auth/google');
console.log('- Revisa si hay errores en la respuesta');
