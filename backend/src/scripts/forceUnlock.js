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

// Función para forzar el desbloqueo
async function forceUnlock() {
  try {
    console.log('🔓 Forzando desbloqueo del usuario admin...\n');
    
    const db = mongoose.connection.db;
    const email = 'admin@repuestospro.com';
    
    console.log('1. Estado actual del usuario...');
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('   - loginAttempts:', user.loginAttempts);
    console.log('   - lockUntil:', user.lockUntil);
    console.log('   - isActive:', user.isActive);
    console.log('   - twoFactorEnabled:', user.twoFactorEnabled);
    
    console.log('\n2. Forzando desbloqueo...');
    const result = await db.collection('users').updateOne(
      { email },
      { 
        $unset: { 
          loginAttempts: 1,
          lockUntil: 1
        },
        $set: {
          isActive: true,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: null,
          isEmailVerified: true
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Usuario desbloqueado exitosamente');
    } else {
      console.log('❌ No se pudo desbloquear el usuario');
    }
    
    console.log('\n3. Verificando desbloqueo...');
    const updatedUser = await db.collection('users').findOne({ email });
    
    if (updatedUser) {
      console.log('✅ Estado actualizado:');
      console.log('   - loginAttempts:', updatedUser.loginAttempts);
      console.log('   - lockUntil:', updatedUser.lockUntil);
      console.log('   - isActive:', updatedUser.isActive);
      console.log('   - twoFactorEnabled:', updatedUser.twoFactorEnabled);
      console.log('   - isEmailVerified:', updatedUser.isEmailVerified);
    }
    
  } catch (error) {
    console.error('❌ Error desbloqueando:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  await forceUnlock();
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
  console.log('\n💡 Ahora puedes intentar hacer login nuevamente');
  console.log('   - Email: admin@repuestospro.com');
  console.log('   - Password: admin123');
}

main().catch(console.error);
