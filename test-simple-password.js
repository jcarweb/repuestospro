const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function testSimplePassword() {
  try {
    // Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Probar solo obtener perfil (sin cambiar contraseña)
    console.log('\n🔐 Probando obtener perfil...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log('✅ Perfil obtenido:', profileResponse.data.success);
    
  } catch (error) {
    console.log('❌ Error completo:');
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('Message:', error.message);
  }
}

testSimplePassword();
