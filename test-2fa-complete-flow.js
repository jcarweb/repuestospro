const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@repuestospro.com';
const PASSWORD = 'Test123!';
const TWO_FA_CODE = '040944'; // Código actual del usuario admin

async function test2FACompleteFlow() {
  try {
    console.log('🔍 Probando flujo completo de 2FA...\n');
    
    // 1. Hacer login para obtener tempToken
    console.log('1. 🔐 Haciendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    if (!loginResponse.data.requiresTwoFactor) {
      console.log('❌ El usuario no tiene 2FA habilitado');
      return;
    }

    console.log('✅ Login exitoso, 2FA requerido');
    console.log(`🔑 TempToken: ${loginResponse.data.tempToken.substring(0, 20)}...`);
    
    // 2. Completar login con 2FA
    console.log('\n2. 🔐 Completando login con 2FA...');
    console.log(`   Usando código: ${TWO_FA_CODE}`);
    
    const verifyResponse = await axios.post(`${API_URL}/auth/login/2fa/complete`, {
      email: EMAIL,
      code: TWO_FA_CODE,
      tempToken: loginResponse.data.tempToken
    });

    if (verifyResponse.data.success) {
      console.log('✅ Verificación 2FA exitosa');
      console.log(`🔑 Token final: ${verifyResponse.data.data.token.substring(0, 20)}...`);
      console.log(`👤 Usuario: ${verifyResponse.data.data.user.name}`);
      console.log(`📧 Email: ${verifyResponse.data.data.user.email}`);
      console.log(`🎭 Role: ${verifyResponse.data.data.user.role}`);
      
      console.log('\n🎉 ¡Flujo completo de 2FA funcionando correctamente!');
      console.log('\n💡 Ahora puedes usar este código en el frontend:');
      console.log(`   Código: ${TWO_FA_CODE}`);
      console.log('   (Este código es válido por 30 segundos)');
      
    } else {
      console.log('❌ Error en verificación 2FA:', verifyResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📋 Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

test2FACompleteFlow();
