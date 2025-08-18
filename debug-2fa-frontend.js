const axios = require('axios');
const { authenticator } = require('otplib');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';
const SECRET = 'KB3HEETBKVJUYEKR';
const EMAIL = 'debug2fa1755533713134@test.com';
const PASSWORD = 'Test123!';

async function debug2FAFrontend() {
  try {
    console.log('🔍 Diagnosticando problema 2FA desde frontend...\n');
    
    // 1. Hacer login
    console.log('1. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    console.log('   ✅ Login exitoso');
    console.log('   📋 Respuesta completa:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.data?.token || loginResponse.data.token;
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación');
    }
    console.log(`   🔑 Token: ${token.substring(0, 20)}...`);

    // 2. Generar código actual
    console.log('\n2. 🔐 Generando código TOTP actual...');
    const currentCode = authenticator.generate(SECRET);
    console.log(`   📋 Código actual: ${currentCode}`);
    
    // Generar códigos para diferentes momentos
    const now = Math.floor(Date.now() / 1000);
    const codes = [];
    for (let i = -2; i <= 2; i++) {
      const time = now + (i * 30);
      const code = authenticator.generate(SECRET, time);
      codes.push({
        time: new Date(time * 1000).toLocaleTimeString(),
        code: code
      });
    }

    console.log('   📋 Códigos disponibles:');
    codes.forEach((item, index) => {
      console.log(`   ${index === 2 ? '→' : ' '} ${item.time}: ${item.code} ${index === 2 ? '(ACTUAL)' : ''}`);
    });

    // 3. Verificar estado actual del perfil
    console.log('\n3. 🔍 Verificando estado del perfil...');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log(`   - 2FA habilitado: ${profileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);
    console.log(`   - Email: ${profileResponse.data.data.email}`);

    // 4. Probar verificación con códigos generados
    console.log('\n4. 🔐 Probando verificación con códigos generados...');
    
    for (let i = 0; i < codes.length; i++) {
      const testCode = codes[i].code;
      console.log(`   📋 Probando código: ${testCode} (${codes[i].time})`);
      
      try {
        const verifyResponse = await axios.put(`${API_URL}/profile/two-factor`, {
          enabled: true,
          code: testCode
        }, { headers });
        
        console.log(`   ✅ ¡ÉXITO! Código ${testCode} funcionó`);
        console.log(`   📋 Respuesta:`, verifyResponse.data);
        break;
      } catch (error) {
        console.log(`   ❌ Falló: ${error.response?.data?.message || error.message}`);
        if (error.response?.data) {
          console.log(`   📋 Detalles:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    // 5. Verificar el estado final
    console.log('\n5. 🔍 Verificando estado final...');
    const finalProfileResponse = await axios.get(`${API_URL}/profile`, { headers });
    console.log(`   - 2FA habilitado: ${finalProfileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);

    // 6. Información para el usuario
    console.log('\n📱 Información para pruebas manuales:');
    console.log(`   - Email: ${EMAIL}`);
    console.log(`   - Password: ${PASSWORD}`);
    console.log(`   - Secret: ${SECRET}`);
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
debug2FAFrontend();
