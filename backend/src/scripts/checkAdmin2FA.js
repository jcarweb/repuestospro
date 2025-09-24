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

// Función para verificar el 2FA del admin
async function checkAdmin2FA() {
  try {
    console.log('🔍 Verificando configuración 2FA del usuario admin...\n');
    
    // Buscar usuario admin directamente en la colección
    const db = mongoose.connection.db;
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No se encontró usuario admin en la base de datos');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:');
    console.log('   - ID:', adminUser._id);
    console.log('   - Email:', adminUser.email);
    console.log('   - Nombre:', adminUser.name);
    console.log('   - 2FA Habilitado:', adminUser.twoFactorEnabled || false);
    console.log('   - Tiene Secreto 2FA:', !!adminUser.twoFactorSecret);
    console.log('   - Tiene Códigos de Respaldo:', !!(adminUser.backupCodes && adminUser.backupCodes.length > 0));
    
    if (adminUser.twoFactorEnabled && adminUser.twoFactorSecret) {
      console.log('\n🔍 Información del Secreto 2FA:');
      console.log('   - Secreto (primeros 10 chars):', adminUser.twoFactorSecret.substring(0, 10) + '...');
      console.log('   - Longitud del secreto:', adminUser.twoFactorSecret.length);
      
      if (adminUser.backupCodes && adminUser.backupCodes.length > 0) {
        console.log('\n🔍 Códigos de Respaldo disponibles:');
        adminUser.backupCodes.forEach((code, index) => {
          console.log(`   - Código ${index + 1}: ${code}`);
        });
        console.log('\n💡 Puedes usar cualquiera de estos códigos de respaldo para ingresar');
      } else {
        console.log('\n⚠️  No hay códigos de respaldo disponibles');
      }
      
    } else {
      console.log('\n⚠️  El usuario admin no tiene 2FA configurado correctamente');
      console.log('   - 2FA Habilitado:', adminUser.twoFactorEnabled || false);
      console.log('   - Tiene Secreto:', !!adminUser.twoFactorSecret);
    }
    
    // Verificar otros usuarios con 2FA
    console.log('\n🔍 Otros usuarios con 2FA habilitado:');
    const usersWith2FA = await db.collection('users').find({ 
      twoFactorEnabled: true,
      _id: { $ne: adminUser._id }
    }).toArray();
    
    if (usersWith2FA.length > 0) {
      usersWith2FA.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    } else {
      console.log('   - No hay otros usuarios con 2FA habilitado');
    }
    
  } catch (error) {
    console.error('❌ Error verificando 2FA:', error);
  }
}

// Función para deshabilitar 2FA del admin
async function disableAdmin2FA() {
  try {
    console.log('🔄 Deshabilitando 2FA para usuario admin...\n');
    
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
      { role: 'admin' },
      { 
        $set: { 
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: null
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ 2FA deshabilitado exitosamente para usuario admin');
      console.log('   - El usuario admin ahora puede ingresar sin 2FA');
      console.log('   - Puede configurar 2FA nuevamente desde el panel de seguridad');
    } else {
      console.log('❌ No se pudo deshabilitar el 2FA (usuario no encontrado o ya deshabilitado)');
    }
    
  } catch (error) {
    console.error('❌ Error deshabilitando 2FA:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      await checkAdmin2FA();
      break;
    case 'disable':
      await disableAdmin2FA();
      break;
    default:
      console.log('Uso: node checkAdmin2FA.js [check|disable]');
      console.log('  check   - Verifica la configuración 2FA del admin');
      console.log('  disable - Deshabilita el 2FA del admin');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
