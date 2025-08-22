const mongoose = require('mongoose');
require('dotenv').config();

async function testDirectUserCreation() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    // Importar modelos
    const User = require('./src/models/User').default;
    const Activity = require('./src/models/Activity').default;
    
    const testUser = {
      name: 'Test Direct User',
      email: 'test-direct@example.com',
      password: '123456Aa@',
      phone: '1234567890',
      role: 'client'
    };

    console.log('🔍 Probando creación directa de usuario...');
    console.log('📋 Datos del usuario:', { ...testUser, password: '[HIDDEN]' });

    try {
      // Paso 1: Verificar si el usuario ya existe
      console.log('\n🔍 Paso 1: Verificando si el usuario ya existe...');
      const existingUser = await User.findOne({ email: testUser.email });
      if (existingUser) {
        console.log('❌ Usuario ya existe:', existingUser._id);
        return;
      }
      console.log('✅ Usuario no existe, procediendo...');

      // Paso 2: Crear usuario
      console.log('\n🔍 Paso 2: Creando usuario...');
      const user = await User.create(testUser);
      console.log('✅ Usuario creado exitosamente');
      console.log('- ID:', user._id);
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- ReferralCode:', user.referralCode);
      console.log('- Password hasheado:', user.password.startsWith('$argon2'));

      // Paso 3: Generar token de verificación
      console.log('\n🔍 Paso 3: Generando token de verificación...');
      const crypto = require('crypto');
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      console.log('✅ Token de verificación generado');

      // Paso 4: Registrar actividad
      console.log('\n🔍 Paso 4: Registrando actividad...');
      try {
        await Activity.create({
          userId: user._id,
          type: 'register',
          description: 'Usuario registrado exitosamente',
          metadata: { ip: '127.0.0.1', userAgent: 'Test Script' }
        });
        console.log('✅ Actividad registrada');
      } catch (activityError) {
        console.error('❌ Error registrando actividad:', activityError);
      }

      // Paso 5: Generar token JWT
      console.log('\n🔍 Paso 5: Generando token JWT...');
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      console.log('✅ Token JWT generado');

      console.log('\n🎉 Proceso completado exitosamente!');
      console.log('📋 Resumen:');
      console.log('- Usuario ID:', user._id);
      console.log('- Token JWT:', token.substring(0, 20) + '...');
      console.log('- ReferralCode:', user.referralCode);

      // Limpiar el usuario de prueba
      console.log('\n🧹 Limpiando usuario de prueba...');
      await User.findByIdAndDelete(user._id);
      console.log('✅ Usuario de prueba eliminado');

    } catch (error) {
      console.error('❌ Error durante el proceso:', error);
      console.error('Stack:', error.stack);
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testDirectUserCreation();
