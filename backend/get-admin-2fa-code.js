const mongoose = require('mongoose');
const { authenticator } = require('otplib');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema de Usuario (simplificado)
const userSchema = new mongoose.Schema({
  email: String,
  twoFactorSecret: String,
  twoFactorEnabled: Boolean,
  backupCodes: [String]
});

const User = mongoose.model('User', userSchema);

async function getAdmin2FACode() {
  try {
    console.log('🔍 Buscando usuario admin...\n');
    
    const admin = await User.findOne({ email: 'admin@repuestospro.com' });
    
    if (!admin) {
      console.log('❌ Usuario admin@repuestospro.com no encontrado');
      return;
    }

    console.log('✅ Usuario admin encontrado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   2FA habilitado: ${admin.twoFactorEnabled ? 'Sí' : 'No'}`);
    
    if (!admin.twoFactorEnabled || !admin.twoFactorSecret) {
      console.log('❌ 2FA no está configurado para este usuario');
      return;
    }

    console.log(`   Secret 2FA: ${admin.twoFactorSecret}`);
    
    // Generar código actual
    const currentCode = authenticator.generate(admin.twoFactorSecret);
    
    // Generar códigos para diferentes momentos
    const now = Math.floor(Date.now() / 1000);
    const codes = [];
    
    for (let i = -2; i <= 2; i++) {
      const time = now + (i * 30);
      const code = authenticator.generate(admin.twoFactorSecret, time);
      codes.push({
        time: new Date(time * 1000).toLocaleTimeString(),
        code: code
      });
    }

    console.log('\n📋 Códigos disponibles:');
    codes.forEach((item, index) => {
      console.log(`   ${index === 2 ? '→' : ' '} ${item.time}: ${item.code} ${index === 2 ? '(ACTUAL)' : ''}`);
    });

    if (admin.backupCodes && admin.backupCodes.length > 0) {
      console.log('\n🔑 Códigos de respaldo disponibles:');
      admin.backupCodes.forEach((code, index) => {
        console.log(`   ${index + 1}. ${code}`);
      });
    }
    
    console.log('\n💡 Instrucciones:');
    console.log('   1. Usa el código marcado como "(ACTUAL)"');
    console.log('   2. Si no funciona, prueba con el código anterior o siguiente');
    console.log('   3. Los códigos cambian cada 30 segundos');
    console.log('   4. O usa uno de los códigos de respaldo mostrados arriba');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getAdmin2FACode();
