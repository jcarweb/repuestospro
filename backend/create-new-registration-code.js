const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

async function createNewRegistrationCode() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/repuestos-pro', {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Conectado a MongoDB');
    
    const db = mongoose.connection.db;
    
    // Generar nuevo código
    const newCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    
    // Buscar un admin para crear el código
    const admin = await db.collection('users').findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ No se encontró ningún administrador');
      return;
    }
    
    console.log('🔍 Creando nuevo código de registro...');
    console.log('- Código:', newCode);
    console.log('- Email:', 'jucarl74@gmail.com');
    console.log('- Role:', 'store_manager');
    console.log('- Expira:', expiresAt);
    
    // Crear el código de registro
    const registrationCode = {
      code: newCode,
      email: 'jucarl74@gmail.com',
      role: 'store_manager',
      status: 'pending',
      expiresAt: expiresAt,
      createdBy: admin._id,
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('registrationcodes').insertOne(registrationCode);
    
    console.log('✅ Código de registro creado exitosamente');
    console.log('- ID:', result.insertedId);
    console.log('- Código:', newCode);
    console.log('- Status:', 'pending');
    
    console.log('\n🎯 El usuario puede usar este código para registrarse:');
    console.log('- Código:', newCode);
    console.log('- Email:', 'jucarl74@gmail.com');
    console.log('- Role:', 'store_manager');

  } catch (error) {
    console.error('❌ Error durante la creación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createNewRegistrationCode();
