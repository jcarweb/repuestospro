const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

// Función para verificar email usando token directo
async function verifyEmailDirectly() {
  try {
    console.log('🔐 Verificando email directamente...');
    
    // Primero, voy a intentar hacer login para ver si el usuario ya está verificado
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'Test123!'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Usuario ya verificado y login exitoso');
        return loginResponse.data.token;
      }
    } catch (loginError) {
      console.log('ℹ️  Usuario no verificado, procediendo con verificación...');
    }

    // Si no está verificado, voy a crear un nuevo usuario sin verificación
    console.log('🔄 Creando nuevo usuario sin verificación...');
    
    const userData = {
      name: 'Usuario Prueba 2',
      email: 'test2@example.com',
      password: 'Test123!',
      phone: '1234567890',
      role: 'client'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
    
    if (registerResponse.data.success) {
      console.log('✅ Usuario creado exitosamente');
      
      // Ahora voy a intentar hacer login inmediatamente
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'test2@example.com',
          password: 'Test123!'
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login exitoso con nuevo usuario');
          return loginResponse.data.token;
        }
      } catch (loginError) {
        console.log('❌ Login falló con nuevo usuario:', loginError.response?.data?.message);
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
  const token = await verifyEmailDirectly();
  if (token) {
    console.log('\n🎉 Token obtenido:', token);
    console.log('✅ Usuario listo para pruebas de seguridad');
  } else {
    console.log('\n❌ No se pudo obtener token');
  }
}

// Ejecutar
main();
