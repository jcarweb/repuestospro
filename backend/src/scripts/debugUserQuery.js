const mongoose = require('mongoose');
const path = require('path');

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

// Función para debuggear la consulta del usuario
async function debugUserQuery() {
  try {
    console.log('🔍 Debuggeando consulta del usuario admin...\n');
    
    // Importar el modelo User
    const User = require(path.join(__dirname, '../models/User')).default;
    
    const email = 'admin@repuestospro.com';
    
    console.log('1. Consulta directa con mongoose...');
    console.log('   - Email:', email);
    
    // Simular exactamente la consulta del login
    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockUntil')
      .populate({
        path: 'stores',
        select: 'name address city state isMainStore _id'
      });
    
    if (!user) {
      console.log('❌ Usuario no encontrado con mongoose');
      
      // Probar consulta directa a la base de datos
      console.log('\n2. Consulta directa a la base de datos...');
      const db = mongoose.connection.db;
      const directUser = await db.collection('users').findOne({ email });
      
      if (directUser) {
        console.log('✅ Usuario encontrado con consulta directa:');
        console.log('   - ID:', directUser._id);
        console.log('   - Email:', directUser.email);
        console.log('   - Name:', directUser.name);
        console.log('   - Role:', directUser.role);
        console.log('   - Password (primeros 20 chars):', directUser.password ? directUser.password.substring(0, 20) + '...' : 'No tiene');
        console.log('   - twoFactorEnabled:', directUser.twoFactorEnabled);
        
        console.log('\n⚠️  El problema está en la consulta de mongoose');
        console.log('   - La consulta directa encuentra el usuario');
        console.log('   - La consulta de mongoose no lo encuentra');
      } else {
        console.log('❌ Usuario no encontrado ni con consulta directa');
      }
      
      return;
    }
    
    console.log('✅ Usuario encontrado con mongoose:');
    console.log('   - ID:', user._id);
    console.log('   - Email:', user.email);
    console.log('   - Name:', user.name);
    console.log('   - Role:', user.role);
    console.log('   - Password (primeros 20 chars):', user.password ? user.password.substring(0, 20) + '...' : 'No tiene');
    console.log('   - twoFactorEnabled:', user.twoFactorEnabled);
    console.log('   - isEmailVerified:', user.isEmailVerified);
    console.log('   - isActive:', user.isActive);
    console.log('   - loginAttempts:', user.loginAttempts);
    console.log('   - lockUntil:', user.lockUntil);
    
    // Probar comparación de contraseña
    console.log('\n3. Probando comparación de contraseña...');
    const testPassword = 'admin123';
    console.log('   - Contraseña a probar:', testPassword);
    
    try {
      const isValid = await user.comparePassword(testPassword);
      console.log('   - Resultado de comparación:', isValid);
      
      if (isValid) {
        console.log('✅ La contraseña es válida');
      } else {
        console.log('❌ La contraseña no es válida');
      }
    } catch (error) {
      console.log('❌ Error en comparación de contraseña:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error en debug:', error);
  }
}

// Función principal
async function main() {
  await connectDB();
  
  await debugUserQuery();
  
  await mongoose.disconnect();
  console.log('\n✅ Desconectado de MongoDB');
}

main().catch(console.error);
