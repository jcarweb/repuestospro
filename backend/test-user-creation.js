const mongoose = require('mongoose');
require('dotenv').config();

async function testUserCreation() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    // Importar el modelo User
    const User = require('./src/models/User').default;
    
    console.log('🔍 Probando creación de usuario...');
    
    try {
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456Aa@',
        phone: '1234567890',
        role: 'client'
      });
      
      console.log('📋 Usuario creado en memoria');
      console.log('- ReferralCode antes de save:', testUser.referralCode);
      
      await testUser.save();
      
      console.log('✅ Usuario guardado exitosamente');
      console.log('- ID:', testUser._id);
      console.log('- ReferralCode después de save:', testUser.referralCode);
      console.log('- Password hasheado:', testUser.password.startsWith('$argon2'));
      
      // Limpiar el usuario de prueba
      await User.findByIdAndDelete(testUser._id);
      console.log('🧹 Usuario de prueba eliminado');
      
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      console.error('Stack:', error.stack);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testUserCreation();
