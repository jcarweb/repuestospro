const axios = require('axios');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';
const FRONTEND_URL = 'http://127.0.0.1:5173';

async function testFrontend2FA() {
  try {
    console.log('🌐 Probando flujo completo de 2FA desde el frontend...\n');
    
    // 1. Crear un usuario de prueba
    const timestamp = Date.now();
    const userData = {
      name: 'Usuario Frontend 2FA',
      email: `frontend2fa${timestamp}@test.com`,
      password: 'Test123!',
      phone: '1234567890',
      role: 'client'
    };

    console.log('1. 📝 Creando usuario de prueba...');
    console.log(`   📧 Email: ${userData.email}`);
    
    const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('   ✅ Usuario creado exitosamente');

    // 2. Hacer login
    console.log('\n2. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    
    const token = loginResponse.data.data.token;
    console.log('   ✅ Login exitoso');

    // 3. Obtener perfil del usuario
    console.log('\n3. 👤 Obteniendo perfil del usuario...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log('   ✅ Perfil obtenido');
    console.log(`   - 2FA habilitado: ${profileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);

    // 4. Probar activación de 2FA
    console.log('\n4. 🔐 Activando 2FA...');
    const twoFactorResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: true
    }, { headers });

    console.log('   ✅ 2FA activado exitosamente');
    console.log('   📋 Datos generados:');
    console.log(`   - Secret: ${twoFactorResponse.data.data.secret}`);
    console.log(`   - Backup Codes: ${twoFactorResponse.data.data.backupCodes.length} códigos`);
    console.log(`   - Google Auth URL: ${twoFactorResponse.data.data.googleAuthUrl ? '✅ Generada' : '❌ No generada'}`);

    // 5. Verificar que el perfil se actualizó
    console.log('\n5. 🔍 Verificando actualización del perfil...');
    const updatedProfileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log(`   - 2FA habilitado: ${updatedProfileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);

    // 6. Probar verificación con código de respaldo
    console.log('\n6. 🔐 Probando verificación con código de respaldo...');
    const backupCode = twoFactorResponse.data.data.backupCodes[0];
    console.log(`   📋 Usando código de respaldo: ${backupCode}`);
    
    try {
      const verifyResponse = await axios.put(`${API_URL}/profile/two-factor`, {
        enabled: true,
        code: backupCode
      }, { headers });
      
      console.log('   ✅ Verificación exitosa');
    } catch (error) {
      console.log(`   ❌ Error en verificación: ${error.response?.data?.message || error.message}`);
    }

    // 7. Probar desactivación de 2FA
    console.log('\n7. 🔐 Desactivando 2FA...');
    const disableResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: false
    }, { headers });
    
    console.log('   ✅ 2FA desactivado exitosamente');

    // 8. Verificar que el perfil se actualizó
    console.log('\n8. 🔍 Verificando desactivación...');
    const finalProfileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log(`   - 2FA habilitado: ${finalProfileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);

    console.log('\n🎉 ¡Prueba del flujo completo completada!');
    console.log('\n📱 Para probar en el frontend:');
    console.log(`1. Ve a ${FRONTEND_URL}`);
    console.log(`2. Inicia sesión con: ${userData.email} / ${userData.password}`);
    console.log('3. Ve a la sección de Seguridad');
    console.log('4. Haz clic en "Configurar" en la sección de Autenticación de dos factores');
    console.log('5. Escanea el código QR con Google Authenticator');
    console.log('6. Ingresa el código de 6 dígitos para verificar');
    
    // 9. Mostrar información para pruebas manuales
    console.log('\n🔧 Información para pruebas manuales:');
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - Password: ${userData.password}`);
    console.log(`   - Secret: ${twoFactorResponse.data.data.secret}`);
    console.log(`   - Backup Codes: ${twoFactorResponse.data.data.backupCodes.join(', ')}`);
    console.log(`   - Google Auth URL: ${twoFactorResponse.data.data.googleAuthUrl}`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar prueba
testFrontend2FA();
