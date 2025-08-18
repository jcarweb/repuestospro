const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

// Función para hacer login
async function testLogin() {
  try {
    console.log('🔐 Probando login...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!'
    };

    console.log('📤 Enviando datos:', loginData);

    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('📋 Respuesta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Login exitoso');
      return response.data.token;
    } else {
      console.log('❌ Login falló');
      return null;
    }
  } catch (error) {
    console.log('❌ Error en login:');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
    console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
    return null;
  }
}

// Función principal
async function main() {
  const token = await testLogin();
  if (token) {
    console.log('\n🎉 Token obtenido:', token);
  } else {
    console.log('\n❌ No se pudo obtener token');
  }
}

// Ejecutar
main();
