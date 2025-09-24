const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando archivo .env para el backend...\n');

const envContent = `# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de JWT
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=24h

# Configuración de MongoDB (REEMPLAZA CON TUS CREDENCIALES)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/repuestos-pro?retryWrites=true&w=majority

# Configuración de CORS
CORS_ORIGIN=*

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300

# Configuración de argon2
ARGON2_MEMORY_COST=65536

# Configuración de Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@piezasya.com
EMAIL_PASS=tu-password-de-email

# Configuración de Google OAuth (OPCIONAL - puedes dejar vacío)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Configuración de Cloudinary (OPCIONAL - puedes dejar vacío)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Configuración de VAPID para notificaciones push (REEMPLAZA CON TUS CREDENCIALES)
VAPID_PUBLIC_KEY=tu-vapid-public-key
VAPID_PRIVATE_KEY=tu-vapid-private-key

# URL del frontend
FRONTEND_URL=http://localhost:3000`;

const envPath = path.join(__dirname, '.env');

try {
  // Verificar si ya existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env ya existe.');
    console.log('📝 Si quieres recrearlo, elimínalo primero y ejecuta este script nuevamente.');
    return;
  }

  // Crear el archivo .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Archivo .env creado exitosamente!');
  console.log('\n📋 INSTRUCCIONES:');
  console.log('1. Abre el archivo .env que se acaba de crear');
  console.log('2. Reemplaza las siguientes variables con tus credenciales reales:');
  console.log('   - MONGODB_URI: Tu conexión a MongoDB en la nube');
  console.log('   - VAPID_PUBLIC_KEY: Tu clave pública VAPID');
  console.log('   - VAPID_PRIVATE_KEY: Tu clave privada VAPID');
  console.log('   - EMAIL_PASS: Tu contraseña de email (si usas email)');
  console.log('\n3. Guarda el archivo y ejecuta: npm start');
  console.log('\n🔗 El servidor se ejecutará en: http://192.168.0.106:5000');
  
} catch (error) {
  console.error('❌ Error creando el archivo .env:', error.message);
  console.log('\n📝 Puedes crear el archivo manualmente copiando el contenido de arriba.');
}
