require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('🚨 DEBUG: URL EXACTA DEL ERROR redirect_uri_mismatch\n');

// Obtener la URL exacta del .env
const redirectURI = process.env.GOOGLE_CALLBACK_URL;

console.log('📋 ANÁLISIS DEL ERROR:');
console.log('Tu aplicación está enviando esta URL:');
console.log(`"${redirectURI}"`);

console.log('\n🔍 VERIFICACIÓN CRÍTICA:');
console.log('1. Ve a Google Cloud Console');
console.log('2. APIs & Services > Credentials');
console.log('3. Edita tu OAuth 2.0 Client ID');
console.log('4. En "Authorized redirect URIs" DEBE estar EXACTAMENTE:');
console.log(`   "${redirectURI}"`);
console.log('   "http://localhost:3000/google-callback"');

console.log('\n⚠️  PROBLEMAS COMUNES:');
console.log('- Espacios invisibles al final de la URL');
console.log('- URLs con barras extra al final');
console.log('- URLs duplicadas o similares');
console.log('- URLs con caracteres especiales');

console.log('\n🧪 PRUEBA DE COMPARACIÓN:');
console.log('Copia esta URL exacta y compárala con la de Google Cloud Console:');
console.log(`"${redirectURI}"`);

console.log('\n🔧 SOLUCIÓN PASO A PASO:');
console.log('1. En Google Cloud Console, ELIMINA todas las URLs existentes');
console.log('2. Agrega SOLO estas dos URLs:');
console.log(`   - "${redirectURI}"`);
console.log('   - "http://localhost:3000/google-callback"');
console.log('3. Haz clic en SAVE');
console.log('4. Espera 10 minutos');
console.log('5. Reinicia tu servidor backend');
console.log('6. Prueba en modo incógnito');

console.log('\n🚨 SI EL ERROR PERSISTE:');
console.log('- Verifica que no haya URLs similares como:');
console.log('  * http://localhost:5000/api/auth/google/callback/');
console.log('  * http://localhost:5000/api/auth/google/callback ');
console.log('  * http://localhost:5000/api/auth/google/callback');
console.log('- Asegúrate de que solo tengas las 2 URLs exactas');
console.log('- Limpia el caché del navegador');
console.log('- Prueba en modo incógnito');
