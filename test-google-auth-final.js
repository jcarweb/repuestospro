const axios = require('axios');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';

async function testGoogleAuthenticatorFinal() {
  try {
    console.log('🔐 Probando funcionalidad de Google Authenticator...\n');
    
    // 1. Crear un usuario de prueba con email único
    const timestamp = Date.now();
    const userData = {
      name: 'Usuario Google Auth Final',
      email: `googleauth${timestamp}@test.com`,
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
    console.log(`   🔑 Token: ${token.substring(0, 20)}...`);

    // 3. Probar activación de 2FA
    console.log('\n3. 🔐 Activando 2FA...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const twoFactorResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: true
    }, { headers });

    console.log('   ✅ 2FA activado exitosamente');
    console.log('   📋 Respuesta completa:');
    console.log(`   - Secret: ${twoFactorResponse.data.data.secret}`);
    console.log(`   - Backup Codes: ${twoFactorResponse.data.data.backupCodes.length} códigos`);
    console.log(`   - Google Auth URL: ${twoFactorResponse.data.data.googleAuthUrl ? '✅ Generada' : '❌ No generada'}`);

    // 4. Verificar que la URL de Google Authenticator es válida
    if (twoFactorResponse.data.data.googleAuthUrl) {
      const url = twoFactorResponse.data.data.googleAuthUrl;
      console.log('\n4. 🔍 Verificando URL de Google Authenticator...');
      console.log(`   📱 URL generada: ${url}`);
      
      // Verificar que la URL tiene el formato correcto
      if (url.startsWith('otpauth://totp/')) {
        console.log('   ✅ Formato de URL correcto');
        
        // Extraer información de la URL
        const urlParts = url.split('?');
        const baseUrl = urlParts[0];
        const params = urlParts[1];
        
        console.log('   📋 Información de la URL:');
        console.log(`   - Base URL: ${baseUrl}`);
        console.log(`   - Parámetros: ${params}`);
        
        // Verificar que contiene el secreto
        if (params.includes('secret=')) {
          console.log('   ✅ Contiene secreto');
        } else {
          console.log('   ❌ No contiene secreto');
        }
        
        // Verificar que contiene el issuer
        if (params.includes('issuer=')) {
          console.log('   ✅ Contiene issuer');
        } else {
          console.log('   ❌ No contiene issuer');
        }
      } else {
        console.log('   ❌ Formato de URL incorrecto');
      }
    }

    // 5. Probar verificación con un código de respaldo
    console.log('\n5. 🔐 Probando verificación con código de respaldo...');
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

    console.log('\n🎉 ¡Prueba de Google Authenticator completada!');
    console.log('\n📱 Para usar en Google Authenticator:');
    console.log('1. Abre Google Authenticator en tu dispositivo');
    console.log('2. Toca el botón "+"');
    console.log('3. Selecciona "Escanear código QR"');
    console.log('4. Escanea el código QR que aparece en la aplicación web');
    console.log('5. O ingresa manualmente el código secreto');
    
    // 6. Mostrar información para pruebas manuales
    console.log('\n🔧 Información para pruebas manuales:');
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - Password: ${userData.password}`);
    console.log(`   - Secret: ${twoFactorResponse.data.data.secret}`);
    console.log(`   - Backup Codes: ${twoFactorResponse.data.data.backupCodes.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar prueba
testGoogleAuthenticatorFinal();
