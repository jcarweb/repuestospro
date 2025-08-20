const webpush = require('web-push');

// Generar claves VAPID
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 Claves VAPID generadas:');
console.log('');
console.log('📋 VAPID_PUBLIC_KEY:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('🔐 VAPID_PRIVATE_KEY:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('📝 Agrega estas claves a tu archivo .env:');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('✅ También agrega la clave pública al frontend (.env):');
console.log('VITE_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
