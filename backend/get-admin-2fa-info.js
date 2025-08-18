const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@repuestospro.com';
const PASSWORD = 'Test123!';

async function getAdmin2FAInfo() {
  try {
    console.log('🔍 Obteniendo información 2FA del usuario admin...\n');
    
    // 1. Hacer login para obtener tempToken
    console.log('1. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    if (!loginResponse.data.requiresTwoFactor) {
      console.log('❌ El usuario no tiene 2FA habilitado');
      return;
    }

    console.log('✅ Login exitoso, 2FA requerido');
    console.log(`🔑 TempToken: ${loginResponse.data.tempToken.substring(0, 20)}...`);
    
    // 2. Intentar obtener información del perfil (esto podría requerir autenticación completa)
    console.log('\n2. 📋 Información del usuario:');
    console.log(`   - Email: ${loginResponse.data.data.user.email}`);
    console.log(`   - Nombre: ${loginResponse.data.data.user.name}`);
    console.log(`   - Role: ${loginResponse.data.data.user.role}`);
    console.log(`   - 2FA habilitado: ${loginResponse.data.data.user.twoFactorEnabled ? 'Sí' : 'No'}`);
    
    console.log('\n💡 Para completar el login necesitas:');
    console.log('   1. El código de Google Authenticator (6 dígitos)');
    console.log('   2. O un código de respaldo si tienes acceso');
    console.log('   3. Hacer una petición POST a /auth/login/2fa/complete');
    console.log('   4. Con el tempToken y el código');
    
    console.log('\n🔧 Opciones para obtener el código:');
    console.log('   a) Si tienes Google Authenticator configurado:');
    console.log('      - Abre la app en tu teléfono');
    console.log('      - Busca la entrada para "PiezasYA" o "admin@repuestospro.com"');
    console.log('      - Usa el código de 6 dígitos que aparece');
    console.log('   b) Si tienes códigos de respaldo:');
    console.log('      - Usa uno de los códigos de respaldo que se generaron al configurar 2FA');
    console.log('   c) Si no tienes acceso:');
    console.log('      - Necesitarás resetear la configuración 2FA desde la base de datos');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

getAdmin2FAInfo();
