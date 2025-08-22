const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testDirectDBCreation() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    const db = mongoose.connection.db;
    
    const testUser = {
      name: 'Test Direct DB User',
      email: 'test-direct-db@example.com',
      password: '123456Aa@',
      phone: '1234567890',
      role: 'client'
    };

    console.log('🔍 Probando creación directa en base de datos...');
    console.log('📋 Datos del usuario:', { ...testUser, password: '[HIDDEN]' });

    try {
      // Paso 1: Verificar si el usuario ya existe
      console.log('\n🔍 Paso 1: Verificando si el usuario ya existe...');
      const existingUser = await db.collection('users').findOne({ email: testUser.email });
      if (existingUser) {
        console.log('❌ Usuario ya existe:', existingUser._id);
        return;
      }
      console.log('✅ Usuario no existe, procediendo...');

      // Paso 2: Generar código de referido
      console.log('\n🔍 Paso 2: Generando código de referido...');
      let referralCode = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const existingUserWithCode = await db.collection('users').findOne({ referralCode });
        if (!existingUserWithCode) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        referralCode = Date.now().toString(36).toUpperCase();
      }
      console.log('✅ Código de referido generado:', referralCode);

      // Paso 3: Hash de la contraseña
      console.log('\n🔍 Paso 3: Hasheando contraseña...');
      const hashedPassword = await argon2.hash(testUser.password);
      console.log('✅ Contraseña hasheada');

      // Paso 4: Crear usuario
      console.log('\n🔍 Paso 4: Creando usuario...');
      const userData = {
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword,
        phone: testUser.phone,
        role: testUser.role,
        referralCode: referralCode,
        isActive: true,
        isEmailVerified: false,
        points: 0,
        loyaltyLevel: 'bronze',
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('users').insertOne(userData);
      const userId = result.insertedId;
      console.log('✅ Usuario creado exitosamente');
      console.log('- ID:', userId);
      console.log('- ReferralCode:', referralCode);

      // Paso 5: Generar token de verificación
      console.log('\n🔍 Paso 5: Generando token de verificación...');
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      await db.collection('users').updateOne(
        { _id: userId },
        { 
          $set: { 
            emailVerificationToken,
            emailVerificationExpires
          }
        }
      );
      console.log('✅ Token de verificación generado');

      // Paso 6: Registrar actividad
      console.log('\n🔍 Paso 6: Registrando actividad...');
      try {
        await db.collection('activities').insertOne({
          userId: userId,
          type: 'register',
          description: 'Usuario registrado exitosamente',
          metadata: { ip: '127.0.0.1', userAgent: 'Test Script' },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Actividad registrada');
      } catch (activityError) {
        console.error('❌ Error registrando actividad:', activityError);
      }

      // Paso 7: Generar token JWT
      console.log('\n🔍 Paso 7: Generando token JWT...');
      const token = jwt.sign(
        { userId: userId.toString() },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      console.log('✅ Token JWT generado');

      console.log('\n🎉 Proceso completado exitosamente!');
      console.log('📋 Resumen:');
      console.log('- Usuario ID:', userId);
      console.log('- Token JWT:', token.substring(0, 20) + '...');
      console.log('- ReferralCode:', referralCode);

      // Verificar que el usuario se creó correctamente
      console.log('\n🔍 Verificando usuario creado...');
      const createdUser = await db.collection('users').findOne({ _id: userId });
      if (createdUser) {
        console.log('✅ Usuario verificado en la base de datos');
        console.log('- Name:', createdUser.name);
        console.log('- Email:', createdUser.email);
        console.log('- Role:', createdUser.role);
        console.log('- ReferralCode:', createdUser.referralCode);
        console.log('- Password hasheado:', createdUser.password.startsWith('$argon2'));
      }

      // Limpiar el usuario de prueba
      console.log('\n🧹 Limpiando usuario de prueba...');
      await db.collection('users').deleteOne({ _id: userId });
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

testDirectDBCreation();
