const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo URLs en archivo .env');
console.log('=====================================\n');

// Verificar si existe .env
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ Archivo .env no encontrado');
  return;
}

// Leer el archivo .env actual
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 URLs actuales:');
console.log('- Backend: Puerto 5000(en lugar de 5000)');
console.log('- Frontend: Puerto 3000 (en lugar de 3000)');

// Corregir las URLs
envContent = envContent.replace(/http:\/\/localhost:5000/g, 'http://localhost:5001');
envContent = envContent.replace(/http:\/\/localhost:3000/g, 'http://localhost:3001');

// Escribir archivo .env actualizado
fs.writeFileSync(envPath, envContent);

console.log('\n✅ URLs corregidas en archivo .env:');
console.log('  ✅ CORS_ORIGIN: http://localhost:3001');
console.log('  ✅ FRONTEND_URL: http://localhost:3001');
console.log('  ✅ GOOGLE_CALLBACK_URL: http://localhost:5000/api/auth/google/callback');

console.log('\n🎯 Para probar el sistema:');
console.log('1. Reinicia el backend: npm run dev');
console.log('2. Ve a http://localhost:3000');
console.log('3. Inicia sesión como administrador');
console.log('4. Ve a "Códigos de Registro"');
console.log('5. Crea un código de registro');
console.log('6. El correo se enviará automáticamente');

console.log('\n⚠️  Nota: Los puertos cambiaron automáticamente porque 5000 y 3000 estaban ocupados'); 