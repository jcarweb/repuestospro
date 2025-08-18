const axios = require('axios');
const { authenticator } = require('otplib');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';

async function debug2FAVerification() {
  try {
    console.log('🔍 Diagnosticando problema de verificación 2FA...\n');
    
    // 1. Crear un usuario de prueba
    const timestamp = Date.now();
    const userData = {
      name: 'Usuario Debug 2FA',
      email: `debug2fa${timestamp}@test.com`,
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

    // 3. Activar 2FA
    console.log('\n3. 🔐 Activando 2FA...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const twoFactorResponse = await axios.put(`${API_URL}/profile/two-factor`, {
      enabled: true
    }, { headers });

    console.log('   ✅ 2FA activado exitosamente');
    const secret = twoFactorResponse.data.data.secret;
    console.log(`   🔑 Secret: ${secret}`);

    // 4. Generar códigos TOTP localmente para comparar
    console.log('\n4. 🔍 Generando códigos TOTP para comparación...');
    
    // Generar códigos para diferentes momentos
    const now = Math.floor(Date.now() / 1000);
    const codes = [];
    
    for (let i = -2; i <= 2; i++) {
      const time = now + (i * 30); // 30 segundos por código
      const code = authenticator.generate(secret, time);
      codes.push({
        time: new Date(time * 1000).toLocaleTimeString(),
        code: code
      });
    }

    console.log('   📋 Códigos generados:');
    codes.forEach((item, index) => {
      console.log(`   ${index === 2 ? '→' : ' '} ${item.time}: ${item.code} ${index === 2 ? '(actual)' : ''}`);
    });

    // 5. Probar verificación con códigos generados
    console.log('\n5. 🔐 Probando verificación con códigos generados...');
    
    for (let i = 0; i < codes.length; i++) {
      const testCode = codes[i].code;
      console.log(`   📋 Probando código: ${testCode} (${codes[i].time})`);
      
      try {
        const verifyResponse = await axios.put(`${API_URL}/profile/two-factor`, {
          enabled: true,
          code: testCode
        }, { headers });
        
        console.log(`   ✅ ¡ÉXITO! Código ${testCode} funcionó`);
        break;
      } catch (error) {
        console.log(`   ❌ Falló: ${error.response?.data?.message || error.message}`);
      }
    }

    // 6. Verificar el estado final
    console.log('\n6. 🔍 Verificando estado final...');
    const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log(`   - 2FA habilitado: ${profileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);

    // 7. Información para el usuario
    console.log('\n📱 Información para pruebas manuales:');
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - Password: ${userData.password}`);
    console.log(`   - Secret: ${secret}`);
    console.log(`   - Código actual: ${codes[2].code}`);
    console.log(`   - Código anterior: ${codes[1].code}`);
    console.log(`   - Código siguiente: ${codes[3].code}`);
    
    console.log('\n💡 Recomendaciones:');
    console.log('   1. Usa el código "actual" que aparece arriba');
    console.log('   2. Si no funciona, prueba con el código "anterior" o "siguiente"');
    console.log('   3. Los códigos cambian cada 30 segundos');
    console.log('   4. Asegúrate de que el tiempo de tu dispositivo esté sincronizado');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar diagnóstico
debug2FAVerification();
