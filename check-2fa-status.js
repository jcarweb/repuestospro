const axios = require('axios');
const { authenticator } = require('otplib');

// Configuración
const API_URL = 'http://127.0.0.1:5000/api';
const SECRET = 'KB3HEETBKVJUYEKR';
const EMAIL = 'debug2fa1755533713134@test.com';
const PASSWORD = 'Test123!';

async function check2FAStatus() {
  try {
    console.log('🔍 Verificando estado de 2FA...\n');
    
    // 1. Hacer login
    console.log('1. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    console.log('   ✅ Login exitoso');
    
    // Verificar si requiere 2FA
    if (loginResponse.data.requiresTwoFactor) {
      console.log('   🔐 Usuario tiene 2FA habilitado');
      console.log(`   🔑 TempToken: ${loginResponse.data.tempToken.substring(0, 20)}...`);
      
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

      // 3. Completar login con 2FA
      console.log('\n3. 🔐 Completando login con 2FA...');
      const verifyResponse = await axios.post(`${API_URL}/auth/verify-2fa`, {
        tempToken: loginResponse.data.tempToken,
        code: currentCode
      });
      
      console.log('   ✅ Verificación 2FA exitosa');
      console.log(`   🔑 Token final: ${verifyResponse.data.data.token.substring(0, 20)}...`);
      
      // 4. Obtener perfil completo
      console.log('\n4. 🔍 Obteniendo perfil completo...');
      const headers = {
        'Authorization': `Bearer ${verifyResponse.data.data.token}`,
        'Content-Type': 'application/json'
      };

      const profileResponse = await axios.get(`${API_URL}/profile`, { headers });
      console.log('   ✅ Perfil obtenido correctamente');
      console.log(`   - 2FA habilitado: ${profileResponse.data.data.twoFactorEnabled ? 'Sí' : 'No'}`);
      console.log(`   - Email: ${profileResponse.data.data.email}`);
      console.log(`   - Secret: ${profileResponse.data.data.twoFactorSecret || 'No disponible'}`);
      
    } else {
      console.log('   ❌ Usuario no tiene 2FA habilitado');
    }
    
    // 5. Información para el usuario
    console.log('\n📱 Información para pruebas manuales:');
    console.log(`   - Email: ${EMAIL}`);
    console.log(`   - Password: ${PASSWORD}`);
    console.log(`   - Secret: ${SECRET}`);
    console.log(`   - Código actual: ${authenticator.generate(SECRET)}`);
    
    console.log('\n💡 Estado actual:');
    console.log('   - El usuario YA TIENE 2FA HABILITADO');
    console.log('   - En el frontend debería mostrar "Activada" en lugar de "Inactiva"');
    console.log('   - El botón debería decir "Desactivar" en lugar de "Activar"');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar verificación
check2FAStatus();
