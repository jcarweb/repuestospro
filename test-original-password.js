const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function testOriginalPassword() {
  try {
    // Login con contraseña original
    console.log('🔐 Probando login con contraseña original...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    console.log('✅ Login exitoso:', loginResponse.data.success);
    
  } catch (error) {
    console.log('❌ Error login:', error.response?.data?.message || error.message);
  }
}

testOriginalPassword();
