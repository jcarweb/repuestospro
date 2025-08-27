const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/repuestospro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Importar el servicio
const { SalesReportService } = require('./src/services/SalesReportService');

async function testTwoMonthsData() {
  try {
    console.log('🧪 Probando generación de datos de 2 meses...');
    
    // Generar datos de prueba para el gestor de tienda
    await SalesReportService.generateStoreManagerTestData('jucarl74@gmail.com');
    
    // Verificar los datos generados
    const Order = mongoose.model('Order');
    const totalOrders = await Order.countDocuments();
    console.log(`\n📊 Total de órdenes en la base de datos: ${totalOrders}`);
    
    // Verificar órdenes de los últimos 2 meses
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
    
    const recentOrders = await Order.find({
      createdAt: { $gte: twoMonthsAgo }
    }).sort({ createdAt: 1 });
    
    console.log(`📅 Órdenes de los últimos 2 meses: ${recentOrders.length}`);
    
    if (recentOrders.length > 0) {
      console.log(`📅 Primera orden: ${recentOrders[0].createdAt.toLocaleDateString()}`);
      console.log(`📅 Última orden: ${recentOrders[recentOrders.length - 1].createdAt.toLocaleDateString()}`);
      
      // Análisis por tienda
      const storeStats = {};
      recentOrders.forEach(order => {
        const storeId = order.storeId.toString();
        if (!storeStats[storeId]) {
          storeStats[storeId] = { orders: 0, total: 0 };
        }
        storeStats[storeId].orders++;
        storeStats[storeId].total += order.totalAmount;
      });
      
      console.log('\n🏪 Estadísticas por tienda:');
      Object.entries(storeStats).forEach(([storeId, stats]) => {
        console.log(`   - Tienda ${storeId}: ${stats.orders} órdenes, $${stats.total.toFixed(2)}`);
      });
      
      // Análisis semanal
      const weeklyStats = {};
      recentOrders.forEach(order => {
        const week = new Date(order.createdAt).toISOString().slice(0, 10).split('-').slice(0, 2).join('-W');
        if (!weeklyStats[week]) {
          weeklyStats[week] = { orders: 0, total: 0 };
        }
        weeklyStats[week].orders++;
        weeklyStats[week].total += order.totalAmount;
      });
      
      console.log('\n📈 Distribución semanal:');
      Object.entries(weeklyStats).sort().forEach(([week, stats]) => {
        console.log(`   - Semana ${week}: ${stats.orders} órdenes, $${stats.total.toFixed(2)}`);
      });
      
      // Verificar rangos de precios
      const prices = recentOrders.map(order => order.totalAmount);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      console.log('\n💰 Análisis de precios:');
      console.log(`   - Precio mínimo: $${minPrice.toFixed(2)}`);
      console.log(`   - Precio máximo: $${maxPrice.toFixed(2)}`);
      console.log(`   - Precio promedio: $${avgPrice.toFixed(2)}`);
      
      // Verificar estados de orden
      const orderStatuses = {};
      recentOrders.forEach(order => {
        const status = order.orderStatus;
        orderStatuses[status] = (orderStatuses[status] || 0) + 1;
      });
      
      console.log('\n📋 Estados de orden:');
      Object.entries(orderStatuses).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} órdenes`);
      });
      
    } else {
      console.log('⚠️ No se encontraron órdenes recientes');
    }
    
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTwoMonthsData();
