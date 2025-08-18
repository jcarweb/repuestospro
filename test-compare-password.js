const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function testComparePassword() {
  try {
    // Login
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Probar cambiar contraseña con contraseña incorrecta
    console.log('\n🔐 Probando con contraseña incorrecta...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      const passwordResponse = await axios.put(`${API_URL}/profile/password`, {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewTest123!'
      }, { headers });
      
      console.log('❌ No debería funcionar:', passwordResponse.data);
    } catch (error) {
      console.log('✅ Error esperado:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.response?.data?.message || error.message);
  }
}

testComparePassword();
