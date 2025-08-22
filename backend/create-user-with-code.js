const mongoose = require('mongoose');
const argon2 = require('argon2');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function createUserWithCode() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    const db = mongoose.connection.db;
    
    // Datos del usuario real
    const userData = {
      name: 'Juan Carlos',
      email: 'jucarl74@gmail.com',
      password: '123456Aa@',
      phone: '1234567890',
      role: 'store_manager'
    };

    const code = '5CFF3FAA4D06A7F3';

    console.log('🔍 Proceso de registro con código para:', userData.email);
    console.log('📋 Código de registro:', code);

    try {
      // Paso 1: Verificar si el usuario ya existe
      console.log('\n🔍 Paso 1: Verificando si el usuario ya existe...');
      const existingUser = await db.collection('users').findOne({ email: userData.email });
      if (existingUser) {
        console.log('❌ Usuario ya existe:', existingUser._id);
        console.log('- Role:', existingUser.role);
        console.log('- IsActive:', existingUser.isActive);
        return;
      }
      console.log('✅ Usuario no existe, procediendo...');

      // Paso 2: Verificar código de registro
      console.log('\n🔍 Paso 2: Verificando código de registro...');
      const registrationCode = await db.collection('registrationcodes').findOne({
        code: code,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      });

      if (!registrationCode) {
        console.log('❌ Código de registro no encontrado o inválido');
        return;
      }

      console.log('✅ Código de registro válido');
      console.log('- Email asociado:', registrationCode.email);
      console.log('- Role:', registrationCode.role);
      console.log('- Status:', registrationCode.status);

      // Paso 3: Generar código de referido
      console.log('\n🔍 Paso 3: Generando código de referido...');
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

      // Paso 4: Hash de la contraseña
      console.log('\n🔍 Paso 4: Hasheando contraseña...');
      const hashedPassword = await argon2.hash(userData.password);
      console.log('✅ Contraseña hasheada');

      // Paso 5: Crear usuario
      console.log('\n🔍 Paso 5: Creando usuario...');
      const newUserData = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role,
        referralCode: referralCode,
        isActive: true,
        isEmailVerified: false,
        points: 0,
        loyaltyLevel: 'bronze',
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('users').insertOne(newUserData);
      const userId = result.insertedId;
      console.log('✅ Usuario creado exitosamente');
      console.log('- ID:', userId);
      console.log('- ReferralCode:', referralCode);

      // Paso 6: Generar token de verificación
      console.log('\n🔍 Paso 6: Generando token de verificación...');
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

      // Paso 7: Marcar código como usado
      console.log('\n🔍 Paso 7: Marcando código como usado...');
      await db.collection('registrationcodes').updateOne(
        { code: code },
        {
          $set: {
            status: 'used',
            usedAt: new Date(),
            usedBy: userId,
            registrationCompletedAt: new Date()
          }
        }
      );
      console.log('✅ Código marcado como usado');

      // Paso 8: Registrar actividad
      console.log('\n🔍 Paso 8: Registrando actividad...');
      try {
        await db.collection('activities').insertOne({
          userId: userId,
          type: 'register',
          description: 'Usuario registrado exitosamente con código de registro',
          metadata: { 
            ip: '127.0.0.1', 
            userAgent: 'Manual Registration Script',
            registrationCode: code
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Actividad registrada');
      } catch (activityError) {
        console.error('❌ Error registrando actividad:', activityError);
      }

      // Paso 9: Generar token JWT
      console.log('\n🔍 Paso 9: Generando token JWT...');
      const token = jwt.sign(
        { userId: userId.toString() },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );
      console.log('✅ Token JWT generado');

      console.log('\n🎉 ¡Registro completado exitosamente!');
      console.log('📋 Resumen:');
      console.log('- Usuario ID:', userId);
      console.log('- Email:', userData.email);
      console.log('- Role:', userData.role);
      console.log('- ReferralCode:', referralCode);
      console.log('- Token JWT:', token.substring(0, 20) + '...');

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
        console.log('- IsActive:', createdUser.isActive);
      }

      // Verificar estado del código
      console.log('\n🔍 Verificando estado del código...');
      const updatedCode = await db.collection('registrationcodes').findOne({ code: code });
      if (updatedCode) {
        console.log('✅ Código actualizado correctamente');
        console.log('- Status:', updatedCode.status);
        console.log('- UsedAt:', updatedCode.usedAt);
        console.log('- UsedBy:', updatedCode.usedBy);
      }

      console.log('\n🎯 El usuario puede ahora iniciar sesión con:');
      console.log('- Email:', userData.email);
      console.log('- Password:', userData.password);

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

createUserWithCode();
