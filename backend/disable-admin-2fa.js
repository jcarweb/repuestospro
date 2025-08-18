const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquema de Usuario (simplificado)
const userSchema = new mongoose.Schema({
  email: String,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  backupCodes: [String]
});

const User = mongoose.model('User', userSchema);

async function disableAdmin2FA() {
  try {
    console.log('🔍 Buscando usuario admin...\n');
    
    const admin = await User.findOne({ email: 'admin@repuestospro.com' });
    
    if (!admin) {
      console.log('❌ Usuario admin@repuestospro.com no encontrado');
      return;
    }

    console.log('✅ Usuario admin encontrado:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   2FA habilitado actualmente: ${admin.twoFactorEnabled ? 'Sí' : 'No'}`);
    
    if (admin.twoFactorEnabled) {
      // Deshabilitar 2FA
      admin.twoFactorEnabled = false;
      admin.twoFactorSecret = undefined;
      admin.backupCodes = [];
      
      await admin.save();
      
      console.log('\n✅ 2FA deshabilitado exitosamente');
      console.log('   Ahora puedes hacer login sin necesidad de código 2FA');
      console.log('\n🔑 Credenciales:');
      console.log('   Email: admin@repuestospro.com');
      console.log('   Password: Test123!');
      
    } else {
      console.log('\nℹ️ 2FA ya está deshabilitado');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

disableAdmin2FA();
