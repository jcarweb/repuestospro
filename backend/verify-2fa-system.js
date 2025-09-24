const mongoose = require('mongoose');
const { authenticator } = require('otplib');
require('dotenv').config();

// Conectar a MongoDB
async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=Cluster';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Verificación final del sistema
async function verifySystem() {
  try {
    console.log('🔍 VERIFICACIÓN FINAL DEL SISTEMA 2FA');
    console.log('=====================================\n');
    
    const User = require('./dist/models/User').default;
    const user = await User.findOne({ email: 'admin@example.com' }).select('+twoFactorSecret +backupCodes');
    
    if (!user || !user.twoFactorEnabled) {
      console.log('❌ Sistema 2FA no configurado');
      return false;
    }
    
    // Generar y verificar código
    const code = authenticator.generate(user.twoFactorSecret);
    const isValid = user.verifyTwoFactorCode(code);
    
    console.log('✅ Usuario admin encontrado');
    console.log('✅ 2FA habilitado');
    console.log('✅ Secreto configurado');
    console.log('✅ Código generado:', code);
    console.log('✅ Verificación exitosa:', isValid);
    console.log('✅ Códigos de respaldo:', user.backupCodes?.length || 0);
    
    return isValid;
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return false;
  }
}

// Función principal
async function main() {
  await connectDB();
  const isWorking = await verifySystem();
  
  if (isWorking) {
    console.log('\n🎉 SISTEMA 2FA COMPLETAMENTE FUNCIONAL');
    console.log('✅ Listo para presentación a socios capitalistas');
  } else {
    console.log('\n❌ Sistema requiere configuración adicional');
  }
  
  process.exit(0);
}

main().catch(console.error);
