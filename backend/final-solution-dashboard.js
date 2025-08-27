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

const storeSchema = new mongoose.Schema({
  name: String,
  description: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  phone: String,
  email: String,
  isMainStore: Boolean
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
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  taxAmount: Number,
  shippingCost: Number,
  discountAmount: Number,
  totalAmount: Number,
  currency: String,
  orderStatus: String,
  paymentStatus: String,
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const Store = mongoose.model('Store', storeSchema);
const Order = mongoose.model('Order', orderSchema);

async function finalSolutionDashboard() {
  try {
    console.log('🎯 SOLUCIÓN FINAL PARA EL DASHBOARD');
    console.log('=====================================');
    
    // 1. Verificar o crear el gestor de tienda
    console.log('\n1️⃣ Verificando gestor de tienda...');
    
    let storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com'
    });
    
    if (!storeManager) {
      console.log('📝 Creando gestor de tienda...');
      
      // Crear tiendas
      const store1 = new Store({
        name: 'Tienda Principal',
        description: 'Tienda principal de repuestos',
        address: 'Av. Principal 123',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-1234567',
        email: 'tienda1@repuestospro.com',
        isMainStore: true
      });
      
      const store2 = new Store({
        name: 'Sucursal Centro',
        description: 'Sucursal en el centro de la ciudad',
        address: 'Calle Centro 456',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-7654321',
        email: 'tienda2@repuestospro.com',
        isMainStore: false
      });
      
      await store1.save();
      await store2.save();
      
      // Crear gestor
      storeManager = new User({
        name: 'Juan Carlos',
        email: 'jucarl74@gmail.com',
        password: '123456Aa@',
        role: 'store_manager',
        stores: [store1._id, store2._id],
        isEmailVerified: true,
        isActive: true
      });
      
      await storeManager.save();
      console.log('✅ Gestor de tienda creado');
    } else {
      console.log('✅ Gestor de tienda encontrado');
      
      // Actualizar configuración
      storeManager.role = 'store_manager';
      storeManager.isEmailVerified = true;
      storeManager.isActive = true;
      await storeManager.save();
    }
    
    // 2. Verificar datos de prueba
    console.log('\n2️⃣ Verificando datos de prueba...');
    
    const totalOrders = await Order.countDocuments();
    console.log(`   - Total órdenes en BD: ${totalOrders}`);
    
    if (totalOrders === 0) {
      console.log('📝 Generando datos de prueba...');
      
      // Generar 50 órdenes de prueba
      const orders = [];
      const now = new Date();
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < 50; i++) {
        const orderDate = new Date(twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime()));
        const storeId = storeManager.stores[Math.floor(Math.random() * storeManager.stores.length)];
        
        const order = new Order({
          orderNumber: `ORD-${String(i + 1).padStart(4, '0')}`,
          userId: storeManager._id,
          storeId: storeId,
          customerInfo: {
            name: `Cliente ${i + 1}`,
            email: `cliente${i + 1}@email.com`,
            phone: `+58-412-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
            address: {
              street: `Calle ${i + 1}`,
              city: 'Caracas',
              state: 'Distrito Capital',
              zipCode: '1010',
              country: 'Venezuela'
            }
          },
          items: [{
            productId: new mongoose.Types.ObjectId(),
            productName: `Producto ${i + 1}`,
            sku: `SKU-${String(i + 1).padStart(4, '0')}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: Math.floor(Math.random() * 300) + 25,
            totalPrice: 0
          }],
          subtotal: 0,
          taxAmount: 0,
          shippingCost: Math.random() > 0.5 ? 10 : 0,
          discountAmount: Math.random() > 0.8 ? 15 : 0,
          totalAmount: 0,
          currency: 'USD',
          orderStatus: ['pending', 'processing', 'completed', 'shipped'][Math.floor(Math.random() * 4)],
          paymentStatus: ['pending', 'paid', 'failed'][Math.floor(Math.random() * 3)],
          paymentMethod: ['credit_card', 'cash', 'transfer'][Math.floor(Math.random() * 3)],
          createdAt: orderDate,
          updatedAt: orderDate
        });
        
        // Calcular totales
        order.items.forEach(item => {
          item.totalPrice = item.quantity * item.unitPrice;
        });
        
        order.subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
        order.taxAmount = order.subtotal * 0.16; // 16% IVA
        order.totalAmount = order.subtotal + order.taxAmount + order.shippingCost - order.discountAmount;
        
        orders.push(order);
      }
      
      await Order.insertMany(orders);
      console.log('✅ 50 órdenes de prueba generadas');
    } else {
      console.log('✅ Datos de prueba ya existen');
    }
    
    // 3. Verificar configuración final
    console.log('\n3️⃣ Verificación final...');
    
    const finalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    console.log(`   - Total órdenes: ${finalOrders}`);
    console.log(`   - Órdenes recientes (30 días): ${recentOrders}`);
    console.log(`   - Gestor activo: ${storeManager.isActive}`);
    console.log(`   - Rol correcto: ${storeManager.role}`);
    
    // 4. Instrucciones finales
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETA!');
    console.log('============================');
    console.log('');
    console.log('📋 INSTRUCCIONES PARA VER LOS DATOS:');
    console.log('');
    console.log('1️⃣ INICIO DE SESIÓN:');
    console.log('   - Email: jucarl74@gmail.com');
    console.log('   - Contraseña: 123456Aa@');
    console.log('');
    console.log('2️⃣ PASOS EN EL NAVEGADOR:');
    console.log('   a) Ve a http://localhost:3000');
    console.log('   b) Inicia sesión con las credenciales de arriba');
    console.log('   c) Ve al menú de "Reportes de Ventas" o "Dashboard"');
    console.log('   d) Los datos deberían aparecer automáticamente');
    console.log('');
    console.log('3️⃣ SI NO VES DATOS:');
    console.log('   a) Abre la consola del navegador (F12)');
    console.log('   b) Verifica que no haya errores en rojo');
    console.log('   c) Recarga la página (Ctrl+F5)');
    console.log('   d) Verifica que estés en la ruta correcta');
    console.log('');
    console.log('4️⃣ DATOS ESPERADOS:');
    console.log('   - Total Ventas: Variable (depende de las órdenes)');
    console.log('   - Total Órdenes: ~50 órdenes');
    console.log('   - Valor Promedio: Variable por orden');
    console.log('   - Gráficos con tendencias de 2 meses');
    console.log('');
    console.log('5️⃣ VERIFICACIÓN:');
    console.log('   - El servidor debe estar corriendo (puerto 5000)');
    console.log('   - El frontend debe estar corriendo (puerto 3000)');
    console.log('   - No debe haber errores en la consola');
    console.log('');
    console.log('🔧 SI SIGUES SIN VER DATOS:');
    console.log('   1. Verifica que el servidor esté corriendo: npm start');
    console.log('   2. Verifica que el frontend esté corriendo: npm run dev');
    console.log('   3. Limpia el caché del navegador');
    console.log('   4. Intenta en modo incógnito');
    console.log('');
    console.log('✅ ¡El dashboard debería mostrar los datos ahora!');
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
  } finally {
    mongoose.connection.close();
  }
}

finalSolutionDashboard();
