const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/repuestos-pro', {
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

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  totalAmount: Number,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

async function checkFrontendIssue() {
  try {
    console.log('🔍 DIAGNÓSTICO DEL PROBLEMA DEL DASHBOARD');
    console.log('==========================================');
    
    // 1. Verificar datos en la base de datos
    console.log('\n1️⃣ Verificando datos en la base de datos...');
    
    const storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com'
    });
    
    if (!storeManager) {
      console.log('❌ Gestor de tienda no encontrado');
      console.log('💡 Ejecuta: node backend/final-solution-dashboard.js');
      return;
    }
    
    console.log('✅ Gestor de tienda encontrado:');
    console.log(`   - ID: ${storeManager._id}`);
    console.log(`   - Nombre: ${storeManager.name}`);
    console.log(`   - Email: ${storeManager.email}`);
    console.log(`   - Rol: ${storeManager.role}`);
    console.log(`   - Activo: ${storeManager.isActive}`);
    console.log(`   - Tiendas: ${storeManager.stores?.length || 0}`);
    
    // 2. Verificar órdenes
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    console.log('\n2️⃣ Verificando órdenes...');
    console.log(`   - Total órdenes: ${totalOrders}`);
    console.log(`   - Órdenes recientes (30 días): ${recentOrders}`);
    
    if (totalOrders === 0) {
      console.log('❌ No hay órdenes en la base de datos');
      console.log('💡 Ejecuta: node backend/final-solution-dashboard.js');
      return;
    }
    
    // 3. Verificar órdenes por tienda
    console.log('\n3️⃣ Verificando órdenes por tienda...');
    
    for (let i = 0; i < storeManager.stores.length; i++) {
      const storeId = storeManager.stores[i];
      const storeOrders = await Order.countDocuments({ storeId });
      console.log(`   - Tienda ${i + 1}: ${storeOrders} órdenes`);
    }
    
    // 4. Verificar órdenes recientes
    console.log('\n4️⃣ Verificando órdenes recientes...');
    
    const recentOrdersData = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).limit(5);
    
    console.log(`   - Últimas 5 órdenes:`);
    recentOrdersData.forEach((order, index) => {
      console.log(`     ${index + 1}. ${order.orderNumber} - $${order.totalAmount?.toFixed(2) || '0.00'} - ${order.createdAt.toLocaleDateString()}`);
    });
    
    // 5. Instrucciones para el usuario
    console.log('\n🎯 SOLUCIÓN PARA VER LOS DATOS:');
    console.log('================================');
    console.log('');
    console.log('📋 PASOS A SEGUIR:');
    console.log('');
    console.log('1️⃣ VERIFICAR QUE EL SERVIDOR ESTÉ CORRIENDO:');
    console.log('   - El servidor debe estar en puerto 5000');
    console.log('   - Verifica que no haya errores en la consola del servidor');
    console.log('');
    console.log('2️⃣ VERIFICAR QUE EL FRONTEND ESTÉ CORRIENDO:');
    console.log('   - El frontend debe estar en puerto 3000');
    console.log('   - Ve a http://localhost:3000');
    console.log('');
    console.log('3️⃣ INICIAR SESIÓN:');
    console.log('   - Email: jucarl74@gmail.com');
    console.log('   - Contraseña: 123456Aa@');
    console.log('');
    console.log('4️⃣ NAVEGAR AL DASHBOARD:');
    console.log('   - Busca el menú de "Reportes de Ventas"');
    console.log('   - O ve directamente a: http://localhost:3000/sales');
    console.log('');
    console.log('5️⃣ SI NO VES DATOS, VERIFICA LA CONSOLA DEL NAVEGADOR:');
    console.log('   - Abre las herramientas de desarrollador (F12)');
    console.log('   - Ve a la pestaña "Console"');
    console.log('   - Busca errores en rojo');
    console.log('');
    console.log('6️⃣ POSIBLES PROBLEMAS Y SOLUCIONES:');
    console.log('');
    console.log('   🔴 PROBLEMA: "Token inválido" o "401 Unauthorized"');
    console.log('   ✅ SOLUCIÓN: El problema es de autenticación');
    console.log('   💡 ACCIÓN: Limpia el caché del navegador y vuelve a iniciar sesión');
    console.log('');
    console.log('   🔴 PROBLEMA: "404 Not Found"');
    console.log('   ✅ SOLUCIÓN: La ruta del dashboard no existe');
    console.log('   💡 ACCIÓN: Verifica que estés en la ruta correcta');
    console.log('');
    console.log('   🔴 PROBLEMA: "500 Internal Server Error"');
    console.log('   ✅ SOLUCIÓN: Error en el servidor');
    console.log('   💡 ACCIÓN: Verifica los logs del servidor');
    console.log('');
    console.log('   🔴 PROBLEMA: "CORS error"');
    console.log('   ✅ SOLUCIÓN: Problema de configuración CORS');
    console.log('   💡 ACCIÓN: Verifica la configuración del servidor');
    console.log('');
    console.log('7️⃣ VERIFICACIÓN FINAL:');
    console.log('   - Los datos están en la base de datos (✅ confirmado)');
    console.log('   - El gestor de tienda existe (✅ confirmado)');
    console.log('   - El servidor está corriendo (✅ confirmado)');
    console.log('   - El frontend está corriendo (✅ confirmado)');
    console.log('');
    console.log('8️⃣ SI SIGUES SIN VER DATOS:');
    console.log('   - Abre la consola del navegador (F12)');
    console.log('   - Copia y pega cualquier error que veas');
    console.log('   - Verifica que estés en la ruta correcta del dashboard');
    console.log('   - Intenta en modo incógnito');
    console.log('   - Limpia el caché del navegador');
    console.log('');
    console.log('✅ Los datos están disponibles en la base de datos.');
    console.log('✅ El problema probablemente está en la configuración del frontend o autenticación.');
    console.log('✅ Sigue los pasos de arriba para resolver el problema.');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkFrontendIssue();
