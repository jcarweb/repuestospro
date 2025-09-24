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

// Simular el proceso de login para debuggear
async function debugLogin() {
  try {
    console.log('🔍 Simulando proceso de login para usuario admin...\n');
    
    const db = mongoose.connection.db;
    
    // Simular la consulta exacta que hace el login
    console.log('1. Buscando usuario admin con la consulta del login...');
    const user = await db.collection('users').findOne({ 
      email: 'admin@repuestospro.com' 
    });
    
    if (!user) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('   - ID:', user._id);
    console.log('   - Email:', user.email);
    console.log('   - Nombre:', user.name);
    console.log('   - Role:', user.role);
    console.log('   - twoFactorEnabled:', user.twoFactorEnabled);
    console.log('   - twoFactorSecret:', user.twoFactorSecret ? 'Presente' : 'Ausente');
    console.log('   - backupCodes:', user.backupCodes ? `${user.backupCodes.length} códigos` : 'Ausentes');
    
    // Verificar la lógica de 2FA
    console.log('\n2. Verificando lógica de 2FA...');
    console.log('   - user.twoFactorEnabled =', user.twoFactorEnabled);
    console.log('   - typeof user.twoFactorEnabled =', typeof user.twoFactorEnabled);
    console.log('   - Boolean(user.twoFactorEnabled) =', Boolean(user.twoFactorEnabled));
    
    if (user.twoFactorEnabled) {
      console.log('⚠️  El usuario tiene 2FA habilitado - esto causaría que se pida código 2FA');
    } else {
      console.log('✅ El usuario NO tiene 2FA habilitado - debería permitir login directo');
    }
    
    // Verificar si hay algún problema con el valor
    console.log('\n3. Verificando valores específicos...');
    console.log('   - user.twoFactorEnabled === true:', user.twoFactorEnabled === true);
    console.log('   - user.twoFactorEnabled === false:', user.twoFactorEnabled === false);
    console.log('   - user.twoFactorEnabled === null:', user.twoFactorEnabled === null);
    console.log('   - user.twoFactorEnabled === undefined:', user.twoFactorEnabled === undefined);
    
    // Verificar otros campos relacionados
    console.log('\n4. Verificando otros campos relacionados...');
    console.log('   - isEmailVerified:', user.isEmailVerified);
    console.log('   - isActive:', user.isActive);
    console.log('   - loginAttempts:', user.loginAttempts);
    console.log('   - lockUntil:', user.lockUntil);
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Función para forzar el valor de twoFactorEnabled a false
async function forceDisable2FA() {
  try {
    console.log('🔄 Forzando twoFactorEnabled a false para usuario admin...\n');
    
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
      { email: 'admin@repuestospro.com' },
      { 
        $set: { 
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: null
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Usuario admin actualizado exitosamente');
      console.log('   - twoFactorEnabled establecido a false');
      console.log('   - twoFactorSecret eliminado');
      console.log('   - backupCodes eliminados');
    } else {
      console.log('❌ No se pudo actualizar el usuario admin');
    }
    
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'debug':
      await debugLogin();
      break;
    case 'fix':
      await forceDisable2FA();
      break;
    default:
      console.log('Uso: node debugLogin.js [debug|fix]');
      console.log('  debug - Debuggea el proceso de login');
      console.log('  fix   - Fuerza twoFactorEnabled a false');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
