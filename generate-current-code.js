const { authenticator } = require('otplib');

// Configuración
const SECRET = 'KB3HEETBKVJUYEKR'; // Secret del usuario de prueba

function generateCurrentCode() {
  console.log('🔐 Generando código TOTP actual...\n');
  
  // Generar código actual
  const currentCode = authenticator.generate(SECRET);
  
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

  console.log('📋 Códigos disponibles:');
  codes.forEach((item, index) => {
    console.log(`   ${index === 2 ? '→' : ' '} ${item.time}: ${item.code} ${index === 2 ? '(ACTUAL)' : ''}`);
  });

  console.log('\n💡 Instrucciones:');
  console.log('   1. Usa el código marcado como "(ACTUAL)"');
  console.log('   2. Si no funciona, prueba con el código anterior o siguiente');
  console.log('   3. Los códigos cambian cada 30 segundos');
  console.log('   4. Ejecuta este script nuevamente si necesitas un código actualizado');
  
  console.log('\n🔑 Información del usuario:');
  console.log('   - Email: debug2fa1755533713134@test.com');
  console.log('   - Password: Test123!');
  console.log('   - Secret: KB3HEETBKVJUYEKR');
}

// Ejecutar
generateCurrentCode();
