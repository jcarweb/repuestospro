const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Esquemas simplificados
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  stores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }],
  isEmailVerified: Boolean,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);

async function fixStoreManagerAuth() {
  try {
    console.log('🔧 Arreglando autenticación del gestor de tienda...');
    
    // 1. Buscar el gestor de tienda
    let storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com'
    });
    
    if (!storeManager) {
      console.log('❌ Gestor de tienda no encontrado');
      return;
    }
    
    console.log('✅ Gestor de tienda encontrado:');
    console.log(`   - ID: ${storeManager._id}`);
    console.log(`   - Nombre: ${storeManager.name}`);
    console.log(`   - Email: ${storeManager.email}`);
    console.log(`   - Rol: ${storeManager.role}`);
    console.log(`   - Activo: ${storeManager.isActive}`);
    
    // 2. Actualizar la contraseña
    const newPassword = '123456Aa@';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    storeManager.password = hashedPassword;
    storeManager.role = 'store_manager';
    storeManager.isEmailVerified = true;
    storeManager.isActive = true;
    
    await storeManager.save();
    
    console.log('\n✅ Contraseña actualizada:');
    console.log(`   - Nueva contraseña: ${newPassword}`);
    console.log(`   - Rol confirmado: ${storeManager.role}`);
    console.log(`   - Email verificado: ${storeManager.isEmailVerified}`);
    console.log(`   - Usuario activo: ${storeManager.isActive}`);
    
    // 3. Generar token JWT
    const payload = {
      userId: storeManager._id,
      email: storeManager.email,
      role: storeManager.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });
    
    console.log('\n🔑 Token generado:');
    console.log(`   - Token: ${token.substring(0, 50)}...`);
    console.log(`   - Longitud: ${token.length} caracteres`);
    
    // 4. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('\n✅ Token verificado:');
    console.log(`   - userId: ${decoded.userId}`);
    console.log(`   - email: ${decoded.email}`);
    console.log(`   - role: ${decoded.role}`);
    console.log(`   - exp: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    
    // 5. Instrucciones para el usuario
    console.log('\n📋 Instrucciones para usar el dashboard:');
    console.log('');
    console.log('1. Inicia sesión con las siguientes credenciales:');
    console.log(`   - Email: jucarl74@gmail.com`);
    console.log(`   - Contraseña: ${newPassword}`);
    console.log('');
    console.log('2. O usa el token directamente en el navegador:');
    console.log('   - Abre la consola del navegador (F12)');
    console.log('   - Ejecuta: localStorage.setItem("token", "' + token + '");');
    console.log('   - Recarga la página del dashboard');
    console.log('');
    console.log('3. El dashboard debería mostrar los datos automáticamente');
    console.log('');
    console.log('4. Si aún no ves datos, verifica que:');
    console.log('   - El servidor esté corriendo (npm start)');
    console.log('   - Los datos de prueba estén generados');
    console.log('   - No haya errores en la consola del navegador');
    
    // 6. Verificar datos disponibles
    console.log('\n🔍 Verificando datos disponibles...');
    
    const Order = mongoose.model('Order', new mongoose.Schema({
      storeId: mongoose.Schema.Types.ObjectId,
      totalAmount: Number,
      createdAt: Date
    }));
    
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    console.log(`   - Total órdenes: ${totalOrders}`);
    console.log(`   - Órdenes recientes (30 días): ${recentOrders}`);
    
    if (totalOrders === 0) {
      console.log('\n⚠️ No hay órdenes en la base de datos');
      console.log('   Ejecuta: node generate-test-data-simple.js');
    } else {
      console.log('\n✅ Datos disponibles para el dashboard');
    }
    
    console.log('\n🎉 ¡Autenticación del gestor de tienda arreglada!');
    
  } catch (error) {
    console.error('❌ Error arreglando autenticación:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixStoreManagerAuth();
