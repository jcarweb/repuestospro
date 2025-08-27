const mongoose = require('mongoose');

console.log('🔧 CORRIGIENDO DATOS DE TENDENCIAS');
console.log('==================================\n');

// URI de MongoDB directamente
const MONGODB_URI = 'mongodb+srv://jcarwebdesigner:LSwHnmFAuiypYy7I@cluster0.s307fxr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function fixTrendsData() {
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
      console.log('   ❌ No hay órdenes para generar tendencias');
      return;
    }

    // 4. Verificar distribución de órdenes por fecha
    console.log('\n4. VERIFICANDO DISTRIBUCIÓN DE ÓRDENES...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await ordersCollection.find({
      storeId: { $in: user.stores },
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 }).toArray();

    console.log(`   - Órdenes en los últimos 30 días: ${recentOrders.length}`);

    // 5. Generar datos de tendencias diarias
    console.log('\n5. GENERANDO DATOS DE TENDENCIAS DIARIAS...');
    
    const dailyTrends = {};
    const paymentTrends = {};

    // Agrupar órdenes por día
    recentOrders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      
      if (!dailyTrends[dateKey]) {
        dailyTrends[dateKey] = {
          date: dateKey,
          sales: 0,
          orders: 0,
          customers: new Set()
        };
      }
      
      dailyTrends[dateKey].sales += order.totalAmount;
      dailyTrends[dateKey].orders += 1;
      dailyTrends[dateKey].customers.add(order.customerEmail);

      // Agrupar por método de pago
      const paymentMethod = order.paymentMethod || 'unknown';
      if (!paymentTrends[dateKey]) {
        paymentTrends[dateKey] = {};
      }
      if (!paymentTrends[dateKey][paymentMethod]) {
        paymentTrends[dateKey][paymentMethod] = {
          count: 0,
          amount: 0
        };
      }
      paymentTrends[dateKey][paymentMethod].count += 1;
      paymentTrends[dateKey][paymentMethod].amount += order.totalAmount;
    });

    // Convertir a arrays para el dashboard
    const dailyTrendsArray = Object.values(dailyTrends).map(trend => ({
      date: trend.date,
      sales: trend.sales,
      orders: trend.orders,
      customers: trend.customers.size
    }));

    const paymentTrendsArray = [];
    Object.keys(paymentTrends).forEach(date => {
      Object.keys(paymentTrends[date]).forEach(method => {
        paymentTrendsArray.push({
          date: date,
          method: method,
          count: paymentTrends[date][method].count,
          amount: paymentTrends[date][method].amount
        });
      });
    });

    console.log(`   - Días con datos: ${dailyTrendsArray.length}`);
    console.log(`   - Métodos de pago registrados: ${new Set(paymentTrendsArray.map(p => p.method)).size}`);

    // 6. Mostrar ejemplo de datos generados
    console.log('\n6. EJEMPLO DE DATOS DE TENDENCIAS:');
    console.log('   - Tendencias diarias (primeros 5 días):');
    dailyTrendsArray.slice(0, 5).forEach(trend => {
      console.log(`     * ${trend.date}: $${trend.sales.toFixed(2)} - ${trend.orders} órdenes - ${trend.customers} clientes`);
    });

    console.log('\n   - Tendencias de pago (primeros 5 registros):');
    paymentTrendsArray.slice(0, 5).forEach(trend => {
      console.log(`     * ${trend.date} - ${trend.method}: $${trend.amount.toFixed(2)} (${trend.count} transacciones)`);
    });

    // 7. Verificar si el problema está en el frontend o backend
    console.log('\n7. DIAGNÓSTICO DEL PROBLEMA:');
    console.log('   - Los datos de tendencias están disponibles en la base de datos');
    console.log('   - El problema puede estar en:');
    console.log('     a) El servicio SalesReportService no está procesando las fechas correctamente');
    console.log('     b) El frontend no está mostrando los datos de tendencias');
    console.log('     c) Los filtros de fecha no están aplicándose correctamente');

    console.log('\n💡 RECOMENDACIONES:');
    console.log('   1. Verificar que el SalesReportService esté agrupando por fecha correctamente');
    console.log('   2. Revisar los logs del backend cuando se accede a /api/sales-reports/store/trends');
    console.log('   3. Verificar que el frontend esté llamando al endpoint correcto');
    console.log('   4. Comprobar que las fechas estén en el formato correcto (ISO)');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔧 PROCESO COMPLETADO');
  }
}

fixTrendsData();
