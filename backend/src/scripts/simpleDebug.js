const mongoose = require('mongoose');

// Conectar a la base de datos
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para debuggear simple
async function simpleDebug() {
  try {
    console.log('🔍 Debug simple del usuario admin...\n');
    
    const db = mongoose.connection.db;
    const email = 'admin@repuestospro.com';
    
    console.log('1. Buscando usuario con email:', email);
    
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      
      // Buscar todos los usuarios admin
      console.log('\n2. Buscando todos los usuarios admin...');
      const adminUsers = await db.collection('users').find({ role: 'admin' }).toArray();
      
      if (adminUsers.length > 0) {
        console.log('✅ Usuarios admin encontrados:');
        adminUsers.forEach((admin, index) => {
          console.log(`   ${index + 1}. Email: ${admin.email}, Name: ${admin.name}`);
        });
      } else {
        console.log('❌ No hay usuarios admin en la base de datos');
      }
      
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('   - ID:', user._id);
    console.log('   - Email:', user.email);
    console.log('   - Name:', user.name);
    console.log('   - Role:', user.role);
    console.log('   - Password (primeros 20 chars):', user.password ? user.password.substring(0, 20) + '...' : 'No tiene');
    console.log('   - Password format:', user.password ? user.password.substring(0, 7) : 'No tiene');
    console.log('   - twoFactorEnabled:', user.twoFactorEnabled);
    console.log('   - isEmailVerified:', user.isEmailVerified);
    console.log('   - isActive:', user.isActive);
    console.log('   - loginAttempts:', user.loginAttempts);
    console.log('   - lockUntil:', user.lockUntil);
    
    // Verificar si el email está en minúsculas
    console.log('\n2. Verificando formato del email...');
    console.log('   - Email en la consulta:', email);
    console.log('   - Email en la base de datos:', user.email);
    console.log('   - Son iguales:', email === user.email);
    console.log('   - Email en minúsculas:', email.toLowerCase());
    console.log('   - Email en BD en minúsculas:', user.email.toLowerCase());
    
    // Buscar con email en minúsculas
    console.log('\n3. Buscando con email en minúsculas...');
    const userLower = await db.collection('users').findOne({ email: email.toLowerCase() });
    
    if (userLower) {
      console.log('✅ Usuario encontrado con email en minúsculas');
      console.log('   - Email:', userLower.email);
    } else {
      console.log('❌ Usuario no encontrado con email en minúsculas');
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  await simpleDebug();
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
