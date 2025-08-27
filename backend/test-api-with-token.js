const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
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

async function testAPIWithToken() {
  try {
    console.log('🔑 Generando token y probando API...');
    
    // 1. Buscar el gestor de tienda
    const storeManager = await User.findOne({ 
      email: 'jucarl74@gmail.com',
      role: 'store_manager'
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
    
    // 2. Generar token JWT
    const payload = {
      userId: storeManager._id,
      email: storeManager.email,
      role: storeManager.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });
    
    console.log('\n🔑 Token generado exitosamente');
    
    // 3. Probar la API
    console.log('\n🌐 Probando API del gestor de tienda...');
    
    // Fechas para los últimos 30 días
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const params = new URLSearchParams({
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    });
    
    const apiUrl = `http://localhost:5000/api/sales-reports/store?${params}`;
    
    console.log(`   - URL: ${apiUrl}`);
    console.log(`   - Fechas: ${thirtyDaysAgo.toISOString().split('T')[0]} a ${today.toISOString().split('T')[0]}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`\n📊 Respuesta de la API:`);
      console.log(`   - Status: ${response.status} ${response.statusText}`);
      console.log(`   - Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`\n✅ Datos recibidos:`);
        console.log(`   - Success: ${data.success}`);
        
        if (data.data && data.data.overview) {
          const overview = data.data.overview;
          console.log(`   - Total Ventas: $${overview.totalSales?.toFixed(2) || '0.00'}`);
          console.log(`   - Total Órdenes: ${overview.totalOrders || 0}`);
          console.log(`   - Valor Promedio: $${overview.averageOrderValue?.toFixed(2) || '0.00'}`);
          console.log(`   - Total Clientes: ${overview.totalCustomers || 0}`);
          console.log(`   - Nuevos Clientes: ${overview.newCustomers || 0}`);
          console.log(`   - Tasa Conversión: ${overview.conversionRate?.toFixed(1) || '0.0'}%`);
          console.log(`   - Items Vendidos: ${overview.totalItemsSold || 0}`);
        }
        
        if (data.data && data.data.period) {
          console.log(`\n📅 Período:`);
          console.log(`   - Desde: ${data.data.period.from}`);
          console.log(`   - Hasta: ${data.data.period.to}`);
          console.log(`   - Días: ${data.data.period.days}`);
        }
        
        console.log('\n🎉 ¡API funcionando correctamente! El dashboard debería mostrar los datos.');
        
      } else {
        const errorData = await response.text();
        console.log(`\n❌ Error en la API:`);
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Error: ${errorData}`);
        
        if (response.status === 401) {
          console.log('\n💡 Posibles soluciones:');
          console.log('   1. Verificar que el servidor esté corriendo en puerto 5000');
          console.log('   2. Verificar que el JWT_SECRET esté configurado correctamente');
          console.log('   3. Verificar que el middleware de autenticación esté funcionando');
        }
        
        if (response.status === 403) {
          console.log('\n💡 Posibles soluciones:');
          console.log('   1. Verificar que el usuario tenga el rol correcto');
          console.log('   2. Verificar que el middleware de roles esté funcionando');
        }
      }
      
    } catch (fetchError) {
      console.log(`\n❌ Error de conexión:`);
      console.log(`   - Error: ${fetchError.message}`);
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Asegúrate de que el servidor esté corriendo: npm start');
      console.log('   2. Verifica que el puerto 5000 esté disponible');
      console.log('   3. Verifica la configuración de CORS');
    }
    
    // 4. Instrucciones para el frontend
    console.log('\n📋 Para usar en el frontend:');
    console.log('1. Abre la consola del navegador (F12)');
    console.log('2. Ejecuta el siguiente comando:');
    console.log(`   localStorage.setItem('token', '${token}');`);
    console.log('3. Recarga la página del dashboard del gestor de tienda');
    console.log('4. Los datos deberían aparecer automáticamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAPIWithToken();
