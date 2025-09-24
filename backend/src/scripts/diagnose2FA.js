const mongoose = require('mongoose');
const path = require('path');

// Configurar las rutas correctas
const User = require(path.join(__dirname, '../models/User'));
const { verifyTwoFactorCode } = require(path.join(__dirname, '../utils/twoFactorUtils'));

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

// Función para diagnosticar el 2FA del usuario admin
async function diagnoseAdmin2FA() {
  try {
    console.log('🔍 Buscando usuario admin...');
    
    // Buscar usuario admin
    const adminUser = await User.findOne({ role: 'admin' }).select('+twoFactorSecret +backupCodes');
    
    if (!adminUser) {
      console.log('❌ No se encontró usuario admin');
      return;
    }
    
    console.log('✅ Usuario admin encontrado:');
    console.log('   - ID:', adminUser._id);
    console.log('   - Email:', adminUser.email);
    console.log('   - Nombre:', adminUser.name);
    console.log('   - 2FA Habilitado:', adminUser.twoFactorEnabled);
    console.log('   - Tiene Secreto 2FA:', !!adminUser.twoFactorSecret);
    console.log('   - Tiene Códigos de Respaldo:', !!adminUser.backupCodes);
    
    if (adminUser.twoFactorEnabled && adminUser.twoFactorSecret) {
      console.log('\n🔍 Información del Secreto 2FA:');
      console.log('   - Secreto (primeros 10 chars):', adminUser.twoFactorSecret.substring(0, 10) + '...');
      console.log('   - Longitud del secreto:', adminUser.twoFactorSecret.length);
      
      if (adminUser.backupCodes && adminUser.backupCodes.length > 0) {
        console.log('\n🔍 Códigos de Respaldo:');
        adminUser.backupCodes.forEach((code, index) => {
          console.log(`   - Código ${index + 1}: ${code}`);
        });
      }
      
      // Probar verificación con un código de ejemplo
      console.log('\n🧪 Probando verificación 2FA...');
      const testCode = '123456';
      const isValid = verifyTwoFactorCode(adminUser.twoFactorSecret, testCode);
      console.log(`   - Código de prueba "${testCode}" es válido:`, isValid);
      
      // Verificar si el secreto está en formato correcto
      console.log('\n🔍 Verificando formato del secreto...');
      try {
        const { authenticator } = require('otplib');
        const isValidSecret = authenticator.checkSecret(adminUser.twoFactorSecret);
        console.log('   - Formato del secreto es válido:', isValidSecret);
      } catch (error) {
        console.log('   - Error verificando formato del secreto:', error.message);
      }
      
    } else {
      console.log('\n⚠️  El usuario admin no tiene 2FA configurado correctamente');
      console.log('   - 2FA Habilitado:', adminUser.twoFactorEnabled);
      console.log('   - Tiene Secreto:', !!adminUser.twoFactorSecret);
    }
    
    // Verificar otros usuarios con 2FA habilitado
    console.log('\n🔍 Otros usuarios con 2FA habilitado:');
    const usersWith2FA = await User.find({ 
      twoFactorEnabled: true,
      _id: { $ne: adminUser._id }
    }).select('email role twoFactorEnabled');
    
    if (usersWith2FA.length > 0) {
      usersWith2FA.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    } else {
      console.log('   - No hay otros usuarios con 2FA habilitado');
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

// Función para generar un nuevo secreto 2FA para el admin
async function resetAdmin2FA() {
  try {
    console.log('🔄 Reseteando 2FA para usuario admin...');
    
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No se encontró usuario admin');
      return;
    }
    
    // Deshabilitar 2FA actual
    adminUser.twoFactorEnabled = false;
    adminUser.twoFactorSecret = undefined;
    adminUser.backupCodes = undefined;
    
    await adminUser.save();
    
    console.log('✅ 2FA deshabilitado para usuario admin');
    console.log('   - El usuario admin ahora puede configurar 2FA nuevamente');
    console.log('   - Deberá escanear un nuevo código QR y configurar su autenticador');
    
  } catch (error) {
    console.error('❌ Error reseteando 2FA:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'diagnose':
      await diagnoseAdmin2FA();
      break;
    case 'reset':
      await resetAdmin2FA();
      break;
    default:
      console.log('Uso: node diagnose2FA.js [diagnose|reset]');
      console.log('  diagnose - Diagnostica la configuración 2FA del admin');
      console.log('  reset    - Resetea la configuración 2FA del admin');
  }
  
  await mongoose.disconnect();
  console.log('✅ Desconectado de MongoDB');
}

main().catch(console.error);
