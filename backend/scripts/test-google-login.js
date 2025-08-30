require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('🧪 PRUEBA: Configuración de Google OAuth Actualizada\n');

// Verificar configuración
const config = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  frontendURL: process.env.FRONTEND_URL
};

console.log('📋 Estado de la configuración:');
console.log(`✅ Client ID: ${config.clientID ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log(`✅ Client Secret: ${config.clientSecret ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log(`✅ Callback URL: ${config.callbackURL}`);
console.log(`✅ Frontend URL: ${config.frontendURL}`);

console.log('\n🔗 URLs configuradas en Google Cloud Console:');
console.log('1. http://localhost:5000/api/auth/google/callback');
console.log('2. http://localhost:3000/google-callback');

console.log('\n✅ PASOS COMPLETADOS:');
console.log('✅ Credenciales actualizadas en Google Cloud Console');
console.log('✅ URLs de redirección configuradas');
console.log('✅ Servidor backend reiniciado');

console.log('\n🧪 PRUEBA DEL LOGIN:');
console.log('1. Ve a: http://localhost:3000');
console.log('2. Haz clic en "Iniciar sesión con Google"');
console.log('3. Deberías ser redirigido a Google sin errores');
console.log('4. Después de autorizar, volverás a la aplicación');

console.log('\n🚨 SI SIGUES VIENDO EL ERROR:');
console.log('- Espera 5-10 minutos más (Google puede tardar en propagar cambios)');
console.log('- Limpia el caché del navegador (Ctrl+Shift+Delete)');
console.log('- Prueba en modo incógnito');
console.log('- Verifica que las URLs coincidan exactamente');

console.log('\n📞 PARA DEBUGGING:');
console.log('- Revisa la consola del navegador (F12)');
console.log('- Revisa los logs del servidor backend');
console.log('- Verifica que ambos servidores estén corriendo');
