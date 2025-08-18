const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';

// Función para crear usuario de prueba
async function createTestUser() {
  try {
    console.log('🔐 Creando usuario de prueba...');
    
    const userData = {
      name: 'Usuario Prueba',
      email: 'test@example.com',
      password: 'Test123!',
      phone: '1234567890',
      role: 'client'
    };

    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    console.log('📋 Respuesta completa del registro:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Usuario creado exitosamente');
      console.log('   - Email:', userData.email);
      console.log('   - Contraseña:', userData.password);
      
      if (response.data.token) {
        console.log('   - Token:', response.data.token);
        return response.data.token;
      } else {
        console.log('ℹ️  No se devolvió token, intentando login...');
        return await loginExistingUser();
      }
    } else {
      throw new Error('Error creando usuario');
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('ya existe')) {
      console.log('ℹ️  El usuario ya existe, intentando login...');
      return await loginExistingUser();
    } else {
      console.error('❌ Error creando usuario:', error.response?.data?.message || error.message);
      throw error;
    }
  }
}

// Función para hacer login con usuario existente
async function loginExistingUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    console.log('📋 Respuesta completa del login:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Login exitoso con usuario existente');
      return response.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    const token = await createTestUser();
    console.log('\n🎉 Usuario de prueba listo para usar');
    console.log('   Token:', token);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
main();
