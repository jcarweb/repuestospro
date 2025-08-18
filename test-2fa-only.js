const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function test2FAOnly() {
  try {
    // Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'final2fa@test.com',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Probar solo 2FA
    console.log('\n🔐 Probando 2FA...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const twoFactorResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: true
    }, { headers });
    
    console.log('✅ Respuesta 2FA:', twoFactorResponse.data);
    
  } catch (error) {
    console.log('❌ Error completo:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
  }
}

test2FAOnly();
