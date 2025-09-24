const mongoose = require('mongoose');

// Conectar a la base de datos
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para probar el login del admin
async function testAdminLogin() {
  try {
    console.log('🔍 Probando login del usuario admin...\n');
    
    // Simular la petición de login
    const loginData = {
      email: 'admin@repuestospro.com',
      password: 'admin123' // Asumiendo que esta es la contraseña
    };
    
    console.log('📤 Enviando petición de login...');
    console.log('   - Email:', loginData.email);
    console.log('   - Password:', '***');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      if (data.requiresTwoFactor) {
        console.log('\n⚠️  El login requiere 2FA (esto no debería pasar)');
        console.log('   - requiresTwoFactor:', data.requiresTwoFactor);
        console.log('   - tempToken:', data.tempToken ? 'Presente' : 'Ausente');
      } else {
        console.log('\n✅ Login exitoso sin 2FA');
        console.log('   - Token:', data.data.token ? 'Presente' : 'Ausente');
        console.log('   - Usuario:', data.data.user.name);
        console.log('   - Role:', data.data.user.role);
        console.log('   - twoFactorEnabled:', data.data.user.twoFactorEnabled);
      }
    } else {
      console.log('\n❌ Error en login:');
      console.log('   - Status:', response.status);
      console.log('   - Message:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Función para verificar la contraseña del admin
async function checkAdminPassword() {
  try {
    console.log('🔍 Verificando contraseña del usuario admin...\n');
    
    const db = mongoose.connection.db;
    const adminUser = await db.collection('users').findOne({ 
      email: 'admin@repuestospro.com' 
    });
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:');
    console.log('   - Email:', adminUser.email);
    console.log('   - Tiene password:', !!adminUser.password);
    console.log('   - Password (primeros 20 chars):', adminUser.password ? adminUser.password.substring(0, 20) + '...' : 'No tiene');
    
    // Verificar si la contraseña es la esperada
    const expectedPasswords = ['admin123', 'admin', 'password', '123456'];
    console.log('\n🔍 Contraseñas comunes a probar:');
    expectedPasswords.forEach(pwd => {
      console.log(`   - ${pwd}`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando contraseña:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testAdminLogin();
      break;
    case 'check-password':
      await checkAdminPassword();
      break;
    default:
      console.log('Uso: node testAdminLogin.js [test|check-password]');
      console.log('  test          - Prueba el login del admin');
      console.log('  check-password - Verifica la contraseña del admin');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
