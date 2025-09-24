const mongoose = require('mongoose');
const argon2 = require('argon2');

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

// Función para probar la contraseña
async function testPassword() {
  try {
    console.log('🔍 Probando contraseña del admin...\n');
    
    const db = mongoose.connection.db;
    const email = 'admin@repuestospro.com';
    const testPassword = 'admin123';
    
    console.log('1. Obteniendo usuario de la base de datos...');
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('   - Email:', user.email);
    console.log('   - Password (primeros 20 chars):', user.password.substring(0, 20) + '...');
    console.log('   - Password format:', user.password.substring(0, 7));
    
    console.log('\n2. Probando contraseña:', testPassword);
    
    try {
      const isValid = await argon2.verify(user.password, testPassword);
      console.log('   - Resultado de verificación:', isValid);
      
      if (isValid) {
        console.log('✅ La contraseña es válida');
      } else {
        console.log('❌ La contraseña no es válida');
        
        // Probar con diferentes variaciones
        console.log('\n3. Probando variaciones de la contraseña...');
        const variations = ['admin123', 'Admin123', 'ADMIN123', 'admin', '123456'];
        
        for (const variation of variations) {
          try {
            const result = await argon2.verify(user.password, variation);
            console.log(`   - "${variation}": ${result ? '✅' : '❌'}`);
          } catch (error) {
            console.log(`   - "${variation}": ❌ (Error: ${error.message})`);
          }
        }
      }
    } catch (error) {
      console.log('❌ Error verificando contraseña:', error.message);
    }
    
    // Generar una nueva contraseña y probarla
    console.log('\n4. Generando nueva contraseña para prueba...');
    const newPassword = 'admin123';
    const newHash = await argon2.hash(newPassword);
    
    console.log('   - Nueva contraseña:', newPassword);
    console.log('   - Nuevo hash (primeros 20 chars):', newHash.substring(0, 20) + '...');
    
    try {
      const isValidNew = await argon2.verify(newHash, newPassword);
      console.log('   - Verificación del nuevo hash:', isValidNew ? '✅' : '❌');
    } catch (error) {
      console.log('   - Error verificando nuevo hash:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  await testPassword();
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
