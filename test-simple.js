const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function testSimple() {
  try {
    // Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Probar solo cambiar contraseña
    console.log('\n🔐 Probando cambio de contraseña...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const passwordResponse = await axios.put(`${API_URL}/profile/password`, {
      currentPassword: 'Test123!',
      newPassword: 'NewTest123!'
    }, { headers });
    
    console.log('✅ Respuesta:', passwordResponse.data);
    
  } catch (error) {
    console.log('❌ Error completo:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
  }
}

testSimple();
