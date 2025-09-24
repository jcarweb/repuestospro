const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Función para resetear la contraseña del admin
async function resetAdminPassword() {
  try {
    console.log('🔄 Reseteando contraseña del usuario admin...\n');
    
    const db = mongoose.connection.db;
    
    // Nueva contraseña
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('🔐 Nueva contraseña:', newPassword);
    console.log('🔐 Password hasheado (primeros 20 chars):', hashedPassword.substring(0, 20) + '...');
    
    // Actualizar la contraseña del admin
    const result = await db.collection('users').updateOne(
      { email: 'admin@repuestospro.com' },
      { 
        $set: { 
          password: hashedPassword
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Contraseña del admin actualizada exitosamente');
      console.log('   - Email: admin@repuestospro.com');
      console.log('   - Nueva contraseña: admin123');
      console.log('   - Puedes usar estas credenciales para hacer login');
    } else {
      console.log('❌ No se pudo actualizar la contraseña (usuario no encontrado)');
    }
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
  }
}

// Función para probar el login con la nueva contraseña
async function testLogin() {
  try {
    console.log('🧪 Probando login con las nuevas credenciales...\n');
    
    const loginData = {
      email: 'admin@repuestospro.com',
      password: 'admin123'
    };
    
    console.log('📤 Enviando petición de login...');
    console.log('   - Email:', loginData.email);
    console.log('   - Password:', loginData.password);
    
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
        console.log('\n⚠️  El login requiere 2FA');
        console.log('   - Esto indica que el 2FA sigue habilitado en la base de datos');
        console.log('   - Necesitamos deshabilitarlo completamente');
      } else {
        console.log('\n✅ Login exitoso sin 2FA');
        console.log('   - Token:', data.data.token ? 'Presente' : 'Ausente');
        console.log('   - Usuario:', data.data.user.name);
        console.log('   - Role:', data.data.user.role);
        console.log('   - twoFactorEnabled:', data.data.user.twoFactorEnabled);
        console.log('\n🎉 ¡El problema del 2FA está resuelto!');
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

// Función principal
async function main() {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'reset':
      await resetAdminPassword();
      break;
    case 'test':
      await testLogin();
      break;
    case 'full':
      await resetAdminPassword();
      console.log('\n' + '='.repeat(50) + '\n');
      await testLogin();
      break;
    default:
      console.log('Uso: node resetAdminPassword.js [reset|test|full]');
      console.log('  reset - Resetea la contraseña del admin');
      console.log('  test  - Prueba el login con las nuevas credenciales');
      console.log('  full  - Ejecuta reset y test en secuencia');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
