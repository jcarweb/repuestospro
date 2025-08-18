const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function testNewUserLogin() {
  try {
    console.log('🔐 Probando login con usuario nuevo...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'nuevo@test.com',
      password: 'Test123!'
    });
    
    console.log('✅ Login exitoso:', loginResponse.data.success);
    console.log('Token:', loginResponse.data.data.token);
    
  } catch (error) {
    console.log('❌ Error login:', error.response?.data?.message || error.message);
  }
}

testNewUserLogin();
