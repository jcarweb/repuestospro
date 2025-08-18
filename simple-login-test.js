const axios = require('axios');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';
const EMAIL = 'debug2fa1755533713134@test.com';
const PASSWORD = 'Test123!';

async function simpleLoginTest() {
  try {
    console.log('🔍 Probando login simple...\n');
    
    // 1. Hacer login
    console.log('1. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    console.log('   ✅ Login exitoso');
    console.log('   📋 Respuesta completa:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    // 2. Extraer token
    const responseData = loginResponse.data;
    let token = null;
    
    if (responseData.data && responseData.data.token) {
      token = responseData.data.token;
    } else if (responseData.token) {
      token = responseData.token;
    } else if (responseData.accessToken) {
      token = responseData.accessToken;
    }
    
    if (!token) {
      console.log('   ❌ No se pudo encontrar el token en la respuesta');
      console.log('   📋 Estructura de la respuesta:');
      console.log(Object.keys(responseData));
      return;
    }
    
    console.log(`   🔑 Token encontrado: ${token.substring(0, 20)}...`);
    
    // 3. Probar endpoint de perfil
    console.log('\n2. 🔍 Probando endpoint de perfil...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
      console.log('   ✅ Perfil obtenido correctamente');
      console.log(`   - 2FA habilitado: ${profileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);
      console.log(`   - Email: ${profileResponse.data.data.email}`);
    } catch (profileError) {
      console.log('   ❌ Error al obtener perfil:', profileError.response?.data?.message || profileError.message);
    }
    
  } catch (error) {
    console.error('❌ Error en el login:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar prueba
simpleLoginTest();
