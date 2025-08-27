const mongoose = require('mongoose');
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
  isMainStore: Boolean,
  managers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

const productSchema = new mongoose.Schema({
  name: String,
  sku: String,
  price: Number,
  category: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  transactionId: mongoose.Schema.Types.ObjectId,
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
  commissionAmount: Number,
  warrantyTotal: Number,
  shippingCost: Number,
  discountAmount: Number,
  totalAmount: Number,
  currency: String,
  orderStatus: String,
  paymentStatus: String,
  fulfillmentStatus: String,
  paymentMethod: String,
  shippingMethod: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  warrantyEnabled: Boolean,
  warrantyLevel: String,
  warrantyCoverage: Number,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);
const Store = mongoose.model('Store', storeSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

async function generateTestData() {
  try {
    console.log('🚀 Iniciando generación de datos de prueba...');
    
    // 1. Crear o verificar el gestor de tienda
    let storeManager = await User.findOne({ email: 'jucarl74@gmail.com' });
    
    if (!storeManager) {
      console.log('👤 Creando gestor de tienda...');
      storeManager = new User({
        name: 'Juan Carlos',
        email: 'jucarl74@gmail.com',
        password: 'password123',
        role: 'store_manager',
        isEmailVerified: true,
        isActive: true
      });
      await storeManager.save();
      console.log('✅ Gestor de tienda creado');
    } else {
      console.log('✅ Gestor de tienda ya existe');
    }
    
    // 2. Crear o verificar tiendas
    let stores = await Store.find({ managers: storeManager._id });
    
    if (stores.length === 0) {
      console.log('🏪 Creando tiendas...');
      
      const store1 = new Store({
        name: 'Tienda Principal',
        description: 'Tienda principal del sistema',
        address: 'Av. Principal 123',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-555-0101',
        email: 'tienda@test.com',
        isMainStore: true,
        managers: [storeManager._id],
        owner: storeManager._id,
        coordinates: {
          latitude: 10.4806,
          longitude: -66.9036
        }
      });
      
      const store2 = new Store({
        name: 'Sucursal Centro',
        description: 'Sucursal en el centro de la ciudad',
        address: 'Calle Comercial 456',
        city: 'Caracas',
        state: 'Distrito Capital',
        zipCode: '1010',
        country: 'Venezuela',
        phone: '+58-212-555-0202',
        email: 'sucursal@test.com',
        isMainStore: false,
        managers: [storeManager._id],
        owner: storeManager._id,
        coordinates: {
          latitude: 10.4906,
          longitude: -66.9136
        }
      });
      
      await store1.save();
      await store2.save();
      stores = [store1, store2];
      console.log('✅ Tiendas creadas');
    } else {
      console.log('✅ Tiendas ya existen');
    }
    
    // 3. Actualizar el gestor con las tiendas
    storeManager.stores = stores.map(s => s._id);
    await storeManager.save();
    
    // 4. Verificar productos
    let products = await Product.find().limit(10);
    
    if (products.length === 0) {
      console.log('📦 Creando productos de prueba...');
      const testProducts = [
        { name: 'Filtro de Aceite', sku: 'FIL-001', price: 25.00, category: 'Filtros' },
        { name: 'Bujía', sku: 'BUJ-001', price: 15.00, category: 'Encendido' },
        { name: 'Freno de Disco', sku: 'FRE-001', price: 85.00, category: 'Frenos' },
        { name: 'Aceite de Motor', sku: 'ACE-001', price: 45.00, category: 'Lubricantes' },
        { name: 'Batería', sku: 'BAT-001', price: 120.00, category: 'Eléctrico' },
        { name: 'Neumático', sku: 'NEU-001', price: 95.00, category: 'Neumáticos' },
        { name: 'Amortiguador', sku: 'AMO-001', price: 75.00, category: 'Suspensión' },
        { name: 'Radiador', sku: 'RAD-001', price: 180.00, category: 'Refrigeración' },
        { name: 'Alternador', sku: 'ALT-001', price: 150.00, category: 'Eléctrico' },
        { name: 'Bomba de Agua', sku: 'BOM-001', price: 65.00, category: 'Refrigeración' }
      ];
      
      for (const productData of testProducts) {
        const product = new Product(productData);
        await product.save();
      }
      
      products = await Product.find().limit(10);
      console.log('✅ Productos creados');
    } else {
      console.log('✅ Productos ya existen');
    }
    
    // 5. Crear clientes de prueba
    let customers = await User.find({ role: 'client' }).limit(5);
    
    if (customers.length === 0) {
      console.log('👥 Creando clientes de prueba...');
      const testCustomers = [
        { name: 'María García', email: 'maria@test.com' },
        { name: 'Carlos López', email: 'carlos@test.com' },
        { name: 'Ana Rodríguez', email: 'ana@test.com' },
        { name: 'Luis Martínez', email: 'luis@test.com' },
        { name: 'Carmen Pérez', email: 'carmen@test.com' }
      ];
      
      for (const customerData of testCustomers) {
        const customer = new User({
          ...customerData,
          password: 'password123',
          role: 'client',
          isEmailVerified: true,
          isActive: true
        });
        await customer.save();
      }
      
      customers = await User.find({ role: 'client' }).limit(5);
      console.log('✅ Clientes creados');
    } else {
      console.log('✅ Clientes ya existen');
    }
    
    // 6. Generar órdenes de prueba (80 órdenes en 2 meses)
    console.log('📊 Generando órdenes de prueba...');
    
    const now = new Date();
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const testOrders = [];
    
    for (let i = 0; i < 80; i++) {
      const randomDate = new Date(twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime()));
      const randomStore = stores[Math.floor(Math.random() * stores.length)];
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      
      // Generar 1-4 productos por orden
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = randomProduct.price + (Math.random() * 50); // Variar precio
        const totalPrice = quantity * unitPrice;
        subtotal += totalPrice;
        
        items.push({
          productId: randomProduct._id,
          productName: randomProduct.name,
          sku: randomProduct.sku,
          quantity,
          unitPrice,
          totalPrice
        });
      }
      
      const taxAmount = subtotal * 0.12;
      const shippingCost = subtotal > 150 ? 0 : 8;
      const discountAmount = Math.random() > 0.75 ? subtotal * 0.15 : 0;
      const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;
      
      const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
      const paymentStatuses = ['pending', 'paid', 'failed'];
      const fulfillmentStatuses = ['pending', 'processing', 'shipped', 'delivered'];
      const paymentMethods = ['credit_card', 'debit_card', 'cash', 'transfer'];
      
      const order = new Order({
        orderNumber: `ORD-${randomStore.name.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`,
        transactionId: new mongoose.Types.ObjectId(),
        userId: randomCustomer._id,
        storeId: randomStore._id,
        customerInfo: {
          name: randomCustomer.name,
          email: randomCustomer.email,
          phone: `+58${Math.floor(Math.random() * 900000000) + 100000000}`,
          address: {
            street: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 50) + 1}`,
            city: randomStore.city,
            state: randomStore.state,
            zipCode: '1010',
            country: 'Venezuela'
          }
        },
        items,
        subtotal,
        taxAmount,
        commissionAmount: subtotal * 0.05,
        warrantyTotal: 0,
        shippingCost,
        discountAmount,
        totalAmount,
        currency: 'USD',
        orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        fulfillmentStatus: fulfillmentStatuses[Math.floor(Math.random() * fulfillmentStatuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        shippingMethod: 'standard',
        shippingAddress: {
          street: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 50) + 1}`,
          city: randomStore.city,
          state: randomStore.state,
          zipCode: '1010',
          country: 'Venezuela'
        },
        warrantyEnabled: false,
        warrantyLevel: 'none',
        warrantyCoverage: 0,
        createdAt: randomDate,
        updatedAt: randomDate
      });
      
      testOrders.push(order);
    }
    
    await Order.insertMany(testOrders);
    
    console.log('✅ Datos de prueba generados exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - Gestor de tienda: ${storeManager.name} (${storeManager.email})`);
    console.log(`   - Tiendas: ${stores.length}`);
    console.log(`   - Productos: ${products.length}`);
    console.log(`   - Clientes: ${customers.length}`);
    console.log(`   - Órdenes: ${testOrders.length}`);
    console.log(`   - Período: ${twoMonthsAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`);
    console.log(`   - Duración: 2 meses (60 días)`);
    
    // Mostrar estadísticas por tienda
    const statsByStore = {};
    testOrders.forEach(order => {
      const storeName = stores.find(s => s._id.toString() === order.storeId.toString())?.name || 'Tienda Desconocida';
      if (!statsByStore[storeName]) {
        statsByStore[storeName] = { orders: 0, total: 0 };
      }
      statsByStore[storeName].orders++;
      statsByStore[storeName].total += order.totalAmount;
    });
    
    console.log(`\n🏪 Estadísticas por tienda:`);
    Object.entries(statsByStore).forEach(([storeName, stats]) => {
      console.log(`   - ${storeName}: ${stats.orders} órdenes, $${stats.total.toFixed(2)}`);
    });
    
    console.log('\n🎉 ¡Datos listos! El gestor de tienda puede ver los reportes ahora.');
    
  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateTestData();
