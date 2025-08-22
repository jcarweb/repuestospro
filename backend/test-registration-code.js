const mongoose = require('mongoose');
require('dotenv').config();

async function testRegistrationCode() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    // Acceder directamente a las colecciones
    const db = mongoose.connection.db;
    
    console.log('🔍 Verificando código de registro: 5CFF3FAA4D06A7F3');
    
    // Verificar si el código existe
    const registrationCode = await db.collection('registrationcodes').findOne({
      code: '5CFF3FAA4D06A7F3'
    });

    if (!registrationCode) {
      console.log('❌ Código de registro no encontrado');
      
      // Listar todos los códigos disponibles
      const allCodes = await db.collection('registrationcodes').find({}).toArray();
      console.log('📋 Códigos disponibles:', allCodes.map(c => ({ code: c.code, email: c.email, status: c.status })));
      return;
    }

    console.log('✅ Código encontrado:');
    console.log('- Email:', registrationCode.email);
    console.log('- Role:', registrationCode.role);
    console.log('- Status:', registrationCode.status);
    console.log('- ExpiresAt:', registrationCode.expiresAt);
    console.log('- IsExpired:', new Date() > registrationCode.expiresAt);
    console.log('- CreatedAt:', registrationCode.createdAt);
    console.log('- CreatedBy:', registrationCode.createdBy);

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ email: 'jucarl74@gmail.com' });
    if (existingUser) {
      console.log('❌ Usuario ya existe con ese email');
      console.log('- User ID:', existingUser._id);
      console.log('- Role:', existingUser.role);
      console.log('- IsActive:', existingUser.isActive);
      console.log('- CreatedAt:', existingUser.createdAt);
    } else {
      console.log('✅ Email disponible para registro');
    }

    // Verificar si el código ya fue usado
    if (registrationCode.status === 'used') {
      console.log('❌ Código ya fue usado');
      console.log('- UsedAt:', registrationCode.usedAt);
      console.log('- UsedBy:', registrationCode.usedBy);
    } else if (registrationCode.status === 'expired') {
      console.log('❌ Código expirado');
    } else if (registrationCode.status === 'revoked') {
      console.log('❌ Código revocado');
    } else {
      console.log('✅ Código válido y disponible');
    }

    // Verificar conexión a la base de datos
    const dbState = mongoose.connection.readyState;
    console.log('📊 Estado de la conexión a MongoDB:', dbState);
    console.log('- 0 = disconnected');
    console.log('- 1 = connected');
    console.log('- 2 = connecting');
    console.log('- 3 = disconnecting');

    // Verificar si hay errores en los logs del servidor
    console.log('\n🔍 Verificando logs del servidor...');
    try {
      const logs = await db.collection('logs').find({}).sort({ timestamp: -1 }).limit(10).toArray();
      if (logs.length > 0) {
        console.log('📋 Últimos logs:', logs);
      } else {
        console.log('📋 No hay logs recientes');
      }
    } catch (logError) {
      console.log('📋 No se pudo acceder a los logs:', logError.message);
    }

    // Verificar actividades recientes
    console.log('\n🔍 Verificando actividades recientes...');
    try {
      const activities = await db.collection('activities').find({}).sort({ createdAt: -1 }).limit(5).toArray();
      if (activities.length > 0) {
        console.log('📋 Últimas actividades:', activities.map(a => ({ 
          type: a.type, 
          description: a.description, 
          userId: a.userId,
          createdAt: a.createdAt 
        })));
      } else {
        console.log('📋 No hay actividades recientes');
      }
    } catch (activityError) {
      console.log('📋 No se pudo acceder a las actividades:', activityError.message);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testRegistrationCode();
