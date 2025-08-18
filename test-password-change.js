const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function testPasswordChange() {
  try {
    // Login inicial
    console.log('🔐 Login inicial...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login inicial exitoso');
    
    // Cambiar contraseña
    console.log('\n🔐 Cambiando contraseña...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const passwordResponse = await axios.put(`${API_URL}/profile/password`, {
        currentPassword: 'Test123!',
        newPassword: 'NewTest123!'
      }, { headers });
      
      console.log('✅ Contraseña cambiada:', passwordResponse.data);
    } catch (error) {
      console.log('❌ Error cambiando contraseña:', error.response?.data?.message || error.message);
      return;
    }
    
    // Probar login con nueva contraseña
    console.log('\n🔐 Probando login con nueva contraseña...');
    try {
      const newLoginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'NewTest123!'
      });
      
      console.log('✅ Login con nueva contraseña exitoso:', newLoginResponse.data);
    } catch (error) {
      console.log('❌ Error login con nueva contraseña:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.response?.data?.message || error.message);
  }
}

testPasswordChange();
