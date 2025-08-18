const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

async function createFinal2FAUser() {
  try {
    console.log('🔐 Creando usuario final para prueba de 2FA...');
    
    const userData = {
      name: 'Usuario 2FA Final',
      email: 'final2fa@test.com',
      password: 'Test123!',
      phone: '1234567890',
      role: 'client'
    };

    console.log('📤 Registrando usuario...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
    
    if (registerResponse.data.success) {
      console.log('✅ Usuario creado exitosamente');
      
      // Esperar un momento para que se procese
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ahora voy a intentar hacer login
      console.log('\n🔐 Intentando login...');
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'final2fa@test.com',
          password: 'Test123!'
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login exitoso!');
          console.log('🎉 Token obtenido:', loginResponse.data.data.token);
          return loginResponse.data.data.token;
        }
      } catch (loginError) {
        console.log('❌ Error en login:', loginError.response?.data?.message || loginError.message);
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    return null;
  }
}

// Función principal
async function main() {
  const token = await createFinal2FAUser();
  if (token) {
    console.log('\n🎉 Usuario 2FA final listo para pruebas');
    console.log('   Email: final2fa@test.com');
    console.log('   Password: Test123!');
    console.log('   Token:', token);
  } else {
    console.log('\n❌ No se pudo crear usuario 2FA final');
  }
}

// Ejecutar
main();
