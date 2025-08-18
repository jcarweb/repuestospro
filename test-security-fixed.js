const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'final@test.com';
const TEST_PASSWORD = 'Test123!';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (response.data.success) {
      return response.data.data.token;
    } else {
      throw new Error('Login failed');
    }
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar endpoints de seguridad
async function testSecurityEndpoints(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('🔍 Probando endpoints de seguridad...\n');

  // 1. Probar obtener perfil
  try {
    console.log('1. Probando GET /profile...');
    const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log('✅ Perfil obtenido:', profileResponse.data.success);
    console.log('   - PIN configurado:', !!profileResponse.data.data.pin);
    console.log('   - Huella habilitada:', profileResponse.data.data.fingerprintEnabled);
    console.log('   - 2FA habilitado:', profileResponse.data.data.twoFactorEnabled);
    console.log('   - Email verificado:', profileResponse.data.data.isEmailVerified);
  } catch (error) {
    console.log('❌ Error obteniendo perfil:', error.response?.data?.message || error.message);
  }

  // 2. Probar configurar PIN
  try {
    console.log('\n2. Probando PUT /profile/pin...');
    const pinResponse = await axios.put(`${API_URL}/profile/pin`, {
      pin: '1234',
      currentPassword: TEST_PASSWORD
    }, { headers });
    console.log('✅ PIN configurado:', pinResponse.data.success);
    console.log('   Mensaje:', pinResponse.data.message);
  } catch (error) {
    console.log('❌ Error configurando PIN:', error.response?.data?.message || error.message);
  }

  // 3. Probar configurar huella digital
  try {
    console.log('\n3. Probando PUT /profile/fingerprint...');
    const fingerprintResponse = await axios.put(`${API_URL}/profile/fingerprint`, {
      enabled: true,
      fingerprintData: 'simulated_fingerprint_data_12345'
    }, { headers });
    console.log('✅ Huella configurada:', fingerprintResponse.data.success);
    console.log('   Mensaje:', fingerprintResponse.data.message);
  } catch (error) {
    console.log('❌ Error configurando huella:', error.response?.data?.message || error.message);
  }

  // 4. Probar configurar 2FA
  try {
    console.log('\n4. Probando PUT /profile/two-factor...');
    const twoFactorResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: true
    }, { headers });
    console.log('✅ 2FA configurado:', twoFactorResponse.data.success);
    console.log('   Mensaje:', twoFactorResponse.data.message);
  } catch (error) {
    console.log('❌ Error configurando 2FA:', error.response?.data?.message || error.message);
  }

  // 5. Probar actualizar notificaciones
  try {
    console.log('\n5. Probando PUT /profile/notifications...');
    const notificationsResponse = await axios.put(`${API_URL}/profile/notifications`, {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false
    }, { headers });
    console.log('✅ Notificaciones actualizadas:', notificationsResponse.data.success);
    console.log('   Mensaje:', notificationsResponse.data.message);
  } catch (error) {
    console.log('❌ Error actualizando notificaciones:', error.response?.data?.message || error.message);
  }

  // 6. Probar cambiar contraseña
  try {
    console.log('\n6. Probando PUT /profile/password...');
    const passwordResponse = await axios.put(`${API_URL}/profile/password`, {
      currentPassword: TEST_PASSWORD,
      newPassword: 'NewTest123!'
    }, { headers });
    console.log('✅ Contraseña cambiada:', passwordResponse.data.success);
    console.log('   Mensaje:', passwordResponse.data.message);
  } catch (error) {
    console.log('❌ Error cambiando contraseña:', error.response?.data?.message || error.message);
  }

  // 7. Verificar perfil actualizado
  try {
    console.log('\n7. Verificando perfil actualizado...');
    const updatedProfileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log('✅ Perfil actualizado obtenido');
    console.log('   - PIN configurado:', !!updatedProfileResponse.data.data.pin);
    console.log('   - Huella habilitada:', updatedProfileResponse.data.data.fingerprintEnabled);
    console.log('   - 2FA habilitado:', updatedProfileResponse.data.data.twoFactorEnabled);
    console.log('   - Notificaciones email:', updatedProfileResponse.data.data.emailNotifications);
    console.log('   - Notificaciones push:', updatedProfileResponse.data.data.pushNotifications);
    console.log('   - Marketing emails:', updatedProfileResponse.data.data.marketingEmails);
  } catch (error) {
    console.log('❌ Error obteniendo perfil actualizado:', error.response?.data?.message || error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de seguridad con usuario corregido...\n');
    
    // Hacer login
    console.log('🔐 Haciendo login...');
    const token = await login();
    console.log('✅ Login exitoso\n');
    
    // Probar endpoints
    await testSecurityEndpoints(token);
    
    console.log('\n✅ Pruebas completadas');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
main();
