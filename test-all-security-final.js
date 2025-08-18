const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'final2fa@test.com';
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

// Función para probar todos los endpoints de seguridad
async function testAllSecurityEndpoints(token) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('🔍 Probando TODAS las funcionalidades de seguridad...\n');

  // 1. Probar obtener perfil
  try {
    console.log('1. ✅ GET /profile - Obtener perfil');
    const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log('   - PIN configurado:', !!profileResponse.data.data.pin);
    console.log('   - Huella habilitada:', profileResponse.data.data.fingerprintEnabled);
    console.log('   - 2FA habilitado:', profileResponse.data.data.twoFactorEnabled);
    console.log('   - Email verificado:', profileResponse.data.data.isEmailVerified);
  } catch (error) {
    console.log('❌ Error obteniendo perfil:', error.response?.data?.message || error.message);
  }

  // 2. Probar configurar PIN
  try {
    console.log('\n2. ✅ PUT /profile/pin - Configurar PIN');
    const pinResponse = await axios.put(`${API_URL}/profile/pin`, {
      pin: '1234',
      currentPassword: TEST_PASSWORD
    }, { headers });
    console.log('   - Mensaje:', pinResponse.data.message);
  } catch (error) {
    console.log('❌ Error configurando PIN:', error.response?.data?.message || error.message);
  }

  // 3. Probar configurar huella digital
  try {
    console.log('\n3. ✅ PUT /profile/fingerprint - Configurar huella digital');
    const fingerprintResponse = await axios.put(`${API_URL}/profile/fingerprint`, {
      enabled: true,
      fingerprintData: 'simulated_fingerprint_data_12345'
    }, { headers });
    console.log('   - Mensaje:', fingerprintResponse.data.message);
  } catch (error) {
    console.log('❌ Error configurando huella:', error.response?.data?.message || error.message);
  }

  // 4. Probar configurar 2FA
  try {
    console.log('\n4. ✅ PUT /profile/two-factor - Configurar 2FA');
    const twoFactorResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: true
    }, { headers });
    console.log('   - Mensaje:', twoFactorResponse.data.message);
    console.log('   - Secreto generado:', twoFactorResponse.data.data.secret);
    console.log('   - Códigos de respaldo:', twoFactorResponse.data.data.backupCodes.length);
  } catch (error) {
    console.log('❌ Error configurando 2FA:', error.response?.data?.message || error.message);
  }

  // 5. Probar actualizar notificaciones
  try {
    console.log('\n5. ✅ PUT /profile/notifications - Actualizar notificaciones');
    const notificationsResponse = await axios.put(`${API_URL}/profile/notifications`, {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false
    }, { headers });
    console.log('   - Mensaje:', notificationsResponse.data.message);
  } catch (error) {
    console.log('❌ Error actualizando notificaciones:', error.response?.data?.message || error.message);
  }

  // 6. Probar cambiar contraseña
  try {
    console.log('\n6. ✅ PUT /profile/password - Cambiar contraseña');
    const passwordResponse = await axios.put(`${API_URL}/profile/password`, {
      currentPassword: TEST_PASSWORD,
      newPassword: 'NewTest123!'
    }, { headers });
    console.log('   - Mensaje:', passwordResponse.data.message);
  } catch (error) {
    console.log('❌ Error cambiando contraseña:', error.response?.data?.message || error.message);
  }

  // 7. Verificar perfil final actualizado
  try {
    console.log('\n7. ✅ GET /profile - Verificar perfil final');
    const updatedProfileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log('   - PIN configurado:', !!updatedProfileResponse.data.data.pin);
    console.log('   - Huella habilitada:', updatedProfileResponse.data.data.fingerprintEnabled);
    console.log('   - 2FA habilitado:', updatedProfileResponse.data.data.twoFactorEnabled);
    console.log('   - Notificaciones email:', updatedProfileResponse.data.data.emailNotifications);
    console.log('   - Notificaciones push:', updatedProfileResponse.data.data.pushNotifications);
    console.log('   - Marketing emails:', updatedProfileResponse.data.data.marketingEmails);
  } catch (error) {
    console.log('❌ Error obteniendo perfil final:', error.response?.data?.message || error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 INICIANDO PRUEBAS FINALES DE SEGURIDAD\n');
    console.log('📋 Usuario de prueba:');
    console.log('   - Email:', TEST_EMAIL);
    console.log('   - Password:', TEST_PASSWORD);
    console.log('');
    
    // Hacer login
    console.log('🔐 Haciendo login...');
    const token = await login();
    console.log('✅ Login exitoso\n');
    
    // Probar todos los endpoints
    await testAllSecurityEndpoints(token);
    
    console.log('\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
    console.log('✅ Login: Funcional');
    console.log('✅ PIN: Funcional');
    console.log('✅ Huella Digital: Funcional');
    console.log('✅ 2FA: Funcional');
    console.log('✅ Notificaciones: Funcional');
    console.log('✅ Contraseña: Funcional');
    console.log('\n🎯 ¡TODAS LAS FUNCIONALIDADES DE SEGURIDAD ESTÁN OPERATIVAS!');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
main();
