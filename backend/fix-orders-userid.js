const mongoose = require('mongoose');

console.log('🔧 CORRIGIENDO ÓRDENES - AGREGANDO USERID');
console.log('=========================================\n');

// URI de MongoDB directamente
const MONGODB_URI = 'mongodb+srv://jcarwebdesigner:LSwHnmFAuiypYy7I@cluster0.s307fxr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixOrdersUserId() {
  try {
    console.log('1. CONECTANDO A MONGODB...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Conexión exitosa a MongoDB\n');

    const db = mongoose.connection.db;

    // 2. Obtener usuario y tiendas
    console.log('2. OBTENIENDO USUARIO Y TIENDAS...');
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email: 'jucarl74@gmail.com' });
    
    if (!user) {
      console.log('   ❌ Usuario jucarl74@gmail.com no encontrado');
      return;
    }

    console.log(`   ✅ Usuario encontrado: ${user.email}`);

    // 3. Verificar órdenes existentes
    console.log('\n3. VERIFICANDO ÓRDENES EXISTENTES...');
    const ordersCollection = db.collection('orders');
    
    const totalOrders = await ordersCollection.countDocuments({
      storeId: { $in: user.stores }
    });
    console.log(`   - Total órdenes del usuario: ${totalOrders}`);

    if (totalOrders === 0) {
      console.log('   ❌ No hay órdenes para corregir');
      return;
    }

    // 4. Verificar órdenes sin userId
    console.log('\n4. VERIFICANDO ÓRDENES SIN USERID...');
    const ordersWithoutUserId = await ordersCollection.countDocuments({
      storeId: { $in: user.stores },
      userId: { $exists: false }
    });
    console.log(`   - Órdenes sin userId: ${ordersWithoutUserId}`);

    if (ordersWithoutUserId === 0) {
      console.log('   ✅ Todas las órdenes ya tienen userId');
      return;
    }

    // 5. Crear usuarios únicos para cada cliente
    console.log('\n5. CREANDO USUARIOS ÚNICOS PARA CLIENTES...');
    const usersCollection2 = db.collection('users');
    
    // Obtener todos los emails únicos de clientes
    const uniqueCustomerEmails = await ordersCollection.distinct('customerEmail', {
      storeId: { $in: user.stores }
    });
    
    console.log(`   - Emails únicos de clientes: ${uniqueCustomerEmails.length}`);

    // Crear usuarios para cada cliente único
    const customerUsers = [];
    for (let i = 0; i < uniqueCustomerEmails.length; i++) {
      const email = uniqueCustomerEmails[i];
      const customerName = email.split('@')[0];
      
      const customerUser = {
        _id: new mongoose.Types.ObjectId(),
        email: email,
        firstName: customerName,
        lastName: 'Cliente',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      customerUsers.push(customerUser);
    }

    // Insertar usuarios de clientes
    if (customerUsers.length > 0) {
      await usersCollection2.insertMany(customerUsers);
      console.log(`   ✅ ${customerUsers.length} usuarios de clientes creados`);
    }

    // 6. Actualizar órdenes con userId
    console.log('\n6. ACTUALIZANDO ÓRDENES CON USERID...');
    
    let updatedCount = 0;
    for (const customerUser of customerUsers) {
      const result = await ordersCollection.updateMany(
        { 
          storeId: { $in: user.stores },
          customerEmail: customerUser.email,
          userId: { $exists: false }
        },
        { 
          $set: { 
            userId: customerUser._id,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        updatedCount += result.modifiedCount;
        console.log(`   ✅ ${result.modifiedCount} órdenes actualizadas para ${customerUser.email}`);
      }
    }

    console.log(`\n   ✅ Total de órdenes actualizadas: ${updatedCount}`);

    // 7. Verificar resultados
    console.log('\n7. VERIFICANDO RESULTADOS...');
    
    const ordersWithUserId = await ordersCollection.countDocuments({
      storeId: { $in: user.stores },
      userId: { $exists: true }
    });
    
    const ordersWithoutUserIdAfter = await ordersCollection.countDocuments({
      storeId: { $in: user.stores },
      userId: { $exists: false }
    });

    console.log(`   - Órdenes con userId: ${ordersWithUserId}`);
    console.log(`   - Órdenes sin userId: ${ordersWithoutUserIdAfter}`);

    // 8. Probar consulta de tendencias
    console.log('\n8. PROBANDO CONSULTA DE TENDENCIAS...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendsTest = await ordersCollection.aggregate([
      { 
        $match: { 
          storeId: { $in: user.stores },
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          customers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          date: '$_id',
          sales: 1,
          orders: 1,
          customers: { $size: '$customers' }
        }
      },
      { $sort: { date: 1 } }
    ]).toArray();

    console.log(`   - Días con tendencias: ${trendsTest.length}`);
    console.log('   - Ejemplo de tendencias:');
    trendsTest.slice(0, 3).forEach(trend => {
      console.log(`     * ${trend.date}: $${trend.sales.toFixed(2)} - ${trend.orders} órdenes - ${trend.customers} clientes`);
    });

    console.log('\n✅ ÓRDENES CORREGIDAS EXITOSAMENTE');
    console.log('💡 Ahora las tendencias deberían mostrarse correctamente en el dashboard');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔧 PROCESO COMPLETADO');
  }
}

fixOrdersUserId();
