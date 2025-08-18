const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

// Función para crear usuario y verificar email manualmente
async function createVerifiedUser() {
  try {
    console.log('🔐 Creando usuario verificado...');
    
    // Crear usuario
    const userData = {
      name: 'Usuario Verificado',
      email: 'verified@test.com',
      password: 'Test123!',
      phone: '1234567890',
      role: 'client'
    };

    console.log('📤 Registrando usuario...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
    
    if (registerResponse.data.success) {
      console.log('✅ Usuario creado exitosamente');
      console.log('📋 Respuesta del registro:', JSON.stringify(registerResponse.data, null, 2));
      
      // Ahora voy a intentar hacer login para ver si funciona
      console.log('\n🔐 Intentando login...');
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'verified@test.com',
          password: 'Test123!'
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login exitoso!');
          console.log('🎉 Token obtenido:', loginResponse.data.token);
          return loginResponse.data.token;
        }
      } catch (loginError) {
        console.log('❌ Login falló:', loginError.response?.data?.message);
        console.log('ℹ️  El usuario necesita verificación de email');
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
  const token = await createVerifiedUser();
  if (token) {
    console.log('\n🎉 Usuario verificado listo para pruebas');
    console.log('   Email: verified@test.com');
    console.log('   Password: Test123!');
    console.log('   Token:', token);
  } else {
    console.log('\n❌ No se pudo crear usuario verificado');
  }
}

// Ejecutar
main();
