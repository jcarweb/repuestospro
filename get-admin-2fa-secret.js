const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema de Usuario (simplificado para obtener 2FA)
const userSchema = new mongoose.Schema({
  email: String,
  twoFactorSecret: String,
  twoFactorEnabled: Boolean,
  backupCodes: [String]
});

const User = mongoose.model('User', userSchema);

async function getAdmin2FASecret() {
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
    
    if (admin.twoFactorEnabled && admin.twoFactorSecret) {
      console.log(`   Secret 2FA: ${admin.twoFactorSecret}`);
      
      if (admin.backupCodes && admin.backupCodes.length > 0) {
        console.log('\n🔑 Códigos de respaldo disponibles:');
        admin.backupCodes.forEach((code, index) => {
          console.log(`   ${index + 1}. ${code}`);
        });
      }
      
      console.log('\n💡 Para generar códigos TOTP:');
      console.log('   1. Instala Google Authenticator en tu teléfono');
      console.log('   2. Escanea el QR code o ingresa manualmente el secret');
      console.log('   3. Usa el código de 6 dígitos que aparece en la app');
      console.log('   4. O usa uno de los códigos de respaldo mostrados arriba');
      
    } else {
      console.log('❌ 2FA no está configurado para este usuario');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getAdmin2FASecret();
