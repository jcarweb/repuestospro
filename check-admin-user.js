const axios = require('axios');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';
const EMAIL = 'admin@repuestospro.com';
const PASSWORD = 'Test123!';

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuario admin...\n');
    
    // 1. Hacer login
    console.log('1. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    console.log('   ✅ Login exitoso');
    console.log('   📋 Respuesta completa:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    // Verificar si requiere 2FA
    if (loginResponse.data.requiresTwoFactor) {
      console.log('\n🔐 Usuario tiene 2FA habilitado');
      console.log(`🔑 TempToken: ${loginResponse.data.tempToken.substring(0, 20)}...`);
      console.log('\n💡 Para completar el login necesitas:');
      console.log('   1. El código de Google Authenticator');
      console.log('   2. Hacer una petición POST a /auth/verify-2fa');
      console.log('   3. Con el tempToken y el código');
    } else {
      console.log('\n✅ Usuario no tiene 2FA habilitado');
      console.log(`🔑 Token: ${loginResponse.data.data.token.substring(0, 20)}...`);
    }
    
  } catch (error) {
    console.error('❌ Error en el login:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar verificación
checkAdminUser();
