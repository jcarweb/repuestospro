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

// Función para arreglar completamente el login del admin
async function fixAdminLogin() {
  try {
    console.log('🔧 Arreglando completamente el login del admin...\n');
    
    const db = mongoose.connection.db;
    
    // Buscar el usuario admin
    const adminUser = await db.collection('users').findOne({ 
      email: 'admin@repuestospro.com' 
    });
    
    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:');
    console.log('   - ID:', adminUser._id);
    console.log('   - Email:', adminUser.email);
    console.log('   - Nombre:', adminUser.name);
    console.log('   - Role:', adminUser.role);
    console.log('   - twoFactorEnabled:', adminUser.twoFactorEnabled);
    console.log('   - Tiene password:', !!adminUser.password);
    
    // Nueva contraseña
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('\n🔐 Configurando nueva contraseña...');
    console.log('   - Nueva contraseña:', newPassword);
    console.log('   - Password hasheado (primeros 20 chars):', hashedPassword.substring(0, 20) + '...');
    
    // Actualizar completamente el usuario admin
    const result = await db.collection('users').updateOne(
      { email: 'admin@repuestospro.com' },
      { 
        $set: { 
          password: hashedPassword,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: null,
          isEmailVerified: true,
          isActive: true,
          loginAttempts: 0,
          lockUntil: null
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Usuario admin actualizado exitosamente');
      console.log('   - Contraseña actualizada');
      console.log('   - 2FA deshabilitado');
      console.log('   - Cuenta desbloqueada');
      console.log('   - Email verificado');
    } else {
      console.log('❌ No se pudo actualizar el usuario admin');
    }
    
    // Verificar la actualización
    console.log('\n🔍 Verificando actualización...');
    const updatedUser = await db.collection('users').findOne({ 
      email: 'admin@repuestospro.com' 
    });
    
    if (updatedUser) {
      console.log('✅ Usuario actualizado verificado:');
      console.log('   - twoFactorEnabled:', updatedUser.twoFactorEnabled);
      console.log('   - isEmailVerified:', updatedUser.isEmailVerified);
      console.log('   - isActive:', updatedUser.isActive);
      console.log('   - loginAttempts:', updatedUser.loginAttempts);
      console.log('   - lockUntil:', updatedUser.lockUntil);
    }
    
  } catch (error) {
    console.error('❌ Error arreglando login:', error);
  }
}

// Función para probar el login
async function testLogin() {
  try {
    console.log('\n🧪 Probando login...\n');
    
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
    
    if (response.ok) {
      if (data.requiresTwoFactor) {
        console.log('\n⚠️  El login requiere 2FA');
        console.log('   - requiresTwoFactor:', data.requiresTwoFactor);
        console.log('   - Esto indica que hay un problema en el backend');
      } else {
        console.log('\n✅ Login exitoso sin 2FA');
        console.log('   - Token:', data.data.token ? 'Presente' : 'Ausente');
        console.log('   - Usuario:', data.data.user.name);
        console.log('   - Role:', data.data.user.role);
        console.log('   - twoFactorEnabled:', data.data.user.twoFactorEnabled);
        console.log('\n🎉 ¡El problema del 2FA está resuelto!');
        console.log('   - Puedes usar admin@repuestospro.com / admin123 para hacer login');
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
    case 'fix':
      await fixAdminLogin();
      break;
    case 'test':
      await testLogin();
      break;
    case 'full':
      await fixAdminLogin();
      await testLogin();
      break;
    default:
      console.log('Uso: node fixAdminLogin.js [fix|test|full]');
      console.log('  fix  - Arregla completamente el login del admin');
      console.log('  test - Prueba el login');
      console.log('  full - Ejecuta fix y test en secuencia');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
